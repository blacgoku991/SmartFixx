import { publishedRealisations, type Realisation } from "@/lib/realisations";
import { DemoFrame } from "./demo-frame";
/* Réalisations (serveur) : uniquement les entrées published:true de lib/realisations.ts. Sans capture, la
   carte montre une maquette en DOM étiquetée « Démonstration » ; jamais de cadre vide ni d'emplacement
   réservé visible. Rien n'est rendu s'il n'y a aucune entrée publiée. */
const CHIP: Record<string, string> = { Nouvelle: "sx-chip sx-chip--signal", "En cours": "sx-chip sx-chip--accent", "Devis envoyé": "sx-chip sx-chip--violet", Archivée: "sx-chip" };
function RequestsBoard() {
  // Données fictives, étiquetées « Démonstration » (jamais de vrai client). 5 lignes à partir de 480 px, 3 en dessous.
  const rows = [
    ["SF-3A91C2E0", "Démonstration Dupont", "Refonte", "09:42", "Nouvelle"],
    ["SF-7B20D415", "Démonstration Martin", "Création", "hier", "En cours"],
    ["SF-1C84E9A7", "Démonstration Leroy", "Création", "lun.", "Devis envoyé"],
    ["SF-58F3A0B2", "Démonstration Bernard", "Automatisation", "12/10", "En cours"],
    ["SF-0D6E7C93", "Démonstration Petit", "Refonte", "08/10", "Archivée"],
  ];
  return (
    <div className="sx-mini">
      <div className="sx-mini-head"><span>Demandes reçues</span><span className="sx-chip sx-chip--signal">1 nouvelle</span></div>
      <div className="sx-mini-stats"><span><b>1</b>à traiter</span><span><b>2</b>en cours</span><span><b>1</b>devis envoyé</span></div>
      {rows.map(([ref, n, s, t, st]) => (
        <div className={st === "Nouvelle" ? "sx-mini-row is-new" : "sx-mini-row"} key={ref}>
          <span className="sx-mini-ref">{ref}</span><b>{n}</b><span>{s}</span><span>{t}</span><span className={CHIP[st]}>{st}</span>
        </div>
      ))}
    </div>
  );
}
export function Realisations({ items, headingLevel = 3 }: { items?: Realisation[]; headingLevel?: 2 | 3 }) {
  const list = (items ?? publishedRealisations()).filter((r) => r.published);
  if (!list.length) return null;
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="sx-works">
      {list.map((r) => (
        <article className="sx-work" key={r.id}>
          <div>
            <H>{r.title}</H>
            <p>{r.summary}</p>
            <p>{r.role}</p>
            <div className="sx-work-meta">{r.tags.map((t) => <span className="sx-chip" key={t}>{t}</span>)}</div>
            <p className="sx-muted"><small>{r.note}</small></p>
          </div>
          {r.images?.length ? (
            <img src={r.images[0].src} alt={r.images[0].alt} width={r.images[0].width} height={r.images[0].height} loading="lazy" decoding="async" />
          ) : r.mockup === "requests-board" ? (
            <DemoFrame url="smartfixx.fr/admin" description="Maquette fictive du tableau de suivi : cinq demandes de démonstration avec leur référence, leur type, leur date et leur statut.">
              <RequestsBoard />
            </DemoFrame>
          ) : null}
        </article>
      ))}
    </div>
  );
}
