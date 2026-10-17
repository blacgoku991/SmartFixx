import { Layer, PlateFrame, T } from "./plate";
/* Planche « tableau de bord et rôles » (développement sur mesure), données fictives.
   Récit (6,4 s, une fois) : le tableau de bord s'ouvre, ses compteurs puis ses dossiers arrivent ; la barre
   « Accès vérifiés côté serveur » se pose ; trois rôles s'y raccordent (le trait grandit depuis la carte) ;
   le dossier du client s'allume. État final = tout visible. */
const ROWS = [
  { y: 116, name: "Dossier 1042", status: "À faire", cls: "sv-tx--signal" },
  { y: 142, name: "Dossier 1043", status: "En cours", cls: "sv-tx--accent" },
  { y: 168, name: "Dossier 1044", status: "Terminé", cls: "sv-tx--ok" },
];
const ROLES = [
  { x: 16, name: "Gérant", scope: "voit tout" },
  { x: 128, name: "Technicien", scope: "ses dossiers" },
  { x: 240, name: "Client", scope: "son dossier" },
];
const TILES: [string, number][] = [["À traiter", 72], ["En cours", 164], ["Terminés", 256]];
export function DevPlate() {
  return (
    <PlateFrame kind="dev" heading="Outil métier">
      <Layer className="sv-dev-win" svg={<>
        <rect className="sv-p-card" x="16" y="46" width="328" height="150" rx="12" />
        <path className="sv-p-bar" d="M28 46H332A12 12 0 0 1 344 58V70H16V58A12 12 0 0 1 28 46Z" />
        <path className="sv-p-side" d="M16.5 70H60V195.5H28.5A12 12 0 0 1 16.5 183.5Z" />
        {[82, 112, 142, 172].map((y, i) => <rect key={y} className={i === 0 ? "sv-p-icon sv-p-icon--on" : "sv-p-icon"} x="28" y={y} width="20" height="18" rx="5" />)}
      </>}>
        <T x={72} y={63} c="sv-tx--b">Interventions</T>
      </Layer>
      <Layer className="sv-dev-tiles" svg={<>{TILES.map(([t, x]) => <rect key={t} className="sv-p-tile" x={x} y="78" width="80" height="30" rx="8" />)}</>}>
        {TILES.map(([t, x]) => <T key={t} x={x + 40} y={98} a="m" c="sv-tx--sm">{t}</T>)}
      </Layer>
      {ROWS.map((r, i) => (
        <Layer className={`sv-dev-row sv-dev-row${i + 1}`} key={r.name} svg={<rect className="sv-p-row" x="72" y={r.y} width="260" height="22" rx="6" />}>
          <T x={82} y={r.y + 15.5}>{r.name}</T>
          <T x={322} y={r.y + 15.5} a="e" c={`sv-tx--b ${r.cls}`}>{r.status}</T>
        </Layer>
      ))}
      {ROLES.map((r, i) => (
        <Layer className={`sv-dev-link sv-dev-link${i + 1}`} key={`l${r.name}`} svg={<path className="sv-p-link" d={`M${r.x + 52} 260V${i === 2 ? 190 : 196}`} />} />
      ))}
      <Layer className="sv-dev-gate" svg={<>
        <rect className="sv-p-gate" x="16" y="214" width="328" height="24" rx="12" />
        <path className="sv-p-lock" d="M40 224V221A5 5 0 0 1 50 221V224M37 224H53V233H37Z" />
      </>}>
        <T x={196} y={231} a="m" c="sv-tx--b">Accès vérifiés côté serveur</T>
      </Layer>
      {ROLES.map((r, i) => (
        <Layer className={`sv-dev-role sv-dev-role${i + 1}`} key={r.name} svg={<rect className={i === 2 ? "sv-p-card sv-p-card--signal" : "sv-p-card"} x={r.x} y="260" width="104" height="48" rx="10" />}>
          <T x={r.x + 52} y={280} a="m" c="sv-tx--b">{r.name}</T>
          <T x={r.x + 52} y={299} a="m" c="sv-tx--muted">{r.scope}</T>
        </Layer>
      ))}
      <Layer className="sv-dev-mine" svg={<rect className="sv-p-halo" x="70" y="166" width="264" height="26" rx="8" />} />
    </PlateFrame>
  );
}
