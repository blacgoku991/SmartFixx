import type { ReactNode } from "react";
import { Glow, PageHero, PublicShell, Section } from "@/components/sx";
import { ReadingLayout, type TocItem } from "@/components/editorial/reading";
import { SITE_IDENTITY, mailHref, telHref } from "@/lib/site-identity";
/* Pages légales (lot 9) : PublicShell, hero de lecture (fil d'Ariane, H1, chapeau), puis le gabarit de
   lecture (sommaire-façade collant, chapitres numérotés) et, sous le sommaire, le contact direct.
   Compatibilité : /garanties (lot 8) appelle encore LegalLayout avec { title, eyebrow, children } sans
   sommaire ; ce cas rend la même page sans sommaire, et le lot 8 la remplace par son propre gabarit.
   Plus de « une équipe à votre écoute » : un seul interlocuteur, Mohamed. */
type LegalLayoutProps = {
  title: string;
  eyebrow?: string;
  lead?: ReactNode;
  path?: string;
  crumb?: string;
  toc?: TocItem[];
  children: ReactNode;
};
export function LegalLayout({ title, eyebrow, lead, path, crumb, toc, children }: LegalLayoutProps) {
  const contact = (
    <div className="ed-toc-note ed-toc-contact">
      <p>Une question sur cette page{" "}? Écrivez-moi ou appelez-moi{" "}:</p>
      <a href={mailHref}>{SITE_IDENTITY.EMAIL}</a>
      <a href={telHref} className="sx-tabular sx-nowrap">{SITE_IDENTITY.PHONE_DISPLAY}</a>
    </div>
  );
  return (
    <PublicShell>
      <PageHero
        className="ed-hero ed-hero--legal"
        breadcrumbs={path ? [{ name: crumb ?? title, path }] : undefined}
        eyebrow={path ? undefined : eyebrow}
        eyebrowDot={false}
        title={title}
        lead={lead}
        backdrop={<><Glow tone="blue" size={640} top="-320px" right="-200px" /><span className="ed-legal-grid" /></>}
      />
      <Section className="ed-reading-section ed-reading-section--legal">
        {toc?.length ? (
          <ReadingLayout tocLabel="Sur cette page" toc={toc} aside={contact}>{children}</ReadingLayout>
        ) : (
          <div className="sx-container ed-reading ed-reading--plain"><div className="ed-body ed-legacy">{children}{contact}</div></div>
        )}
      </Section>
    </PublicShell>
  );
}
