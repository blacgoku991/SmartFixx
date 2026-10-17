import "./editorial.css";
import { ButtonLink, Container, Glow, PageHero, PhoneLink, Place, Section, SectionHead } from "@/components/sx";
import CampaignLink from "@/components/campaign-link";
import { JsonLd } from "@/components/json-ld";
import { type Guide, guides, readingMinutes } from "@/lib/guides";
import { articleJsonLd } from "@/lib/seo";
import { SITE_IDENTITY } from "@/lib/site-identity";
import { Chapter, ReadingLayout, fr, frenchDate, num } from "./reading";
import { RichText } from "./rich-text";
import { GuideCard } from "./guide-card";
/* Page d'un guide (/conseils/[slug]). Hero : fil d'Ariane, H1 (titre éditorial, distinct du seoTitle),
   chapeau et métadonnées réelles (dates de lib/guides.ts, temps de lecture calculé, auteur). Décor du
   hero : la « fenêtre de lecture », quatre carreaux dont la lumière passe d'une pièce à l'autre (ambiance,
   data-motion=on, cycle de 24 s, délais négatifs), à partir de 1100 px. Puis le gabarit de lecture
   (sommaire-façade collant), les liens vers la prestation liée dans le texte, la source, l'encadré
   d'appel et les deux autres guides. Auteur : Person « Mohamed » seulement si le propriétaire l'accepte
   (SITE_IDENTITY.personAuthorAccepted, décision n° 12), sinon SmartFixx, comme dans le JSON-LD. */
export function GuideArticle({ guide }: { guide: Guide }) {
  const index = guides.findIndex((g) => g.slug === guide.slug);
  const path = `/conseils/${guide.slug}`;
  const author = SITE_IDENTITY.personAuthorAccepted ? `${SITE_IDENTITY.NAME}, ${SITE_IDENTITY.BRAND}` : SITE_IDENTITY.BRAND;
  const others = guides.filter((g) => g.slug !== guide.slug);
  const updated = guide.dateModified !== guide.datePublished;
  return (
    <>
      <JsonLd data={articleJsonLd({ headline: guide.title, description: guide.seoDescription, path, datePublished: guide.datePublished, dateModified: guide.dateModified })} />
      <PageHero
        className="ed-hero ed-hero--guide"
        breadcrumbs={[{ name: "Conseils", path: "/conseils" }, { name: guide.title, path }]}
        title={fr(guide.title)}
        lead={fr(guide.description)}
        actions={<><ButtonLink href={guide.cta.href} size="lg">{guide.cta.label}</ButtonLink><PhoneLink compact="sm" /></>}
        proofs={[
          `Guide ${num(index + 1)} · ${guide.category}`,
          `Lecture ${readingMinutes(guide)} min · par ${author}`,
          `Publié le ${frenchDate(guide.datePublished)}${updated ? ` · mis à jour le ${frenchDate(guide.dateModified)}` : ""}`,
        ]}
        backdrop={
          <>
            <Glow tone="blue" size={720} top="-320px" right="-220px" />
            <span className="ed-lamp" />
            <span className="ed-window">
              <span className="ed-window-pane ed-wp1" /><span className="ed-window-pane ed-wp2" /><span className="ed-window-pane ed-wp3" /><span className="ed-window-pane ed-wp4" />
              <span className="ed-window-cross" />
              <span className="ed-window-num sx-figure">{num(index + 1)}</span>
            </span>
          </>
        }
      />
      <Section className="ed-reading-section">
        <ReadingLayout
          tocLabel="Dans ce guide"
          toc={guide.sections.map((s) => ({ id: s.id, label: fr(s.title) }))}
          aside={<p className="ed-toc-note">Prestation liée{"\u202F"}: <CampaignLink href={guide.related.href}>{guide.related.label}</CampaignLink></p>}
        >
          {guide.sections.map((s, i) => (
            <Chapter key={s.id} id={s.id} n={i + 1} title={fr(s.title)}>
              {s.paragraphs.map((p) => <p key={p}><RichText text={p} /></p>)}
            </Chapter>
          ))}
          {guide.source ? (
            <p className="ed-source">
              <span className="ed-source-k">Pour aller plus loin</span>
              <a href={guide.source.url} target="_blank" rel="noopener noreferrer">{guide.source.label}<span className="ed-sr"> (nouvel onglet)</span></a>
            </p>
          ) : null}
          <aside className="ed-cta" data-sx-tone="night" aria-labelledby="ed-cta-titre">
            <span className="ed-cta-win" aria-hidden="true" />
            <h2 id="ed-cta-titre" className="ed-cta-title">{fr(guide.cta.title)}</h2>
            <p className="ed-cta-text">{fr(guide.cta.text)}</p>
            <div className="ed-cta-actions">
              <ButtonLink href={guide.cta.href} size="lg">{guide.cta.label}</ButtonLink>
              <PhoneLink />
            </div>
            <p className="ed-cta-links">
              <CampaignLink href={guide.cta.secondary.href}>{guide.cta.secondary.label}</CampaignLink>
              <span>Je travaille depuis <Place>Asnières-sur-Seine</Place>{"\u202F"}: <CampaignLink href="/creation-site-internet-asnieres-sur-seine">création de site internet à <Place>Asnières-sur-Seine</Place></CampaignLink></span>
            </p>
          </aside>
        </ReadingLayout>
      </Section>
      <Section tone="surface" id="autres-guides" labelledBy="autres-guides-titre" className="ed-more-section">
        <Container>
          <SectionHead id="autres-guides-titre" eyebrow="Conseils" title="Les autres guides" />
          <div className="ed-cards ed-cards--two">
            {others.map((g) => <GuideCard key={g.slug} guide={g} index={guides.indexOf(g)} headingLevel={3} />)}
          </div>
          <p className="ed-all"><CampaignLink href="/conseils">Tous les conseils pour votre site, vos outils et votre prospection</CampaignLink></p>
        </Container>
      </Section>
    </>
  );
}
