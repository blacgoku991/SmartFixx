import { ArrowRight } from "lucide-react";
import CampaignLink from "@/components/campaign-link";
import { PageHero } from "@/components/sx/page-hero";
import { ButtonLink, PhoneLink } from "@/components/sx/actions";
import { Glow, Skyline } from "@/components/sx/ambient";
import { Section, Container, SectionHead } from "@/components/sx/section";
import { Media, type MediaBase } from "@/components/sx/media";
import { CtaBand } from "@/components/sx/cta-band";
import { Place } from "@/components/sx/place";
import { Facade, LinkCard } from "./shared";
/* /services (lot 8) — destination par défaut des emails déjà envoyés : URL, statut 200 et lecture de
   utm_campaign inchangés. Chaque lien de prestation passe par CampaignLink (utm_campaign propagé dans le
   HTML serveur : /creation-site-internet?utm_campaign=…).
   Moment signature : « la ville des prestations ». Chaque carte porte une façade de sept fenêtres (une par
   prestation) ; sa propre fenêtre reste allumée, les autres s'allument au survol ou au focus (au défilement sur écran
   tactile ou sous 1024 px). Création et
   refonte en grand, quatre prestations en moyen, la prospection emailing en dernier. Objets chrome en Media
   (lazy, jamais dans le hero) ; trois maquettes DOM pour les prestations sans objet. */
type Card = { id: string; href: string; size: "lg" | "md"; kicker: string; title: string; text: string; points: string[]; link: string; media?: { base: MediaBase; src: string }; vignette?: "refonte" | "dev" | "seo" };
const CARDS: Card[] = [
  { id: "creation", href: "/creation-site-internet", size: "lg", kicker: "Créer mon site", title: "Création de site internet", text: "Un site clair qui présente votre activité, se lit bien sur un téléphone et facilite les prises de contact. Je le conçois et je le construis.", points: ["Design sur mesure", "Pensé d’abord pour le mobile", "Formulaire relié à un tableau de suivi"], link: "Découvrir la création de site internet", media: { base: "studio-web", src: "/studio-web.webp" } },
  { id: "refonte", href: "/refonte-site-internet", size: "lg", kicker: "Moderniser mon site", title: "Refonte de site internet", text: "Votre activité a changé, votre site doit suivre. Je modernise le design, les textes et les parcours en gardant ce qui fonctionne déjà.", points: ["Analyse de l’existant", "Pages utiles conservées", "Redirections préparées"], link: "Découvrir la refonte de site internet", vignette: "refonte" },
  { id: "developpement", href: "/developpement-sur-mesure", size: "md", kicker: "Créer un outil", title: "Développement sur mesure", text: "Espace client, tableau de bord ou outil interne : je développe les fonctions dont votre activité a réellement besoin.", points: ["Outil métier", "Accès et rôles", "Connexions entre logiciels"], link: "Voir le développement sur mesure", vignette: "dev" },
  { id: "automatisation", href: "/automatisation-informatique", size: "md", kicker: "Gagner du temps", title: "Automatisation informatique", text: "Je relie vos formulaires, vos logiciels et vos tâches récurrentes, avec des contrôles et un suivi des erreurs.", points: ["Moins de ressaisie", "Scénarios contrôlés", "Suivi des exécutions"], link: "Voir l’automatisation informatique", media: { base: "studio-automation", src: "/studio-automation.webp" } },
  { id: "cybersecurite", href: "/cybersecurite", size: "md", kicker: "Protéger mes outils", title: "Sécurité web", text: "Un audit au périmètre défini avec vous, des priorités claires et un accompagnement pour renforcer vos accès et vos applications.", points: ["Périmètre autorisé", "Priorités claires", "Accompagnement"], link: "Voir la cybersécurité", media: { base: "studio-security", src: "/studio-security.webp" } },
  { id: "seo", href: "/referencement-seo", size: "md", kicker: "Être trouvé", title: "Référencement SEO", text: "Des pages structurées, des contenus utiles et un référencement local cohérent pour être trouvé sur les bonnes recherches, sans promesse de classement.", points: ["Socle technique", "Contenus utiles", "Référencement local"], link: "Voir le référencement SEO", vignette: "seo" },
  { id: "emailing", href: "/prospection-emailing", size: "md", kicker: "Trouver des prospects", title: "Prospection emailing", text: "Des campagnes avec votre propre fichier de contacts : messages validés avec vous avant l’envoi, cadence maîtrisée, désinscription respectée.", points: ["Votre fichier de contacts", "Aucun envoi sans validation", "Désinscription respectée"], link: "Voir la prospection emailing", media: { base: "mail-sculpture", src: "/mail-sculpture.webp" } },
];

/* Maquettes DOM des prestations sans objet chrome (décor aria-hidden, aucun texte lisible requis). */
function Vignette({ kind }: { kind: "refonte" | "dev" | "seo" }) {
  if (kind === "refonte") return (
    <span className="sc-vg sc-vg--refonte" aria-hidden="true">
      <span className="sc-vg-page sc-vg-page--old"><i /><i /><i /><i /></span>
      <span className="sc-vg-page sc-vg-page--new"><i /><i /><i /><b /></span>
    </span>
  );
  if (kind === "dev") return (
    <span className="sc-vg sc-vg--dev" aria-hidden="true">
      <span className="sc-vg-bars"><i /><i /><i /><i /><i /></span>
      <span className="sc-vg-rows"><i /><i /><i /></span>
    </span>
  );
  return (
    <span className="sc-vg sc-vg--seo" aria-hidden="true">
      <span className="sc-vg-search"><i /></span>
      <span className="sc-vg-result sc-vg-result--you"><i /><i /></span>
      <span className="sc-vg-result"><i /><i /></span>
    </span>
  );
}

/* Plan de l'immeuble (à partir de 1024 px) : le tableau d'un hall d'entrée, une ligne par prestation,
   chacune avec sa fenêtre ; il mène à la carte correspondante plus bas. Masqué sous 1024 px (la liste
   des cartes suit immédiatement le hero). Texte court : le H1 reste l'élément le plus grand (LCP). */
function Board() {
  return (
    <nav className="sc-board" aria-label="Plan des prestations">
      <p className="sc-board-head"><span>Plan des prestations</span><span className="sc-board-sub">7 fenêtres</span></p>
      <ol className="sc-board-list">
        {CARDS.map((c, i) => (
          <li key={c.id} className="sc-lit"><a href={`#prest-${c.id}`} className="sc-board-link"><span className="sc-board-num sx-tabular">{String(i + 1).padStart(2, "0")}</span><span className="sc-board-name">{c.title}</span><Facade count={1} signal={i < 2 ? 0 : undefined} /></a></li>
        ))}
      </ol>
    </nav>
  );
}

export function ServicesPage() {
  return (
    <>
      <PageHero
        className="sc-hero"
        breadcrumbs={[{ name: "Prestations", path: "/services" }]}
        title={<>Prestations web :</>}
        tagline="création, refonte, automatisation, sécurité et SEO"
        lead={<>Je conçois des sites en Île-de-France, depuis <Place>Asnières-sur-Seine</Place>.</>}
        actions={<><ButtonLink variant="cta" href="/contact" size="lg">Parler de mon projet</ButtonLink><PhoneLink compact="sm" /></>}
        backdrop={<><Glow tone="blue" size={680} top="-240px" right="-200px" duration={26} /><Skyline seed={7} signal depth={false} /></>}
        aside={<Board />}
      />
      <Section id="prestations" labelledBy="sc-prest-titre" className="sc-prest-sec">
        <Container>
          <SectionHead id="sc-prest-titre" eyebrow="Sept prestations, un seul interlocuteur" title="Choisissez la fenêtre qui vous concerne" text="Je construis les sites, et les outils qui vont avec. Chaque prestation a sa page détaillée : choisissez par où commencer, ou décrivez-moi votre situation : je vous oriente vers ce qui sert vraiment votre activité." />
          <ul className="sc-prest" role="list">
            {CARDS.map((c, i) => (
              <li key={c.id} id={`prest-${c.id}`} className={`sc-prest-card sc-prest-card--${c.size} sc-prest-card--${c.id} sc-lit`}>
                <div className="sc-prest-top">
                  <span className="sc-prest-num sx-figure" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <Facade count={7} signal={i} />
                </div>
                <div className="sc-prest-copy">
                  <p className="sc-kicker">{c.kicker}</p>
                  <h3 className="sc-prest-title"><CampaignLink href={c.href} className="sc-stretch" data-analytics="service" data-service={c.id}>{c.title}</CampaignLink></h3>
                  <p className="sc-prest-text">{c.text}</p>
                  <ul className="sc-points">{c.points.map((p) => <li key={p}>{p}</li>)}</ul>
                  <span className="sc-prest-more" aria-hidden="true">{c.link}<ArrowRight className="sc-arrow" /></span>
                </div>
                <div className={c.media ? "sc-prest-art" : "sc-prest-art sc-prest-art--vg"}>
                  {c.media ? <Media src={c.media.src} base={c.media.base} alt="" width={1024} height={1024} maxWidth={c.size === "lg" ? 260 : 200} sizes={c.size === "lg" ? "(max-width: 719.98px) 112px, 260px" : "(max-width: 719.98px) 112px, 200px"} className="sc-prest-media" sheen={c.size === "lg"} /> : <Vignette kind={c.vignette!} />}
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <Section tone="surface" labelledBy="sc-unsure-titre" className="sc-unsure-sec">
        <Container className="sc-unsure">
          <div className="sc-unsure-copy">
            <h2 id="sc-unsure-titre" className="sx-h2">Pas sûr de ce qu’il vous faut ?</h2>
            <p className="sx-lead">Un site qui ne ramène pas de demandes, des tâches qui se répètent, un outil qui vous ralentit : décrivez la situation, je vous dis par quoi commencer. C’est moi qui lis votre message.</p>
            <div className="sc-unsure-actions">
              <ButtonLink variant="primary" href="/contact?service=conseil">Demander un conseil</ButtonLink>
              <CampaignLink href="/diagnostic" className="sc-textlink">Faire le point sur votre site et vos outils</CampaignLink>
            </div>
          </div>
          <div className="sc-unsure-links">
            <LinkCard href="/creation-site-internet-asnieres-sur-seine" kicker="Près de chez vous" title="Création de site internet à Asnières-sur-Seine" text={<>Je travaille depuis <Place>Asnières-sur-Seine</Place> : rendez-vous possible chez vous, en visio ou au téléphone.</>} signal={2} />
            <LinkCard href="/agence-web-ile-de-france" kicker="Hauts-de-Seine et Paris" title="Création et refonte de site en Île-de-France" text="Les communes où je me déplace et la façon dont je travaille à distance." signal={4} />
          </div>
        </Container>
      </Section>
      <CtaBand title="Un projet de site, d’outil ou de campagne ?" text="Décrivez-le en quelques lignes : votre demande est enregistrée et je reviens vers vous moi-même." />
    </>
  );
}
