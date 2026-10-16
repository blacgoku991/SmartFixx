import "./editorial.css";
import { Container, CtaBand, Glow, PageHero, Place, Section, SectionHead, Skyline } from "@/components/sx";
import CampaignLink from "@/components/campaign-link";
import { guides } from "@/lib/guides";
import { GuideCard } from "./guide-card";
/* /conseils (lot 9). Moment signature : « la façade des guides » — chaque guide est une travée d'immeuble
   dont une fenêtre est allumée ; au survol ou au focus, tout l'étage s'allume. Le hero garde la ville de
   nuit (graine 3, distincte du hero d'accueil 0 et du bandeau 5) et, à partir de 1200 px, « la maison des
   conseils » : un immeuble à toit mansardé dont les trois fenêtres cintrées (une par guide, plaque émaillée
   du numéro) s'allument tour à tour (ambiance, cycle de 24 s, délais négatifs). Ensuite, les prestations auxquelles
   mènent les guides, avec des ancres descriptives (maillage interne, Asnières-sur-Seine compris), puis le
   bandeau d'appel. Aucun chiffre, aucun avis : uniquement les guides publiés et leurs dates réelles. */
const NEXT = [
  { href: "/creation-site-internet", label: "Création de site internet", text: "Un site clair, lisible sur mobile, avec un formulaire relié à un tableau de suivi." },
  { href: "/refonte-site-internet", label: "Refonte de site internet", text: "Moderniser un site existant sans perdre les pages et les adresses qui comptent." },
  { href: "/creation-site-internet-asnieres-sur-seine", label: <>Création de site à <Place>Asnières-sur-Seine</Place></>, text: "Là où je travaille : un seul interlocuteur, joignable en direct, du premier échange à la mise en ligne." },
  { href: "/automatisation-informatique", label: "Automatisation informatique", text: "Relier un formulaire, un tableur et une notification pour ne plus recopier les demandes." },
  { href: "/prospection-emailing", label: "Prospection emailing", text: "Une campagne B2B préparée avec vous, validée avant envoi, avec désinscription en un clic." },
];
export function GuideIndex() {
  return (
    <>
      <PageHero
        className="ed-hero ed-hero--index"
        breadcrumbs={[{ name: "Conseils", path: "/conseils" }]}
        title="Conseils pour votre site internet,"
        tagline="vos outils et votre prospection"
        lead="Trois guides pour préparer une décision : ce qu’il faut trancher avant de refaire un site, d’automatiser le suivi des demandes ou de lancer une première campagne d’emailing."
        backdrop={
          <>
            <Glow tone="blue" size={760} top="-360px" right="-240px" />
            <Glow tone="blue" alt size={480} top="10%" left="-220px" duration={30} />
            <Skyline seed={3} />
            <span className="ed-house">
              <span className="ed-house-roof" />
              <span className="ed-house-row">{[1, 2, 3].map((n) => <span key={n} className={`ed-house-win ed-hw${n}`}><span className="ed-house-plate sx-ref">{String(n).padStart(2, "0")}</span></span>)}</span>
              <span className="ed-house-row ed-house-row--low">{[1, 2, 3].map((n) => <span key={n} className="ed-house-win" />)}</span>
              <span className="ed-house-row ed-house-row--low">{[1, 2, 3].map((n) => <span key={n} className={n === 3 ? "ed-house-win is-on" : "ed-house-win"} />)}</span>
            </span>
          </>
        }
      />
      <Section id="guides" labelledBy="guides-titre" className="ed-guides-section">
        <Container>
          <SectionHead id="guides-titre" eyebrow="Trois situations, trois guides" title="Choisissez le guide qui correspond à votre situation" text="Chaque guide se lit en quelques minutes et renvoie vers la prestation concernée si vous voulez aller plus loin avec moi." />
          <div className="ed-cards">
            {guides.map((g, i) => <GuideCard key={g.slug} guide={g} index={i} />)}
          </div>
        </Container>
      </Section>
      <Section tone="surface" id="apres-la-lecture" labelledBy="apres-titre" className="ed-next-section">
        <Container>
          <SectionHead id="apres-titre" eyebrow="Après la lecture" title="Passer de la préparation au projet" text="Les guides restent généraux. Pour votre situation, voici les prestations que je mène moi-même, de l’échange à la mise en ligne." />
          <ul className="ed-next">
            {NEXT.map((n) => (
              <li key={n.href}>
                <CampaignLink href={n.href} className="ed-next-link">
                  <span className="ed-next-win" aria-hidden="true" />
                  <span className="ed-next-label">{n.label}</span>
                  <span className="ed-next-text">{n.text}</span>
                  <span className="ed-arrow" aria-hidden="true" />
                </CampaignLink>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <CtaBand
        id="conseils-cta"
        title="Une question après la lecture ?"
        text={<>Je vous réponds directement, sans standard, depuis <Place>Asnières-sur-Seine</Place>.</>}
        primaryHref="/contact?service=conseil"
        primaryLabel="Poser ma question"
      />
    </>
  );
}
