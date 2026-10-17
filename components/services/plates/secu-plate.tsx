import { Layer, MarkNum, MarkShape, PlateFrame, T } from "./plate";
/* Planche « périmètre autorisé et points exposés » (audit de sécurité), cas fictif.
   Récit (6,4 s, une fois) : le périmètre écrit se pose, ses éléments apparaissent (ce qui est hors
   périmètre reste à part, en pointillés) ; un balayage traverse le périmètre ; trois points exposés
   s'allument ; le plan de correction les classe (urgent, important, plus tard). Le balayage est un calque
   plein cadre déplacé en pourcentage, masqué à l'état final. */
const NODES = [
  { x: 26, y: 88, t: "Site public" },
  { x: 138, y: 88, t: "Formulaire" },
  { x: 26, y: 150, t: "Espace admin" },
  { x: 138, y: 150, t: "Composants" },
];
const MARKS = [
  { x: 242, y: 90, n: 1 },
  { x: 130, y: 152, n: 2 },
  { x: 242, y: 152, n: 3 },
];
const PLAN = [
  { x: 16, t: "Urgent", cls: "sv-p-prio--danger" },
  { x: 128, t: "Important", cls: "sv-p-prio--warning" },
  { x: 240, t: "Plus tard", cls: "sv-p-prio--neutral" },
];
export function SecuPlate() {
  return (
    <PlateFrame kind="secu" heading="Revue de sécurité">
      <Layer className="sv-se-zone" svg={<>
        <rect className="sv-p-zone" x="16" y="50" width="234" height="194" rx="14" />
        <path className="sv-p-check" d="M31 222L36 227L45 216" />
      </>}>
        <T x={30} y={74} c="sv-tx--b">Périmètre autorisé</T>
        <T x={52} y={227} c="sv-tx--muted">Autorisation écrite</T>
      </Layer>
      <Layer className="sv-se-out" svg={<>
        <rect className="sv-p-ghost" x="258" y="104" width="88" height="36" rx="8" />
        <rect className="sv-p-ghost" x="258" y="152" width="88" height="36" rx="8" />
      </>}>
        <T x={302} y={70} a="m" c="sv-tx--muted">Hors</T>
        <T x={302} y={88} a="m" c="sv-tx--muted">périmètre</T>
        <T x={302} y={127} a="m" c="sv-tx--muted sv-tx--sm">Messagerie</T>
        <T x={302} y={175} a="m" c="sv-tx--muted">Postes</T>
      </Layer>
      {NODES.map((n, i) => (
        <Layer className={`sv-se-n sv-se-n${i + 1}`} key={n.t} svg={<rect className="sv-p-card" x={n.x} y={n.y} width="106" height="44" rx="9" />}>
          <T x={n.x + 53} y={n.y + 27} a="m" c="sv-tx--sm">{n.t}</T>
        </Layer>
      ))}
      <Layer className="sv-se-scan" svg={<rect className="sv-p-scan" x="18" y="52" width="16" height="190" />} />
      {MARKS.map((m) => (
        <Layer className={`sv-se-m sv-se-m${m.n}`} key={m.n} svg={<MarkShape x={m.x} y={m.y} />}>
          <MarkNum {...m} />
        </Layer>
      ))}
      {PLAN.map((p, i) => (
        <Layer className={`sv-se-p sv-se-p${i + 1}`} key={p.t} svg={<>
          <rect className={`sv-p-prio ${p.cls}`} x={p.x} y="262" width="104" height="40" rx="10" />
          <MarkShape x={p.x + 16} y={282} r={10} />
        </>}>
          <MarkNum x={p.x + 16} y={282} n={i + 1} />
          <T x={p.x + 31} y={287} c="sv-tx--sm">{p.t}</T>
        </Layer>
      ))}
    </PlateFrame>
  );
}
