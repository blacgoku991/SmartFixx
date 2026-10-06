/**
 * Télécharge les polices depuis Google Fonts et génère `src/fonts.css`.
 * Les fichiers sont auto-hébergés : pas de requête tierce au chargement,
 * pas de dépendance externe, et rien à déclarer côté RGPD.
 *
 *   node scripts/fetch-fonts.mjs
 *
 * Les trois familles sont VARIABLES : un seul fichier porte tout l'axe de
 * graisse. L'API de Google renvoie pourtant la même URL pour chaque graisse
 * demandée. La première version de ce script enregistrait donc le même fichier
 * sous un nom par graisse — dix fichiers pour trois polices, 345 040 octets
 * pour 101 976 utiles, et un navigateur qui retéléchargeait le même fichier à
 * chaque graisse employée. On déduplique désormais par contenu, et on écrit une
 * seule `@font-face` par famille avec la plage réellement portée par le fichier.
 */
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const FAMILIES = [
  "Space+Grotesk:wght@400;500;600;700",
  "Inter:wght@300;400;500;600",
  "JetBrains+Mono:wght@400;500",
];

/**
 * Plage de graisses de chaque fichier variable, lue dans sa table `fvar`.
 * Déclarer plus large que la réalité ferait synthétiser par le navigateur une
 * graisse absente du fichier, ce qui déforme les lettres.
 */
const AXES = {
  "Space Grotesk": "300 700",
  Inter: "100 900",
  "JetBrains Mono": "400 800",
};

const OUT_DIR = path.resolve("public/fonts");
const CSS_OUT = path.resolve("src/fonts.css");
const KEEP_SUBSETS = new Set(["latin"]); // U+0152-0153 (Œœ) est déjà dans "latin" : le français est couvert.

const slug = (family, subset) =>
  `${family.toLowerCase().replace(/\s+/g, "-")}-var-${subset}.woff2`;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const url = `https://fonts.googleapis.com/css2?${FAMILIES.map((f) => `family=${f}`).join(
    "&",
  )}&display=swap`;

  const css = await (await fetch(url, { headers: { "User-Agent": UA } })).text();

  // Google émet un bloc @font-face par sous-ensemble, précédé d'un commentaire.
  const blocks = css.split("/*").slice(1);

  /** Une entrée par famille, dédupliquée par empreinte du fichier téléchargé. */
  const fonts = new Map();

  for (const block of blocks) {
    const subset = block.slice(0, block.indexOf("*/")).trim();
    if (!KEEP_SUBSETS.has(subset)) continue;

    const family = /font-family:\s*'([^']+)'/.exec(block)?.[1];
    const src = /src:\s*url\(([^)]+)\)/.exec(block)?.[1];
    const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1];
    if (!family || !src) continue;

    const buffer = Buffer.from(await (await fetch(src)).arrayBuffer());
    const digest = createHash("md5").update(buffer).digest("hex");
    const key = `${family}|${subset}`;
    const seen = fonts.get(key);

    if (seen) {
      if (seen.digest !== digest) {
        throw new Error(
          `${family} (${subset}) renvoie deux fichiers différents selon la graisse : ` +
            "ce n'est pas une fonte variable, la déduplication fausserait le rendu.",
        );
      }
      continue;
    }

    const filename = slug(family, subset);
    await writeFile(path.join(OUT_DIR, filename), buffer);
    fonts.set(key, { family, subset, filename, range, digest, bytes: buffer.length });
    console.log(`✓ ${filename} (${(buffer.length / 1024).toFixed(1)} kB)`);
  }

  const rules = [...fonts.values()].map((font) => {
    const weight = AXES[font.family];
    if (!weight) throw new Error(`Plage de graisses inconnue pour ${font.family} — compléter AXES.`);

    return [
      "@font-face {",
      `  font-family: "${font.family}";`,
      "  font-style: normal;",
      `  font-weight: ${weight};`,
      "  font-display: swap;",
      `  src: url("/fonts/${font.filename}") format("woff2");`,
      font.range ? `  unicode-range: ${font.range};` : null,
      "}",
    ]
      .filter(Boolean)
      .join("\n");
  });

  await writeFile(
    CSS_OUT,
    `/* Généré par scripts/fetch-fonts.mjs — ne pas éditer à la main. */\n\n${rules.join("\n\n")}\n`,
  );

  const total = [...fonts.values()].reduce((sum, f) => sum + f.bytes, 0);
  console.log(
    `\n${rules.length} @font-face écrites dans src/fonts.css — ${total} octets au total.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
