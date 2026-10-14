import type { ReactNode } from "react";
import CampaignLink from "@/components/campaign-link";
import { Container, Eyebrow, Section } from "@/components/sx/section";
import { KineticHeading } from "@/components/sx/kinetic-heading";
import { FaqList } from "@/components/sx/faq-list";
import { Place } from "@/components/sx/place";
import { SITE_IDENTITY } from "@/lib/site-identity";
import type { Faq, Rich, RelatedLink, Step } from "@/lib/content/acquisition";
/* Blocs communs aux deux pages d'acquisition (serveur). Préfixe CSS aq- (components/acquisition/acquisition.css). */

/* Nom de lieu insécable dans une chaîne : « Asnières-sur-Seine » ne se coupe jamais (charte typographique). */
export function withPlace(text: string): ReactNode {
  const city = SITE_IDENTITY.WORK_CITY;
  const i = text.indexOf(city);
  if (i < 0) return text;
  return <>{text.slice(0, i)}<Place>{city}</Place>{text.slice(i + city.length)}</>;
}

/* Texte enrichi : morceaux de texte et liens internes à ancre descriptive (soulignés par la base). */
export function RichText({ parts }: { parts: Rich }) {
  return <>{parts.map((p, i) => typeof p === "string" ? <span key={i}>{p}</span> : <CampaignLink key={i} href={p.href}>{p.label}{p.place ? <Place>{p.place}</Place> : null}</CampaignLink>)}</>;
}

/* En-tête de chapitre : surtitre, H2 (cinétique si kinetic, charte R7 : un par écran, jamais dans les
   900 premiers pixels) et chapeau. */
export function ChapterHead({ id, eyebrow, title, text, kinetic = false, className }: { id: string; eyebrow: string; title: string; text?: ReactNode; kinetic?: boolean; className?: string }) {
  return (
    <div className={["aq-head", className].filter(Boolean).join(" ")}>
      <Eyebrow dot>{eyebrow}</Eyebrow>
      {kinetic ? <KineticHeading id={id} className="aq-h2 aq-h2--chapter">{title}</KineticHeading> : <h2 id={id} className="aq-h2">{title}</h2>}
      {text ? <p className="aq-head-text">{text}</p> : null}
    </div>
  );
}

/* Déroulement en 4 étapes, sans durée : une rangée de « fenêtres » numérotées reliées par un fil. Titre non
   cinétique : un seul titre cinétique par page (planche annotée, ce que je reprends) ; chaque mot cinétique
   est une animation de timeline recalculée à chaque image de défilement (motion-cost --scroll). */
export function Steps({ id, eyebrow, title, text, items }: { id: string; eyebrow: string; title: string; text: string; items: Step[] }) {
  return (
    <Section id="deroulement" labelledBy={id}>
      <Container>
        <ChapterHead id={id} eyebrow={eyebrow} title={title} text={text} />
        <ol className="aq-steps">
          {items.map((s, i) => (
            <li className="aq-step" key={s.title}>
              <span className="aq-step-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="aq-step-title">{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

export function Objections({ id, eyebrow, title, text, items }: { id: string; eyebrow: string; title: string; text: string; items: Faq[] }) {
  return (
    <Section id="questions" labelledBy={id} tone="surface">
      <Container className="aq-faq-grid">
        <ChapterHead id={id} eyebrow={eyebrow} title={title} text={text} />
        <FaqList items={items.map((f) => ({ q: f.q, a: <p><RichText parts={f.a} /></p> }))} />
      </Container>
    </Section>
  );
}

/* Liens contextuels : une phrase avec des ancres descriptives, puis des cartes de liens. */
export function Related({ id, title, intro, links }: { id: string; title: string; intro: Rich; links: RelatedLink[] }) {
  return (
    <Section labelledBy={id} className="aq-related">
      <Container>
        <div className="aq-related-head">
          <h2 id={id} className="aq-h2 aq-h2--small">{title}</h2>
          <p className="aq-related-intro"><RichText parts={intro} /></p>
        </div>
        <ul className="aq-links">
          {links.map((l) => (
            <li key={l.href}>
              <CampaignLink href={l.href} className="aq-link">
                <span className="aq-link-label">{withPlace(l.label)}</span>
                <span className="aq-link-text">{l.text}</span>
              </CampaignLink>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
