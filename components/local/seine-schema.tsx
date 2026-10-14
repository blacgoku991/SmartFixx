import { ScenePlayer } from "@/components/sx";
/* Schéma indicatif des communes autour d'Asnières-sur-Seine (serveur ; la scène est pilotée par ScenePlayer).
   NON cartographique : positions relatives approximatives, pas d'échelle, pas de fond de carte. Le nord est
   en haut ; la Seine monte entre Asnières (rive gauche) et Clichy, longe Gennevilliers puis tourne vers
   l'est après Villeneuve-la-Garenne.
   - Repères dans un repère 0-100 commun : le SVG (preserveAspectRatio="none", traits non déformés par
     vector-effect) et les étiquettes HTML (left/top en %) partagent les mêmes coordonnées, quelle que soit
     la largeur ; les étiquettes restent en texte HTML de 13 px (jamais un texte SVG réduit sous 12 px).
   - Toute la zone est décorative (aria-hidden par ScenePlayer) : la liste des communes est donnée en texte
     dans la section, et la description de la scène est lue par les lecteurs d'écran.
   - Scène jouée UNE fois (ScenePlayer) : la Seine apparaît, Asnières s'allume, puis chaque repère et son
     lien. Le serveur rend l'état final ; mode réduit ou pause : rien ne bouge, tout est visible. */
type Pin = { id: string; name: string; x: number; y: number; side: "right" | "left" };
const HOME = { x: 38, y: 47 };
const PINS: Pin[] = [
  { id: "gennevilliers", name: "Gennevilliers", x: 33, y: 24, side: "right" },
  { id: "villeneuve", name: "Villeneuve-la-Garenne", x: 58, y: 9, side: "left" },
  { id: "clichy", name: "Clichy", x: 76, y: 52, side: "right" },
  { id: "levallois", name: "Levallois-Perret", x: 74, y: 80, side: "left" },
  { id: "courbevoie", name: "Courbevoie", x: 36, y: 88, side: "left" },
  { id: "bois-colombes", name: "Bois-Colombes", x: 16, y: 66, side: "right" },
  { id: "colombes", name: "Colombes", x: 9, y: 40, side: "right" },
];
const RIVER = "M61 104 C55 86 53 66 58 50 C62 36 61 27 69 19 C77 11 89 9 104 8";
export function SeineSchema() {
  return (
    <ScenePlayer
      className="lc-schema"
      duration={4800}
      label="Schéma indicatif, non à l’échelle"
      description="Asnières-sur-Seine au centre, rive gauche de la Seine. Au nord : Gennevilliers et Villeneuve-la-Garenne. À l’est, de l’autre côté du fleuve : Clichy et Levallois-Perret. À l’ouest : Colombes et Bois-Colombes. Au sud : Courbevoie."
    >
      <div className="lc-map">
        <svg className="lc-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
          <path className="lc-map-river" d={RIVER} vectorEffect="non-scaling-stroke" />
          <path className="lc-map-river-core" d={RIVER} vectorEffect="non-scaling-stroke" />
          {PINS.map((p, i) => (
            <line key={p.id} className={`lc-map-link lc-d${i + 1}`} x1={HOME.x} y1={HOME.y} x2={p.x} y2={p.y} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <span className="lc-map-seine">La Seine</span>
        <span className="lc-map-north"><span>N</span></span>
        {PINS.map((p, i) => (
          <span key={p.id} className={`lc-pin lc-pin--${p.side} lc-d${i + 1}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <i className="lc-pin-dot" />
            <span className="lc-pin-name">{p.name}</span>
          </span>
        ))}
        <span className="lc-pin lc-pin--home" style={{ left: `${HOME.x}%`, top: `${HOME.y}%` }}>
          <i className="lc-pin-ring" />
          <i className="lc-pin-dot" />
          <span className="lc-pin-name">Asnières-sur-Seine</span>
        </span>
      </div>
    </ScenePlayer>
  );
}
