import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/brand";
import { MobileCtaBar } from "./mobile-cta-bar";
import { MotionGate } from "./motion-gate";
/* Coquille de toute page publique (serveur) : en-tête, <main id=contenu> (cible du lien d'évitement
   « Aller au contenu », rendu en tête du body par le layout racine), pied de page,
   barre d'action mobile et MotionGate. /admin et /email ne l'utilisent pas. ThemeControl et
   AudienceMeasurement restent rendus par le layout racine (tests). */
/* Un seul élément <Footer/> pour tout le module : la page 404 racine est sérialisée dans la charge RSC de
   chaque page (emplacement notFound du layout), avec sa propre coquille. Avec le même objet élément des deux
   côtés, React Flight peut renvoyer à la première sérialisation au lieu de répéter le pied de page. */
const FOOTER = <Footer />;
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="contenu" className="sx-main" tabIndex={-1}>{children}</main>
      {FOOTER}
      <MobileCtaBar />
      <MotionGate />
    </>
  );
}
