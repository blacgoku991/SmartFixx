import type { CSSProperties } from "react";
/* Décor d'ambiance (serveur, aria-hidden par le conteneur [data-sx-ambient]) — amendement du mouvement :
   transform et opacity seulement, uniquement sous html[data-motion=on], suspendu hors écran par MotionGate
   (data-sx-visible) et par le contrôle global de pause, arrêté net en mouvement réduit.
   Placer ces éléments dans un conteneur data-sx-ambient (Section ambient=…, PageHero backdrop=…, ou
   <div className="sx-ambient" aria-hidden="true" data-sx-ambient="">). */
export function Glow({ tone = "blue", size = 620, top, left, right, bottom, alt = false, duration = 22 }: { tone?: "blue" | "amber"; size?: number; top?: string; left?: string; right?: string; bottom?: string; alt?: boolean; duration?: number }) {
  const style = { "--sx-glow-size": `${size}px`, "--sx-drift-dur": `${duration}s`, top, left, right, bottom } as CSSProperties;
  return <span className={["sx-glow", tone === "amber" ? "sx-glow--amber" : "", alt ? "sx-glow--alt" : ""].filter(Boolean).join(" ")} style={style} />;
}
/* Silhouette de façades nocturnes, déterministe (pas d'aléatoire au rendu) : quelques fenêtres
   s'allument et s'éteignent lentement ; « signal » garde une fenêtre ambre allumée en permanence. */
const HEIGHTS = [58, 82, 46, 70, 94, 52, 76, 64, 88, 40, 72, 60, 84, 50, 68];
const WIDTHS = [1.2, 0.8, 1.4, 1, 0.9, 1.3, 1.1, 0.7, 1.2, 1, 0.9, 1.3, 0.8, 1.1, 1];
export function Skyline({ seed = 0, buildings = 11, signal = false, className, height }: { seed?: number; buildings?: number; signal?: boolean; className?: string; height?: string }) {
  const items = Array.from({ length: buildings }, (_, i) => {
    const k = (i + seed * 5) % HEIGHTS.length;
    // Délais NÉGATIFS (chaque fenêtre démarre en cours de cycle) et cycles longs : un délai positif ou
    // une fin d'itération rapprochée réveille le fil principal (mesuré en CDP, motion-cost.mjs).
    const v = (i * 7 + seed) % 5;
    const lit = [{ c: v % 4, r: (v * 2) % 3, d: (-((i * 3.7 + seed * 1.3) % 17) - 1).toFixed(1), dur: 16 + ((i * 3 + seed) % 9) }];
    return { h: HEIGHTS[k], w: WIDTHS[k], lit: i % 2 === seed % 2 ? lit : [] };
  });
  const signalAt = Math.floor(buildings / 2);
  return (
    <div className={["sx-skyline", className].filter(Boolean).join(" ")} style={height ? ({ "--sx-skyline-h": height } as CSSProperties) : undefined}>
      {items.map((b, i) => (
        <span className="sx-skyline-b" key={i} style={{ "--h": `${b.h}%`, "--w": b.w } as CSSProperties}>
          {b.lit.map((w, j) => <i key={j} className="sx-win" style={{ "--c": w.c, "--r": w.r, "--sx-delay": `${w.d}s`, "--sx-twinkle-dur": `${w.dur}s` } as CSSProperties} />)}
          {signal && i === signalAt ? <i className="sx-win is-lit" style={{ "--c": 1, "--r": 1 } as CSSProperties} /> : null}
        </span>
      ))}
    </div>
  );
}
