import "./acquisition/acquisition.css";
import { PublicShell } from "@/components/sx/public-shell";
import { CtaBand } from "@/components/sx/cta-band";
import { JsonLd } from "@/components/json-ld";
import { AcquisitionHero } from "@/components/acquisition/hero";
import { CreationSections } from "@/components/acquisition/creation";
import { RefonteSections } from "@/components/acquisition/refonte";
import { acquisition } from "@/lib/content/acquisition";
import { services } from "@/lib/services";
import { serviceJsonLd } from "@/lib/seo";
import { SITE_IDENTITY } from "@/lib/site-identity";
/* CONTRAT figé au lot 0 : AcquisitionPage({service}) pour /creation-site-internet et /refonte-site-internet,
   pages d'arrivée des annonces Search (docs/SEO_ADS.md). Implémentation du lot 2. Les métadonnées (titre,
   description, canonique) sont produites par app/[slug]/page.tsx (gelé) à partir de lib/services.ts.
   - Hero d'acquisition + UNE instance de ShortQuoteForm (#demande) dans l'aside ;
   - sections propres à la page (moment signature : planche annotée tracée / comparateur avant-après) ;
   - bandeau d'appel vers #demande ;
   - JSON-LD : BreadcrumbList (rendu par le fil d'Ariane du hero) et Service (fournisseur = Organization,
     zones Asnières-sur-Seine, Hauts-de-Seine, Île-de-France, France ; aucune offre ni prix).
   La feuille du lot (préfixe aq-) est importée ici, depuis ce composant serveur. */
const SEEDS = { creation: 3, refonte: 8 } as const;
export function AcquisitionPage({ service }: { service: "creation" | "refonte" }) {
  const content = acquisition[service];
  const s = services.find((x) => x.id === service);
  if (!s) return null;
  return (
    <PublicShell>
      <AcquisitionHero content={content} seed={SEEDS[service]} />
      {service === "creation" ? <CreationSections /> : <RefonteSections />}
      <CtaBand id="aq-cta-titre" title={content.band.title} text={content.band.text} primaryHref="#demande" primaryLabel={content.hero.cta} />
      <JsonLd data={serviceJsonLd({ name: content.crumb, description: s.seoDescription, path: content.path, areaServed: [...SITE_IDENTITY.AREAS] })} />
    </PublicShell>
  );
}
