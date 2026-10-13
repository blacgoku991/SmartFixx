// Contrôles de mise en page et de mouvement sur une variante servie.
//   node scripts/qa/layout-check.mjs <baseURL> /chemin1 /chemin2 … [--checks=overflow,cta,lcp,h1,reduced,reveal,font]
// Par défaut, tous les contrôles. Code de sortie 1 au premier écart constaté (tous sont listés).
//  overflow : aucun défilement horizontal à 360, 390, 412, 768 et 1440 px de large ;
//  cta      : le bas des CTA du hero ([data-sx-hero] .sx-hero-actions) est au-dessus du haut du
//             consentement ([data-sx-consent]) à 360 × 640, 390 × 664, 412 × 823 et 1440 × 900,
//             consentement ouvert, et visible dans le premier écran ;
//  lcp      : l'élément LCP (PerformanceObserver) est le H1 ou un de ses descendants (390 × 844, 1440 × 900) ;
//  h1       : exactement un h1 ;
//  reduced  : avec reducedMotion=reduce, document.getAnimations().length === 0 après 5 s ;
//  reveal   : opacité calculée 1 sur le dernier .sx-reveal après défilement complet (390 × 844, 1440 × 900) ;
//  font     : police bloquée puis libérée, décalage vertical du H1 et de l'élément suivant ≤ 1 px
//             (360, 390, 412, 1440).
import { chromium } from "playwright";
const argv = process.argv.slice(2);
const base = argv[0]?.replace(/\/$/, "");
const paths = argv.slice(1).filter((a) => !a.startsWith("--"));
const checksArg = argv.find((a) => a.startsWith("--checks="));
const checks = new Set((checksArg ? checksArg.slice(9) : "overflow,cta,lcp,h1,reduced,reveal,font").split(","));
if (!base || !paths.length) { console.error("usage : layout-check.mjs <base> /chemin… [--checks=…]"); process.exit(2); }
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium" });
let failures = 0;
const ok = (m) => console.log("  ✓", m);
const ko = (m) => { failures++; console.log("  ✗", m); };
async function open(viewport, path, { consent = "ouvert", reduced = false, theme = "dark", beforeGoto, waitUntil = "load" } = {}) {
  const ctx = await browser.newContext({ viewport, reducedMotion: reduced ? "reduce" : "no-preference" });
  await ctx.addInitScript(([c, t]) => {
    try {
      localStorage.setItem("smartfixx-theme", t);
      if (c === "ferme") localStorage.setItem("smartfixx-statistics-preference-v1", JSON.stringify({ value: "no", at: Date.now() }));
      else localStorage.removeItem("smartfixx-statistics-preference-v1");
    } catch {}
  }, [consent, theme]);
  const page = await ctx.newPage();
  if (beforeGoto) await beforeGoto(page);
  await page.goto(base + path, { waitUntil, timeout: 60000 });
  return { ctx, page };
}
for (const path of paths) {
  console.log(`\n${path}`);
  if (checks.has("h1")) {
    const { ctx, page } = await open({ width: 390, height: 844 }, path);
    const n = await page.locator("h1").count();
    if (n === 1) ok("un seul h1"); else ko(`h1 = ${n}`);
    await ctx.close();
  }
  if (checks.has("overflow")) {
    for (const width of [360, 390, 412, 768, 1440]) {
      const { ctx, page } = await open({ width, height: 900 }, path);
      await page.waitForTimeout(600);
      const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        culprits: [...document.querySelectorAll("body *")].filter((e) => { const b = e.getBoundingClientRect(); return b.right > document.documentElement.clientWidth + 1 && getComputedStyle(e).position !== "fixed"; }).slice(0, 4).map((e) => e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.split(" ").slice(0, 2).join(".") : "")) }));
      if (r.sw <= r.cw) ok(`pas de défilement horizontal à ${width}px`); else ko(`défilement horizontal à ${width}px (${r.sw} > ${r.cw}) : ${r.culprits.join(", ")}`);
      await ctx.close();
    }
  }
  if (checks.has("cta")) {
    for (const viewport of [{ width: 360, height: 640 }, { width: 390, height: 664 }, { width: 412, height: 823 }, { width: 1440, height: 900 }]) {
      const { ctx, page } = await open(viewport, path);
      const consent = page.locator("[data-sx-consent]");
      try { await consent.first().waitFor({ state: "visible", timeout: 4000 }); } catch {}
      const r = await page.evaluate(() => {
        const acts = [...document.querySelectorAll("[data-sx-hero] .sx-hero-actions a, [data-sx-hero] .sx-hero-actions button")].filter((e) => e.getBoundingClientRect().height > 0);
        const c = document.querySelector("[data-sx-consent]");
        const cb = c && c.getBoundingClientRect().height > 0 ? c.getBoundingClientRect() : null;
        return { n: acts.length, bottom: Math.max(...acts.map((e) => e.getBoundingClientRect().bottom)), consentTop: cb ? cb.top : null, vh: innerHeight };
      });
      const label = `${viewport.width}×${viewport.height}`;
      if (!r.n) { ko(`${label} : aucun CTA trouvé dans [data-sx-hero] .sx-hero-actions`); }
      else if (r.consentTop === null) { ko(`${label} : consentement [data-sx-consent] non affiché`); }
      else if (r.bottom <= r.consentTop && r.bottom <= r.vh) ok(`${label} : CTA (bas ${Math.round(r.bottom)}) au-dessus du consentement (haut ${Math.round(r.consentTop)})`);
      else ko(`${label} : CTA bas ${Math.round(r.bottom)} / consentement haut ${Math.round(r.consentTop)} / écran ${r.vh}`);
      await ctx.close();
    }
  }
  if (checks.has("lcp")) {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      const { ctx, page } = await open(viewport, path, { consent: "ouvert" });
      await page.waitForTimeout(2500);
      const r = await page.evaluate(() => new Promise((res) => {
        let last = null;
        new PerformanceObserver((l) => { for (const e of l.getEntries()) last = e; }).observe({ type: "largest-contentful-paint", buffered: true });
        setTimeout(() => res(last ? { tag: last.element ? last.element.tagName.toLowerCase() + (last.element.className ? "." + String(last.element.className).split(" ")[0] : "") + " « " + (last.element.textContent || "").trim().slice(0, 40) + " »" : "?", inH1: !!(last.element && last.element.closest("h1")), size: last.size, url: last.url } : null), 300);
      }));
      const label = `${viewport.width}×${viewport.height}`;
      if (r && r.inH1) ok(`${label} : LCP = H1 (${r.size}px²)`); else ko(`${label} : LCP = ${r ? r.tag + " " + (r.url || "") + " " + r.size + "px²" : "aucun"}`);
      await ctx.close();
    }
  }
  if (checks.has("reduced")) {
    const { ctx, page } = await open({ width: 390, height: 844 }, path, { reduced: true });
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(600);
    const n = await page.evaluate(() => document.getAnimations().map((a) => (a.animationName || a.constructor.name) + "@" + (a.effect?.target?.className || "")));
    if (n.length === 0) ok("mode réduit : 0 animation après 5 s"); else ko(`mode réduit : ${n.length} animation(s) : ${n.slice(0, 5).join(", ")}`);
    await ctx.close();
  }
  if (checks.has("reveal")) {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      const { ctx, page } = await open(viewport, path, { consent: "ferme" });
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= h; y += Math.floor(viewport.height * 0.6)) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(900);
      const r = await page.evaluate(() => { const all = document.querySelectorAll(".sx-reveal"); const last = all[all.length - 1]; return { n: all.length, op: last ? getComputedStyle(last).opacity : null }; });
      const label = `${viewport.width}×${viewport.height}`;
      if (!r.n) ok(`${label} : aucun .sx-reveal (rien à contrôler)`);
      else if (Number(r.op) === 1) ok(`${label} : dernier .sx-reveal opacité 1 (${r.n} éléments)`); else ko(`${label} : dernier .sx-reveal opacité ${r.op}`);
      await ctx.close();
    }
  }
  if (checks.has("font")) {
    for (const width of [360, 390, 412, 1440]) {
      const held = [];
      const opened = await open({ width, height: 900 }, path, {
        consent: "ferme",
        waitUntil: "domcontentloaded",
        beforeGoto: (p) => p.route(/\.woff2(\?|$)/, (route) => { held.push(route); }),
      }).catch((e) => ({ error: e }));
      const { ctx, page } = opened;
      if (!page) { ko(`${width}px : chargement impossible (${opened.error?.message?.split("\n")[0]})`); continue; }
      const measure = () => page.evaluate(() => { const h = document.querySelector("h1"); if (!h) return null; const n = h.nextElementSibling || h.parentElement?.nextElementSibling; const a = h.getBoundingClientRect(); return { top: a.top + scrollY, h: a.height, next: n ? n.getBoundingClientRect().top + scrollY : null }; });
      await page.waitForTimeout(400);
      const before = await measure();
      for (const r of held) await r.continue().catch(() => {});
      await page.unroute(/\.woff2(\?|$)/);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      const after = await measure();
      const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family + " " + f.stretch));
      if (!before || !after) { ko(`${width}px : pas de h1`); }
      else {
        const d = Math.max(Math.abs(after.h - before.h), Math.abs((after.next ?? 0) - (before.next ?? 0)));
        const info = `polices bloquées ${held.length}, chargées : ${fonts.join(", ") || "aucune"}`;
        if (d <= 1) ok(`${width}px : décalage H1 ${d.toFixed(2)} px (${info})`); else ko(`${width}px : décalage H1 ${d.toFixed(2)} px (hauteur ${before.h.toFixed(1)} → ${after.h.toFixed(1)}) (${info})`);
      }
      await ctx.close();
    }
  }
}
await browser.close();
console.log(`\n${failures} écart(s)`);
process.exit(failures ? 1 : 0);
