import "./home.css";
import { Suspense } from "react";
import { Cartouche } from "@/components/sx/cartouche";
import { HomeHero } from "./hero";
import { RequestJourney } from "./request-journey";
import { Advice, Audience, Choice, Deliverables, Demande, Method, Objections, Works, Zone } from "./sections";
/* Accueil (lot 1), composant serveur principal : il importe la feuille du lot (préfixe hm-), chargée
   après globals.css (règle d'import des CSS de lot, DESIGN_SYSTEM §1). Ordre de la page « / » (pages.md).
   Chaque section sous le hero est une frontière <Suspense> : rien n'y est suspendu (le HTML serveur est
   complet), mais React hydrate alors chaque section comme une unité séparée et rend la main au navigateur
   entre deux, au lieu d'une seule longue tâche d'hydratation pour ~1 100 éléments (Lighthouse : tâche de
   350 ms dans react-dom au chargement mobile). */
export function HomePage() {
  const below = [Audience, Choice, RequestJourney, Deliverables, Works, Method, Objections, Zone, Advice, Demande];
  return (
    <>
      <HomeHero />
      <Cartouche variant="band" />
      {below.map((S, i) => <Suspense key={i} fallback={null}><S /></Suspense>)}
    </>
  );
}
