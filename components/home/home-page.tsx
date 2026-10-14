import "./home.css";
import { Cartouche } from "@/components/sx/cartouche";
import { HomeHero } from "./hero";
import { RequestJourney } from "./request-journey";
import { Advice, Audience, Choice, Deliverables, Demande, Method, Objections, Works, Zone } from "./sections";
/* Accueil (lot 1), composant serveur principal : il importe la feuille du lot (préfixe hm-), chargée
   après globals.css (règle d'import des CSS de lot, DESIGN_SYSTEM §1). Ordre de la page « / » (pages.md).
   Pas de frontière <Suspense> autour des sections : Next les diffusait alors hors ordre (contenu dans des
   <div hidden> en fin de document, replacé par un script), donc invisible sans JavaScript, sans gain mesurable
   sur le TBT (comparaison alternée, 2 × 3 passes Lighthouse). Le coût de rendu hors écran est traité par
   content-visibility dans home.css. */
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
