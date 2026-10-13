/* Image responsive (serveur) : <picture> AVIF puis WebP 240/480/768 depuis public/media/studio/, avec
   l'original en dernier candidat (1024w) et en src (les URL d'origine restent valides : emails, tests).
   width et height obligatoires (réserve d'espace). Lazy par défaut ; jamais dans un hero (le H1 doit
   rester l'élément LCP). sheen : reflet d'ambiance lent (amendement du mouvement). */
export type MediaBase = "studio-web" | "studio-automation" | "studio-security" | "mail-sculpture";
const ORIGINAL_WIDTH = 1024;
export function Media({ src, base, sizes = "(min-width: 1024px) 480px, 90vw", alt, width, height, loading = "lazy", className, sheen = false }: { src: string; base?: MediaBase; sizes?: string; alt: string; width: number; height: number; loading?: "lazy" | "eager"; className?: string; sheen?: boolean }) {
  const set = (ext: string) => [240, 480, 768].map((w) => `/media/studio/${base}-${w}.${ext} ${w}w`).join(", ");
  const img = <img src={src} srcSet={base ? `${set("webp")}, ${src} ${ORIGINAL_WIDTH}w` : undefined} sizes={base ? sizes : undefined} alt={alt} width={width} height={height} loading={loading} decoding="async" />;
  return (
    <picture className={["sx-media", sheen ? "sx-sheen" : "", className].filter(Boolean).join(" ")} {...(sheen ? { "data-sx-ambient": "" } : {})}>
      {base ? <source type="image/avif" srcSet={set("avif")} sizes={sizes} /> : null}
      {img}
    </picture>
  );
}
