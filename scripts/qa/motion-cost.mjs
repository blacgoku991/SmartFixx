// Coût d'une animation, mesuré en CDP (Performance.getMetrics), CPU ralenti 4 fois.
//   node scripts/qa/motion-cost.mjs <baseURL> <chemin> <sélecteur> [--window=4000] [--width=1440] [--height=900] [--budget=20] [--settle=2500] [--runs=3]
// Ouvre la page (consentement fermé, mouvement autorisé), attend html[data-motion="on"] (MotionGate), puis
// --settle ms (2500 par défaut) : le pic de démarrage de TOUTES les animations au passage à data-motion=on
// (une fois par page, environ 1,5 s sous CPU × 4) est exclu de la mesure ; sans ce délai, la mesure de
// l'ambiance du hero varie de 15 à 25 ms/s d'une passe à l'autre (4 ms/s une fois le pic passé). Attention :
// tout départ d'animation (entrée unique, délai positif) coûte une rafale d'images sur le fil principal ;
// une entrée de 0,9 s différée après le pic a été mesurée à 40 ms/s, d'où son retrait. Fait ensuite défiler l'élément dans l'écran, attend qu'une animation y
// tourne, puis mesure pendant la fenêtre :
//  - LayoutCount (doit rester à 0 : charte R11 et amendement du mouvement) ;
//  - RecalcStyleCount, TaskDuration rapportée en ms par seconde (plafond R11 : 20 ms/s, --budget).
// La fenêtre est bornée à la fin de la plus longue animation FINIE en cours dans le sélecteur
// (scène jouée une fois) ; une animation infinie (ambiance) garde la fenêtre demandée. Après la fenêtre,
// 800 ms supplémentaires sont mesurées À PART (« finDeScene ») : la fin d'une scène (ScenePlayer passe à
// done) peut légitimement provoquer une mise en page, qui n'est pas comptée dans le budget de l'animation.
// La mesure est répétée --runs fois (3 par défaut, navigateur neuf à chaque fois) : le budget porte sur la
// MÉDIANE (une fenêtre courte de scène est bruitée), LayoutCount sur CHAQUE passe.
// Code de sortie 1 si LayoutCount augmente pendant une fenêtre, si la médiane dépasse le budget, ou si
// aucune animation n'a été trouvée.
//
// Mode défilement : node scripts/qa/motion-cost.mjs <base> <chemin> --scroll [--width=390] [--height=844]
//   [--runs=3] [--max-overhead-pct=40] [--max-overhead-ms=60]
// Les effets liés au défilement (révélations, mots cinétiques, parallaxe, ville qui s'enfonce) sont des
// animations de timeline : la mesure immobile ne les voit pas. On parcourt toute la page à la molette
// (120 px toutes les 50 ms) sous CPU × 4, en mode animé (après data-motion=on et --settle) puis avec le
// contrôle global en pause (localStorage 'smartfixx-motion-paused' : ni timeline de défilement, ni ambiance
// qui tourne), qui sert de référence du coût du défilement lui-même. La référence n'est PAS le mode réduit :
// sous reducedMotion=reduce, Chromium ne lisse plus le défilement à la molette (moins d'images), ce qui
// fausse la comparaison (mesuré : 275 ms/s en réduit, 354 ms/s en mode animé sans aucune animation). Échec si
// LayoutCount (médiane) dépasse la référence de plus de 2, ou si le surcoût de TaskDuration (ms par seconde
// de défilement, médianes) dépasse À LA FOIS --max-overhead-pct % et --max-overhead-ms ms/s.
import { chromium } from "playwright";
const argv = process.argv.slice(2);
const [base, path, selector] = argv;
const opt = (k, d) => Number((argv.find((a) => a.startsWith(`--${k}=`)) || "").split("=")[1] || d);
if (argv.includes("--scroll")) {
  if (!base || !path) { console.error("usage : motion-cost.mjs <base> <chemin> --scroll"); process.exit(2); }
  const viewport = { width: opt("width", 390), height: opt("height", 844) };
  async function scrollOnce(paused) {
    const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium" });
    const ctx = await browser.newContext({ viewport, reducedMotion: "no-preference" });
    await ctx.addInitScript((pz) => { try { localStorage.setItem("smartfixx-statistics-preference-v1", JSON.stringify({ value: "no", at: Date.now() })); if (pz) localStorage.setItem("smartfixx-motion-paused", "1"); else localStorage.removeItem("smartfixx-motion-paused"); } catch {} }, paused);
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Performance.enable");
    await page.goto(base.replace(/\/$/, "") + path, { waitUntil: "load", timeout: 60000 });
    try { await page.waitForSelector('html[data-motion="on"]', { timeout: 6000 }); } catch { console.log("  ! html[data-motion=on] absent"); }
    await page.waitForTimeout(opt("settle", 2500));
    await page.mouse.move(viewport.width / 2, viewport.height / 2);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    const metrics = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
    const a = await metrics(); const t0 = Date.now(); let steps = 0;
    for (; steps < 400; steps++) {
      await page.mouse.wheel(0, 120); await page.waitForTimeout(50);
      if (steps % 5 === 4 && await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2)) break;
    }
    await page.waitForTimeout(300);
    const b = await metrics(); const elapsed = Date.now() - t0;
    const anims = await page.evaluate(() => document.getAnimations().length);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    await browser.close();
    const d = (k) => (b[k] || 0) - (a[k] || 0);
    return { mode: paused ? "pause" : "animé", animations: anims, crans: steps + 1, dureeMs: elapsed, LayoutCount: d("LayoutCount"), RecalcStyleCount: d("RecalcStyleCount"), TaskDurationMs: +(d("TaskDuration") * 1000).toFixed(0), msParSeconde: +((d("TaskDuration") * 1000) / (elapsed / 1000)).toFixed(1) };
  }
  const med = (xs) => { const s = [...xs].sort((x, y) => x - y); return s[Math.floor((s.length - 1) / 2)]; };
  const runs = Math.max(1, opt("runs", 3)); const anim = [], red = [];
  for (let i = 0; i < runs; i++) { anim.push(await scrollOnce(false)); red.push(await scrollOnce(true)); }
  const A = { ms: med(anim.map((r) => r.msParSeconde)), layout: med(anim.map((r) => r.LayoutCount)), recalc: med(anim.map((r) => r.RecalcStyleCount)) };
  const R = { ms: med(red.map((r) => r.msParSeconde)), layout: med(red.map((r) => r.LayoutCount)), recalc: med(red.map((r) => r.RecalcStyleCount)) };
  const over = +(A.ms - R.ms).toFixed(1), pct = R.ms > 0 ? +((100 * (A.ms - R.ms)) / R.ms).toFixed(0) : 0;
  console.log(JSON.stringify({ chemin: path, viewport, passes: [...anim, ...red], anime: A, pause: R, surcoutMsParSeconde: over, surcoutPct: pct }, null, 1));
  let bad = 0;
  if (A.layout > R.layout + 2) { console.log(`✗ LayoutCount au défilement : ${A.layout} (animé) contre ${R.layout} (pause)`); bad++; } else console.log(`✓ LayoutCount au défilement stable : ${A.layout} (animé) / ${R.layout} (pause)`);
  const maxPct = opt("max-overhead-pct", 40), maxMs = opt("max-overhead-ms", 60);
  if (pct > maxPct && over > maxMs) { console.log(`✗ surcoût du défilement animé : +${over} ms/s (+${pct} %), plafonds +${maxMs} ms/s ou +${maxPct} %`); bad++; }
  else console.log(`✓ surcoût du défilement animé : +${over} ms/s (+${pct} %) ; ${A.ms} contre ${R.ms} ms/s ; recalculs de style ${A.recalc} contre ${R.recalc}`);
  process.exit(bad ? 1 : 0);
}
if (!base || !path || !selector) { console.error("usage : motion-cost.mjs <base> <chemin> <sélecteur>"); process.exit(2); }
const windowMs = opt("window", 4000);
const budget = opt("budget", 20);
async function measureOnce() {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium" });
  const ctx = await browser.newContext({ viewport: { width: opt("width", 1440), height: opt("height", 900) }, reducedMotion: "no-preference" });
  await ctx.addInitScript(() => { try { localStorage.setItem("smartfixx-statistics-preference-v1", JSON.stringify({ value: "no", at: Date.now() })); localStorage.removeItem("smartfixx-motion-paused"); } catch {} });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Performance.enable");
  await page.goto(base.replace(/\/$/, "") + path, { waitUntil: "load", timeout: 60000 });
  try { await page.waitForSelector('html[data-motion="on"]', { timeout: 6000 }); } catch { console.log("  ! html[data-motion=on] absent (MotionGate a refusé le mouvement ?)"); }
  await page.waitForTimeout(opt("settle", 2500));
  // evaluate plutôt que scrollIntoViewIfNeeded : Playwright attend qu'un élément soit immobile, ce qui
  // n'arrive jamais pour un décor animé en continu.
  await page.locator(selector).first().evaluate((e) => e.scrollIntoView({ block: "nearest" }));
  await page.waitForTimeout(400);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const running = async () => page.evaluate((sel) => { const root = document.querySelector(sel); if (!root) return -1; return document.getAnimations().filter((a) => { const t = a.effect && a.effect.target; return t && (root === t || root.contains(t)) && a.playState === "running"; }).length; }, selector);
  let n = await running();
  for (let i = 0; i < 20 && n === 0; i++) { await page.waitForTimeout(250); n = await running(); }
  // Reste à jouer de la plus longue animation finie en cours (ms de temps de document) ; Infinity si une
  // animation infinie tourne.
  const remaining = await page.evaluate((sel) => {
    const root = document.querySelector(sel); if (!root) return 0;
    let max = 0;
    for (const a of document.getAnimations()) {
      const t = a.effect && a.effect.target; if (!t || !(root === t || root.contains(t)) || a.playState !== "running") continue;
      const end = a.effect.getComputedTiming().endTime; const cur = Number(a.currentTime) || 0;
      if (!Number.isFinite(end)) return Infinity;
      max = Math.max(max, end - cur);
    }
    return max;
  }, selector);
  // Le CPU ralenti 4 fois ne change pas le temps du document : la borne est en temps réel.
  const effWindow = Math.max(250, Math.min(windowMs, Number.isFinite(remaining) ? Math.floor(remaining) - 50 : windowMs));
  const metrics = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  const a = await metrics();
  await page.waitForTimeout(effWindow);
  const b = await metrics();
  await page.waitForTimeout(800);
  const c = await metrics();
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await browser.close();
  const d = (k, x = a, y = b) => (y[k] || 0) - (x[k] || 0);
  return { animationsEnCours: n, fenetreMs: effWindow, borneeParLaFinDesAnimations: effWindow < windowMs, LayoutCount: d("LayoutCount"), RecalcStyleCount: d("RecalcStyleCount"), TaskDurationMs: +(d("TaskDuration") * 1000).toFixed(1), msParSeconde: +((d("TaskDuration") * 1000) / (effWindow / 1000)).toFixed(1),
    finDeScene: { dureeMs: 800, LayoutCount: d("LayoutCount", b, c), TaskDurationMs: +(d("TaskDuration", b, c) * 1000).toFixed(1) } };
}
const passes = [];
for (let i = 0; i < Math.max(1, opt("runs", 3)); i++) passes.push(await measureOnce());
const sorted = passes.map((p) => p.msParSeconde).sort((x, y) => x - y);
const median = sorted[Math.floor((sorted.length - 1) / 2)];
const res = { chemin: path, selecteur: selector, fenetreDemandeeMs: windowMs, budgetMsParSeconde: budget, passes, medianeMsParSeconde: median };
console.log(JSON.stringify(res, null, 1));
if (passes.some((p) => p.animationsEnCours <= 0)) { console.log("✗ aucune animation en cours dans le sélecteur"); process.exit(1); }
let bad = 0;
const layouts = passes.map((p) => p.LayoutCount);
if (layouts.some((l) => l > 0)) { console.log(`✗ LayoutCount augmente pendant l'animation (${layouts.join(", ")})`); bad++; } else console.log(`✓ LayoutCount stable pendant l'animation (${passes.length} passes)`);
if (median > budget) { console.log(`✗ médiane ${median} ms de tâches par seconde d'animation (plafond ${budget} ; passes ${sorted.join(", ")})`); bad++; } else console.log(`✓ médiane ${median} ms/s ≤ ${budget} ms/s (passes ${sorted.join(", ")})`);
const endLayouts = passes.map((p) => p.finDeScene.LayoutCount);
if (endLayouts.some((l) => l > 0)) console.log(`  ! note : mise(s) en page APRÈS la fenêtre (fin de scène, hors budget) : ${endLayouts.join(", ")}`);
process.exit(bad ? 1 : 0);
