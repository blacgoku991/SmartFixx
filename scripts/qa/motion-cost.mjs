// Coût d'une animation, mesuré en CDP (Performance.getMetrics), CPU ralenti 4 fois.
//   node scripts/qa/motion-cost.mjs <baseURL> <chemin> <sélecteur> [--window=4000] [--width=1440] [--height=900]
// Ouvre la page (consentement fermé, mouvement autorisé), attend html[data-motion="on"] (MotionGate),
// fait défiler l'élément dans l'écran, attend qu'une animation y tourne, puis mesure pendant la fenêtre :
//  - LayoutCount (doit rester à 0 : charte R11 et amendement du mouvement) ;
//  - RecalcStyleCount, TaskDuration (≤ 20 ms par seconde d'animation visé).
// Code de sortie 1 si LayoutCount augmente pendant la fenêtre, ou si aucune animation n'a été trouvée.
import { chromium } from "playwright";
const argv = process.argv.slice(2);
const [base, path, selector] = argv;
const opt = (k, d) => Number((argv.find((a) => a.startsWith(`--${k}=`)) || "").split("=")[1] || d);
if (!base || !path || !selector) { console.error("usage : motion-cost.mjs <base> <chemin> <sélecteur>"); process.exit(2); }
const windowMs = opt("window", 4000);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: opt("width", 1440), height: opt("height", 900) }, reducedMotion: "no-preference" });
await ctx.addInitScript(() => { try { localStorage.setItem("smartfixx-statistics-preference-v1", JSON.stringify({ value: "no", at: Date.now() })); localStorage.removeItem("smartfixx-motion-paused"); } catch {} });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Performance.enable");
await page.goto(base.replace(/\/$/, "") + path, { waitUntil: "load", timeout: 60000 });
try { await page.waitForSelector('html[data-motion="on"]', { timeout: 6000 }); } catch { console.log("  ! html[data-motion=on] absent (MotionGate a refusé le mouvement ?)"); }
await page.locator(selector).first().scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
const running = async () => page.evaluate((sel) => { const root = document.querySelector(sel); if (!root) return -1; return document.getAnimations().filter((a) => { const t = a.effect && a.effect.target; return t && (root === t || root.contains(t)) && a.playState === "running"; }).length; }, selector);
let n = await running();
for (let i = 0; i < 20 && n === 0; i++) { await page.waitForTimeout(250); n = await running(); }
const metrics = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
const a = await metrics();
await page.waitForTimeout(windowMs);
const b = await metrics();
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
await browser.close();
const d = (k) => (b[k] || 0) - (a[k] || 0);
const res = { chemin: path, selecteur: selector, animationsEnCours: n, fenetreMs: windowMs, LayoutCount: d("LayoutCount"), RecalcStyleCount: d("RecalcStyleCount"), TaskDurationMs: +(d("TaskDuration") * 1000).toFixed(1), msParSeconde: +((d("TaskDuration") * 1000) / (windowMs / 1000)).toFixed(1) };
console.log(JSON.stringify(res, null, 1));
if (n <= 0) { console.log("✗ aucune animation en cours dans le sélecteur"); process.exit(1); }
if (res.LayoutCount > 0) { console.log("✗ LayoutCount augmente pendant l'animation"); process.exit(1); }
console.log("✓ LayoutCount stable pendant l'animation");
