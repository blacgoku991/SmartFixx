import "./home.css";
import { Cartouche } from "@/components/sx/cartouche";
import { HomeHero } from "./hero";
import { RequestJourney } from "./request-journey";
import { Advice, Audience, Choice, Deliverables, Demande, Method, Objections, Works, Zone } from "./sections";
/* Accueil (lot 1), composant serveur principal : il importe la feuille du lot (préfixe hm-), chargée
   après globals.css (règle d'import des CSS de lot, DESIGN_SYSTEM §1). Ordre de la page « / » (pages.md). */
export function HomePage() {
  return (
    <>
      <HomeHero />
      <Cartouche variant="band" />
      <Audience />
      <Choice />
      <RequestJourney />
      <Deliverables />
      <Works />
      <Method />
      <Objections />
      <Zone />
      <Advice />
      <Demande />
    </>
  );
}
