import type { CSSProperties } from "react";
/* Image responsive (serveur) : <picture> AVIF puis WebP 240/480/768/1024 depuis public/media/studio/, avec
   l'original en src (les URL d'origine restent valides : emails, tests). width et height obligatoires
   (réserve d'espace). Lazy par défaut ; jamais dans un hero (le H1 doit rester l'élément LCP).
   Largeur affichée bornée par maxWidth (480 px par défaut, variable --sx-media-max) ; le sizes par défaut
   en découle, pour que le fichier choisi ne soit jamais agrandi. sheen : reflet d'ambiance lent. */
export type MediaBase = "studio-web" | "studio-automation" | "studio-security" | "mail-sculpture";
const WIDTHS = [240, 480, 768, 1024];
export function Media({ src, base, sizes, maxWidth = 480, alt, width, height, loading = "lazy", className, sheen = false }: { src: string; base?: MediaBase; sizes?: string; maxWidth?: number; alt: string; width: number; height: number; loading?: "lazy" | "eager"; className?: string; sheen?: boolean }) {
  const set = (ext: string) => WIDTHS.map((w) => `/media/studio/${base}-${w}.${ext} ${w}w`).join(", ");
  const finalSizes = sizes ?? `(min-width: ${Math.ceil(maxWidth / 0.9)}px) ${maxWidth}px, 90vw`;
  const img = <img src={src} srcSet={base ? set("webp") : undefined} sizes={base ? finalSizes : undefined} alt={alt} width={width} height={height} loading={loading} decoding="async" />;
  return (
    <picture className={["sx-media", sheen ? "sx-sheen" : "", className].filter(Boolean).join(" ")} style={maxWidth !== 480 ? ({ "--sx-media-max": `${maxWidth}px` } as CSSProperties) : undefined} {...(sheen ? { "data-sx-ambient": "" } : {})}>
      {base ? <source type="image/avif" srcSet={set("avif")} sizes={finalSizes} /> : null}
      {img}
    </picture>
  );
}
