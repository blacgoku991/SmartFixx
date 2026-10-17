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
/* Police du H1 (élément LCP) : SFX Display 82 n'était découverte qu'après les trois feuilles de style et la
   mise en page (requête à ~160 ms, juste avant le premier rendu du texte) ; dans la simulation mobile de
   Lighthouse, ce trajet document → CSS → police allongeait le LCP. Le préchargement la demande dès l'en-tête
   du document, en parallèle des feuilles. Même URL et même mode CORS que l'@font-face de globals.css.
   Élément <link> et non ReactDOM.preload() : ici, l'indice que preload() envoie dans le flux RSC n'arrive
   jamais dans le HTML rendu par le serveur ; React remonte en revanche ce <link> dans <head>. */
const H1_FONT = "/fonts/sfx-display-82.v1.woff2";
export function HomePage() {
  return (
    <>
      <link rel="preload" href={H1_FONT} as="font" type="font/woff2" crossOrigin="anonymous" />
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
