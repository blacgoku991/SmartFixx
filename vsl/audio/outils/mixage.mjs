// Mixage de référence de chaque montage : voix posée sur le minutage + musique en retrait.
//
// - La musique est baissée de 9 dB puis compressée par la voix (sidechain) : elle reste au moins
//   15 dB sous la voix pendant chaque segment parlé (mesuré, contrôle bloquant), et remonte dans les
//   respirations et sur l'écran final.
// - Sonie finale -14 LUFS intégrés (cible des plateformes vidéo), crête vraie <= -1,5 dBTP avant
//   l'encodage AAC (marge pour rester <= -1 dBTP dans les MP4).
// - Accroches : boucle musicale coupée à la durée, fondu de sortie 0,3 s.
//
// Sorties (WAV 48 kHz 16 bits) dans audio/mix/ :
//   smartfixx-vsl-<montage>-mix.wav   voix + musique, prêt pour le montage
//   smartfixx-vsl-<montage>-voix.wav  voix seule posée sur le minutage (mono), pour remixer
// Usage : node vsl/audio/outils/mixage.mjs  (après minutage.mjs et musique.mjs)
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AUDIO, SR, ff, sonie, sonieExtrait, dureeWav, lireJson, arrondi } from "./commun.mjs";

const CIBLE_LUFS = -14, PLAFOND_DBTP = -1.5, ECART_MIN_DB = 15;
const OUT = join(AUDIO, "mix");
mkdirSync(OUT, { recursive: true });
const { montages } = lireJson(join(AUDIO, "minutage.json"));
const MUSIQUE = { principale: "smartfixx-musique-principale.wav", courte: "smartfixx-musique-courte.wav" };
const res = {};

for (const [nom, m] of Object.entries(montages)) {
  const D = m.duree_s.toFixed(3);
  const voixIn = m.segments.flatMap((s) => ["-i", join(AUDIO, s.fichier)]);
  const pose = m.segments
    .map((s, k) => `[${k + 1}:a]aformat=sample_rates=${SR}:channel_layouts=mono,adelay=delays=${Math.round(s.debut_s * 1000)}:all=1[v${k}]`)
    .join(";");
  const somme = `${m.segments.map((_, k) => `[v${k}]`).join("")}amix=inputs=${m.segments.length}:normalize=0:dropout_transition=0,apad=whole_dur=${D},atrim=0:${D}`;

  // 1) voix seule sur le minutage
  const voixDst = join(OUT, `smartfixx-vsl-${nom}-voix.wav`);
  ff(["-f", "lavfi", "-i", `anullsrc=r=${SR}:cl=mono`, ...voixIn, "-filter_complex", `${pose};${somme}[vox]`, "-map", "[vox]", "-t", D, "-c:a", "pcm_s16le", voixDst]);

  // 2) voix + musique ducking
  const musique = MUSIQUE[nom];
  const musIn = musique ? ["-i", join(AUDIO, "musique", musique)] : ["-stream_loop", "-1", "-i", join(AUDIO, "musique/smartfixx-musique-boucle.wav")];
  const fondu = musique ? "" : `,afade=t=out:st=${(m.duree_s - 0.3).toFixed(3)}:d=0.3`;
  const graphe =
    `${pose};${somme},aformat=channel_layouts=stereo,asplit=3[voxa][voxsc][voxm];` +
    `[0:a]atrim=0:${D},asetpts=PTS-STARTPTS,volume=-9dB${fondu}[mus];` +
    `[mus][voxsc]sidechaincompress=threshold=0.04:ratio=4:attack=15:release=450:knee=4,asplit=2[duck][duckm];` +
    `[voxa][duck]amix=inputs=2:normalize=0:dropout_transition=0,atrim=0:${D}[mix]`;
  const brut = join(OUT, `.${nom}.f32.wav`);
  const pisteVoix = join(OUT, `.${nom}.voix.f32.wav`);
  const pisteMusique = join(OUT, `.${nom}.musique.f32.wav`);
  ff([...musIn, ...voixIn, "-filter_complex", graphe, "-map", "[mix]", "-c:a", "pcm_f32le", brut, "-map", "[voxm]", "-c:a", "pcm_f32le", pisteVoix, "-map", "[duckm]", "-c:a", "pcm_f32le", pisteMusique]);
  // Écart voix / musique pendant chaque segment parlé (même gain final pour les deux pistes).
  const ecarts = m.segments.map((s) => {
    const v = sonieExtrait(pisteVoix, s.debut_s, s.fin_s);
    const mu = sonieExtrait(pisteMusique, s.debut_s, s.fin_s);
    return { segment: s.id, voix_lufs: v, musique_lufs: mu, ecart_db: arrondi(v - mu, 1) };
  });
  rmSync(pisteVoix);
  rmSync(pisteMusique);
  const ecartMin = Math.min(...ecarts.map((e) => e.ecart_db));
  if (!(ecartMin >= ECART_MIN_DB)) {
    rmSync(brut);
    throw new Error(`${nom} : musique trop forte sous la voix (écart minimal ${ecartMin} dB < ${ECART_MIN_DB} dB) ${JSON.stringify(ecarts)}`);
  }
  const avant = sonie(brut);
  const dst = join(OUT, `smartfixx-vsl-${nom}-mix.wav`);
  const lim = 10 ** (PLAFOND_DBTP / 20) * 0.97; // marge pour la crête vraie (inter-échantillons)
  // Le limiteur retire un peu de sonie : on corrige le gain jusqu'à être à ±0,2 LU de la cible.
  let gain = CIBLE_LUFS - avant.lufs;
  let apres;
  for (let essai = 0; essai < 5; essai++) {
    ff(["-i", brut, "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=${lim.toFixed(4)}:attack=3:release=80:level=disabled:latency=1,aresample=osf=s16:dither_method=triangular`, "-t", D, "-c:a", "pcm_s16le", dst]);
    apres = sonie(dst);
    if (Math.abs(apres.lufs - CIBLE_LUFS) <= 0.2) break;
    gain += CIBLE_LUFS - apres.lufs;
  }
  rmSync(brut);
  res[nom] = {
    mix: `mix/smartfixx-vsl-${nom}-mix.wav`,
    voix: `mix/smartfixx-vsl-${nom}-voix.wav`,
    duree_s: arrondi(dureeWav(dst)),
    lufs: apres.lufs,
    crete_dbtp: apres.tp,
    ecart_voix_musique_min_db: ecartMin,
    ecarts_par_segment: ecarts,
    provisoire: m.provisoire,
  };
  console.log(`${nom.padEnd(11)} ${res[nom].duree_s.toFixed(3)} s  ${apres.lufs} LUFS  crête ${apres.tp} dBTP  musique ≥ ${ecartMin} dB sous la voix${m.provisoire ? "  [voix PROVISOIRE]" : ""}`);
}
writeFileSync(join(OUT, "mix.json"), JSON.stringify(res, null, 2) + "\n");
