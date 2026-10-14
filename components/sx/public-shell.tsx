import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/brand";
import { MobileCtaBar } from "./mobile-cta-bar";
import { MotionGate } from "./motion-gate";
/* Coquille de toute page publique (serveur) : en-tête, <main id=contenu> (cible du lien d'évitement
   « Aller au contenu », rendu en tête du body par le layout racine), pied de page,
   barre d'action mobile et MotionGate. /admin et /email ne l'utilisent pas. ThemeControl et
   AudienceMeasurement restent rendus par le layout racine (tests). */
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="contenu" className="sx-main" tabIndex={-1}>{children}</main>
      <Footer />
      <MobileCtaBar />
      <MotionGate />
    </>
  );
}
