// Rendu des exports livrables dans vsl/exports/.
//   node outils/rendu.mjs                    → toutes les vidéos + miniatures
//   node outils/rendu.mjs principale-9x16 …  → seulement ces cibles
// Étapes par vidéo : (1) Remotion rend l'image seule (H.264 de travail, CRF 14) ;
// (2) ffmpeg encode le livrable : H.264 High yuv420p, débit plafonné, AAC 48 kHz depuis
//     audio/mix/smartfixx-vsl-<montage>-mix.wav, durée exacte du montage (-t), faststart ; (3) le SRT du montage est copié à côté.
// Chaque rendu et chaque encodage passe par « flock /tmp/smartfixx-build.lock » (machine partagée).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MINIATURES, VIDEOS, fichierMiniature, fichierSrt, fichierVideo } from "./cibles.mjs";

const VSL = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXPORTS = join(VSL, "exports");
const TMP = join(VSL, ".rendu");
const VERROU = process.env.VERROU ?? "/tmp/smartfixx-build.lock";
const FFMPEG = process.env.FFMPEG ?? join(VSL, "node_modules/ffmpeg-static/ffmpeg");
const REMOTION = join(VSL, "node_modules/.bin/remotion");
const MINUTAGE = JSON.parse(readFileSync(join(VSL, "audio", "minutage.json"), "utf8"));
mkdirSync(EXPORTS, { recursive: true });
mkdirSync(TMP, { recursive: true });

const sousVerrou = (cmd, args) => {
  console.log(`→ ${[cmd, ...args].join(" ").slice(0, 160)}…`);
  execFileSync("flock", [VERROU, cmd, ...args], { cwd: VSL, stdio: ["ignore", "inherit", "inherit"] });
};

const demandees = process.argv.slice(2);
const garder = (id) => demandees.length === 0 || demandees.includes(id);

for (const v of VIDEOS.filter((x) => garder(x.id))) {
  const travail = join(TMP, `${v.id}-image.mp4`);
  const mix = join(VSL, "audio", "mix", `smartfixx-vsl-${v.montage}-mix.wav`);
  if (!existsSync(mix)) throw new Error(`Mixage absent : ${mix} (lancer audio/outils/mixage.mjs)`);
  // Durée exacte du montage, arrondie à l'image comme la composition (Root.tsx, dureeImages) : « -t »
  // coupe vidéo et audio au même instant (sans lui, le remplissage AAC fait dépasser le conteneur de 5 à
  // 18 ms, ce qui peut faire refuser une version de 15 s).
  const duree = (Math.round(MINUTAGE.montages[v.montage].duree_s * 30) / 30).toFixed(6);
  sousVerrou(REMOTION, ["render", "src/index.ts", v.id, travail, "--muted", "--codec=h264", "--crf=14", "--pixel-format=yuv420p", "--log=warn"]);
  const sortie = join(EXPORTS, fichierVideo(v.id));
  sousVerrou(FFMPEG, [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", travail, "-i", mix,
    "-map", "0:v:0", "-map", "1:a:0",
    "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "3200k", "-bufsize", "6400k",
    "-profile:v", "high", "-level:v", "4.1", "-pix_fmt", "yuv420p", "-r", "30",
    "-af", "apad", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
    "-t", duree, "-movflags", "+faststart",
    "-metadata", "title=SmartFixx — " + v.id,
    sortie,
  ]);
  rmSync(travail);
  copyFileSync(join(VSL, "captions", `smartfixx-vsl-${v.montage}.srt`), join(EXPORTS, fichierSrt(v.id)));
  console.log(`✓ ${sortie}`);
}

for (const id of MINIATURES.filter(garder)) {
  const sortie = join(EXPORTS, fichierMiniature(id));
  sousVerrou(REMOTION, ["still", "src/index.ts", id, sortie, "--image-format=jpeg", "--jpeg-quality=92", "--log=warn"]);
  console.log(`✓ ${sortie}`);
}
