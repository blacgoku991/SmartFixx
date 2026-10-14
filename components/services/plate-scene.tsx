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
    <div className="sv-hero-plate">
      <ScenePlayer label={label} description={description} duration={6600} className="sv-scene">
        <Plate />
      </ScenePlayer>
    </div>
  );
}
