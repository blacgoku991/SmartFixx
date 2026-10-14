import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
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
/* Anti-veuve du titre (tour 3) : le sous-titre étant en ligne dans le H1, text-wrap: balance n'agit plus sur
   le titre et le dernier mot pouvait finir seul (« internet » de 600 à 1179 px). La dernière espace du
   titre devient insécable (U+00A0) si les deux derniers mots tiennent en 16 caractères au plus (au-delà,
   le groupe risquerait de déborder à 360 px, H1 de 40 px). Agit sur une chaîne, ou descend dans le
   DERNIER enfant d'un fragment ou d'un élément (<span className="sx-keyword">site internet</span>).
   Une espace située entre deux nœuds (« Création de <span>site</span> ») n'est pas traitée : le lot qui
   compose un tel titre lie lui-même ses deux derniers mots (U+00A0). */
const NBSP = "\u00A0";
function bindLastSpace(text: string): string {
  const end = text.trimEnd().length; const i = text.lastIndexOf(" ", end - 1);
  if (i <= 0) return text;
  const prev = text.lastIndexOf(" ", i - 1);
  return end - (prev + 1) <= 16 ? text.slice(0, i) + NBSP + text.slice(i + 1) : text;
}
function noWidow(node: ReactNode): ReactNode {
  if (typeof node === "string") return bindLastSpace(node);
  if (Array.isArray(node)) {
    if (!node.length) return node;
    const last = noWidow(node[node.length - 1]);
    return last === node[node.length - 1] ? node : [...node.slice(0, -1), last];
  }
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    const kids = el.props.children; if (kids === undefined) return node;
    const next = noWidow(kids);
    return next === kids ? node : cloneElement(el, undefined, ...(Array.isArray(next) ? next : [next]));
  }
  return node;
}
export type PageHeroProps = {
  eyebrow?: ReactNode;
  /* Surtitre court affiché sous 480 px à la place d'eyebrow (budget de lignes du hero mobile : le surtitre
     tient sur UNE ligne à 360 px, par exemple « Mohamed · Asnières (92) »). Le surtitre long reste seul
     lu au-delà ; display:none retire l'autre de l'arbre d'accessibilité. */
  eyebrowShort?: ReactNode;
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
  /* "auto" (défaut) : suit le thème — nuit en sombre, aube (ciel pêche, façades encrées) en clair.
     "night" : reste nocturne dans les deux thèmes (portée [data-sx-tone=night]). */
  tone?: "auto" | "night";
};
export function PageHero({ eyebrow, eyebrowShort, eyebrowDot = true, title, tagline, lead, proofs, actions, aside, breadcrumbs, backdrop, id = "hero-titre", className, tone = "auto" }: PageHeroProps) {
  return (
    <section className={["sx-hero", className].filter(Boolean).join(" ")} data-sx-hero="" data-sx-tone={tone === "night" ? "night" : undefined} aria-labelledby={id}>
      {backdrop ? <div className="sx-hero-backdrop" aria-hidden="true" data-sx-ambient="">{backdrop}</div> : null}
      <div className={["sx-container", "sx-hero-grid", aside ? "sx-hero-grid--aside" : ""].filter(Boolean).join(" ")}>
        <div className="sx-hero-copy">
          {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
          {eyebrow ? <Eyebrow dot={eyebrowDot}>{eyebrowShort ? <><span className="sx-eyebrow-long">{eyebrow}</span><span className="sx-eyebrow-short">{eyebrowShort}</span></> : eyebrow}</Eyebrow> : null}
          <h1 id={id} className="sx-h1"><span className="sx-h1-main">{noWidow(title)}</span>{tagline ? <>{" "}<span className="sx-h1-tagline">{tagline}</span></> : null}</h1>
          {lead ? <p className="sx-lead">{lead}</p> : null}
          {actions ? <div className="sx-hero-actions">{actions}</div> : null}
          {proofs?.length ? <ProofList items={proofs} className="sx-hero-proofs" /> : null}
        </div>
        {aside ? <div className="sx-hero-aside">{aside}</div> : null}
      </div>
    </section>
  );
}
