// Image de partage et icônes de SmartFixx, produites SANS IA : gabarits HTML aux jetons du socle, capturés
// par Playwright (dépendance de scripts/qa, aucune dépendance ajoutée au site).
//   python3 -I scripts/og/monogram.py .        # 1. public/favicon.svg (monogramme S, glyphe SFX Display)
//   node scripts/og/render.mjs .                # 2. og-image.png, icônes PNG et favicon.ico dans public/
// Prérequis : npm --prefix scripts/qa ci (Playwright 1.55.1, Chromium dans /opt/pw-browsers/chromium).
// Sorties : public/og-image.png (1200 × 630), apple-touch-icon.png (180), icon-192.png, icon-512.png
// (fond plein, monogramme dans la zone sûre de 80 % : aussi déclarée « maskable » par app/manifest.ts),
// favicon.ico (PNG 16, 32 et 48 dans un conteneur ICO).
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(process.argv[2] || resolve(here, "../.."));
const { chromium } = createRequire(resolve(here, "../qa/package.json"))("playwright");
const pub = (f) => resolve(repo, "public", f);

// Jetons du thème sombre, lus dans le premier bloc « :root,[data-sx-tone='night']{…} » de app/globals.css.
const css = readFileSync(resolve(repo, "app/globals.css"), "utf8");
const block = /:root,\[data-sx-tone='night'\]\{([\s\S]*?)\n\}/.exec(css)?.[1];
if (!block) throw new Error("Bloc de jetons sombres introuvable dans app/globals.css");
const tokens = [...block.matchAll(/(--sx-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => `${k}:${v.trim()}`).join(";");
if (!/--sx-sky:/.test(tokens) || !/--sx-signal:/.test(tokens)) throw new Error("Jetons --sx-sky ou --sx-signal absents");

const svg = readFileSync(pub("favicon.svg"), "utf8");
const data = (t) => `data:image/svg+xml;base64,${Buffer.from(t).toString("base64")}`;
const svgData = data(svg);
// Icônes d'application : le fond est peint par la page (plein cadre), le SVG sans son carré arrondi.
const glyphData = data(svg.replace(/<rect width="48" height="48"[^>]*\/>/, ""));
if (glyphData === svgData) throw new Error("Carré de fond du favicon.svg introuvable");
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium" });
try {
  // 1. Image de partage.
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const html = readFileSync(resolve(here, "og.html"), "utf8")
    .replace("/*TOKENS*/", tokens)
    .replace("__FONT__", `data:font/woff2;base64,${readFileSync(pub("fonts/sfx-display-92.v1.woff2")).toString("base64")}`)
    .replace("__ICON__", svgData);
  await og.setContent(html, { waitUntil: "load" });
  const fontOk = await og.evaluate(async () => { await document.fonts.load("700 78px 'SFX Display'"); await document.fonts.ready; return [...document.fonts].some((f) => f.family.includes("SFX Display") && f.status === "loaded"); });
  if (!fontOk) throw new Error("SFX Display non chargée dans le gabarit");
  writeFileSync(pub("og-image.png"), await og.screenshot({ type: "png" }));

  // 2. Icônes : le monogramme sur fond plein (bleu nuit), sans transparence.
  const icon = await browser.newPage({ viewport: { width: 512, height: 512 } });
  // transparent : coins transparents comme le SVG (favicon.ico) ; sinon fond plein (icônes d'application).
  const shot = async (size, inset, transparent = false, src = svgData) => {
    await icon.setContent(`<!doctype html><style>html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden;background:${transparent ? "transparent" : "#070B18"}}
      .bg{position:absolute;inset:0;background:linear-gradient(180deg,#0D1638 0%,#070B18 62%,#2A2370 100%)}
      img{position:absolute;left:${inset}px;top:${inset}px;width:${size - 2 * inset}px;height:${size - 2 * inset}px}</style>
      ${transparent ? "" : '<div class="bg"></div>'}<img src="${src}" alt="">`, { waitUntil: "load" });
    return icon.screenshot({ type: "png", omitBackground: transparent, clip: { x: 0, y: 0, width: size, height: size } });
  };
  // Icônes « pleines » (le système arrondit ou découpe lui-même). 192 et 512 servent aussi d'icône
  // « maskable » : le S et son trait restent dans le cercle sûr de 80 % (marge de 8 %).
  const full = async (size, margin) => shot(size, Math.round(size * margin), false, glyphData);
  writeFileSync(pub("apple-touch-icon.png"), await full(180, 0));
  writeFileSync(pub("icon-192.png"), await full(192, 0.08));
  writeFileSync(pub("icon-512.png"), await full(512, 0.08));

  // 3. favicon.ico : entrées PNG (format ICO Vista+, lu par tous les navigateurs actuels).
  const sizes = [16, 32, 48];
  const pngs = [];
  for (const s of sizes) pngs.push(await shot(s, 0, true));
  const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  let offset = 6 + 16 * sizes.length;
  const dir = sizes.map((s, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(offset, 12);
    offset += pngs[i].length; return e;
  });
  writeFileSync(pub("favicon.ico"), Buffer.concat([header, ...dir, ...pngs]));
  console.log("public/og-image.png, apple-touch-icon.png, icon-192.png, icon-512.png, favicon.ico : écrits");
} finally {
  await browser.close();
}
