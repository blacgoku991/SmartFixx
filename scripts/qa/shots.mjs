// Captures de recette, sans donnée réelle.
//   node scripts/qa/shots.mjs <baseURL> <dossierSortie> /chemin1 /chemin2 …   (pages publiques)
//   node scripts/qa/shots.mjs <baseURL> <dossierSortie> --admin /admin?tab=requests /admin?tab=campaigns
// Pages publiques : 360 × 640, 390 × 844, 412 × 823 et 1440 × 900, thèmes clair et sombre,
// consentement ouvert (aucun choix enregistré) et fermé (choix « no » enregistré). Premier écran ;
// SHOTS_FULL=1 ajoute une capture pleine page.
// --admin : connexion au compte fictif de serve-vps.sh (Origin https://smartfixx.fr), puis captures
// 390 × 844 et 1440 × 900 dans les deux thèmes ; /admin/login est capturé déconnecté.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const argv = process.argv.slice(2);
const [base, out] = argv;
const admin = argv.includes("--admin");
const paths = argv.slice(2).filter((a) => a !== "--admin");
if (!base || !out || !paths.length) { console.error("usage : shots.mjs <base> <sortie> [--admin] /chemin…"); process.exit(2); }
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium" });
const slug = (p) => (p === "/" ? "accueil" : p.replace(/^\//, "").replace(/[/?&=]/g, "_"));
const formats = admin
  ? [{ width: 390, height: 844 }, { width: 1440, height: 900 }]
  : [{ width: 360, height: 640 }, { width: 390, height: 844 }, { width: 412, height: 823 }, { width: 1440, height: 900 }];
const files = [];
async function context(viewport, theme, consent) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await ctx.addInitScript(([t, c]) => {
    try {
      localStorage.setItem("smartfixx-theme", t);
      if (c === "ferme") localStorage.setItem("smartfixx-statistics-preference-v1", JSON.stringify({ value: "no", at: Date.now() }));
      else localStorage.removeItem("smartfixx-statistics-preference-v1");
    } catch {}
  }, [theme, consent]);
  return ctx;
}
async function login(ctx) {
  const r = await ctx.request.post(base + "/api/admin/login", {
    headers: { origin: "https://smartfixx.fr", "content-type": "application/json" },
    data: { email: "owner@example.test", password: "test-local-owner-password-32-characters" },
  });
  return r.ok();
}
for (const theme of ["dark", "light"]) {
  for (const viewport of formats) {
    for (const consent of admin ? ["ferme"] : ["ouvert", "ferme"]) {
      const ctx = await context(viewport, theme, consent);
      if (admin) {
        const page = await ctx.newPage();
        await page.goto(base + "/admin/login", { waitUntil: "load" });
        await page.waitForTimeout(800);
        const f = `${out}/admin_login-${viewport.width}-${theme}.png`;
        await page.screenshot({ path: f, animations: "disabled" }); files.push(f);
        if (!(await login(ctx))) { console.error("connexion impossible (serveur lancé par serve-vps.sh ?)"); process.exit(1); }
      }
      for (const p of paths) {
        const page = await ctx.newPage();
        await page.goto(base + p, { waitUntil: "load", timeout: 60000 });
        await page.waitForTimeout(admin ? 2500 : 1200);
        const name = `${out}/${slug(p)}-${viewport.width}x${viewport.height}-${theme}${admin ? "" : "-consentement-" + consent}`;
        await page.screenshot({ path: name + ".png", animations: "disabled" }); files.push(name + ".png");
        if (process.env.SHOTS_FULL === "1") { await page.screenshot({ path: name + "-plein.png", fullPage: true, animations: "disabled" }); files.push(name + "-plein.png"); }
        await page.close();
      }
      await ctx.close();
    }
  }
}
await browser.close();
console.log(JSON.stringify({ captures: files.length, dossier: out }));
