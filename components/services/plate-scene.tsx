import { ScenePlayer } from "@/components/sx/scene-player";
import type { PlateKind } from "./content";
import { DevPlate } from "./plates/dev-plate";
import { AutoPlate } from "./plates/auto-plate";
import { SecuPlate } from "./plates/secu-plate";
import { SeoPlate } from "./plates/seo-plate";
/* Planche du hero dans ScenePlayer (le seul composant client de la page) : jouée une fois quand elle est
   visible, après load + idle (MotionGate), sous html[data-motion=on] ; état final rendu par le serveur ;
   bouton Pause / Rejouer hors de la zone aria-hidden ; description textuelle pour les lecteurs d'écran. */
const PLATES = { dev: DevPlate, auto: AutoPlate, secu: SecuPlate, seo: SeoPlate } as const;
export function PlateScene({ kind, label, description }: { kind: PlateKind; label: string; description: string }) {
  const Plate = PLATES[kind];
  return (
    // data-sx-ambient : MotionGate y pose data-sx-visible et data-sx-hold ; les règles du socle figent alors
    // la scène hors écran et pendant un défilement (mesuré : une scène qui continuait hors écran coûtait
    // jusqu'à 200 ms/s sous CPU × 4 pendant le défilement vers le bas de la page). ScenePlayer garde la main
    // sur le départ, la pause et « Rejouer ».
    <div className="sv-hero-plate" data-sx-ambient="">
      <ScenePlayer label={label} description={description} duration={7200} className="sv-scene">
        <Plate />
      </ScenePlayer>
    </div>
  );
}
