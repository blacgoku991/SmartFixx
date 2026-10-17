// Outils partagés des scripts audio de la VSL SmartFixx (Node 18+, aucune dépendance npm).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const OUTILS = dirname(fileURLToPath(import.meta.url));
export const AUDIO = resolve(OUTILS, "..");
export const VSL = resolve(AUDIO, "..");
export const SR = 48000;

// ffmpeg : variable FFMPEG, sinon ffmpeg-static du projet vidéo, sinon celui du PATH.
export function ffmpegPath() {
  const candidats = [
    process.env.FFMPEG,
    join(VSL, "node_modules/ffmpeg-static/ffmpeg"),
    "/tmp/claude-0/-home-user-SmartFixx/e747d961-bda7-5712-ad58-aadf6a403b35/scratchpad/ff/node_modules/ffmpeg-static/ffmpeg",
  ].filter(Boolean);
  for (const c of candidats) if (existsSync(c)) return c;
  return "ffmpeg";
}

export function ff(args, { quiet = true } = {}) {
  const full = ["-hide_banner", "-nostats", "-y", ...args];
  try {
    return execFileSync(ffmpegPath(), full, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20 });
  } catch (e) {
    if (!quiet) console.error(e.stderr);
    throw new Error(`ffmpeg a échoué : ${full.join(" ")}\n${String(e.stderr).slice(-1500)}`);
  }
}

// ffmpeg écrit ses analyses sur stderr : on les lit via « -f null » et une redirection.
function stderrDe(input, filtre) {
  return execFileSync("sh", ["-c", '"$0" -hide_banner -nostats -i "$1" -af "$2" -f null - 2>&1', ffmpegPath(), input, filtre], {
    encoding: "utf8",
    maxBuffer: 64 << 20,
  });
}

// Durée exacte d'un WAV PCM (lecture de l'en-tête, sans arrondi d'affichage).
export function dureeWav(path) {
  const b = readFileSync(path);
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WAVE") throw new Error(`${path} n'est pas un WAV`);
  let off = 12, fmt = null;
  while (off + 8 <= b.length) {
    const id = b.toString("ascii", off, off + 4);
    const size = b.readUInt32LE(off + 4);
    if (id === "fmt ") fmt = { ch: b.readUInt16LE(off + 10), sr: b.readUInt32LE(off + 12), bits: b.readUInt16LE(off + 22) };
    if (id === "data") {
      if (!fmt) throw new Error("fmt manquant");
      return size / (fmt.sr * fmt.ch * (fmt.bits / 8));
    }
    off += 8 + size + (size % 2);
  }
  throw new Error(`${path} : bloc data introuvable`);
}

// Silences internes (début, fin) au seuil donné.
export function silences(path, seuilDb = -42, minS = 0.09) {
  const out = stderrDe(path, `silencedetect=n=${seuilDb}dB:d=${minS}`);
  const res = [];
  let debut = null;
  for (const l of out.split("\n")) {
    const a = l.match(/silence_start: (-?[0-9.]+)/);
    const b = l.match(/silence_end: ([0-9.]+)/);
    if (a) debut = Math.max(0, parseFloat(a[1]));
    if (b && debut !== null) { res.push([debut, parseFloat(b[1])]); debut = null; }
  }
  return res;
}

// Sonie intégrée (LUFS) et crête vraie (dBTP).
export function sonie(path) {
  const out = stderrDe(path, "ebur128=peak=true:framelog=quiet");
  const i = out.match(/I:\s+(-?[0-9.]+) LUFS/g);
  const p = out.match(/Peak:\s+(-?[0-9.inf]+) dBFS/g);
  return {
    lufs: i ? parseFloat(i[i.length - 1].match(/-?[0-9.]+/)[0]) : NaN,
    tp: p ? parseFloat(p[p.length - 1].match(/-?[0-9.]+|-inf/)[0]) : NaN,
  };
}

// Sonie intégrée (LUFS) d'un extrait [debut, fin] (secondes).
export function sonieExtrait(path, debut, fin) {
  const out = execFileSync(
    "sh",
    ["-c", '"$0" -hide_banner -nostats -ss "$1" -t "$2" -i "$3" -af ebur128=framelog=quiet -f null - 2>&1', ffmpegPath(), String(debut), String(Math.max(0.1, fin - debut)), path],
    { encoding: "utf8", maxBuffer: 64 << 20 },
  );
  const i = out.match(/I:\s+(-?[0-9.]+) LUFS/g);
  return i ? parseFloat(i[i.length - 1].match(/-?[0-9.]+/)[0]) : NaN;
}

export function lireJson(p) { return JSON.parse(readFileSync(p, "utf8")); }
export const arrondi = (x, n = 3) => Math.round(x * 10 ** n) / 10 ** n;
