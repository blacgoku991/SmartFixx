import { Briefcase, Building2, Hammer, Mail, Phone, Store } from "lucide-react";
import CampaignLink from "@/components/campaign-link";
import { Container, Eyebrow, Section, SectionHead } from "@/components/sx/section";
import { ButtonLink } from "@/components/sx/actions";
import { Media } from "@/components/sx/media";
import { Realisations } from "@/components/sx/realisations";
import { KineticHeading } from "@/components/sx/kinetic-heading";
import { FaqList } from "@/components/sx/faq-list";
import { Place } from "@/components/sx/place";
import { Glow } from "@/components/sx/ambient";
import { ShortQuoteForm } from "@/components/short-quote-form";
import { getExperience } from "@/lib/service-experience";
import { serviceLabels } from "@/lib/services";
import { guides } from "@/lib/guides";
import { SITE_IDENTITY, mailHref, telHref } from "@/lib/site-identity";
import { AUDIENCE, CHOICE, DELIVERABLES, FAQ, METHOD, OTHER_SERVICES, ZONE_LINKS } from "./content";
/* Sections de l'accueil après le hero (serveur), dans l'ordre de la page « / » (pages.md). */

const T = "\u202F";
const AUDIENCE_ICONS = [Hammer, Store, Briefcase, Building2];

/* Pour qui : des cibles, jamais des clients. */
export function Audience() {
  return (
    <section className="hm-audience" aria-labelledby="pour-qui-titre">
      <Container className="hm-audience-inner">
        <h2 id="pour-qui-titre" className="hm-audience-title">Pour qui{T}?</h2>
        <ul className="hm-audience-list">
          {AUDIENCE.map((a, i) => {
            const Icon = AUDIENCE_ICONS[i];
            return (
              <li key={a.name}>
                <span className="hm-audience-icon" aria-hidden="true"><Icon /></span>
                <span className="hm-audience-name">{a.name}</span>
                <span className="hm-audience-need">{a.need}</span>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

/* Création ou refonte : deux cartes jumelles. Libellés exacts lus dans lib/service-experience.ts
   (« Créer mon site », « Moderniser mon site », « Gagner du temps », « Protéger mes outils »…) et objet
   studio-web.webp en srcset : chaînes exigées par tests/production-security.test.mjs (l.92). */
export function Choice() {
  const creation = getExperience("creation");
  const refonte = getExperience("refonte");
  return (
    <Section tone="surface" id="creation-ou-refonte" labelledBy="choix-titre" className="hm-choice">
      <Container>
        <SectionHead id="choix-titre" eyebrow="Votre point de départ" title={<>Création ou refonte{T}?</>} text="Deux situations, une même exigence : un site que vos clients comprennent tout de suite et qui les aide à vous contacter." />
        <div className="hm-twins">
          <article className="hm-twin hm-twin--creation sx-edge" aria-labelledby="twin-creation">
            <div className="hm-twin-art">
              {/* maxWidth 260 = largeur affichée (.hm-twin-media) : sizes « 260px », soit le fichier de 480 px et non de
                  768 px sur un mobile DPR 1,75 (14 Ko au lieu de 25 Ko, requête partie avant le LCP). */}
              <Media src={creation.asset} base="studio-web" alt="" width={1024} height={1024} maxWidth={260} className="hm-twin-media" />
            </div>
            <div className="hm-twin-body">
              <p className="hm-twin-kicker">{CHOICE.creation.kicker}</p>
              <h3 id="twin-creation">{CHOICE.creation.title}</h3>
              <p className="hm-twin-signs-label">C’est le bon moment si…</p>
              <ul className="hm-twin-signs">{CHOICE.creation.signs.map((s) => <li key={s}>{s}</li>)}</ul>
              <ButtonLink variant="primary" href={creation.href} className="hm-twin-link">{creation.label}</ButtonLink>
            </div>
          </article>
          <article className="hm-twin hm-twin--refonte sx-edge" aria-labelledby="twin-refonte">
            <div className="hm-twin-art" aria-hidden="true">
              <div className="hm-ba">
                <span className="hm-ba-old"><small>Avant</small><i /><i /><i /><i /></span>
                <span className="hm-ba-new"><small>Après</small><b>Un titre qui dit ce que vous faites</b><em>Appeler</em></span>
              </div>
            </div>
            <div className="hm-twin-body">
              <p className="hm-twin-kicker">{CHOICE.refonte.kicker}</p>
              <h3 id="twin-refonte">{CHOICE.refonte.title}</h3>
              <p className="hm-twin-signs-label">C’est le bon moment si…</p>
              <ul className="hm-twin-signs">{CHOICE.refonte.signs.map((s) => <li key={s}>{s}</li>)}</ul>
              <ButtonLink variant="primary" href={refonte.href} className="hm-twin-link">{refonte.label}</ButtonLink>
            </div>
          </article>
        </div>
        <div className="hm-others">
          <h3 className="hm-others-title">D’autres besoins autour de votre site{T}?</h3>
          <ul className="hm-others-list">
            {OTHER_SERVICES.map((o) => {
              const e = getExperience(o.id);
              return (
                <li key={o.id}>
                  <CampaignLink href={e.href} className="hm-other">
                    <span className="hm-other-label">{e.label}</span>
                    <span className="hm-other-service">{serviceLabels[o.id]}</span>
                    <span className="hm-other-text">{o.text}</span>
                    <span className="hm-other-arrow hm-arrow hm-arrow--up" aria-hidden="true" />
                  </CampaignLink>
                </li>
              );
            })}
          </ul>
          <p className="hm-others-all"><CampaignLink href="/services" className="hm-link">Voir toutes mes prestations<span className="hm-arrow" aria-hidden="true" /></CampaignLink></p>
        </div>
      </Container>
    </Section>
  );
}

/* Ce que vous recevez : 4 livrables numérotés, cartes « fenêtres » qui s'allument au défilement. */
export function Deliverables() {
  return (
    <Section id="livrables" labelledBy="livrables-titre" className="hm-deliv-sec">
      <Container>
        <SectionHead id="livrables-titre" eyebrow="Ce que vous recevez" title="Un site complet, pas une simple vitrine" text="Les quatre éléments que je prévois dans chaque création ou refonte de site." />
        <ol className="hm-deliv">
          {DELIVERABLES.map((d, i) => (
            <li key={d.title} className="hm-deliv-card">
              <span className="hm-deliv-light" aria-hidden="true" />
              <span className="hm-deliv-num sx-figure" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </li>
          ))}
        </ol>
        <p className="hm-deliv-options"><span className="hm-deliv-options-k">En option, selon devis{T}:</span> rédaction, référencement local, automatisation, prospection emailing.</p>
      </Container>
    </Section>
  );
}

export function Works() {
  return (
    <Section tone="surface" id="realisations" labelledBy="realisations-titre" className="hm-works">
      <Container>
        <SectionHead id="realisations-titre" eyebrow="Réalisations" title="Ce que je peux vous montrer" text="Ce site et son tableau de suivi des demandes, que j’ai conçus et construits. Les données affichées sont fictives." />
        <Realisations headingLevel={3} />
      </Container>
    </Section>
  );
}

/* Méthode : 4 étapes sans durée, H2 cinétique (R7), tracé qui s'éclaire au défilement. */
export function Method() {
  return (
    <Section id="methode" labelledBy="methode-titre" className="hm-method">
      <Container>
        <div className="sx-section-head hm-head">
          <Eyebrow>Ma méthode</Eyebrow>
          <KineticHeading id="methode-titre" className="hm-chapter">Quatre étapes, un seul interlocuteur</KineticHeading>
          <p>Du premier échange à la mise en ligne, vous savez où en est votre site et ce qui vient ensuite.</p>
        </div>
        <div className="hm-steps-wrap">
          <span className="hm-steps-track" aria-hidden="true"><span className="hm-steps-fill" /></span>
          <ol className="hm-steps">
          {METHOD.map((m, i) => (
            <li key={m.title} className="hm-step">
              <span className="hm-step-win" aria-hidden="true"><span className="sx-ref">{i + 1}</span></span>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
            </li>
          ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

export function Objections() {
  return (
    <Section tone="surface" id="questions" labelledBy="questions-titre" className="hm-faq">
      <Container className="hm-faq-grid">
        <SectionHead id="questions-titre" eyebrow="Vos questions" title="Mes réponses, sans détour" text={<>Une autre question{T}? Appelez-moi au <a href={telHref} className="sx-tabular hm-inline-link">{SITE_IDENTITY.PHONE_DISPLAY}</a> ou <a href={mailHref} className="hm-inline-link">écrivez-moi</a>.</>} />
        <FaqList items={FAQ} />
      </Container>
    </Section>
  );
}

/* Zone d'intervention : schéma indicatif en anneaux (non cartographique), liens descriptifs vers les 3 pages locales. */
export function Zone() {
  return (
    <Section tone="night" id="zone" labelledBy="zone-titre" className="hm-zone">
      <Container className="hm-zone-grid">
        <div>
          <SectionHead id="zone-titre" eyebrow="Zone d’intervention" title={<>Depuis <Place>Asnières-sur-Seine</Place>, partout où votre projet le demande</>} text={<>Je travaille depuis <Place>Asnières-sur-Seine</Place> (92). Je me déplace dans les Hauts-de-Seine et en <Place>Île-de-France</Place> selon le projet, et je travaille à distance partout en France.</>} />
          <ul className="hm-zone-links">
            {ZONE_LINKS.map((z) => (
              <li key={z.href}>
                <CampaignLink href={z.href} className="hm-zone-link"><span className="hm-zone-link-label">{z.label}</span><span className="hm-zone-link-text">{z.text}</span><span className="hm-arrow" aria-hidden="true" /></CampaignLink>
              </li>
            ))}
          </ul>
        </div>
        <figure className="hm-rings">
          <div className="hm-rings-map" aria-hidden="true">
            <span className="hm-ring hm-ring--4"><em>France, à distance</em></span>
            <span className="hm-ring hm-ring--3"><em>Île‑de‑France</em></span>
            <span className="hm-ring hm-ring--2"><em>Hauts‑de‑Seine</em></span>
            <span className="hm-ring-ambient" data-sx-ambient=""><span className="hm-ring-sweep" /><span className="hm-ring-pulse" /></span>
            <span className="hm-ring-center"><i /><em>Asnières‑sur‑Seine</em></span>
          </div>
          <figcaption>Schéma indicatif, non à l’échelle : <Place>Asnières-sur-Seine</Place> au centre, puis les Hauts-de-Seine, l’<Place>Île-de-France</Place> et la France à distance.</figcaption>
        </figure>
      </Container>
    </Section>
  );
}

export function Advice() {
  return (
    <Section tone="surface" id="conseils" labelledBy="conseils-titre" className="hm-advice">
      <Container>
        <SectionHead id="conseils-titre" eyebrow="Conseils" title="Avant de vous lancer" text="Trois guides pour préparer votre projet et poser les bonnes questions." />
        <ul className="hm-guides">
          {guides.map((g, i) => (
            <li key={g.slug}>
              <CampaignLink href={`/conseils/${g.slug}`} className="hm-guide">
                <span className="hm-guide-num sx-ref" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="hm-guide-title">{g.title}</span>
                <span className="hm-guide-text">{g.description}</span>
                <span className="hm-guide-more" aria-hidden="true">Lire le guide<span className="hm-arrow" /></span>
              </CampaignLink>
            </li>
          ))}
        </ul>
        <p className="hm-others-all"><CampaignLink href="/conseils" className="hm-link">Tous les conseils<span className="hm-arrow" aria-hidden="true" /></CampaignLink></p>
      </Container>
    </Section>
  );
}

/* Demande (#demande) : formulaire court réellement relié à /api/devis (ShortQuoteForm, lot 5), puis
   téléphone et email en clair. */
export function Demande() {
  return (
    <Section id="demande" labelledBy="demande-titre" className="hm-demande" ambient={<Glow size={640} top="-20%" left="-16%" />}>
      <Container className="hm-demande-grid">
        <div className="hm-demande-copy">
          <Eyebrow dot>Votre projet</Eyebrow>
          <h2 id="demande-titre" className="hm-demande-title">Parlons de votre site</h2>
          <p className="hm-demande-lead">{`Quelques mots suffisent${T}: votre projet, votre activité et un moyen de vous joindre. Je lis chaque demande moi-même et je vous recontacte pour en parler.`}</p>
          <ul className="hm-contact">
            <li><a href={telHref} className="hm-contact-link" data-analytics="contact"><span className="hm-contact-icon" aria-hidden="true"><Phone /></span><span><small>Téléphone direct</small><span className="sx-tabular">{SITE_IDENTITY.PHONE_DISPLAY}</span></span></a></li>
            <li><a href={mailHref} className="hm-contact-link"><span className="hm-contact-icon" aria-hidden="true"><Mail /></span><span><small>Email</small>{SITE_IDENTITY.EMAIL}</span></a></li>
          </ul>
        </div>
        <div className="hm-demande-form">
          <ShortQuoteForm variant="inline" headingLevel={3} />
        </div>
      </Container>
    </Section>
  );
}
