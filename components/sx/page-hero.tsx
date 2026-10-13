import type { ReactNode } from "react";
import { Eyebrow } from "./section";
import { ProofList } from "./proof-list";
import { Breadcrumbs } from "./breadcrumbs";
/* Hero de page (serveur). Un seul <h1><span class=sx-h1-main>{title}</span> <span class=sx-h1-tagline>{tagline}</span></h1>,
   avec une vraie espace avant le sous-titre. Les deux parties restent EN LIGNE dans le H1 : un seul bloc de
   texte, donc un seul candidat LCP (le H1), plus grand que le chapeau. R1 : rien n'est animé ni masqué ici (H1, chapeau, preuves, CTA).
   data-sx-hero sert à MobileCtaBar ; .sx-hero-actions est lu par layout-check (CTA au-dessus du
   consentement). Sous 768 px, tant que html[data-consent=pending], la réserve --sx-consent-reserve est
   ménagée sous le contenu (le décor « backdrop » peut l'occuper). Ordre du DOM : surtitre, H1, chapeau,
   actions, preuves, puis aside (scène ou formulaire). */
export type PageHeroProps = {
  eyebrow?: ReactNode;
  eyebrowDot?: boolean;
  title: ReactNode;
  tagline?: ReactNode;
  lead?: ReactNode;
  proofs?: string[];
  actions?: ReactNode;
  aside?: ReactNode;
  breadcrumbs?: { name: string; path: string }[];
  /* Décor plein cadre derrière le hero (motif nocturne…), rendu aria-hidden. */
  backdrop?: ReactNode;
  id?: string;
  className?: string;
};
export function PageHero({ eyebrow, eyebrowDot = true, title, tagline, lead, proofs, actions, aside, breadcrumbs, backdrop, id = "hero-titre", className }: PageHeroProps) {
  return (
    <section className={["sx-hero", className].filter(Boolean).join(" ")} data-sx-hero="" aria-labelledby={id}>
      {backdrop ? <div className="sx-hero-backdrop" aria-hidden="true" data-sx-ambient="">{backdrop}</div> : null}
      <div className={["sx-container", "sx-hero-grid", aside ? "sx-hero-grid--aside" : ""].filter(Boolean).join(" ")}>
        <div className="sx-hero-copy">
          {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
          {eyebrow ? <Eyebrow dot={eyebrowDot}>{eyebrow}</Eyebrow> : null}
          <h1 id={id} className="sx-h1"><span className="sx-h1-main">{title}</span>{tagline ? <>{" "}<span className="sx-h1-tagline">{tagline}</span></> : null}</h1>
          {lead ? <p className="sx-lead">{lead}</p> : null}
          {actions ? <div className="sx-hero-actions">{actions}</div> : null}
          {proofs?.length ? <ProofList items={proofs} className="sx-hero-proofs" /> : null}
        </div>
        {aside ? <div className="sx-hero-aside">{aside}</div> : null}
      </div>
    </section>
  );
}
