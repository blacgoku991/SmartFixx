// Images de contrôle : rend des images fixes à des instants donnés, sans encoder de vidéo.
//   node outils/apercus.mjs principale-9x16:1.5,4.2 principale-16x9:10 …   → .rendu/apercus/*.jpg
// (à lancer sous « flock /tmp/smartfixx-build.lock » quand la machine est partagée)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const VSL = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(VSL, ".rendu", "apercus");
mkdirSync(OUT, { recursive: true });
const CHROME = process.env.REMOTION_CHROME ?? "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const demandes = process.argv.slice(2).map((a) => {
  const [id, temps] = a.split(":");
  return { id, temps: (temps ?? "0").split(",").map(Number) };
});
const serveUrl = await bundle({ entryPoint: join(VSL, "src/index.ts"), publicDir: join(VSL, "public") });
for (const d of demandes) {
  const composition = await selectComposition({ serveUrl, id: d.id, browserExecutable: CHROME });
  for (const s of d.temps) {
    const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
    const output = join(OUT, `${d.id}-${s.toFixed(2)}.jpg`);
    await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 88, browserExecutable: CHROME, scale: 0.5 });
    console.log(output);
  }
}
