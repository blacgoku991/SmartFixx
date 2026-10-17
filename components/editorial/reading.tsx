import "./editorial.css";
import type { ReactNode } from "react";
/* Gabarit de lecture (lot 9) : guides, mentions légales, confidentialité. Serveur, sans JS.
   Moment signature : le sommaire est une façade. Chaque chapitre est un étage avec sa fenêtre ; à partir de
   1024 px, le sommaire est collant et la fenêtre du chapitre en cours de lecture s'allume (animation liée
   au défilement, opacité seulement : view-timeline de chaque chapitre, plage réduite par
   view-timeline-inset à une ligne située à 30 % du haut de l'écran). Une colonne de lumière monte le long
   de la façade avec la lecture (transform: scaleY). Uniquement sous html[data-motion=on] et hors pause ; en
   mouvement réduit, au survol et au focus, la fenêtre du lien survolé s'allume sans animation.
   Au plus 8 chapitres (timeline-scope déclaré pour --ed-s1 … --ed-s8, voir editorial.css). */
export type TocItem = { id: string; label: string };
export const MAX_CHAPTERS = 8;
export const num = (n: number) => String(n).padStart(2, "0");
/* Composition française : espace fine insécable (U+202F) avant « : ; ? ! » et à l'intérieur des
   guillemets, pour qu'un signe ne commence jamais une ligne. Appliquée aux textes des guides. */
export const fr = (s: string) => s.replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ");
export function ReadingLayout({ toc, tocLabel, children, aside }: { toc: TocItem[]; tocLabel: string; children: ReactNode; aside?: ReactNode }) {
  const items = toc.slice(0, MAX_CHAPTERS);
  return (
    <div className="sx-container ed-reading">
      <nav className="ed-toc" aria-labelledby="ed-toc-titre">
        <p className="ed-toc-title" id="ed-toc-titre">{tocLabel}</p>
        <ol className="ed-toc-list">
          {items.map((t, i) => (
            <li key={t.id}>
              <a href={`#${t.id}`} className={`ed-toc-link ed-t${i + 1}`}>
                <span className="ed-toc-win" aria-hidden="true" />
                <span className="ed-toc-num sx-ref" aria-hidden="true">{num(i + 1)}</span>
                <span className="ed-toc-label">{t.label}</span>
              </a>
            </li>
          ))}
        </ol>
        <span className="ed-toc-rail" aria-hidden="true"><span className="ed-toc-light" /></span>
        {aside ? <div className="ed-toc-aside">{aside}</div> : null}
      </nav>
      <div className="ed-body">{children}</div>
    </div>
  );
}
/* Chapitre : section titrée (H2), cible du sommaire. n commence à 1 (classe ed-sN : nom de view-timeline).
   Le numéro du chapitre est dessiné par ::before (attr(data-n)) : il n'entre ni dans le texte du H2 ni
   dans son nom accessible. */
export function Chapter({ id, n, title, children, className }: { id: string; n: number; title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={["ed-chapter", n <= MAX_CHAPTERS ? `ed-s${n}` : "", className].filter(Boolean).join(" ")} aria-labelledby={`${id}-titre`}>
      <h2 id={`${id}-titre`} className="ed-chapter-title" data-n={num(n)}>{title}</h2>
      <div className="ed-prose">{children}</div>
    </section>
  );
}
const DATE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const frenchDate = (iso: string) => DATE.format(new Date(`${iso}T12:00:00Z`));
