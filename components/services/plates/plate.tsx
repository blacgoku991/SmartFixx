import type { ReactNode } from "react";
/* Planche d'une prestation (serveur) : un cadre SVG statique (fond, trame, repères d'angle) et des CALQUES
   superposés. Chaque calque est un <div class="sv-ly"> plein cadre qui contient un SVG de même viewBox
   (formes) et ses libellés en HTML. Seuls ces calques s'animent, en transform et opacity (composités) : un
   calque plein cadre déplacé en pourcentage se déplace d'une fraction de la planche, quelle que soit sa
   taille. Mesure du lot 2 : un tracé stroke-dashoffset ou une animation portée par un élément SVG provoque
   une mise en page par image ; d'où ces calques. Le « tracé » d'un trait est un calque qui grandit
   (scaleX/scaleY) depuis l'origine du trait (transform-origin en % du cadre).
   Libellés en HTML et non en <text> SVG : Chrome compte un texte SVG comme candidat LCP avec la surface de
   tout le <svg> (le calque plein cadre), qui battait le H1 (mesuré par layout-check). Chaque libellé est un
   petit bloc positionné en % du cadre, à la taille du viewBox grâce aux unités de conteneur (cqw) : 14
   unités = 14/360 de la largeur de la planche (12,75 px pour une planche de 328 px, à 360 px d'écran).
   L'état final est celui rendu par le serveur : tout est visible sans JavaScript, en mouvement réduit et
   avant le passage de ScenePlayer à « is-playing ». Les cases sont calibrées sur DejaVu Sans (police
   système Linux, parmi les plus larges) : environ 8,2 unités par caractère en romain, 9 en gras. */
export const VB = "0 0 360 320";
export function Layer({ className, svg, children }: { className: string; svg?: ReactNode; children?: ReactNode }) {
  return (
    <div className={`sv-ly ${className}`}>
      {svg ? <svg viewBox={VB} focusable="false" aria-hidden="true">{svg}</svg> : null}
      {children}
    </div>
  );
}
/* Libellé : (x, y) = point de base de la ligne, comme un <text> SVG ; a = alignement (début, milieu, fin). */
export function T({ x, y, a = "s", c = "", children }: { x: number; y: number; a?: "s" | "m" | "e"; c?: string; children: ReactNode }) {
  return <span className={["sv-tx", a === "m" ? "sv-tx--m" : a === "e" ? "sv-tx--e" : "", c].filter(Boolean).join(" ")} style={{ left: `${((x / 360) * 100).toFixed(2)}%`, top: `${((y / 320) * 100).toFixed(2)}%` }}>{children}</span>;
}
export function PlateFrame({ kind, heading, children }: { kind: string; heading: string; children: ReactNode }) {
  const grid = `sv-grid-${kind}`;
  return (
    <div className={`sv-plate sv-plate--${kind}`}>
      <svg className="sv-plate-base" viewBox={VB} focusable="false" aria-hidden="true">
        <defs>
          <pattern id={grid} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" className="sv-p-grid" />
          </pattern>
        </defs>
        <rect className="sv-p-bg" x=".5" y=".5" width="359" height="319" rx="18" />
        <rect x="8" y="40" width="344" height="272" fill={`url(#${grid})`} />
        <path className="sv-p-tick" d="M8 48V40H16M352 48V40H344M8 304V312H16M352 304V312H344" />
        <rect className="sv-p-chip" x="226" y="11" width="122" height="23" rx="11.5" />
      </svg>
      <T x={16} y={27} c="sv-tx--muted">{heading}</T>
      <T x={287} y={27} a="m">Démonstration</T>
      {children}
    </div>
  );
}
/* Pastille numérotée d'annotation (ambre de la couche d'annotation) : forme SVG + chiffre HTML. */
export function MarkShape({ x, y, r = 12 }: { x: number; y: number; r?: number }) {
  return <circle className="sv-p-mark" cx={x} cy={y} r={r} />;
}
export function MarkNum({ x, y, n }: { x: number; y: number; n: number }) {
  return <T x={x} y={y + 5} a="m" c="sv-tx--mark">{n}</T>;
}
