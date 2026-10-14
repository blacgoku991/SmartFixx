import { DemoFrame } from "@/components/sx/demo-frame";
import { SignalCard } from "@/components/sx/ambient";
/* Scène du hero (serveur, rendue dans ScenePlayer à partir de 1024 px). Le serveur rend l'ÉTAT FINAL :
   le site d'un artisan imaginaire sur ordinateur, sa version téléphone avec le formulaire court rempli, et
   la carte « Nouvelle demande ». La lecture (une fois, 7,2 s, transform et opacity) est écrite dans
   home.css sous .sx-scene.is-playing. Toutes les animations partent ensemble et durent 7,2 s (leurs
   images clés portent le minutage) : un seul départ, pas de délai. Données fictives, aucun texte < 12 px. */
export function HeroScene() {
  return (
    <div className="hm-stage">
      <DemoFrame className="hm-sc-browser" url="votre-entreprise.fr" ratio="3/2" description="Exemple fictif : le site d’un artisan.">
        <div className="hm-ms">
          <div className="hm-ms-nav">
            <span className="hm-ms-logo"><i />Votre Entreprise</span>
            <span className="hm-ms-links">Prestations · Zone · Contact</span>
            <span className="hm-ms-call">Appeler</span>
          </div>
          <div className="hm-ms-hero hm-sc-a">
            <span className="hm-ms-kicker">Exemple : artisan plombier</span>
            <b className="hm-ms-title">Votre salle de bain refaite, sans mauvaise surprise</b>
            <span className="hm-ms-text">Dépannage, rénovation, chauffe-eau : un devis clair après un premier échange.</span>
          </div>
          <div className="hm-ms-cards hm-sc-b">
            <span>Dépannage</span>
            <span>Salle de bain</span>
            <span>Chauffe-eau</span>
          </div>
          <div className="hm-ms-form hm-sc-c">
            <span className="hm-ms-field">Votre projet</span>
            <span className="hm-ms-field">Téléphone ou email</span>
            <span className="hm-ms-send">Envoyer</span>
          </div>
        </div>
      </DemoFrame>
      <DemoFrame kind="phone" className="hm-sc-phone" ratio="9/14">
        <div className="hm-mp">
          <b className="hm-mp-title">Demande de devis</b>
          <span className="hm-mp-field"><small>Projet</small><span className="hm-sc-f1">Salle de bain</span></span>
          <span className="hm-mp-field"><small>Nom</small><span className="hm-sc-f2">Dupont</span></span>
          <span className="hm-mp-field"><small>Email</small><span className="hm-sc-f3">dupont@example.test</span></span>
          <span className="hm-mp-send hm-sc-press">Envoyer<i className="hm-sc-tap" /></span>
          <span className="hm-mp-ok hm-sc-sent">Demande enregistrée</span>
        </div>
      </DemoFrame>
      <SignalCard className="hm-sc-card" title="Nouvelle demande" reference="SF-3A91C2E0" meta="Salle de bain · démonstration" />
    </div>
  );
}
