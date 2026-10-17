// Contrôle des exports : codecs, dimensions, durée, poids, faststart, sonie et crête vraie (ebur128),
// présence du SRT ; extrait des images clés dans .rendu/controle/ pour les regarder (en 9:16, les zones
// recouvertes par l'interface des placements sont teintées en rouge).
//   node outils/controle.mjs            → exports/controle.json (+ code de sortie 1 si un contrôle échoue)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readSync, closeSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MINIATURES, VIDEOS, fichierMiniature, fichierSrt, fichierVideo } from "./cibles.mjs";

const VSL = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXPORTS = join(VSL, "exports");
const FFMPEG = process.env.FFMPEG ?? join(VSL, "node_modules/ffmpeg-static/ffmpeg");
const FFPROBE = process.env.FFPROBE ?? join(VSL, "node_modules/@remotion/compositor-linux-x64-gnu/ffprobe");
const IMAGES = join(VSL, ".rendu", "controle");
mkdirSync(IMAGES, { recursive: true });
const minutage = JSON.parse(execFileSync("cat", [join(VSL, "audio/minutage.json")], { encoding: "utf8" }));

const probe = (f) => JSON.parse(execFileSync(FFPROBE, ["-v", "error", "-show_streams", "-show_format", "-of", "json", f], { encoding: "utf8" }));
const ebur = (f) => {
  const out = execFileSync("sh", ["-c", '"$0" -hide_banner -nostats -i "$1" -map 0:a -af ebur128=peak=true:framelog=quiet -f null - 2>&1', FFMPEG, f], { encoding: "utf8", maxBuffer: 64 << 20 });
  const i = out.match(/I:\s+(-?[0-9.]+) LUFS/g);
  const p = out.match(/Peak:\s+(-?[0-9.inf]+) dBFS/g);
  return { lufs: parseFloat(i.at(-1).match(/-?[0-9.]+/)[0]), crete_dbtp: parseFloat(p.at(-1).match(/-?[0-9.]+|-inf/)[0]) };
};
// faststart : l'atome moov doit précéder mdat.
const faststart = (f) => {
  const fd = openSync(f, "r");
  const b = Buffer.alloc(64 * 1024);
  readSync(fd, b, 0, b.length, 0);
  closeSync(fd);
  const moov = b.indexOf("moov"), mdat = b.indexOf("mdat");
  return moov !== -1 && (mdat === -1 || moov < mdat);
};

const rapport = { date: new Date().toISOString(), videos: {}, miniatures: {} };
let echecs = 0;
for (const v of VIDEOS) {
  const f = join(EXPORTS, fichierVideo(v.id));
  if (!existsSync(f)) { rapport.videos[v.id] = { absent: true }; echecs++; continue; }
  const p = probe(f);
  const vs = p.streams.find((s) => s.codec_type === "video");
  const as = p.streams.find((s) => s.codec_type === "audio");
  const duree = parseFloat(p.format.duration);
  // durée de la composition : minutage arrondi à l'image (30 i/s), comme dureeImages dans src/lib/temps.ts
  const attendu = Math.round(minutage.montages[v.montage].duree_s * 30) / 30;
  const [W, H] = v.id.includes("16x9") ? [1920, 1080] : [1080, 1920];
  const loud = ebur(f);
  const mo = statSync(f).size / 1e6;
  const r = {
    fichier: fichierVideo(v.id),
    video: `${vs.codec_name} ${vs.profile} ${vs.width}x${vs.height} ${vs.pix_fmt} ${vs.r_frame_rate}`,
    audio: `${as.codec_name} ${as.sample_rate} Hz ${as.channels} canaux`,
    duree_s: +duree.toFixed(3),
    duree_video_s: +parseFloat(vs.duration).toFixed(3),
    duree_audio_s: +parseFloat(as.duration).toFixed(3),
    duree_attendue_s: +attendu.toFixed(3),
    poids_mo: +mo.toFixed(2),
    debit_kbps: Math.round(parseInt(p.format.bit_rate) / 1000),
    sonie_lufs: loud.lufs,
    crete_vraie_dbtp: loud.crete_dbtp,
    faststart: faststart(f),
    srt: existsSync(join(EXPORTS, fichierSrt(v.id))),
    voix_provisoire: minutage.montages[v.montage].provisoire,
  };
  const ok = {
    h264: vs.codec_name === "h264" && vs.pix_fmt === "yuv420p",
    dimensions: vs.width === W && vs.height === H,
    fps: vs.r_frame_rate === "30/1",
    aac48: as.codec_name === "aac" && as.sample_rate === "48000",
    // durée du conteneur au plus égale à celle du montage (placements stricts : 15 s pour la courte),
    // et vidéo comme audio à moins d'une image de cette durée
    duree: duree <= attendu + 0.001 && Math.abs(duree - attendu) < 0.034,
    duree_flux: [vs, as].every((x) => Math.abs(parseFloat(x.duration) - attendu) < 0.034),
    poids: mo < 20,
    sonie: Math.abs(loud.lufs + 14) <= 1,
    crete: loud.crete_dbtp <= -1,
    faststart: r.faststart,
    srt: r.srt,
  };
  r.controles = ok;
  if (Object.values(ok).some((x) => !x)) echecs++;
  rapport.videos[v.id] = r;
  // images clés : une par carton de sous-titres (milieu) + première et dernière image
  const temps = [0.1, ...minutage.montages[v.montage].sous_titres.map((c) => (c.debut_s + c.fin_s) / 2), duree - 0.05];
  temps.forEach((t, k) => {
    // 9:16 : zones masquées par les interfaces des placements (15 % haut, 25 % bas, colonne d'icônes à droite) en rouge
    // Variantes Reels : ligne jaune à 65 % de la hauteur (Meta : 35 % du bas libres)
    const zones = W === 1080 ? ",drawbox=x=0:y=0:w=iw:h=ih*0.15:color=red@0.22:t=fill,drawbox=x=0:y=ih*0.75:w=iw:h=ih*0.25:color=red@0.22:t=fill,drawbox=x=iw*0.88:y=ih*0.45:w=iw*0.12:h=ih*0.30:color=red@0.22:t=fill" + (v.reels ? ",drawbox=x=0:y=ih*0.65:w=iw:h=3:color=yellow@0.9:t=fill" : "") : "";
    execFileSync(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", "-ss", t.toFixed(3), "-i", f, "-frames:v", "1", "-vf", "scale=iw/2:-2" + zones, "-q:v", "4", join(IMAGES, `${v.id}-${String(k).padStart(2, "0")}-${t.toFixed(2)}s.jpg`)]);
  });
  console.log(`${v.id.padEnd(16)} ${r.video} | ${r.audio} | ${r.duree_s} s | ${r.poids_mo} Mo | ${r.sonie_lufs} LUFS ${r.crete_vraie_dbtp} dBTP | ${Object.entries(ok).filter(([, x]) => !x).map(([k]) => "ÉCHEC " + k).join(" ") || "ok"}`);
}
for (const id of MINIATURES) {
  const f = join(EXPORTS, fichierMiniature(id));
  if (!existsSync(f)) { rapport.miniatures[id] = { absent: true }; echecs++; continue; }
  const s = probe(f).streams[0];
  rapport.miniatures[id] = { fichier: fichierMiniature(id), dimensions: `${s.width}x${s.height}`, poids_ko: Math.round(statSync(f).size / 1024) };
  console.log(`${id.padEnd(16)} ${s.width}x${s.height}`);
}
writeFileSync(join(EXPORTS, "controle.json"), JSON.stringify(rapport, null, 2) + "\n");
console.log(echecs ? `${echecs} export(s) en échec` : "tous les contrôles passent");
process.exit(echecs ? 1 : 0);
