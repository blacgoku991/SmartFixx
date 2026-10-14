import "./local.css";
import { ButtonLink, Container, CtaBand, Glow, PageHero, PhoneLink, Section, SectionHead, SignalCard } from "@/components/sx";
import CampaignLink from "@/components/campaign-link";
import { Commune, LocalLinks, LocalServiceJsonLd } from "@/components/location-page";
/* /agence-web-france — projets à distance (lot 4). Page courte, sans reprise des pages locales : comment un
   projet avance quand on ne se voit pas, ce qui se fait bien à distance, ce qu'il faut prévoir.
   Moment signature : « le fil du projet », quatre étapes reliées par un fil dont les fenêtres s'allument au
   passage (opacité liée au défilement ; allumées d'emblée sans mouvement). Ciel nocturne étoilé de fenêtres
   lointaines dans le hero (décor). Aucun délai. */
const PATH = "/agence-web-france";
const STEPS = [
  { title: "Un premier appel en visio", text: "On parle de votre activité, de vos clients et de ce que le site doit leur permettre de faire. Vous voyez mon écran, je vous montre des exemples, et je repars avec la liste de ce qui compte pour vous." },
  { title: "Une proposition écrite", text: "Je vous envoie le plan des pages, ce qui est inclus, ce qui reste en option et le devis détaillé. Tout est écrit : chacun sait ce qui est prévu avant de commencer." },
  { title: "Des validations à chaque étape", text: "Maquette, textes, puis site en préproduction : vous validez depuis votre navigateur, et vos remarques sont regroupées dans un document partagé plutôt que dispersées dans vos emails." },
  { title: "La mise en ligne et la prise en main", text: "Je publie le site, je vérifie les formulaires et les redirections, puis je vous montre en visio comment suivre vos demandes et ce que vous pouvez modifier vous-même." },
];
const REMOTE = [
  { href: "/creation-site-internet", label: "Création de site internet", text: "Un site vitrine pensé pour être compris et contacté, construit étape par étape avec vous." },
  { href: "/refonte-site-internet", label: "Refonte de site", text: "Un état des lieux de l’existant, puis un site modernisé, sans perdre les pages qui comptent." },
  { href: "/automatisation-informatique", label: "Automatisation", text: "Relier un formulaire, un tableur et une notification pour ne plus recopier les demandes." },
  { href: "/referencement-seo", label: "Référencement SEO", text: "Des titres, des pages et des informations cohérentes pour être trouvé sur vos vraies recherches." },
];
/* Fenêtres lointaines du ciel (décor du hero) : positions fixes en %. */
const STARS = [[56, 20], [60, 64], [64, 36], [69, 76], [72, 14], [77, 52], [81, 28], [84, 70], [88, 12], [91, 44], [94, 24], [96, 62]] as const;
export function FrancePage() {
  return (
    <>
      <LocalServiceJsonLd
        name="Création de site internet à distance"
        description="Création, refonte, automatisation et référencement menés à distance pour les entreprises en France : visio, documents partagés et validations par étapes, par Mohamed (SmartFixx)."
        path={PATH}
        areaServed={[{ "@type": "Country", name: "France" }]}
      />
      <PageHero
        className="lc-hero lc-hero--france"
        tone="night"
        breadcrumbs={[{ name: "À distance en France", path: PATH }]}
        title="Création de site internet à distance, partout en France"
        lead="Vous n’êtes pas en Île-de-France ? Le projet avance en visio, avec des documents partagés et une validation à chaque étape."
        actions={<><ButtonLink href="/contact?service=creation" size="lg">Présenter mon projet</ButtonLink><PhoneLink compact="sm" /></>}
        proofs={["Un seul interlocuteur, joignable en direct", "Chaque étape validée par écrit", "Livrables définis au devis"]}
        backdrop={
          <>
            <Glow tone="blue" size={760} top="-340px" right="-240px" />
            <Glow tone="blue" alt size={520} bottom="-260px" left="-200px" duration={32} />
            <span className="lc-wide">
              <span className="lc-relay">
                <span className="lc-relay-node"><i />Asnières-sur-Seine</span>
                <span className="lc-relay-line"><i className="lc-relay-dot" /></span>
                <span className="lc-relay-node lc-relay-node--far"><i />Chez vous, en France</span>
              </span>
              <SignalCard right="7%" top="15%" title="Étape validée" reference="Maquette v2" meta="Visio · démonstration" />
            </span>
            <div className="lc-stars">{STARS.map(([x, y], i) => <i key={i} className={`lc-star lc-s${(i % 4) + 1}`} style={{ left: `${x}%`, top: `${y}%` }} />)}</div>
          </>
        }
      />

      <Section id="deroulement" labelledBy="deroulement-titre" className="lc-thread-section">
        <Container>
          <div className="lc-split">
            <div className="lc-split-head"><SectionHead
              eyebrow="Comment se passe un projet à distance"
              id="deroulement-titre"
              title="Le fil du projet, de la visio à la mise en ligne"
              text="Ne pas se voir n’empêche pas d’avancer proprement. Ce qui compte : peu d’interlocuteurs, des décisions écrites et une étape validée avant la suivante."
            /></div>
            <ol className="lc-thread">
              {STEPS.map((s, i) => (
                <li key={s.title} className="lc-step">
                  <span className="lc-win lc-step-win" aria-hidden="true"><i /></span>
                  <span className="lc-step-num sx-tabular">Étape {i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section tone="surface" id="prestations" labelledBy="prestations-titre" className="lc-remote-section">
        <Container>
          <SectionHead eyebrow="Ce qui se fait bien à distance" id="prestations-titre" title="Prestations que je mène sans rendez-vous sur place" />
          <ul className="lc-remote sx-reveal">
            {REMOTE.map((r) => (
              <li key={r.href}>
                <CampaignLink href={r.href} className="lc-remote-card">
                  <span className="lc-remote-label">{r.label}</span>
                  <span className="lc-remote-text">{r.text}</span>
                </CampaignLink>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section id="a-prevoir" labelledBy="a-prevoir-titre" className="lc-prep-section">
        <Container size="narrow">
          <SectionHead eyebrow="De votre côté" id="a-prevoir-titre" title="Ce qu’il faut prévoir pour bien démarrer" />
          <ul className="lc-prep">
            <li><b>Une personne qui décide.</b> Une seule voix pour valider chaque étape évite les allers-retours contradictoires.</li>
            <li><b>Vos contenus, ou le temps d’en parler.</b> Textes, photos, logo : je peux les structurer avec vous ; la rédaction complète est une option chiffrée au devis.</li>
            <li><b>Vos accès.</b> Si vous avez déjà un nom de domaine ou un hébergement, gardez les accès à portée de main : ils restent à votre nom.</li>
          </ul>
          <p className="lc-prep-note">Vous êtes finalement proche de Paris ? Je me déplace volontiers : voyez <CampaignLink href="/agence-web-ile-de-france">les communes où j’interviens en Île-de-France</CampaignLink>, ou <CampaignLink href="/creation-site-internet-asnieres-sur-seine">la page consacrée à Asnières-sur-Seine</CampaignLink>, d’où je travaille.</p>
        </Container>
      </Section>

      <LocalLinks
        id="ailleurs"
        tone="surface"
        eyebrow="En Île-de-France"
        title="Si l’on peut se rencontrer"
        items={[
          { href: "/creation-site-internet-asnieres-sur-seine", label: "Création de site à Asnières-sur-Seine", text: "Là où je travaille : rendez-vous chez vous ou à votre local." },
          { href: "/agence-web-ile-de-france", label: "Création et refonte de sites en Île-de-France", text: <>Hauts-de-Seine, Paris, Seine-Saint-Denis et <Commune>Val-d’Oise</Commune>.</> },
        ]}
      />
      <CtaBand
        id="france-cta"
        title="Votre projet, où que vous soyez"
        text={<>Décrivez votre activité : je vous propose un premier appel en visio, depuis <Commune>Asnières-sur-Seine</Commune>.</>}
        primaryHref="/contact?service=creation"
        primaryLabel="Présenter mon projet"
      />
    </>
  );
}
