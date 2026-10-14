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
/* Ville nocturne en profondeur, déterministe (aucun aléatoire au rendu, donc pas d'écart d'hydratation) :
   - un ciel (--sx-horizon) ;
   - un plan lointain (façades --sx-facade-far, petites fenêtres) et un plan proche (--sx-facade-near,
     liseré de toit --sx-rim), avec deux gabarits de fenêtres (A : 9 × 12, B : 8 × 14 en étages hauts) ;
   - une silhouette locale : immeubles de rapport à toit mansardé, souches de cheminée, portes-fenêtres 1:2
     et balcons filants (2e et 5e étages), pavillons bas à deux pans, entre les tours (clip-path statique) ;
   - des étages entiers allumés en bandes et des fenêtres allumées fixes (environ 10 % de lumière) ;
   - quelques fenêtres qui s'allument et s'éteignent (ambiance, data-motion=on, suspendues hors écran) ;
   - signal : la fenêtre ambre « la demande qui s'allume », 16 × 22 px, halo qui respire (voir .sx-win--signal
     et data-sx-signal-on).
   Sous data-motion=on, les deux plans s'enfoncent à des vitesses différentes quand la section sort de
   l'écran (parallaxe au défilement, transform seulement). depth={false} : un seul plan, plus léger. */
const HEIGHTS = [58, 82, 46, 70, 94, 52, 76, 64, 88, 40, 72, 60, 84, 50, 68];
const WIDTHS = [1.2, 0.8, 1.4, 1, 0.9, 1.3, 1.1, 0.7, 1.2, 1, 0.9, 1.3, 0.8, 1.1, 1];
type Win = { c: number; r: number; d?: string; dur?: number };
type Kind = "tower" | "mansard" | "pavillon";
type Building = { h: number; w: number; b: boolean; kind: Kind; twinkle: Win[]; on: Win[]; floor?: number };
function plan(count: number, seed: number, near: boolean, signalAt?: number): Building[] {
  return Array.from({ length: count }, (_, i) => {
    // Silhouette locale, déterministe : la fenêtre signal reste sur une tour (son halo déborde du bâtiment).
    const kind: Kind = i === signalAt ? "tower" : near && (i + seed) % 6 === 4 ? "pavillon" : (i + seed) % (near ? 4 : 3) === 1 ? "mansard" : "tower";
    // Multiplicateur de graine premier avec 15 (4, et non 5 : deux graines distantes de 3 donnaient la même
    // ville) et pas de lecture propre aux graines impaires (4 et 2 au lieu de 1 et 7, tous premiers avec 15) :
    // sinon chaque ville proche serait une fenêtre décalée, ou un miroir, de la même suite de hauteurs.
    // Le hero (graine 0) et le CtaBand (graine 5) n'ont ainsi ni la même silhouette, ni sa symétrique.
    const stride = near ? (seed % 2 ? 4 : 1) : (seed % 2 ? 2 : 7);
    const k = (i * stride + seed * 4 + (near ? 0 : 3)) % HEIGHTS.length;
    const v = (i * 7 + seed) % 5;
    // Délais NÉGATIFS (départ en cours de cycle) et cycles longs : un délai positif réveille le fil
    // principal (mesuré en CDP, motion-cost.mjs).
    const twinkle: Win[] = near && i % 2 === seed % 2 ? [{ c: v % 4, r: (v * 2) % 3, d: (-((i * 3.7 + seed * 1.3) % 17) - 1).toFixed(1), dur: 22 + ((i * 3 + seed) % 13) }] : [];
    const on: Win[] = [{ c: (v + 2) % 4, r: (i + seed) % 4 }];
    if ((i + seed) % 3 === 0) on.push({ c: (v + 1) % 3, r: ((i + seed) % 3) + 1 });
    if (kind === "pavillon") return { h: 24 + ((i + seed) % 3) * 4, w: 0.9, b: false, kind, twinkle: [], on: [{ c: v % 2, r: 0 }] };
    return { h: near ? HEIGHTS[k] : Math.min(98, HEIGHTS[k] + 6), w: near ? WIDTHS[k] : WIDTHS[k] * 0.8, b: kind === "tower" && (i + seed) % 3 === 1, kind, twinkle, on, floor: kind === "tower" && (i * 5 + seed) % 4 === 2 ? ((i + seed) % 3) + 1 : undefined };
  });
}
/* Gabarits de fenêtres (px) par plan et par silhouette : pas de grille (--px), rangée (--py) ni taille
   (--ww × --wh) en propriétés personnalisées. Coût de style mesuré (tour 3 bis, recalcul complet, page à
   hero + bandeau) : une propriété personnalisée posée sur un élément lui donne sa propre table de variables,
   et la ville en posait sur chaque immeuble et chaque fenêtre (16 ms par recalcul contre 7 ms sans
   ville, près de 100 ms par recalcul sous CPU × 4). Les positions sont donc calculées ici, en px, et les
   tailles portées par des classes (voir globals.css, « Ville nocturne »). */
const GRID = { tower: { px: 15, py: 20 }, b: { px: 13, py: 24 }, mansard: { px: 14, py: 24 }, pavillon: { px: 15, py: 20 }, far: { px: 11, py: 15 } } as const;
function grid(b: Building, near: boolean) { return !near ? GRID.far : b.kind === "tower" ? (b.b ? GRID.b : GRID.tower) : GRID[b.kind]; }
const at = (g: { px: number; py: number }, w: Win) => ({ left: `${9 + w.c * g.px}px`, bottom: `${8 + w.r * g.py}px` });
function Plane({ items, near, signalAt }: { items: Building[]; near: boolean; signalAt?: number }) {
  return (
    <div className={`sx-skyline-plane sx-skyline-plane--${near ? "near" : "far"}`}>
      {items.map((b, i) => {
        const g = grid(b, near);
        return (
          <span className={["sx-skyline-b", b.b ? "sx-skyline-b--b" : "", b.kind !== "tower" ? `sx-skyline-b--${b.kind}` : "", signalAt === i ? "sx-skyline-b--signal" : ""].filter(Boolean).join(" ")} key={i} style={{ height: `${b.h}%`, flexGrow: b.w }}>
            {b.floor !== undefined ? <i className="sx-floor" style={{ bottom: `${8 + b.floor * g.py}px` }} /> : null}
            {b.on.map((w, j) => <i key={`o${j}`} className="sx-win is-on" style={at(g, w)} />)}
            {b.twinkle.map((w, j) => <i key={`t${j}`} className="sx-win" style={{ ...at(g, w), animationDelay: `${w.d}s`, animationDuration: `${w.dur}s` }} />)}
            {signalAt === i ? <i className="sx-win sx-win--signal is-lit" style={at(g, { c: 1, r: 1 })} /> : null}
          </span>
        );
      })}
    </div>
  );
}
export function Skyline({ seed = 0, buildings = 11, signal = false, depth = true, className, height }: { seed?: number; buildings?: number; signal?: boolean; depth?: boolean; className?: string; height?: string }) {
  const signalAt = signal ? Math.floor(buildings / 2) : undefined;
  return (
    <div className={["sx-skyline", className].filter(Boolean).join(" ")} style={height ? ({ "--sx-skyline-h": height } as CSSProperties) : undefined}>
      {depth ? <Plane items={plan(Math.round(buildings * 1.5), seed + 2, false)} near={false} /> : null}
      <Plane items={plan(buildings, seed, true, signalAt)} near signalAt={signalAt} />
    </div>
  );
}
/* Carte « Nouvelle demande » posée au-dessus de la ville (décor aria-hidden : à placer dans un conteneur
   data-sx-ambient, par exemple le backdrop de PageHero). Contenu de démonstration, étiqueté comme tel.
   Visible dès le rendu serveur, immobile (coût mesuré : voir globals.css). Masquée sous 768 px. Ne jamais la
   poser sur les CTA ni sur le H1 : la placer au-dessus de la ville. */
export function SignalCard({ title = "Nouvelle demande", reference = "SF-3A91C2E0", meta = "Refonte · il y a 2 min · démonstration", top, left, right, bottom, className }: { title?: string; reference?: string; meta?: string; top?: string; left?: string; right?: string; bottom?: string; className?: string }) {
  return (
    <span className={["sx-signal-card", className].filter(Boolean).join(" ")} style={{ top, left, right, bottom }}>
      <span className="sx-signal-card-head">{title}</span>
      <span className="sx-signal-card-ref">{reference}</span>
      <span className="sx-signal-card-meta">{meta}</span>
    </span>
  );
}
