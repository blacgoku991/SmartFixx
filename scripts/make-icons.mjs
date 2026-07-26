/**
 * Génère les icônes PNG du site depuis `public/favicon.svg`, source unique :
 *
 *   public/icon-192.png            Google Search, Android, manifeste
 *   public/icon-512.png            écrans d'accueil, splash
 *   public/apple-touch-icon.png    iOS — 180 × 180, PNG obligatoire
 *
 * Pourquoi des PNG alors que le SVG existe : iOS ignore le SVG pour
 * `apple-touch-icon`, et Google demande une icône carrée dont le côté est un
 * multiple de 48 px pour l'afficher dans ses résultats. 192 et 512 le sont.
 *
 * À relancer si l'identité change :
 *   node scripts/make-icons.mjs
 *
 * Playwright n'est pas une dépendance de production : les images sont
 * versionnées. CHROMIUM_PATH permet de pointer un Chromium déjà installé.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const SVG = path.resolve("public/favicon.svg");

/* Les icônes gardent le fond sombre du favicon : `apple-touch-icon` ne gère pas
   la transparence et afficherait un carré blanc sur l'écran d'accueil. */
const TARGETS = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
];

const svg = await readFile(SVG, "utf8");

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});

for (const [name, size] of TARGETS) {
  const tab = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  await tab.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>
       *{margin:0;padding:0}
       html,body{width:${size}px;height:${size}px;background:#04050A;overflow:hidden}
       svg{display:block;width:${size}px;height:${size}px}
     </style></head><body>${svg}</body></html>`,
    { waitUntil: "load" },
  );
  const out = path.resolve("public", name);
  await writeFile(out, await tab.screenshot({ type: "png" }));
  console.log(`✓ ${name}  ${size}×${size}`);
  await tab.close();
}

await browser.close();
