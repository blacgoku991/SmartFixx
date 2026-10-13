// Variantes AVIF et WebP 240/480/768 des objets chrome et cobalt, pour la primitive <Media>.
//   cd /tmp && npm install sharp@0.34.4      (HORS du dépôt : sharp n'entre pas dans le package.json du site)
//   SHARP=/tmp/node_modules/sharp node scripts/qa/media/build-studio-variants.mjs
// Les originaux restent à leur URL (/studio-web.webp est exigé sur l'accueil par les tests ; les emails
// déjà envoyés citent certaines images). Sortie : public/media/studio/<base>-<largeur>.<avif|webp>.
import { mkdirSync, statSync } from "node:fs";
import path from "node:path";
const sharp = (await import(process.env.SHARP || "sharp")).default;
const root = path.resolve(new URL("../../..", import.meta.url).pathname);
const out = path.join(root, "public/media/studio");
mkdirSync(out, { recursive: true });
const bases = ["studio-web", "studio-automation", "studio-security", "mail-sculpture"];
let total = 0;
for (const base of bases) {
  const src = path.join(root, "public", `${base}.webp`);
  for (const w of [240, 480, 768]) {
    const img = sharp(src).resize({ width: w, withoutEnlargement: true });
    const webp = path.join(out, `${base}-${w}.webp`);
    const avif = path.join(out, `${base}-${w}.avif`);
    await img.clone().webp({ quality: 78, effort: 6 }).toFile(webp);
    await img.clone().avif({ quality: 52, effort: 6 }).toFile(avif);
    for (const f of [webp, avif]) { const s = statSync(f).size; total += s; console.log(`${path.relative(root, f)}\t${(s / 1024).toFixed(1)} Ko`); }
  }
}
console.log(`total ${(total / 1024).toFixed(1)} Ko`);
