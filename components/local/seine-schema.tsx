/* Schéma indicatif des communes autour d'Asnières-sur-Seine (serveur, aucun JS).
   NON cartographique : positions relatives approximatives, pas d'échelle, pas de fond de carte. Le nord est
   en haut ; la Seine monte entre Asnières (rive gauche) et Clichy, longe Gennevilliers puis tourne vers
   l'est après Villeneuve-la-Garenne.
   - Repères dans un repère 0-100 commun : le SVG (preserveAspectRatio="none", traits non déformés par
     vector-effect) et les étiquettes HTML (left/top en %) partagent les mêmes coordonnées, quelle que soit
     la largeur ; les étiquettes restent en texte HTML de 13 px (jamais un texte SVG réduit sous 12 px).
   - Le dessin est décoratif (aria-hidden) : la liste des communes est donnée en texte dans la section, et
     une description textuelle accompagne la légende.
   - Apparition des repères liée au DÉFILEMENT (une fois en descendant, aucune lecture automatique) : la
     Seine, Asnières, puis deux vagues de repères, sur la ligne de temps de vue de .lc-map. Visible par
     défaut ; mode réduit ou pause : rien ne bouge, tout est visible. Écart à ScenePlayer : son bouton
     change de texte au départ et à la fin de la scène, et sur cette page chaque changement de texte
     recalcule le style de TOUT le document (environ 1 000 éléments, 47 à 88 ms sous CPU × 4 ; cause dans
     le socle) : 100 ms/s mesurés pour la scène, contre un budget de 20. */
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
const WAVES = [PINS.filter((p) => ["gennevilliers", "villeneuve", "colombes", "bois-colombes"].includes(p.id)), PINS.filter((p) => ["clichy", "levallois", "courbevoie"].includes(p.id))];
const RIVER = "M61 104 C55 86 53 66 58 50 C62 36 61 27 69 19 C77 11 89 9 104 8";
export function SeineSchema() {
  return (
    <figure className="lc-schema">
      <div className="lc-map" aria-hidden="true">
        {/* Couches animées comme des blocs (opacité et transform d'éléments HTML, jamais d'un <line> ni d'un
            <path>) : la Seine, Asnières, puis deux vagues de repères (nord et ouest, puis est et sud). */}
        <div className="lc-map-layer lc-map-layer--river">
          <svg className="lc-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            <path className="lc-map-river" d={RIVER} vectorEffect="non-scaling-stroke" />
            <path className="lc-map-river-core" d={RIVER} vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="lc-map-seine">La Seine</span>
        </div>
        <span className="lc-map-north"><span>N</span></span>
        {WAVES.map((wave, w) => (
          <div key={w} className={`lc-map-layer lc-map-wave lc-map-wave--${w + 1}`}>
            <svg className="lc-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
              {wave.map((p) => <line key={p.id} className="lc-map-link" x1={HOME.x} y1={HOME.y} x2={p.x} y2={p.y} vectorEffect="non-scaling-stroke" />)}
            </svg>
            {wave.map((p) => (
              <span key={p.id} className={`lc-pin lc-pin--${p.side}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <i className="lc-pin-dot" />
                <span className="lc-pin-name">{p.name}</span>
              </span>
            ))}
          </div>
        ))}
        <span className="lc-pin lc-pin--home" style={{ left: `${HOME.x}%`, top: `${HOME.y}%` }}>
          <i className="lc-pin-ring" />
          <i className="lc-pin-dot" />
          <span className="lc-pin-name">Asnières-sur-Seine</span>
        </span>
      </div>
      <figcaption className="lc-schema-caption">
        Schéma indicatif, non à l’échelle.
        <span className="sr-only"> Asnières-sur-Seine au centre, rive gauche de la Seine. Au nord : Gennevilliers et Villeneuve-la-Garenne. À l’est, de l’autre côté du fleuve : Clichy et Levallois-Perret. À l’ouest : Colombes et Bois-Colombes. Au sud : Courbevoie.</span>
      </figcaption>
    </figure>
  );
}
