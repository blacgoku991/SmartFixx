import { ArrowRight } from "lucide-react";
import { PhoneLink } from "@/components/sx/actions";
import { Eyebrow } from "@/components/sx/section";
import { ProofList } from "@/components/sx/proof-list";
import { Place } from "@/components/sx/place";
import { Glow, Skyline } from "@/components/sx/ambient";
import { ScenePlayer } from "@/components/sx/scene-player";
import { HERO } from "./content";
import { HeroScene } from "./hero-scene";
/* Hero de l'accueil (serveur). Composition équivalente à PageHero, avec les mêmes règles : data-sx-hero,
   un seul H1 en deux parties (vraie espace, sous-titre en ligne : un seul candidat LCP), .sx-hero-actions
   lu par layout-check, réserve du consentement sous 768 px (règles du socle sur .sx-hero), surtitre court
   sous 480 px. Rien n'y est animé ni masqué (R1). Différence avec PageHero : la colonne de la scène
   (.hm-hero-aside) n'existe qu'à partir de 1024 px ; avec la colonne « aside » de PageHero, une cellule
   vide de grille ajoutait 48 px d'écart sous les preuves sur mobile.
   Décor : ciel et halo sodium du socle, une lueur bleue, la ville nocturne (Skyline graine 0, fenêtre
   signal) dans le tiers inférieur du hero, qui occupe la réserve du consentement sur mobile. La fenêtre
   signal s'allume quand la scène atteint « demande reçue » (home.css).
   CTA « Parler de mon projet » : lien d'ancre natif, mêmes classes que ButtonLink (sx-btn sx-btn--cta
   sx-btn--lg, data-analytics="contact"), et non ButtonLink. ButtonLink passe par next/link, qui change
   l'adresse par history.pushState : la pseudo-classe :target n'est alors jamais posée, et home.css en a
   besoin pour rendre les sections différées (content-visibility) avant le calcul du saut vers #demande.
   Un lien d'ancre garde la requête courante (utm_campaign) : CampaignLink n'apporte rien ici.
   H1 : noms de lieux insécables par white-space: nowrap (sx-nowrap), avec de vrais traits d'union
   (U+002D) et non les U+2011 de nb()/Place, pour que le texte du titre corresponde aux recherches. */
const NBSP = "\u00A0";
export function HomeHero() {
  return (
    <section className="sx-hero hm-hero" data-sx-hero="" aria-labelledby="hero-titre">
      <div className="sx-hero-backdrop" aria-hidden="true" data-sx-ambient="">
        <Glow size={760} top="-38%" right="-14%" />
        <Skyline signal />
      </div>
      <div className="sx-container sx-hero-grid sx-hero-grid--aside">
        <div className="sx-hero-copy">
          <Eyebrow dot>
            <span className="sx-eyebrow-long">{HERO.eyebrow}<Place>Asnières-sur-Seine</Place> (92)</span>
            <span className="sx-eyebrow-short">{HERO.eyebrowShort}</span>
          </Eyebrow>
          <h1 id="hero-titre" className="sx-h1 hm-h1">
            <span className="sx-h1-main">Création et <span className="sx-keyword">refonte</span> de sites{NBSP}internet</span>{" "}
            <span className="sx-h1-tagline">pour les entreprises d’<span className="sx-nowrap">Asnières-sur-Seine</span> et{NBSP}d’<span className="sx-nowrap">Île-de-France</span></span>
          </h1>
          <p className="sx-lead hm-hero-lead">{HERO.lead}<span className="hm-lead-more"> {HERO.leadMore}</span></p>
          <div className="sx-hero-actions">
            <a href="#demande" className="sx-btn sx-btn--cta sx-btn--lg" data-analytics="contact"><span>Parler de mon projet</span><ArrowRight className="sx-btn-icon" aria-hidden="true" /></a>
            <PhoneLink compact="sm" />
          </div>
          <ProofList items={HERO.proofs} className="sx-hero-proofs hm-hero-proofs" />
        </div>
        <div className="hm-hero-aside">
          <ScenePlayer label={HERO.sceneLabel} description={HERO.sceneDescription} className="hm-scene">
            <HeroScene />
          </ScenePlayer>
        </div>
      </div>
    </section>
  );
}
