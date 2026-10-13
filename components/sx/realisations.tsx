import { publishedRealisations, type Realisation } from "@/lib/realisations";
import { DemoFrame } from "./demo-frame";
/* Réalisations (serveur) : uniquement les entrées published:true de lib/realisations.ts. Sans capture, la
   carte montre une maquette en DOM étiquetée « Démonstration » ; jamais de cadre vide ni d'emplacement
   réservé visible. Rien n'est rendu s'il n'y a aucune entrée publiée. */
function RequestsBoard() {
  const rows = [["Démonstration Dupont", "Refonte", "Nouvelle"], ["Démonstration Martin", "Création", "En cours"], ["Démonstration Leroy", "Création", "Devis envoyé"]];
  return (
    <div className="sx-mini">
      <div className="sx-mini-head"><span>Demandes reçues</span><span className="sx-chip sx-chip--signal">1 nouvelle</span></div>
      {rows.map(([n, s, st]) => <div className="sx-mini-row" key={n}><b>{n}</b><span>{s}</span><span className={st === "Nouvelle" ? "sx-chip sx-chip--signal" : "sx-chip"}>{st}</span></div>)}
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
            <DemoFrame url="smartfixx.fr/admin" description="Maquette fictive du tableau de suivi : trois demandes de démonstration et leur statut.">
              <RequestsBoard />
            </DemoFrame>
          ) : null}
        </article>
      ))}
    </div>
  );
}
