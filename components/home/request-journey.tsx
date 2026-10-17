import { Container, Eyebrow, Section } from "@/components/sx/section";
import { KineticHeading } from "@/components/sx/kinetic-heading";
import { DemoFrame } from "@/components/sx/demo-frame";
import { Glow } from "@/components/sx/ambient";
import { JOURNEY } from "./content";
import { JourneyDriver } from "./journey-driver";
/* Récit « Le parcours d'une demande » (serveur) : le moment signature de l'accueil et le storyboard de la VSL.
   4 chapitres (h3) dans le DOM, chacun suivi de sa vignette (DemoFrame, contenu fictif lisible, étiqueté
   « Démonstration »).
   - Sous 1024 px et en mode réduit : vignette statique sous chaque chapitre.
   - À partir de 1024 px : les vignettes occupent toutes la même cellule collante de la colonne droite
     (grid-row 1 / span 4, position: sticky) ; la vignette visible suit le chapitre au milieu de l'écran,
     par des timelines de vue nommées (timeline-scope sur le récit, sous @supports), sinon par data-step
     (JourneyDriver, IntersectionObserver). Opacité et transform seulement. */
const STEP_DESCRIPTIONS = [
  "Démonstration : une page de résultats de recherche fictive où le site d’un artisan imaginaire apparaît parmi d’autres résultats.",
  "Démonstration : la version téléphone du site fictif, avec ses prestations et un bouton d’appel.",
  "Démonstration : le formulaire court rempli avec des données fictives, puis le message « Demande enregistrée » et sa référence.",
  "Démonstration : la fiche de la demande dans le tableau de suivi, avec des données fictives.",
];
function SearchVignette() {
  return (
    <div className="hm-v hm-v-search">
      <span className="hm-v-query">plombier salle de bain asnières</span>
      <span className="hm-v-result"><small>annuaire-artisans.example</small><b>Artisans du bâtiment près de chez vous</b></span>
      <span className="hm-v-result is-yours"><small>votre-entreprise.fr<em>Votre site</em></small><b>Plombier à Asnières{"\u202F"}: salle de bain, dépannage</b>Prestations, zone d’intervention, téléphone direct.</span>
      <span className="hm-v-result"><small>forum-maison.example</small><b>Rénover sa salle de bain{"\u202F"}: par où commencer{"\u202F"}?</b></span>
    </div>
  );
}
function OfferVignette() {
  return (
    <div className="hm-v hm-v-offer">
      <span className="hm-mp-brand"><i />Votre Entreprise</span>
      <b className="hm-v-title">Plombier à Asnières‑sur‑Seine</b>
      <span className="hm-v-text">Dépannage, salle de bain et chauffe-eau, pour les particuliers et les commerces.</span>
      <span className="hm-v-call">Appeler</span>
      <span className="hm-v-list"><span><b>Dépannage</b>Fuites, robinets, WC</span><span><b>Salle de bain</b>Rénovation complète</span><span><b>Chauffe-eau</b>Pose et entretien</span></span>
    </div>
  );
}
function FormVignette() {
  return (
    <div className="hm-v hm-v-form">
      <b className="hm-v-title">Demande de devis</b>
      <span className="hm-mp-field"><small>Projet</small>Salle de bain</span>
      <span className="hm-mp-field"><small>Nom</small>Démonstration Dupont</span>
      <span className="hm-mp-field"><small>Email ou téléphone</small>dupont@example.test</span>
      <span className="hm-mp-send">Envoyer ma demande</span>
      <span className="hm-v-ok"><b>Demande enregistrée</b><span className="hm-v-ref">SF-3A91C2E0</span></span>
    </div>
  );
}
function BoardVignette() {
  return (
    <div className="hm-v hm-v-board">
      <span className="hm-v-board-head"><b>Nouvelle demande</b><span className="sx-chip sx-chip--signal">Nouvelle</span></span>
      <span className="hm-v-ref hm-v-ref--big">SF-3A91C2E0</span>
      <span className="hm-v-rows">
        <span><small>Projet</small>Salle de bain</span>
        <span><small>Nom</small>Démonstration Dupont</span>
        <span><small>Contact</small>dupont@example.test</span>
        <span><small>Reçue</small>à l’instant</span>
      </span>
      <span className="hm-v-actions"><span className="hm-v-btn is-main">Rappeler</span><span className="hm-v-btn">Passer en cours</span></span>
      <span className="hm-v-prev"><span>SF-7B20D415 · Création</span><span className="sx-chip sx-chip--accent">En cours</span></span>
    </div>
  );
}
const VIGNETTES = [
  { kind: "browser" as const, url: "recherche — démonstration", ratio: "6/5", node: <SearchVignette /> },
  { kind: "phone" as const, url: "", ratio: "9/15", node: <OfferVignette /> },
  { kind: "phone" as const, url: "", ratio: "9/15", node: <FormVignette /> },
  { kind: "browser" as const, url: "votre-entreprise.fr/suivi", ratio: "6/5", node: <BoardVignette /> },
];
/* Sans JavaScript, MotionGate ne tranche jamais et JourneyDriver ne pose pas data-step : à partir de
   1 024 px, les vignettes 2 à 4 de la cellule collante restaient invisibles. Ce style, lu seulement quand le
   script est désactivé (<noscript>), remet chaque vignette à côté de son chapitre, sans superposition ni
   cellule collante. Aucun effet quand JavaScript est actif (le contenu de <noscript> n'est alors que du texte). */
const NOSCRIPT_CSS =
  "@media (min-width:1024px){.hm-jr .hm-jr-pair{display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:center;padding-block:var(--sx-space-6)}" +
  ".hm-jr .hm-jr-ch,.hm-jr .hm-jr-vg{grid-row:auto}.hm-jr .hm-jr-ch{grid-column:1;min-height:0}" +
  ".hm-jr .hm-jr-vg{grid-column:2;position:static;height:auto;opacity:1;pointer-events:auto}}";
export function RequestJourney() {
  return (
    <Section tone="night" id="parcours" labelledBy="parcours-titre" className="hm-journey" ambient={<><Glow size={680} top="8%" left="-18%" /><Glow size={520} bottom="-10%" right="-12%" alt duration={28} /></>}>
      <Container>
        <div className="sx-section-head hm-head">
          <Eyebrow dot>Démonstration, données fictives</Eyebrow>
          <KineticHeading id="parcours-titre" className="hm-chapter">Le parcours d’une demande</KineticHeading>
          <p>Du premier clic jusqu’à votre tableau de suivi : ce que je construis pour qu’un visiteur devienne une demande, et que cette demande ne se perde pas.</p>
        </div>
        <div className="hm-jr" id="hm-jr">
          {JOURNEY.map((c, i) => (
            <div key={c.title} className="hm-jr-pair">
              <div className={`hm-jr-ch hm-jr-ch--${i + 1}`} data-hm-step={i + 1}>
                <span className="hm-jr-num" aria-hidden="true"><i />{String(i + 1).padStart(2, "0")}</span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
              <div className={`hm-jr-vg hm-jr-vg--${i + 1}`}>
                <DemoFrame kind={VIGNETTES[i].kind} url={VIGNETTES[i].url || undefined} ratio={VIGNETTES[i].ratio} description={STEP_DESCRIPTIONS[i]} className={`hm-jr-frame hm-jr-frame--${VIGNETTES[i].kind}`}>
                  {VIGNETTES[i].node}
                </DemoFrame>
              </div>
            </div>
          ))}
        </div>
        <noscript dangerouslySetInnerHTML={{ __html: `<style>${NOSCRIPT_CSS}</style>` }} />
        <JourneyDriver target="hm-jr" />
      </Container>
    </Section>
  );
}
