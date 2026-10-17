import "./editorial.css";
import CampaignLink from "@/components/campaign-link";
import { type Guide, readingMinutes } from "@/lib/guides";
import { fr, frenchDate, num } from "./reading";
/* Carte de guide (serveur) : une « fenêtre » de façade. Une seule fenêtre allumée au repos (le numéro du
   guide) ; au survol ou au focus, tout l'étage s'allume (opacité, sans animation en mouvement réduit).
   Lien principal étiré sur la carte (titre) ; le lien vers la prestation liée reste un lien distinct,
   au-dessus du lien étiré (ancre descriptive, maillage interne). */
export function GuideCard({ guide, index, headingLevel = 2 }: { guide: Guide; index: number; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 3 ? "h3" : "h2";
  const lit = index % 4;
  return (
    <article className="ed-card">
      <div className="ed-card-facade" aria-hidden="true">
        {[0, 1, 2, 3].map((w) => <span key={w} className={w === lit ? "ed-card-pane is-on" : "ed-card-pane"} />)}
        <span className="ed-card-big sx-figure">{num(index + 1)}</span>
      </div>
      <p className="ed-card-kicker"><span className="sx-chip">{guide.category}</span><span className="ed-card-meta sx-tabular">Lecture {readingMinutes(guide)} min · {frenchDate(guide.dateModified)}</span></p>
      <H className="ed-card-title"><CampaignLink href={`/conseils/${guide.slug}`} className="ed-card-link">{fr(guide.title)}</CampaignLink></H>
      <p className="ed-card-for"><strong>Pour vous si</strong> {fr(guide.forWhom)}</p>
      <p className="ed-card-text">{fr(guide.description)}</p>
      <p className="ed-card-foot">
        <span className="ed-card-more" aria-hidden="true">Lire le guide<span className="ed-arrow" /></span>
        <span className="ed-card-related">Prestation liée{"\u202F"}: <CampaignLink href={guide.related.href}>{guide.related.label}</CampaignLink></span>
      </p>
    </article>
  );
}
