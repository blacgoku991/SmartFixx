import Link from "@/components/campaign-link";
import { PrivacyPreferences } from "./privacy-preferences";
import { Cartouche } from "@/components/sx/cartouche";
import { MotionToggle } from "@/components/sx/motion-gate";
import { SITE_IDENTITY, mailHref, telHref } from "@/lib/site-identity";
/* Brand vit dans components/brand-mark.tsx : l'en-tête public (composant client) l'importe de là, sans tirer ce
   module (pied de page, liens, identité légale) dans le JavaScript de toutes les pages. Réexportée ici pour
   le panel et la page email. */
import { Brand } from "./brand-mark";
export { Brand };
const columns: { title: string; links: [string, string][] }[] = [
  { title: "Création & refonte", links: [["Création de site internet", "/creation-site-internet"], ["Refonte de site internet", "/refonte-site-internet"], ["Création de site à Asnières-sur-Seine", "/creation-site-internet-asnieres-sur-seine"], ["Île-de-France", "/agence-web-ile-de-france"], ["France, à distance", "/agence-web-france"]] },
  { title: "Prestations", links: [["Développement sur mesure", "/developpement-sur-mesure"], ["Automatisation", "/automatisation-informatique"], ["Sécurité web", "/cybersecurite"], ["Référencement SEO", "/referencement-seo"], ["Prospection emailing", "/prospection-emailing"], ["Toutes les prestations", "/services"]] },
  { title: "Conseils", links: [["Tous les conseils", "/conseils"], ["Préparer la refonte de son site", "/conseils/preparer-refonte-site-internet"], ["Automatiser le suivi des demandes", "/conseils/automatiser-suivi-demandes-clients"], ["Préparer une campagne d’emailing B2B", "/conseils/preparer-campagne-emailing-b2b"]] },
];
/* Pied de page public (SiteFooter). Plus aucun lien /admin. */
export function Footer() {
  return (
    <footer className="sx-footer">
      <div className="sx-container">
        <div className="sx-footer-top">
          <div className="sx-footer-contact">
            <Brand />
            <p>Mohamed — SmartFixx<br /><a href={telHref} className="sx-tabular">{SITE_IDENTITY.PHONE_DISPLAY}</a><br /><a href={mailHref}>{SITE_IDENTITY.EMAIL}</a></p>
            <p><span className="sx-nowrap">Asnières-sur-Seine</span> · Hauts-de-Seine · Île-de-France · à distance</p>
          </div>
          <div className="sx-footer-cols">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2>{col.title}</h2>
                <ul>{col.links.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
              </nav>
            ))}
            <nav aria-label="Légal">
              <h2>Légal</h2>
              <ul>
                <li><Link href="/mentions-legales">Mentions légales</Link></li>
                <li><Link href="/confidentialite">Confidentialité</Link></li>
                <li><PrivacyPreferences /></li>
              </ul>
            </nav>
          </div>
        </div>
        <Cartouche variant="footer" />
        <div className="sx-footer-bottom">
          <span>© {new Date().getFullYear()} {SITE_IDENTITY.LEGAL}</span>
          <MotionToggle />
        </div>
      </div>
    </footer>
  );
}
