import { ScenePlayer } from "@/components/sx/scene-player";
import type { Item } from "@/lib/content/acquisition";
/* Planche annotée « Anatomie d'un site qui fait appeler » (serveur ; ScenePlayer est le seul client).
   - Un téléphone en SVG STATIQUE (320 × 470) : contour et contenu de la maquette.
   - Les repères sont une couche HTML posée sur le SVG, en pourcentages du viewBox : zone en pointillés ambre,
     ligne de rappel, pastille numérotée ①–④. Rendus dans leur état final par le serveur.
   - Scène unique (ScenePlayer, une fois, puis état final) : le téléphone s'éclaire et un balayage descend
     l'écran, puis chaque zone s'allume avec sa ligne de rappel (scaleX) et sa pastille (scale) ; la liste
     reste immobile (coût mesuré au défilement, voir acquisition.css). Transform et opacity seulement,
     sur des éléments HTML (composités). Mesuré : un tracé stroke-dashoffset sur le SVG provoquait une mise
     en page par image (LayoutCount 40 sur la fenêtre de la scène, motion-cost) ; il est donc abandonné.
   - La maquette est un décor aria-hidden (dans la scène) ; la liste ordonnée porte le contenu. Étiquette
     « Démonstration : maquette fictive ». Aucun texte sous 12 px à partir de 360 px de large : à 360 px le SVG
     est rendu à 294 px (échelle 0,919), d'où des tailles d'au moins 13,1 unités (acquisition.css). */
const PHONE = "M44 6H216A36 36 0 0 1 252 42V428A36 36 0 0 1 216 464H44A36 36 0 0 1 8 428V42A36 36 0 0 1 44 6Z";
const ZONES = [
  { x: 160, y: 47, w: 78, h: 36, cy: 65 },
  { x: 26, y: 102, w: 212, h: 102, cy: 153 },
  { x: 26, y: 212, w: 212, h: 68, cy: 246 },
  { x: 26, y: 290, w: 212, h: 156, cy: 368 },
];
const pc = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;
export function Anatomy({ marks, caption, description }: { marks: Item[]; caption: string; description: string }) {
  return (
    <div className="aq-board">
      <div className="aq-board-stage">
        <ScenePlayer label={caption} description={description} duration={4400} className="aq-an-scene">
          <div className="aq-an-wrap">
          <svg className="aq-an" viewBox="0 0 320 470" width="320" height="470" focusable="false">
            <path className="aq-an-phone" d={PHONE} />
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
            {/* « Projets » plutôt que « Réalisations » : à 13,1 unités, trois pastilles doivent tenir dans 212 unités. */}
            <rect className="aq-an-chip" x="28" y="221" width="78" height="24" rx="12" />
            <text className="aq-an-t aq-an-t--s" x="67" y="237" textAnchor="middle">Méthode</text>
            <rect className="aq-an-chip" x="110" y="221" width="70" height="24" rx="12" />
            <text className="aq-an-t aq-an-t--s" x="145" y="237" textAnchor="middle">Projets</text>
            <rect className="aq-an-chip" x="184" y="221" width="52" height="24" rx="12" />
            <text className="aq-an-t aq-an-t--s" x="210" y="237" textAnchor="middle">FAQ</text>
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
          </svg>
          <span className="aq-an-scan" />
          {ZONES.map((z, i) => (
            <span className={`aq-an-k aq-an-k${i + 1}`} key={i}>
              <span className="aq-an-zone" style={{ left: pc(z.x, 320), top: pc(z.y, 470), width: pc(z.w, 320), height: pc(z.h, 470) }} />
              <span className="aq-an-lead" style={{ left: pc(z.x + z.w, 320), top: pc(z.cy, 470), width: pc(277 - z.x - z.w, 320) }} />
              <span className="aq-an-mark" style={{ left: pc(292, 320), top: pc(z.cy, 470) }}>{i + 1}</span>
            </span>
          ))}
          </div>
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
