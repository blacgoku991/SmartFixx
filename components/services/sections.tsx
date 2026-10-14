import type { ReactNode } from "react";
import CampaignLink from "@/components/campaign-link";
import { Container, Eyebrow, Section } from "@/components/sx/section";
import { Media } from "@/components/sx/media";
import { FaqList } from "@/components/sx/faq-list";
import { PhoneLink } from "@/components/sx/actions";
import { Glow } from "@/components/sx/ambient";
import { Place } from "@/components/sx/place";
import { getExperience } from "@/lib/service-experience";
import { serviceLabels, type Service } from "@/lib/services";
import { guides } from "@/lib/guides";
import type { ServicePageContent } from "./content";
/* Sections des pages de prestations, après le hero (serveur). Préfixe CSS sv- (components/services/services.css).
   Mouvement : une seule révélation (.sx-reveal) par section au plus, jamais dans les 900 premiers pixels
   (les sections suivent un hero haut) ; ambiance (lueurs, fenêtres qui respirent) dans des conteneurs
   [data-sx-ambient] ; aucun H2 cinétique (R7 : réservé à l'accueil, à la création et à la refonte). */
const NNBSP = " ";
const pad = (n: number) => String(n).padStart(2, "0");

function Head({ id, eyebrow, title, text, light }: { id: string; eyebrow: string; title: ReactNode; text?: ReactNode; light?: boolean }) {
  return (
    <div className={light ? "sv-head sv-head--light" : "sv-head"}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="sx-h2">{title}</h2>
      {text ? <p className="sv-head-text">{text}</p> : null}
    </div>
  );
}

/* Pour qui et quand : signes concrets du besoin (fenêtres qui s'allument) et objet chrome en vignette. */
export function Audience({ s, c }: { s: Service; c: ServicePageContent }) {
  return (
    <Section id="pour-qui" labelledBy="sv-pour-qui-titre" className="sv-who" ambient={<Glow tone="blue" size={640} top="-120px" right="-260px" duration={24} />}>
      <Container>
        <div className="sv-who-grid">
          <div className="sv-who-main">
            <Head id="sv-pour-qui-titre" eyebrow="Pour qui et quand" title={c.when.title} text={s.audience} />
            <p className="sv-signs-label">C’est le bon moment si…</p>
            <ul className="sv-signs sx-reveal">
              {c.when.signs.map((t) => <li key={t}><span className="sv-pane" aria-hidden="true" />{t}</li>)}
            </ul>
          </div>
          <div className="sv-who-side">
            <div className="sv-object">
              <Media src={c.media.src} base={c.media.base} alt={c.media.alt} width={1024} height={1024} maxWidth={320} sheen />
            </div>
            <p className="sv-who-problem">{s.problem}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* Livrables et limites : section nocturne, cartes « fenêtres » numérotées et carte des limites. */
export function Deliverables({ s, c }: { s: Service; c: ServicePageContent }) {
  return (
    <Section id="livrables" tone="night" labelledBy="sv-livrables-titre" className="sv-deliv" ambient={<><Glow tone="blue" size={760} top="-240px" left="-260px" duration={26} /><Glow tone="amber" size={380} bottom="-160px" right="-120px" alt duration={30} /></>}>
      <Container>
        <Head id="sv-livrables-titre" eyebrow="Livrables et limites" title={<>Ce que je livre, et ce que je ne promets pas</>} text="Le contenu exact, le calendrier et le prix sont détaillés dans le devis, avant votre accord." light />
        <div className={c.limits.length ? "sv-deliv-grid sx-reveal" : "sv-deliv-grid sv-deliv-grid--solo sx-reveal"}>
          <ol className="sv-deliv-list">
            {s.deliverables.map((d, i) => (
              <li className="sv-deliv-card sx-edge" key={d.title}>
                <span className="sv-deliv-num sx-tabular" aria-hidden="true">{pad(i + 1)}</span>
                <span className="sv-lamp" aria-hidden="true" data-sx-ambient=""><i /></span>
                <h3 className="sv-deliv-title">{d.title}</h3>
                <p>{d.text}</p>
              </li>
            ))}
          </ol>
          {c.limits.length ? (
            <div className="sv-limits">
              <h3 className="sv-limits-title">Ce que je ne promets pas</h3>
              <ul>
                {c.limits.map((t) => <li key={t}><span className="sv-pane sv-pane--off" aria-hidden="true" />{t}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

/* Exemple illustratif, étiqueté comme une situation type ; le guide lié est cité dans le texte. */
export function Example({ s, c }: { s: Service; c: ServicePageContent }) {
  const guide = guides.find((g) => g.slug === s.guide);
  return (
    <Section id="exemple" tone="surface" labelledBy="sv-exemple-titre" className="sv-example">
      <Container>
        <div className="sv-example-head">
          <Head id="sv-exemple-titre" eyebrow="Exemple illustratif" title={c.example.title} text={c.example.context} />
          <p className="sv-example-tag"><span className="sx-chip">Situation type, pas un client</span></p>
        </div>
        <ol className="sv-beats sx-reveal">
          {c.example.beats.map((b, i) => (
            <li className="sv-beat" key={b.label}>
              <span className="sv-beat-step" aria-hidden="true">{i + 1}</span>
              <h3 className="sv-beat-label">{b.label}</h3>
              <p>{b.text}</p>
            </li>
          ))}
        </ol>
        {guide ? (
          <p className="sv-guide-note">
            {c.guideText.before}
            <CampaignLink href={`/conseils/${guide.slug}`} className="sv-link">«{NNBSP}{guide.title}{NNBSP}»</CampaignLink>
            {c.guideText.after}
          </p>
        ) : null}
      </Container>
    </Section>
  );
}

/* Déroulement : quatre étapes numérotées, sans durée. */
export function Steps({ s }: { s: Service }) {
  return (
    <Section id="deroulement" labelledBy="sv-deroulement-titre" className="sv-steps-section">
      <Container>
        <Head id="sv-deroulement-titre" eyebrow="Déroulement" title="Quatre étapes, validées avec vous" text="Le calendrier est fixé dans le devis, selon votre disponibilité et le périmètre retenu." />
        <ol className="sv-steps">
          {s.steps.map((t, i) => (
            <li className="sv-step" key={t}>
              <span className="sv-step-num sx-tabular" aria-hidden="true">{pad(i + 1)}</span>
              <p>{t}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

/* Questions fréquentes (3 à 5), en <details> natifs. */
export function Questions({ s }: { s: Service }) {
  return (
    <Section id="questions" tone="surface" labelledBy="sv-questions-titre" className="sv-faq-section">
      <Container>
        <div className="sv-faq-grid">
          <div className="sv-faq-side">
            <Head id="sv-questions-titre" eyebrow="Questions fréquentes" title="Vos questions, mes réponses" />
            <p className="sv-faq-call">Une autre question{NNBSP}? Appelez-moi directement, sans standard.</p>
            <PhoneLink />
          </div>
          <FaqList items={s.faqs.map(([q, a]) => ({ q, a }))} />
        </div>
      </Container>
    </Section>
  );
}

/* Pour aller plus loin : prestations liées (related), guide et zone d'intervention. */
export function Further({ s }: { s: Service }) {
  const guide = guides.find((g) => g.slug === s.guide);
  return (
    <Section id="aller-plus-loin" labelledBy="sv-plus-loin-titre" className="sv-further">
      <Container>
        <Head id="sv-plus-loin-titre" eyebrow="Pour aller plus loin" title="Les prestations voisines" />
        <ul className="sv-related">
          {s.related.map((id) => {
            const e = getExperience(id);
            return (
              <li key={id}>
                <CampaignLink href={e.href} className="sv-rel">
                  <span className="sv-rel-label">{e.label}</span>
                  <span className="sv-rel-title">{serviceLabels[id]}</span>
                  <span className="sv-rel-text">{e.description}</span>
                  <span className="sv-arrow" aria-hidden="true" />
                </CampaignLink>
              </li>
            );
          })}
          {guide ? (
            <li>
              <CampaignLink href={`/conseils/${guide.slug}`} className="sv-rel sv-rel--guide">
                <span className="sv-rel-label">Guide pratique</span>
                <span className="sv-rel-title">{guide.title}</span>
                <span className="sv-rel-text">{guide.description}</span>
                <span className="sv-arrow" aria-hidden="true" />
              </CampaignLink>
            </li>
          ) : null}
        </ul>
        <p className="sv-local">
          Je travaille depuis <Place>Asnières-sur-Seine</Place>{NNBSP}: voir la{" "}
          <CampaignLink href="/creation-site-internet-asnieres-sur-seine" className="sv-link">création de site internet à Asnières-sur-Seine</CampaignLink>, mes{" "}
          <CampaignLink href="/agence-web-ile-de-france" className="sv-link">interventions en Île-de-France</CampaignLink> et les{" "}
          <CampaignLink href="/agence-web-france" className="sv-link">projets menés à distance</CampaignLink>.
        </p>
      </Container>
    </Section>
  );
}
