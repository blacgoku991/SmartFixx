import { publishedRealisations, type Realisation, type RealisationImage } from "@/lib/realisations";
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
/* Capture de démonstration (lot 10) : AVIF puis WebP 480/768/1200 depuis public/media/realisations/ quand
   « base » est renseignée, l'original en src. Toujours lazy, sous la ligne de flottaison (jamais LCP), dans
   le cadre « Démonstration » : recadrée en haut à gauche quand le cadre passe en 4/3 sous 480 px. */
const SHOT_WIDTHS = [480, 768, 1200];
const SHOT_SIZES = "(min-width: 900px) 640px, 92vw";
function Shot({ image }: { image: RealisationImage }) {
  const set = (ext: string) => SHOT_WIDTHS.map((w) => `/media/realisations/${image.base}-${w}.${ext} ${w}w`).join(", ");
  return (
    <picture style={{ display: "block", height: "100%" }}>
      {image.base ? <source type="image/avif" srcSet={set("avif")} sizes={SHOT_SIZES} /> : null}
      <img src={image.src} srcSet={image.base ? set("webp") : undefined} sizes={image.base ? SHOT_SIZES : undefined} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "left top" }} />
    </picture>
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
            <DemoFrame url="smartfixx.fr" label={r.badge ?? "Démonstration"} description={r.images[0].alt}>
              <Shot image={r.images[0]} />
            </DemoFrame>
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
