/**
 * Génère public/email-logo.png (256 × 256, fond transparent) — la marque
 * affichée en tête des e-mails transactionnels.
 *
 * Un PNG et pas le favicon SVG : Gmail, Outlook et la plupart des messageries
 * ignorent le SVG. Les data-URI sont bloquées aussi, l'image doit donc être
 * servie par le site et référencée en URL absolue.
 *
 * À relancer seulement si l'identité change :
 *   node scripts/make-email-logo.mjs
 *
 * Playwright n'est pas une dépendance de production : l'image est versionnée.
 * CHROMIUM_PATH permet de pointer un Chromium déjà installé.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const OUT = path.resolve("public/email-logo.png");
const SIZE = 256;

/* La marque du site, sans le fond sombre : l'e-mail fournit le sien. */
const MARK = `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <linearGradient id="f" x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop stop-color="#4FF0D4"/><stop offset=".55" stop-color="#8B5CFF"/><stop offset="1" stop-color="#FF5C8A"/>
    </linearGradient>
    <linearGradient id="a" x1="13" y1="13" x2="31" y2="31" gradientUnits="userSpaceOnUse">
      <stop stop-color="#6BF5DE"/><stop offset="1" stop-color="#4FF0D4"/>
    </linearGradient>
    <linearGradient id="b" x1="31" y1="13" x2="13" y2="31" gradientUnits="userSpaceOnUse">
      <stop stop-color="#A985FF"/><stop offset="1" stop-color="#6C3BF5"/>
    </linearGradient>
  </defs>
  <rect x="2.6" y="2.6" width="38.8" height="38.8" rx="13" fill="none" stroke="url(#f)" stroke-width="1.7"/>
  <path d="M14.5 14.5 29.5 29.5" stroke="url(#a)" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M29.5 14.5 14.5 29.5" stroke="url(#b)" stroke-width="3.4" stroke-linecap="round"/>
  <circle cx="22" cy="22" r="1.5" fill="#4FF0D4"/>
</svg>`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const tab = await browser.newPage({
  viewport: { width: SIZE, height: SIZE },
  deviceScaleFactor: 1,
});
await tab.setContent(
  `<!doctype html><html><head><meta charset="utf-8"><style>
     *{margin:0;padding:0}html,body{background:transparent}
   </style></head><body>${MARK}</body></html>`,
  { waitUntil: "load" },
);
await writeFile(OUT, await tab.screenshot({ type: "png", omitBackground: true }));
await browser.close();

console.log(`✓ ${OUT}`);
