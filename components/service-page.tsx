import "./services/services.css";
import { PublicShell } from "@/components/sx/public-shell";
import { PageHero } from "@/components/sx/page-hero";
import { ButtonLink, PhoneLink } from "@/components/sx/actions";
import { Glow, Skyline } from "@/components/sx/ambient";
import { CtaBand } from "@/components/sx/cta-band";
import { JsonLd } from "@/components/json-ld";
import { PlateScene } from "@/components/services/plate-scene";
import { Audience, Deliverables, Example, Further, Questions, Steps } from "@/components/services/sections";
import { servicePages, type ServicePageContent } from "@/components/services/content";
import { getExperience } from "@/lib/service-experience";
import { serviceJsonLd } from "@/lib/seo";
import type { Service } from "@/lib/services";
/* Pages de prestations (lot 3) : /developpement-sur-mesure, /automatisation-informatique, /cybersecurite et
   /referencement-seo (app/[slug]/page.tsx, gelé, fournit titre, description et canonique à partir de
   lib/services.ts). Ordre : hero (fil d'Ariane, H1 « mot-clé » + espace + accroche, CTA vers
   /contact?service=<id>, téléphone, preuves ; planche propre au service dans ScenePlayer), pour qui et
   quand (objet chrome en vignette lazy ≤ 320 px), livrables et limites, exemple illustratif (guide lié cité
   dans le texte), déroulement, FAQ, pour aller plus loin (related), bandeau d'appel, JSON-LD Service (le
   BreadcrumbList est rendu par le fil d'Ariane du hero).
   Création et refonte passent par AcquisitionPage (lot 2, branché dans app/[slug]/page.tsx) ; si un jour
   une prestation sans contenu dédié arrivait ici, une version générique (sans planche ni exemple) est
   servie plutôt qu'une erreur.
   Graines de ville : 6, 7, 9, 10 (accueil 0, bandeau 5, création 3, refonte 8). */
const SEEDS: Record<string, number> = { developpement: 6, automatisation: 7, cybersecurite: 9, seo: 10 };
function Hero({ s, c }: { s: Service; c: ServicePageContent }) {
  const title = <>{c.title.before}<span className="sx-keyword">{c.title.keyword}</span>{c.title.after}</>;
  return (
    <PageHero
      className={`sv-hero sv-hero--${s.id}`}
      breadcrumbs={[{ name: "Prestations", path: "/services" }, { name: c.crumb, path: `/${s.slug}` }]}
      title={title}
      tagline={c.tagline}
      lead={c.lead}
      actions={<><ButtonLink variant="cta" href={`/contact?service=${s.id}`} size="lg" data-service={s.id}>Parler de mon projet</ButtonLink><PhoneLink compact="sm" /></>}
      proofs={c.proofs}
      backdrop={<><Glow tone="blue" size={720} top="-260px" right="-220px" duration={26} /><Skyline seed={SEEDS[s.id] ?? 6} signal depth={false} /></>}
      aside={<PlateScene kind={c.plate.kind} label={c.plate.label} description={c.plate.description} />}
    />
  );
}
/* Repli générique : prestation sans contenu dédié dans components/services/content.ts. */
function fallback(s: Service): ServicePageContent {
  const e = getExperience(s.id);
  return {
    crumb: s.title, title: { before: s.title, keyword: "", after: "" }, tagline: s.short, lead: e.description, proofs: [],
    plate: { kind: "dev", label: "", description: "" }, media: { base: "studio-web", src: "/studio-web.webp", alt: "" },
    when: { title: "Pour qui", signs: [] }, limits: [], example: { title: "", context: "", beats: [] },
    guideText: { before: "", after: "" }, band: { title: "Un projet à me confier ?", text: "Décrivez-moi votre besoin : je vous réponds avec une proposition claire." },
  };
}
export function ServicePage({ service: s }: { service: Service }) {
  const content = servicePages[s.id as keyof typeof servicePages];
  const c = content ?? fallback(s);
  return (
    <PublicShell>
      {content ? <Hero s={s} c={c} /> : (
        <PageHero className="sv-hero" breadcrumbs={[{ name: "Prestations", path: "/services" }, { name: s.title, path: `/${s.slug}` }]} title={s.title} tagline={c.tagline} lead={c.lead}
          actions={<><ButtonLink variant="cta" href={`/contact?service=${s.id}`} size="lg" data-service={s.id}>Parler de mon projet</ButtonLink><PhoneLink compact="sm" /></>}
          backdrop={<><Glow tone="blue" size={720} top="-260px" right="-220px" duration={26} /><Skyline seed={6} signal depth={false} /></>} />
      )}
      {content ? <Audience s={s} c={c} /> : null}
      <Deliverables s={s} c={c} />
      {content ? <Example s={s} c={c} /> : null}
      <Steps s={s} />
      <Questions s={s} />
      <Further s={s} />
      <CtaBand id="sv-cta-titre" title={c.band.title} text={c.band.text} primaryHref={`/contact?service=${s.id}`} />
      <JsonLd data={serviceJsonLd({ name: c.crumb, description: s.seoDescription, path: `/${s.slug}` })} />
    </PublicShell>
  );
}
