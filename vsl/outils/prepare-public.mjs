// Copie les mixages de référence dans public/audio/ pour les entendre dans le studio Remotion.
// (public/audio/ est ignoré par git : la source reste audio/mix/.)
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const VSL = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(VSL, "audio", "mix");
const dst = join(VSL, "public", "audio");
mkdirSync(dst, { recursive: true });
for (const f of readdirSync(src).filter((x) => x.endsWith("-mix.wav"))) copyFileSync(join(src, f), join(dst, f));
console.log(`mixages copiés dans ${dst}`);
