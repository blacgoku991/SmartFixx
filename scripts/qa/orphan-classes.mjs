// Classes citées dans les .tsx sans règle CSS correspondante.
//   node scripts/qa/orphan-classes.mjs <dépôt> [--scope=admin|public] [--css=<dossier CSS construit>]
//                                       [--save=<fichier.json>] [--base=<fichier.json>]
// Sources CSS : toutes les .css du dépôt (app, components, vendor) + le dossier --css (par exemple
// <build VPS>/.next/static, qui contient les utilitaires Tailwind générés).
// --scope=admin : app/admin, vps/overlay/app/admin, components/admin-*, components/campaign-*,
//                 components/email-action.tsx et app/email ; --scope=public (défaut) : le reste de app
//                 et components, hors components/ui.
// --base : compare à une liste enregistrée (--save) et n'échoue que sur les orphelines NOUVELLES.
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
const argv = process.argv.slice(2);
const repo = path.resolve(argv[0] || ".");
const opt = (k) => (argv.find((a) => a.startsWith(`--${k}=`)) || "").split("=").slice(1).join("=") || null;
const scope = opt("scope") || "public";
function walk(dir, pred, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === ".git" || e === "dist") continue;
    const p = path.join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, pred, out); else if (pred(p)) out.push(p);
  }
  return out;
}
// 1. classes définies dans le CSS
const cssFiles = [...walk(path.join(repo, "app"), (p) => p.endsWith(".css")), ...walk(path.join(repo, "components"), (p) => p.endsWith(".css")), ...walk(path.join(repo, "vendor"), (p) => p.endsWith(".css"))];
if (opt("css")) cssFiles.push(...walk(path.resolve(opt("css")), (p) => p.endsWith(".css")));
const defined = new Set();
for (const f of cssFiles) {
  const css = readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of css.matchAll(/\.((?:\\.|[\w-])+)/g)) defined.add(m[1].replace(/\\(.)/g, "$1"));
}
// 2. classes citées par les .tsx du périmètre
const rel = (p) => path.relative(repo, p);
const isAdmin = (r) => /^app\/admin\//.test(r) || /^vps\/overlay\/app\/admin\//.test(r) || /^components\/(admin-|campaign-)/.test(r) || r === "components/email-action.tsx" || /^app\/email\//.test(r);
let files = [...walk(path.join(repo, "app"), (p) => p.endsWith(".tsx")), ...walk(path.join(repo, "components"), (p) => p.endsWith(".tsx")), ...walk(path.join(repo, "vps/overlay/app"), (p) => p.endsWith(".tsx"))];
files = files.filter((p) => { const r = rel(p); if (r.startsWith("components/ui/")) return false; return scope === "admin" ? isAdmin(r) : !isAdmin(r) && !r.startsWith("vps/"); });
function classExpressions(src) {
  const out = [];
  for (const m of src.matchAll(/className=("([^"]*)"|'([^']*)')/g)) out.push(m[2] ?? m[3]);
  let i = 0;
  while ((i = src.indexOf("className={", i)) !== -1) {
    let depth = 0, j = i + 10;
    for (; j < src.length; j++) { if (src[j] === "{") depth++; else if (src[j] === "}") { depth--; if (depth === 0) break; } }
    const expr = src.slice(i + 11, j);
    for (const m of expr.matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)) out.push((m[1] ?? m[2] ?? m[3]).replace(/\$\{[^}]*\}/g, " "));
    i = j;
  }
  return out;
}
const used = new Map();
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const expr of classExpressions(src)) for (const c of expr.split(/\s+/)) {
    if (!c || !/^[a-z!-]/i.test(c) || c.includes("=")) continue;
    const name = c.replace(/^!/, "");
    if (!used.has(name)) used.set(name, new Set());
    used.get(name).add(rel(f));
  }
}
const orphans = [...used.keys()].filter((c) => !defined.has(c)).sort();
const report = Object.fromEntries(orphans.map((c) => [c, [...used.get(c)]]));
if (opt("save")) writeFileSync(opt("save"), JSON.stringify(report, null, 1));
let failing = orphans;
if (opt("base")) {
  const base = JSON.parse(readFileSync(opt("base"), "utf8"));
  failing = orphans.filter((c) => !(c in base));
  console.log(`périmètre ${scope} : ${orphans.length} orpheline(s), dont ${failing.length} nouvelle(s) par rapport à la base (${Object.keys(base).length}).`);
} else console.log(`périmètre ${scope} : ${orphans.length} classe(s) orpheline(s) sur ${used.size} citée(s).`);
for (const c of failing) console.log(`  ${c}  ← ${report[c].join(", ")}`);
process.exit(failing.length ? 1 : 0);
