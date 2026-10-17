import { ScenePlayer } from "@/components/sx/scene-player";
import { Media } from "@/components/sx/media";
/* Scène de l'enveloppe (lot 8, /prospection-emailing) — composant serveur : l'objet mail-sculpture passe
   par Media (AVIF/WebP en srcset, lazy, jamais dans le hero : le H1 reste l'élément LCP), et l'animation
   par ScenePlayer (une seule lecture de 6,4 s, état final rendu par le serveur, bouton Pause/Rejouer, aucune
   boucle). Le journal de campagne est une démonstration aux données fictives, étiquetée comme telle.
   Animations : components/secondary/secondary.css, sous .sx-scene.is-playing (transform et opacity). */
const LOG = [
  { chip: "sx-chip sx-chip--success", tag: "Validé", text: "Message relu et validé par vous" },
  { chip: "sx-chip sx-chip--violet", tag: "Test", text: "Envoi de test reçu dans votre boîte" },
  { chip: "sx-chip sx-chip--accent", tag: "En cours", text: "Envois étalés selon la cadence prévue" },
  { chip: "sx-chip", tag: "STOP", text: "Une désinscription : adresse exclue de toutes les campagnes" },
  { chip: "sx-chip sx-chip--signal", tag: "Réponse", text: "« Bonjour, pouvez-vous me rappeler jeudi ? »" },
];
export function MailScene() {
  return (
    <ScenePlayer className="sc-mail" label="Démonstration : une campagne, du message validé à la première réponse." description="Une enveloppe part ; le journal de campagne affiche successivement le message validé, l’envoi de test, des envois étalés, une désinscription appliquée à toutes les campagnes, puis une réponse. Données fictives.">
      <div className="sc-mail-stage">
        <div className="sc-mail-env">
          <Media src="/mail-sculpture.webp" base="mail-sculpture" alt="" width={1024} height={1024} maxWidth={320} sizes="(min-width: 900px) 320px, 56vw" />
        </div>
        <div className="sc-mail-log">
          <div className="sc-mail-log-head"><span className="sc-mail-log-title">Journal de campagne</span><span className="sc-mail-log-tag">Démonstration</span></div>
          <ol className="sc-mail-rows">
            {LOG.map((r, i) => (
              <li className={`sc-mail-row sc-mail-row--${i + 1}`} key={r.tag}><span className={r.chip}>{r.tag}</span><span className="sc-mail-text">{r.text}</span></li>
            ))}
          </ol>
        </div>
      </div>
    </ScenePlayer>
  );
}
