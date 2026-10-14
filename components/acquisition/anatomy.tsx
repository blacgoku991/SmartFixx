import { ScenePlayer } from "@/components/sx/scene-player";
import type { Item } from "@/lib/content/acquisition";
/* Planche annotée « Anatomie d'un site qui fait appeler » (serveur ; ScenePlayer est le seul client).
   - Un téléphone en SVG (320 × 470, sous la limite de 400 × 500 de la charte R2 pour stroke-dashoffset),
     rendu dans son état final par le serveur : contour, zones repérées en pointillés ambre, repères ①–④
     et lignes de rappel.
   - Scène unique (ScenePlayer, 4,2 s, une fois, puis état final) : le contour se trace, puis chaque zone
     s'allume avec sa ligne de rappel tracée et son repère, et l'annotation correspondante de la liste
     passe de l'ombre à la lumière. stroke-dashoffset (pathLength = 1) et opacity/transform seulement,
     aucune var() dans les images clés, aucun effet de mise en page.
   - Le SVG est un décor aria-hidden (dans la scène) ; la liste ordonnée porte le contenu. Étiquette
     « Démonstration : maquette fictive ». Aucun texte sous 12 px à partir de 360 px de large. */
const PHONE = "M44 6H216A36 36 0 0 1 252 42V428A36 36 0 0 1 216 464H44A36 36 0 0 1 8 428V42A36 36 0 0 1 44 6Z";
const ZONES = [
  { x: 160, y: 47, w: 78, h: 36, cy: 65 },
  { x: 26, y: 102, w: 212, h: 102, cy: 153 },
  { x: 26, y: 212, w: 212, h: 68, cy: 246 },
  { x: 26, y: 290, w: 212, h: 156, cy: 368 },
];
export function Anatomy({ marks, caption, description }: { marks: Item[]; caption: string; description: string }) {
  return (
    <div className="aq-board">
      <div className="aq-board-stage">
        <ScenePlayer label={caption} description={description} duration={4200} className="aq-an-scene">
          <svg className="aq-an" viewBox="0 0 320 470" width="320" height="470" focusable="false">
            <path className="aq-an-phone aq-an-trace" d={PHONE} pathLength={1} />
            <rect className="aq-an-screen" x="18" y="16" width="224" height="438" rx="28" />
            <rect className="aq-an-notch" x="105" y="24" width="50" height="8" rx="4" />
            {/* En-tête : marque et bouton d'appel */}
            <rect className="aq-an-brand" x="32" y="54" width="22" height="22" rx="6" />
            <text className="aq-an-t aq-an-t--b" x="61" y="70">Menuiserie</text>
            <rect className="aq-an-cta" x="166" y="52" width="66" height="26" rx="8" />
            <text className="aq-an-t aq-an-t--cta" x="199" y="69" textAnchor="middle">Appeler</text>
            <path className="aq-an-rule" d="M18 90H242" />
            {/* Prestation */}
            <text className="aq-an-t aq-an-t--m" x="32" y="122">Menuisier · Hauts-de-Seine</text>
            <text className="aq-an-t aq-an-t--h" x="32" y="152">Vos escaliers</text>
            <text className="aq-an-t aq-an-t--h" x="32" y="178">sur mesure</text>
            <text className="aq-an-t aq-an-t--m" x="32" y="197">Conception, fabrication, pose.</text>
            {/* Preuves */}
            <rect className="aq-an-chip" x="30" y="221" width="66" height="24" rx="12" />
            <text className="aq-an-t aq-an-t--s" x="63" y="237" textAnchor="middle">Méthode</text>
            <rect className="aq-an-chip" x="100" y="221" width="92" height="24" rx="12" />
            <text className="aq-an-t aq-an-t--s" x="146" y="237" textAnchor="middle">Réalisations</text>
            <rect className="aq-an-chip" x="196" y="221" width="40" height="24" rx="12" />
            <text className="aq-an-t aq-an-t--s" x="216" y="237" textAnchor="middle">FAQ</text>
            <rect className="aq-an-thumb" x="32" y="252" width="62" height="20" rx="5" />
            <rect className="aq-an-thumb" x="100" y="252" width="62" height="20" rx="5" />
            <rect className="aq-an-thumb" x="168" y="252" width="64" height="20" rx="5" />
            {/* Formulaire court */}
            <text className="aq-an-t aq-an-t--s" x="32" y="312">Votre nom</text>
            <rect className="aq-an-field" x="32" y="318" width="196" height="28" rx="6" />
            <text className="aq-an-t aq-an-t--s" x="32" y="364">Téléphone ou email</text>
            <rect className="aq-an-field" x="32" y="370" width="196" height="28" rx="6" />
            <rect className="aq-an-cta" x="32" y="408" width="196" height="30" rx="8" />
            <text className="aq-an-t aq-an-t--cta" x="130" y="428" textAnchor="middle">Demander un devis</text>
            {/* Repères ①–④ : zone en pointillés, ligne de rappel tracée, pastille numérotée */}
            {ZONES.map((z, i) => (
              <g className={`aq-an-k aq-an-k${i + 1}`} key={i}>
                <rect className="aq-an-zone" x={z.x} y={z.y} width={z.w} height={z.h} rx="10" />
                <path className="aq-an-lead aq-an-trace" d={`M${z.x + z.w} ${z.cy}H277`} pathLength={1} />
                <g className="aq-an-mark">
                  <circle cx="292" cy={z.cy} r="14" />
                  <text x="292" y={z.cy + 5} textAnchor="middle">{i + 1}</text>
                </g>
              </g>
            ))}
          </svg>
        </ScenePlayer>
      </div>
      <ol className="aq-marks">
        {marks.map((m, i) => (
          <li className="aq-mark" key={m.title}>
            <span className="aq-mark-num" aria-hidden="true">{i + 1}</span>
            <div>
              <h3 className="aq-mark-title"><span className="sr-only">Repère {i + 1}&#8239;: </span>{m.title}</h3>
              <p>{m.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
