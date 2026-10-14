import { Layer, MarkNum, MarkShape, PlateFrame, T } from "./plate";
/* Planche « arborescence et requête » (référencement), site fictif. Aucune position n'est affichée : le
   résultat est un résultat TYPE (« votre-entreprise.fr »).
   Récit (6,4 s, une fois) : la requête s'écrit (un cache de la couleur du champ glisse et découvre le
   texte : translate composité, dans une fenêtre qui le rogne) ; l'arborescence se déplie ; la page qui
   répond à l'intention s'allume, reliée à la requête ; le résultat type apparaît. */
const PAGES = [
  { y: 154, t: "Création de site" },
  { y: 196, t: "Refonte de site" },
  { y: 238, t: "Asnières (92)" },
];
export function SeoPlate() {
  return (
    <PlateFrame kind="seo" heading="Planche · Référencement">
      <Layer className="sv-so-q" svg={<>
        <rect className="sv-p-query" x="16" y="48" width="328" height="40" rx="20" />
        <circle className="sv-p-lens" cx="36" cy="66" r="6" />
        <path className="sv-p-lens" d="M40.5 70.5L45 75" />
      </>}>
        <T x={56} y={73}>création site internet asnières</T>
      </Layer>
      <span className="sv-so-type" aria-hidden="true"><span className="sv-so-cover" /></span>
      <Layer className="sv-so-root" svg={<rect className="sv-p-card" x="16" y="108" width="96" height="32" rx="8" />}>
        <T x={64} y={129} a="m" c="sv-tx--b">Accueil</T>
      </Layer>
      <Layer className="sv-so-trunk" svg={<path className="sv-p-tree" d="M30 140V254M30 170H44M30 212H44M30 254H44" />} />
      {PAGES.map((p, i) => (
        <Layer className={`sv-so-n sv-so-n${i + 1}`} key={p.t} svg={<rect className="sv-p-card" x="44" y={p.y} width="128" height="32" rx="8" />}>
          <T x={53} y={p.y + 21}>{p.t}</T>
        </Layer>
      ))}
      <Layer className="sv-so-hit" svg={<>
        <path className="sv-p-intent" d="M146 88V150" />
        <rect className="sv-p-halo" x="42" y="152" width="132" height="36" rx="10" />
        <MarkShape x={146} y={114} />
      </>}>
        <MarkNum x={146} y={114} n={1} />
      </Layer>
      <Layer className="sv-so-link" svg={<path className="sv-p-flow sv-p-flow--signal" d="M174 170H184" />} />
      <Layer className="sv-so-card" svg={<>
        <rect className="sv-p-card sv-p-card--result" x="184" y="108" width="160" height="178" rx="12" />
        <rect className="sv-p-line" x="194" y="188" width="138" height="7" rx="3.5" />
        <rect className="sv-p-line" x="194" y="201" width="122" height="7" rx="3.5" />
        <rect className="sv-p-line" x="194" y="214" width="94" height="7" rx="3.5" />
        <path className="sv-p-rule" d="M194 234H334" />
      </>}>
        <T x={194} y={131} c="sv-tx--muted">votre-entreprise.fr</T>
        <T x={194} y={156} c="sv-tx--b sv-tx--accent">Création de site</T>
        <T x={194} y={175} c="sv-tx--b sv-tx--accent">à Asnières</T>
        <T x={194} y={255} c="sv-tx--muted">Résultat type,</T>
        <T x={194} y={273} c="sv-tx--muted">sans position</T>
      </Layer>
      <Layer className="sv-so-note">
        <T x={16} y={301} c="sv-tx--muted">Une page par intention</T>
      </Layer>
    </PlateFrame>
  );
}
