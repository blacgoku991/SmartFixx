import "./secondary.css";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import CampaignLink from "@/components/campaign-link";
/* Pages secondaires (lot 8) — briques partagées (serveur). Ce module importe la feuille du lot
   (components/secondary/secondary.css, préfixe sc-) : toute page du lot passe par lui.
   Motif commun : la FAÇADE, une rangée de fenêtres (décor aria-hidden) qui s'allume au survol ou au focus
   de la carte qui la porte (« cartes qui s'allument »), et dont une fenêtre ambre reste allumée en
   permanence (la demande qui s'allume). Transitions d'opacité seulement ; aucune boucle. */

/* Rangée de fenêtres. count : nombre de fenêtres ; on : indices allumés en permanence (ambre chaud) ;
   signal : indice de la fenêtre ambre vive. Les autres s'allument au survol ou au focus du parent .sc-lit. */
export function Facade({ count = 7, on = [], signal, className }: { count?: number; on?: number[]; signal?: number; className?: string }) {
  return (
    <span className={["sc-facade", className].filter(Boolean).join(" ")} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i key={i} className={i === signal ? "sc-w sc-w--signal" : on.includes(i) ? "sc-w sc-w--on" : "sc-w"} />
      ))}
    </span>
  );
}

/* Lien de maillage interne : ancre descriptive (le texte dit où l'on va), carte entière cliquable par un
   pseudo-élément étiré du lien (un seul arrêt de clavier, texte de la carte sélectionnable). */
export function LinkCard({ href, title, text, kicker, lights = 5, signal }: { href: string; title: string; text: ReactNode; kicker?: string; lights?: number; signal?: number }) {
  return (
    <article className="sc-linkcard sc-lit">
      <Facade count={lights} signal={signal} />
      {kicker ? <p className="sc-kicker">{kicker}</p> : null}
      <h3 className="sc-linkcard-title"><CampaignLink href={href} className="sc-stretch">{title}<ArrowRight className="sc-arrow" aria-hidden="true" /></CampaignLink></h3>
      <p className="sc-linkcard-text">{text}</p>
    </article>
  );
}

/* Liste numérotée en « étages » (méthode, déroulé, suite d'une demande) : chaque étape a sa fenêtre. */
export function Floors({ items, className, headingLevel = 3 }: { items: { title: string; text: ReactNode }[]; className?: string; headingLevel?: 3 | 4 }) {
  const H = headingLevel === 4 ? "h4" : "h3";
  return (
    <ol className={["sc-floors", className].filter(Boolean).join(" ")}>
      {items.map((it, i) => (
        <li key={it.title} className={`sc-floor sc-floor--${i + 1}`}>
          <span className="sc-floor-win" aria-hidden="true"><span className="sc-floor-num sx-figure">{String(i + 1).padStart(2, "0")}</span></span>
          <div className="sc-floor-body">
            <H className="sc-floor-title">{it.title}</H>
            <p>{it.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
