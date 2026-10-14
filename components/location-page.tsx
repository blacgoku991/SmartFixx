import "./local/local.css";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import CampaignLink from "@/components/campaign-link";
import { JsonLd } from "@/components/json-ld";
import { Container, Section, SectionHead } from "@/components/sx";
import { serviceJsonLd, pageMeta } from "@/lib/seo";
import { getLocation, type LocationSlug } from "@/lib/locations";
import type { Area } from "@/lib/site-identity";
/* Parties communes des trois pages locales (lot 4). Le gabarit unique d'autrefois (même structure, nom de
   ville remplacé) est abandonné : chaque page a sa composition dans components/local/. Restent ici :
   - locationMeta : métadonnées (seoTitle et seoDescription de lib/locations.ts, canonique du slug) ;
   - Commune : nom de lieu insécable qui GARDE ses traits d'union ASCII (voir plus bas) ;
   - LocalLinks : maillage interne, ancres descriptives propres à chaque page ;
   - LocalServiceJsonLd : Service (provider = Organization, areaServed exact ; ni LocalBusiness ni adresse). */
export function locationMeta(slug: LocationSlug) {
  const l = getLocation(slug);
  return pageMeta(l.seoTitle, l.seoDescription, `/${l.slug}`);
}
/* Nom de commune insécable. Écart assumé à <Place> (U+2011 et espaces insécables) : sur ces pages, les noms de
   communes sont le cœur du référencement local et la condition des redirections 308 (le texte doit nommer
   « Levallois-Perret », pas « Levallois‑Perret » avec un trait d'union insécable, que les moteurs et un grep
   ne lisent pas comme le même mot). white-space: nowrap suffit à empêcher la coupure. */
export function Commune({ children }: { children: string }) {
  return <span className="sx-nowrap">{children}</span>;
}
export type LocalLink = { href: string; label: string; text: ReactNode };
export function LocalLinks({ id, eyebrow, title, items, tone = "bg" }: { id: string; eyebrow?: ReactNode; title: string; items: LocalLink[]; tone?: "bg" | "surface" }) {
  return (
    <Section tone={tone} id={id} labelledBy={`${id}-titre`} className="lc-links-section">
      <Container>
        <SectionHead eyebrow={eyebrow} title={title} id={`${id}-titre`} />
        <ul className="lc-links">
          {items.map((l) => (
            <li key={l.href}>
              <CampaignLink href={l.href} className="lc-link">
                <span className="lc-link-label">{l.label}</span>
                <span className="lc-link-text">{l.text}</span>
                <ArrowRight className="lc-link-arrow" aria-hidden="true" />
              </CampaignLink>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
export function LocalServiceJsonLd({ name, description, path, areaServed }: { name: string; description: string; path: string; areaServed: Area[] }) {
  return <JsonLd data={serviceJsonLd({ name, description, path, areaServed })} />;
}
