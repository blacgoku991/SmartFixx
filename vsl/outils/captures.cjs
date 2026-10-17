// Captures des vraies pages SmartFixx refaites, pour la VSL (données fictives uniquement).
//
// Prérequis : une variante VPS construite et servie localement, par exemple
//   bash scripts/qa/serve-vps.sh <build> 3480
// puis, depuis la racine du dépôt :
//   NODE_PATH=scripts/qa/node_modules node vsl/outils/captures.cjs http://127.0.0.1:3480
// Écrit vsl/public/captures/*.jpg et vsl/public/captures/captures.json (dimensions, position du
// formulaire et de ses champs dans la capture mobile, pour caler la saisie animée).
// Thème sombre, mouvement réduit, consentement statistiques refusé (aucun bandeau).
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");
const { execFileSync } = require("node:child_process");

const BASE = process.argv[2] || "http://127.0.0.1:3480";
const OUT = join(__dirname, "..", "public", "captures");
const CHROME = process.env.CHROME_PATH || "/opt/pw-browsers/chromium";
const FFMPEG = process.env.FFMPEG || join(__dirname, "..", "node_modules", "@remotion", "compositor-linux-x64-gnu", "ffmpeg");
mkdirSync(OUT, { recursive: true });

// PNG → JPEG (qualité élevée) avec le ffmpeg fourni par Remotion.
function versJpeg(png, jpg) {
  execFileSync(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", "-i", png, "-q:v", "3", jpg]);
  rmSync(png);
}

async function contexte(browser, viewport, dpr) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dpr, reducedMotion: "reduce" });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("smartfixx-theme", "dark");
      localStorage.setItem("smartfixx-statistics-preference-v1", JSON.stringify({ value: "no", at: Date.now() }));
    } catch {}
  });
  return ctx;
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const res = { _lisezmoi: "Généré par vsl/outils/captures.cjs. Coordonnées en pixels CSS de la page (multiplier par dpr pour l'image).", base: BASE, date: new Date().toISOString().slice(0, 10), captures: {} };

  // 1) Premiers écrans desktop (1440 × 900, dpr 1,5).
  for (const [nom, chemin] of [["accueil-desktop", "/"], ["creation-desktop", "/creation-site-internet"], ["refonte-desktop", "/refonte-site-internet"]]) {
    const ctx = await contexte(browser, { width: 1440, height: 900 }, 1.5);
    const p = await ctx.newPage();
    await p.goto(BASE + chemin, { waitUntil: "load" });
    await p.waitForTimeout(1500);
    const png = join(OUT, nom + ".png");
    await p.screenshot({ path: png, animations: "disabled" });
    versJpeg(png, join(OUT, nom + ".jpg"));
    res.captures[nom] = { fichier: `captures/${nom}.jpg`, chemin, largeur: 1440, hauteur: 900, dpr: 1.5 };
    await ctx.close();
  }

  // 2) Mobile (390 × 844, dpr 2) : premier écran de l'accueil, et page création jusqu'au bas du formulaire.
  {
    const ctx = await contexte(browser, { width: 390, height: 844 }, 2);
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "load" });
    await p.waitForTimeout(1500);
    const png = join(OUT, "accueil-mobile.png");
    await p.screenshot({ path: png, animations: "disabled" });
    versJpeg(png, join(OUT, "accueil-mobile.jpg"));
    res.captures["accueil-mobile"] = { fichier: "captures/accueil-mobile.jpg", chemin: "/", largeur: 390, hauteur: 844, dpr: 2 };

    await p.goto(BASE + "/creation-site-internet", { waitUntil: "load" });
    await p.waitForTimeout(1500);
    const form = await p.evaluate(() => {
      const f = document.querySelector("form.project-form") || document.querySelector("main form");
      const box = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + scrollY), l: Math.round(r.width), h: Math.round(r.height) }; };
      const champ = (sel) => { const e = f.querySelector(sel); return e && e.getBoundingClientRect().width > 0 ? box(e) : null; };
      return {
        formulaire: box(f),
        choix_creation: champ('input[name="service"]'),
        nom: champ('input[name="name"]'),
        activite: champ('input[name="activity"]'),
        email: champ('input[name="email"]'),
        telephone: champ('input[name="phone"]'),
        site: champ('input[name="websiteUrl"]'),
        envoyer: champ('button[type="submit"]'),
      };
    });
    const hauteur = Math.min(form.formulaire.y + form.formulaire.h + 32, 4000);
    const png2 = join(OUT, "creation-mobile-page.png");
    await p.setViewportSize({ width: 390, height: hauteur });
    await p.waitForTimeout(600);
    await p.screenshot({ path: png2, animations: "disabled", clip: { x: 0, y: 0, width: 390, height: hauteur } });
    versJpeg(png2, join(OUT, "creation-mobile-page.jpg"));
    res.captures["creation-mobile-page"] = { fichier: "captures/creation-mobile-page.jpg", chemin: "/creation-site-internet", largeur: 390, hauteur, dpr: 2, champs: form };
    await ctx.close();
  }
  await browser.close();
  writeFileSync(join(OUT, "captures.json"), JSON.stringify(res, null, 2) + "\n");
  console.log(JSON.stringify(res, null, 1));
})();
