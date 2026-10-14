import { ButtonLink, PhoneLink } from "@/components/sx/actions";
import { Eyebrow } from "@/components/sx/section";
import { ProofList } from "@/components/sx/proof-list";
import { Place } from "@/components/sx/place";
import { Glow, Skyline } from "@/components/sx/ambient";
import { ScenePlayer } from "@/components/sx/scene-player";
import { nb } from "@/lib/site-identity";
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
   signal s'allume quand la scène atteint « demande reçue » (home.css). */
const NBSP = " ";
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
            <span className="sx-h1-tagline">pour les entreprises d’{nb("Asnières-sur-Seine")} et{NBSP}d’{nb("Île-de-France")}</span>
          </h1>
          <p className="sx-lead hm-hero-lead">{HERO.lead}</p>
          <div className="sx-hero-actions">
            <ButtonLink variant="cta" href="#demande" size="lg">Parler de mon projet</ButtonLink>
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
