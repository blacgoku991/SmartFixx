// Contrôles de mise en page et de mouvement sur une variante servie.
//   node scripts/qa/layout-check.mjs <baseURL> /chemin1 /chemin2 … [--checks=overflow,header,menu,theme,cta,lcp,h1,reduced,reveal900,reveal,font,tab,icons,media]
// Par défaut, tous les contrôles. Code de sortie 1 si un écart est constaté (tous sont listés).
//  overflow : aucun défilement horizontal à 360, 390, 412, 768, 1024, 1180, 1280, 1366, 1440 et 1600 px ;
//  header   : aux mêmes largeurs et de 1024 à 1600 px par pas de 20 px (thèmes sombre et clair),
//             .sx-header-inner ne déborde pas (scrollWidth ≤ clientWidth), aucun lien ou bouton visible n'en
//             chevauche un autre ni n'est tronqué, aucun point n'est recouvert par le ThemeControl fixe
//             (elementFromPoint sur une grille de 5 × 3 points), bouton de pause affiché (data-motion=on
//             forcé : pire cas) ; navigation d'ordinateur : « Création de site », « Refonte » et
//             « Prestations » visibles dès 1180 px, « Asnières & Île-de-France » dès 1420 px, navigation
//             complète et plus de bouton Menu dès 1520 px ;
//  menu     : menu mobile ouvert à 390 × 844, deux thèmes : contraste calculé ≥ 4,5 pour chaque .sx-btn,
//             numéro de téléphone et contrôle des animations visibles du menu (couleur du texte sur le premier fond opaque) ;
//  theme    : interrupteur du ThemeControl à 390 et 1440, deux états : curseur visible (pas de
//             clip-path), contenu dans la piste, piste ≥ 44 × 26, zone de clic ≥ 44 px de haut ;
//  cta      : le bas des CTA du hero ([data-sx-hero] .sx-hero-actions) est au-dessus du haut du
//             consentement ([data-sx-consent]) à 360 × 640, 390 × 664, 412 × 823 et 1440 × 900,
//             consentement ouvert, et visible dans le premier écran ; sur mobile (360, 390, 412), avec
//             une marge d'au moins 16 px (budget de lignes du hero, docs/DESIGN_SYSTEM.md) ;
//  lcp      : l'élément LCP (PerformanceObserver) est le H1 ou un de ses descendants (390 × 844, 1440 × 900) ;
//  h1       : exactement un h1 ;
//  reduced  : avec reducedMotion=reduce, document.getAnimations().length === 0 après 5 s ;
//  reveal900 : R6, aucune révélation dans les 900 premiers pixels : page en haut, à 390 × 844 et 1440 × 900,
//             aucun .sx-reveal, .sx-kinetic .sx-kw ni .sx-parallax visible dont le haut (top + scrollY) est
//             à moins de 900 px ;
//  reveal   : opacité calculée 1 sur le dernier .sx-reveal après défilement complet (390 × 844, 1440 × 900),
//             et, pour CHAQUE .sx-reveal, opacité ≥ 0,99 quand son haut est placé à mi-hauteur d'écran (pas de
//             bloc translucide en zone de lecture, même pour un bloc plus haut que l'écran) ;
//  tab      : l'interrupteur de thème est atteint en 12 tabulations au plus (390 et 1440) ;
//  icons    : aucune icône SVG visible comprimée (largeur rendue < 90 % de sa hauteur : icônes lucide carrées),
//             390 et 1440, deux thèmes ;
//  media    : chaque image de <picture class="sx-media"> : largeur du fichier choisi ≥ 0,8 × largeur rendue ×
//             DPR (390 en DPR 3, 1440 en DPR 1 et 2) ;
//  font     : police bloquée puis libérée, décalage vertical du H1 et de l'élément suivant ≤ 1 px
//             (360, 390, 412, 1440).
import { chromium } from "playwright";
const argv = process.argv.slice(2);
const base = argv[0]?.replace(/\/$/, "");
const paths = argv.slice(1).filter((a) => !a.startsWith("--"));
const checksArg = argv.find((a) => a.startsWith("--checks="));
const checks = new Set((checksArg ? checksArg.slice(9) : "overflow,header,menu,theme,cta,lcp,h1,reduced,reveal900,reveal,font,tab,icons,media").split(","));
const WIDTHS = [360, 390, 412, 768, 1024, 1180, 1280, 1366, 1440, 1600];
// En-tête : toutes les largeurs d'ordinateur de 1024 à 1600 px par pas de 20 px (paliers 1180, 1420, 1520).
const HEADER_WIDTHS = [...new Set([...WIDTHS, ...Array.from({ length: 29 }, (_, i) => 1024 + i * 20), 1179, 1419, 1519, 1520])].sort((a, b) => a - b);
// Contraste WCAG d'un élément : couleur du texte sur le premier fond opaque de ses ancêtres.
const contrastOf = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== "hidden").map((e) => {
  const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  let bg = null; for (let n = e; n; n = n.parentElement) { const c = rgb(getComputedStyle(n).backgroundColor); if (c.length >= 3 && (c.length < 4 || c[3] > 0.9)) { bg = c; break; } }
  bg = bg || rgb(getComputedStyle(document.body).backgroundColor);
  const fg = rgb(getComputedStyle(e).color); const [x, y] = [lum(fg), lum(bg)].sort((p, q) => q - p);
  return { label: (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 30), ratio: +((x + 0.05) / (y + 0.05)).toFixed(2) };
});
if (!base || !paths.length) { console.error("usage : layout-check.mjs <base> /chemin… [--checks=…]"); process.exit(2); }
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium" });
let failures = 0;
const ok = (m) => console.log("  ✓", m);
const ko = (m) => { failures++; console.log("  ✗", m); };
async function open(viewport, path, { consent = "ouvert", reduced = false, theme = "dark", beforeGoto, waitUntil = "load", dpr = 1 } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dpr, reducedMotion: reduced ? "reduce" : "no-preference" });
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
    for (const width of WIDTHS) {
      const { ctx, page } = await open({ width, height: 900 }, path);
      await page.waitForTimeout(600);
      const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        culprits: [...document.querySelectorAll("body *")].filter((e) => { const b = e.getBoundingClientRect(); return b.right > document.documentElement.clientWidth + 1 && getComputedStyle(e).position !== "fixed"; }).slice(0, 4).map((e) => e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.split(" ").slice(0, 2).join(".") : "")) }));
      if (r.sw <= r.cw) ok(`pas de défilement horizontal à ${width}px`); else ko(`défilement horizontal à ${width}px (${r.sw} > ${r.cw}) : ${r.culprits.join(", ")}`);
      await ctx.close();
    }
  }
  if (checks.has("header")) {
    for (const theme of ["dark", "light"]) {
      const { ctx, page } = await open({ width: 1440, height: 900 }, path, { consent: "ferme", theme });
      await page.waitForTimeout(400);
      // Pire cas : le bouton de pause des animations (visible sous data-motion=on) occupe 52 px de plus.
      await page.evaluate(() => { document.documentElement.dataset.motion = "on"; document.documentElement.removeAttribute("data-motion-paused"); });
      const bad = [];
      for (const width of HEADER_WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForTimeout(150);
        const r = await page.evaluate(() => {
          const inner = document.querySelector(".sx-header-inner"); const tc = document.querySelector(".theme-control");
          if (!inner) return { missing: true };
          const vis = [...inner.querySelectorAll("a,button,summary")].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== "hidden"; });
          const name = (e) => (e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 24);
          // Chevauchements entre contrôles (une navigation comprimée déborde sur les actions sans faire
          // grandir scrollWidth) et libellés tronqués.
          const clash = [];
          for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
            if (vis[i].contains(vis[j]) || vis[j].contains(vis[i])) continue;
            const a = vis[i].getBoundingClientRect(), b = vis[j].getBoundingClientRect();
            const x = Math.min(a.right, b.right) - Math.max(a.left, b.left), y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            if (x > 1 && y > 1) clash.push(`${name(vis[i])} / ${name(vis[j])} (${Math.round(x)} px)`);
          }
          for (const e of vis) if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) clash.push(`${name(e)} tronqué (${e.scrollWidth} > ${e.clientWidth})`);
          const shown = new Set(vis.filter((e) => e.closest(".sx-nav")).map((e) => (e.textContent || "").trim()));
          const menu = vis.some((e) => e.classList.contains("sx-menu-button"));
          const covered = [];
          for (const e of vis) {
            const b = e.getBoundingClientRect(); let hit = 0;
            for (const fx of [0.1, 0.3, 0.5, 0.7, 0.9]) for (const fy of [0.25, 0.5, 0.75]) {
              const x = b.left + b.width * fx, y = b.top + b.height * fy;
              if (x < 0 || x >= innerWidth) { hit++; continue; }
              const at = document.elementFromPoint(x, y);
              if (at && tc && tc.contains(at)) hit++;
            }
            if (hit) covered.push(`${(e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 24)} (${hit}/15)`);
          }
          return { overflow: inner.scrollWidth > inner.clientWidth + 1 ? `${inner.scrollWidth} > ${inner.clientWidth}` : "", covered, clash, shown: [...shown], menu };
        });
        if (r.missing) { bad.push(`${width}px : pas de .sx-header-inner`); break; }
        const short = ["Création de site", "Refonte", "Prestations"];
        const need = width >= 1520 ? [...short, "Asnières & Île-de-France", "Conseils"] : width >= 1420 ? [...short, "Asnières & Île-de-France"] : width >= 1180 ? short : [];
        const missing = need.filter((n) => !r.shown.includes(n));
        const nav = [];
        if (missing.length) nav.push(`navigation : ${missing.join(", ")} absent(s)`);
        if (width >= 1520 && r.menu) nav.push("bouton Menu encore affiché");
        if (width < 1520 && !r.menu) nav.push("bouton Menu absent");
        if (r.overflow || r.covered.length || r.clash.length || nav.length) bad.push(`${width}px : ${r.overflow ? "en-tête déborde " + r.overflow + " ; " : ""}${r.covered.length ? "recouverts par le ThemeControl ou hors écran : " + r.covered.join(", ") + " ; " : ""}${r.clash.length ? "chevauchements : " + r.clash.join(", ") + " ; " : ""}${nav.join(" ; ")}`);
      }
      if (bad.length) bad.forEach((b) => ko(`en-tête (${theme}) ${b}`)); else ok(`en-tête (${theme}) : ni débordement, ni chevauchement, ni recouvrement sur ${HEADER_WIDTHS.length} largeurs de ${HEADER_WIDTHS[0]} à ${HEADER_WIDTHS[HEADER_WIDTHS.length - 1]} px ; navigation courte dès 1180, complète dès 1520 (bouton de pause affiché)`);
      await ctx.close();
    }
  }
  if (checks.has("menu")) {
    for (const theme of ["dark", "light"]) {
      const { ctx, page } = await open({ width: 390, height: 844 }, path, { consent: "ferme", theme });
      const btn = page.locator(".sx-menu-button");
      if (!(await btn.count())) { ko(`menu (${theme}) : pas de bouton .sx-menu-button`); await ctx.close(); continue; }
      await btn.click(); await page.waitForTimeout(400);
      const r = await page.evaluate(contrastOf, ".sx-menu .sx-btn, .sx-menu .sx-phone-number, .sx-menu .sx-motion-toggle");
      const low = r.filter((x) => x.ratio < 4.5);
      if (!r.length) ko(`menu (${theme}) : aucun .sx-btn visible dans le menu ouvert`);
      else if (low.length) ko(`menu (${theme}) : contraste insuffisant ${low.map((x) => `« ${x.label} » ${x.ratio}:1`).join(", ")}`);
      else ok(`menu (${theme}) : ${r.length} bouton(s), contraste min ${Math.min(...r.map((x) => x.ratio))}:1`);
      await ctx.close();
    }
  }
  if (checks.has("theme")) {
    for (const width of [390, 1440]) {
      const { ctx, page } = await open({ width, height: 900 }, path, { consent: "ferme", theme: "dark" });
      await page.waitForTimeout(300);
      for (const step of ["sombre", "clair"]) {
        const r = await page.evaluate(() => {
          const th = document.querySelector(".theme-control [data-slot=switch-thumb]"); if (!th) return null;
          const sw = th.closest("[data-slot=switch]"); const t = th.getBoundingClientRect(), s = sw.getBoundingClientRect(); const cs = getComputedStyle(th);
          const hit = getComputedStyle(sw, "::after"); const hitH = hit.content !== "none" && hit.position === "absolute" ? s.height - parseFloat(hit.top) - parseFloat(hit.bottom) : s.height;
          return { clip: cs.clipPath, pos: cs.position, vis: cs.visibility, w: t.width, inside: t.left >= s.left - 0.5 && t.right <= s.right + 0.5 && t.top >= s.top - 0.5 && t.bottom <= s.bottom + 0.5, track: [Math.round(s.width), Math.round(s.height)], hitH: Math.round(hitH), state: sw.getAttribute("data-state") };
        });
        const label = `${width}px, ${step}`;
        if (!r) { ko(`interrupteur (${label}) : introuvable`); break; }
        const errs = [];
        if (r.clip !== "none" || r.pos === "absolute" || r.vis === "hidden" || r.w < 10) errs.push(`curseur masqué (clip ${r.clip}, position ${r.pos})`);
        if (!r.inside) errs.push("curseur hors de la piste");
        if (r.track[0] < 44 || r.track[1] < 26) errs.push(`piste ${r.track.join(" × ")}`);
        if (r.hitH < 44) errs.push(`zone de clic ${r.hitH} px de haut`);
        if (errs.length) ko(`interrupteur (${label}, ${r.state}) : ${errs.join(" ; ")}`); else ok(`interrupteur (${label}, ${r.state}) : curseur visible dans la piste ${r.track.join(" × ")}, clic ${r.hitH} px`);
        if (step === "sombre") { await page.locator(".theme-control [data-slot=switch]").click(); await page.waitForTimeout(250); }
      }
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
      const gap = viewport.width < 768 ? 16 : 0; const margin = Math.round(r.consentTop - r.bottom);
      if (!r.n) { ko(`${label} : aucun CTA trouvé dans [data-sx-hero] .sx-hero-actions`); }
      else if (r.consentTop === null) { ko(`${label} : consentement [data-sx-consent] non affiché`); }
      else if (r.bottom + gap <= r.consentTop && r.bottom <= r.vh) ok(`${label} : CTA (bas ${Math.round(r.bottom)}) au-dessus du consentement (haut ${Math.round(r.consentTop)}), marge ${margin} px${gap ? " ≥ " + gap : ""}`);
      else ko(`${label} : CTA bas ${Math.round(r.bottom)} / consentement haut ${Math.round(r.consentTop)} / écran ${r.vh} : marge ${margin} px${gap ? " (minimum " + gap + " px : budget de lignes du hero dépassé, voir DESIGN_SYSTEM.md)" : ""}`);
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
  if (checks.has("reveal900")) {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      const { ctx, page } = await open(viewport, path, { consent: "ferme" });
      await page.waitForTimeout(300);
      const r = await page.evaluate(() => [...document.querySelectorAll(".sx-reveal, .sx-kinetic .sx-kw, .sx-parallax")].filter((e) => getComputedStyle(e).display !== "none").map((e) => ({ top: Math.round(e.getBoundingClientRect().top + scrollY), what: (e.classList.contains("sx-kw") ? ".sx-kw" : e.classList.contains("sx-parallax") ? ".sx-parallax" : ".sx-reveal") + " « " + (e.textContent || "").trim().slice(0, 30) + " »" })).filter((x) => x.top < 900));
      const label = `${viewport.width}×${viewport.height}`;
      if (r.length) ko(`${label} : révélation dans les 900 premiers pixels (R6) : ${r.slice(0, 5).map((x) => `${x.what} à ${x.top} px`).join(" ; ")}`); else ok(`${label} : aucune révélation dans les 900 premiers pixels (R6)`);
      await ctx.close();
    }
  }
  if (checks.has("reveal")) {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      const { ctx, page } = await open(viewport, path, { consent: "ferme" });
      await page.waitForSelector("html[data-motion]", { timeout: 6000 }).catch(() => {});
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= h; y += Math.floor(viewport.height * 0.6)) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(900);
      const r = await page.evaluate(() => { const all = document.querySelectorAll(".sx-reveal"); const last = all[all.length - 1]; return { n: all.length, op: last ? getComputedStyle(last).opacity : null }; });
      const label = `${viewport.width}×${viewport.height}`;
      if (!r.n) ok(`${label} : aucun .sx-reveal (rien à contrôler)`);
      else if (Number(r.op) === 1) ok(`${label} : dernier .sx-reveal opacité 1 (${r.n} éléments)`); else ko(`${label} : dernier .sx-reveal opacité ${r.op}`);
      if (r.n) {
        const motion = await page.evaluate(() => document.documentElement.dataset.motion || "absent");
        const low = [];
        for (let i = 0; i < r.n; i++) {
          await page.evaluate(([k, vh]) => { const e = document.querySelectorAll(".sx-reveal")[k]; window.scrollTo(0, e.getBoundingClientRect().top + scrollY - vh / 2); }, [i, viewport.height]);
          await page.waitForTimeout(200);
          const m = await page.evaluate((k) => { const e = document.querySelectorAll(".sx-reveal")[k]; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), h: Math.round(b.height), op: Number(getComputedStyle(e).opacity) }; }, i);
          if (m.top <= viewport.height / 2 + 2 && m.op < 0.99) low.push(`n° ${i + 1} (hauteur ${m.h} px, haut à ${m.top} px) opacité ${m.op.toFixed(2)}`);
        }
        if (low.length) ko(`${label} : .sx-reveal translucide en zone de lecture : ${low.join(" ; ")}`); else ok(`${label} : chaque .sx-reveal opaque (≥ 0,99) dès que son haut atteint la mi-hauteur (data-motion=${motion})`);
      }
      await ctx.close();
    }
  }
  if (checks.has("tab")) {
    for (const width of [390, 1440]) {
      const { ctx, page } = await open({ width, height: 900 }, path, { consent: "ferme" });
      await page.waitForTimeout(300);
      let reached = 0;
      for (let i = 1; i <= 40; i++) {
        await page.keyboard.press("Tab");
        if (await page.evaluate(() => !!document.activeElement?.closest(".theme-control"))) { reached = i; break; }
      }
      if (reached && reached <= 12) ok(`${width}px : interrupteur de thème atteint à la tabulation ${reached}`); else ko(`${width}px : interrupteur de thème ${reached ? "atteint à la tabulation " + reached : "non atteint en 40 tabulations"} (plafond 12)`);
      await ctx.close();
    }
  }
  if (checks.has("icons")) {
    for (const theme of ["dark", "light"]) for (const width of [390, 1440]) {
      const { ctx, page } = await open({ width, height: 900 }, path, { consent: "ferme", theme });
      await page.waitForTimeout(300);
      const bad = await page.evaluate(() => [...document.querySelectorAll("svg")].filter((e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.height >= 8 && cs.visibility !== "hidden" && cs.display !== "none" && b.width < 0.9 * b.height && /lucide/.test(e.getAttribute("class") || ""); }).slice(0, 6).map((e) => `${(e.getAttribute("class") || "").split(" ").find((c) => c.startsWith("lucide-")) || "svg"} ${e.getBoundingClientRect().width.toFixed(1)}×${e.getBoundingClientRect().height.toFixed(1)}`));
      if (bad.length) ko(`${width}px (${theme}) : icône(s) comprimée(s) : ${bad.join(", ")}`); else ok(`${width}px (${theme}) : aucune icône comprimée`);
      await ctx.close();
    }
  }
  if (checks.has("media")) {
    for (const [viewport, dpr] of [[{ width: 390, height: 844 }, 3], [{ width: 1440, height: 900 }, 1], [{ width: 1440, height: 900 }, 2]]) {
      const { ctx, page } = await open(viewport, path, { consent: "ferme", dpr });
      const n = await page.locator("picture.sx-media img").count();
      const label = `${viewport.width}px DPR ${dpr}`;
      if (!n) { ok(`${label} : aucune image .sx-media`); await ctx.close(); continue; }
      const bad = [];
      for (let i = 0; i < n; i++) {
        const img = page.locator("picture.sx-media img").nth(i);
        await img.evaluate((e) => { e.loading = "eager"; e.scrollIntoView({ block: "center" }); });
        await page.waitForFunction((k) => { const e = document.querySelectorAll("picture.sx-media img")[k]; return e.complete && e.currentSrc; }, i, { timeout: 10000 }).catch(() => {});
        const m = await img.evaluate(async (e) => { const im = new Image(); im.src = e.currentSrc; try { await im.decode(); } catch {} return { file: e.currentSrc.split("/").pop(), fileW: im.naturalWidth, shown: e.getBoundingClientRect().width }; });
        const need = 0.8 * m.shown * dpr;
        if (m.fileW < need) bad.push(`${m.file} ${m.fileW} px pour ${Math.round(m.shown)} px CSS × ${dpr} (minimum ${Math.round(need)})`);
      }
      if (bad.length) ko(`${label} : image(s) agrandie(s) : ${bad.join(" ; ")}`); else ok(`${label} : ${n} image(s) .sx-media nette(s)`);
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
