// Prépare les fichiers de voix utilisés par le montage.
//
// - Segment avec une prise ElevenLabs retenue (RETENUES ci-dessous) : conversion WAV 48 kHz mono,
//   coupe des silences de tête et de queue, mise à la même sonie (-18 LUFS) -> voix/<ID>.wav
// - Segment sans prise définitive : voix PROVISOIRE de synthèse locale (espeak-ng), étirée à la
//   durée estimée dans script/segments.json pour que le montage garde son rythme
//   -> voix/provisoire/<ID>_PROVISOIRE.wav. À remplacer dès que la vraie prise existe.
//
// Écrit voix/voix.json (fichier, statut, source, durée exacte). Usage : node vsl/audio/outils/prepare-voix.mjs
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AUDIO, VSL, SR, ff, dureeWav, sonie, lireJson, arrondi } from "./commun.mjs";

// Prise retenue pour chaque segment généré par ElevenLabs (voir audio/README.md pour le choix).
const RETENUES = {
  P1: { fichier: "variantes/P1_v3.mp3", generation_id: "NTzJIo7iogycFTlLFtXn" },
  P2: { fichier: "variantes/P2_v2.mp3", generation_id: "Rd2WuLAkjLXcJu4U2fVw" },
  P4: { fichier: "variantes/P4_v1.mp3", generation_id: "H7vtrSKAPzFOdbgT4UpK" },
};

const CIBLE_LUFS = -18;
const VOIX = join(AUDIO, "voix");
const PROV = join(VOIX, "provisoire");
const TMP = join(VOIX, ".tmp");
mkdirSync(PROV, { recursive: true });
mkdirSync(TMP, { recursive: true });

const { segments } = lireJson(join(VSL, "script/segments.json"));
const texteParle = (t) => t.replace(/\[[^\]]*\]\s*/g, "").trim();

// Coupe tête/queue (garde 40 ms d'air avant, 120 ms après) puis fondus de 8 ms anti-clic.
const COUPE =
  "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.04:detection=peak," +
  "areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.12:detection=peak,areverse";

function normaliser(src, dst, filtresAvant = "") {
  const brut = join(TMP, "brut.wav");
  ff(["-i", src, "-af", `${filtresAvant}${filtresAvant ? "," : ""}${COUPE}`, "-ar", String(SR), "-ac", "1", "-c:a", "pcm_s16le", brut]);
  const d = dureeWav(brut);
  const { lufs } = sonie(brut);
  const gain = CIBLE_LUFS - lufs;
  ff([
    "-i", brut,
    "-af", `volume=${gain.toFixed(2)}dB,afade=t=in:d=0.008,afade=t=out:st=${Math.max(0, d - 0.03).toFixed(3)}:d=0.03`,
    "-ar", String(SR), "-ac", "1", "-c:a", "pcm_s16le", dst,
  ]);
}

function atempoChaine(f) {
  const parts = [];
  while (f > 2) { parts.push(2); f /= 2; }
  while (f < 0.5) { parts.push(0.5); f /= 0.5; }
  parts.push(f);
  return parts.map((x) => `atempo=${x.toFixed(4)}`).join(",");
}

const sortie = {};
for (const [id, seg] of Object.entries(segments)) {
  const r = RETENUES[id];
  if (r) {
    const src = join(VOIX, r.fichier);
    const dst = join(VOIX, `${id}.wav`);
    normaliser(src, dst);
    sortie[id] = {
      fichier: `voix/${id}.wav`,
      statut: "definitive",
      source: `ElevenLabs eleven_v4, voix Nico, prise ${r.generation_id} (${r.fichier})`,
      duree_s: arrondi(dureeWav(dst)),
    };
    rmSync(join(PROV, `${id}_PROVISOIRE.wav`), { force: true });
  } else {
    // Voix provisoire : espeak-ng (fr), puis étirement à la durée estimée d'une voix naturelle.
    const brut = join(TMP, "espeak.wav");
    execFileSync("espeak-ng", ["-v", "fr-fr", "-s", "165", "-p", "38", "-w", brut, texteParle(seg.voix)]);
    const coupe = join(TMP, "espeak-coupe.wav");
    ff(["-i", brut, "-af", COUPE, "-ar", String(SR), "-ac", "1", "-c:a", "pcm_s16le", coupe]);
    const facteur = dureeWav(coupe) / seg.estimation_s;
    const dst = join(PROV, `${id}_PROVISOIRE.wav`);
    normaliser(coupe, dst, atempoChaine(facteur));
    sortie[id] = {
      fichier: `voix/provisoire/${id}_PROVISOIRE.wav`,
      statut: "PROVISOIRE",
      source: "espeak-ng (synthèse locale de repérage), étirée à estimation_s ; NE PAS DIFFUSER",
      duree_s: arrondi(dureeWav(dst)),
    };
  }
  console.log(`${id.padEnd(3)} ${sortie[id].statut.padEnd(11)} ${sortie[id].duree_s.toFixed(3)} s  ${sortie[id].fichier}`);
}
rmSync(TMP, { recursive: true, force: true });
writeFileSync(join(VOIX, "voix.json"), JSON.stringify({ cible_lufs: CIBLE_LUFS, segments: sortie }, null, 2) + "\n");
if (!existsSync(join(VOIX, "voix.json"))) process.exit(1);
