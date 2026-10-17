/* Schéma indicatif des communes autour d'Asnières-sur-Seine (serveur, aucun JS).
   NON cartographique : positions relatives approximatives, pas d'échelle, pas de fond de carte. Le nord est
   en haut. La Seine entre par le sud entre Courbevoie (rive gauche) et Levallois-Perret (rive droite), monte
   vers le nord-est entre Asnières (rive gauche) et Clichy, longe Gennevilliers et Villeneuve-la-Garenne par
   l'est, puis tourne vers l'OUEST au nord de Villeneuve-la-Garenne et de Gennevilliers (vers Épinay et
   Argenteuil) : le Val-d'Oise est de l'autre côté de ce méandre, comme le dit la page Île-de-France.
   - Repères dans un repère 0-100 commun : le SVG (preserveAspectRatio="none", traits non déformés par
     vector-effect) et les étiquettes HTML (left/top en %) partagent les mêmes coordonnées, quelle que soit
     la largeur ; les étiquettes restent en texte HTML de 13 px, 12 px sous 380 px (jamais un texte SVG
     réduit). Chaque étiquette reste du côté de son repère par rapport au fleuve, et dans la carte dès
     360 px (carte de 328 px) : Levallois-Perret, sur la rive droite près du bord, a son étiquette SOUS le
     repère (side "below").
   - Le dessin est décoratif (aria-hidden) : la liste des communes est donnée en texte dans la section, et
     une description textuelle accompagne la légende.
   - Apparition des repères liée au DÉFILEMENT (une fois en descendant, aucune lecture automatique) : la
     Seine, Asnières, puis deux vagues de repères, sur la ligne de temps de vue de .lc-map, bornées en
     longueur (tout est opaque quand le haut de la carte atteint la mi-hauteur de l'écran, dès 640 px de
     haut). Visible par défaut ; mode réduit ou pause : rien ne bouge, tout est visible. Écart à
     ScenePlayer : son bouton change de texte au départ et à la fin de la scène, et sur cette page chaque
     changement de texte recalcule le style de TOUT le document (environ 1 000 éléments, 47 à 88 ms sous
     CPU × 4 ; cause dans le socle) : 100 ms/s mesurés pour la scène, contre un budget de 20. */
type Pin = { id: string; name: string; x: number; y: number; side: "right" | "left" | "below" };
const HOME = { x: 36, y: 46 };
/* Rive gauche (ouest du fleuve) : Gennevilliers, Villeneuve-la-Garenne (dans le méandre), Colombes,
   Bois-Colombes, Courbevoie, Asnières. Rive droite (est) : Clichy, Levallois-Perret. */
const PINS: Pin[] = [
  { id: "gennevilliers", name: "Gennevilliers", x: 28, y: 28, side: "right" },
  { id: "villeneuve", name: "Villeneuve-la-Garenne", x: 60, y: 18, side: "left" },
  { id: "clichy", name: "Clichy", x: 75, y: 47, side: "right" },
  { id: "levallois", name: "Levallois-Perret", x: 78, y: 73, side: "below" },
  { id: "courbevoie", name: "Courbevoie", x: 38, y: 89, side: "left" },
  { id: "bois-colombes", name: "Bois-Colombes", x: 10, y: 64, side: "right" },
  { id: "colombes", name: "Colombes", x: 9, y: 38, side: "right" },
];
const WAVES = [PINS.filter((p) => ["gennevilliers", "villeneuve", "colombes", "bois-colombes"].includes(p.id)), PINS.filter((p) => ["clichy", "levallois", "courbevoie"].includes(p.id))];
/* Du sud (bas) vers le nord-est, puis demi-tour vers l'ouest au nord : le fleuve sort par la gauche. */
const RIVER = "M48 104 C50 86 56 68 63 54 C68 44 72 34 72 22 C73 12 67 6 55 6 C40 6 20 9 -4 13";
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
        <span className="sr-only"> Asnières-sur-Seine au centre, rive gauche de la Seine. Au nord : Gennevilliers et Villeneuve-la-Garenne, que la Seine longe par l’est avant de tourner vers l’ouest. À l’est et au sud-est, de l’autre côté du fleuve : Clichy et Levallois-Perret. À l’ouest : Colombes et Bois-Colombes. Au sud-ouest : Courbevoie.</span>
      </figcaption>
    </figure>
  );
}
