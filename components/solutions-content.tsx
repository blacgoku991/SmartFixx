import { ScenePlayer } from "@/components/sx/scene-player";
/* Contenu de /solutions (lot 8) — composant serveur. « Préparer votre propre fichier » : qualité, base
   légale, désinscription. Moment signature : la préparation d'un fichier en démonstration (ScenePlayer, une
   lecture) — les doublons, les adresses invalides et les désinscrits sont écartés ligne à ligne ; l'état
   final, rendu par le serveur, montre le fichier préparé. Adresses fictives en example.test.
   Masqués jusqu'à confirmation écrite du propriétaire (décision n° 9) : l'offre « data ciblée », la
   prospection B2C et toute mention de « sources vérifiées ». Styles : secondary.css (sc-so-…). */
const ROWS = [
  { mail: "contact@boulangerie.example.test", state: "ok", tag: "Prêt" },
  { mail: "a.martin@cabinet.example.test", state: "ok", tag: "Prêt" },
  { mail: "a.martin@cabinet.example.test", state: "out", tag: "Doublon" },
  { mail: "info@@garage.example.test", state: "out", tag: "Adresse invalide" },
  { mail: "j.durand@atelier.example.test", state: "out", tag: "Désinscrit (STOP)" },
  { mail: "accueil@studio.example.test", state: "ok", tag: "Prêt" },
];
export const POINTS = [
  { title: "Un fichier propre", text: "Je retire les doublons et les adresses mal formées, et je repère les contacts qui ne correspondent pas à votre cible. Moins d’envois inutiles, une meilleure réputation d’envoi." },
  { title: "Une base légale claire", text: "En prospection entre professionnels, le message doit concerner l’activité de la personne, et elle doit pouvoir s’y opposer simplement. Je vous demande d’où viennent vos contacts avant tout envoi." },
  { title: "La désinscription respectée", text: "Chaque message porte un lien de désinscription en un clic. Une adresse désinscrite rejoint une liste STOP commune à toutes les campagnes : elle n’est plus sollicitée." },
];
export function SolutionsContent() {
  return (
    <div className="sc-so">
      <ul className="sc-so-points" role="list">
        {POINTS.map((p, i) => (
          <li className="sc-so-point" key={p.title}>
            <span className="sc-so-mark" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="sc-so-title">{p.title}</h3>
            <p>{p.text}</p>
          </li>
        ))}
      </ul>
      <ScenePlayer className="sc-so-scene" label="Démonstration : préparation d’un fichier de contacts." description="Six lignes fictives ; un doublon, une adresse invalide et une personne désinscrite sont écartés, trois contacts restent prêts pour la campagne.">
        <div className="sc-so-file">
          <div className="sc-so-file-head"><span className="sc-so-file-name">votre-fichier.csv</span><span className="sc-so-file-tag">Démonstration</span></div>
          <ol className="sc-so-rows">
            {ROWS.map((r, i) => (
              <li className={`sc-so-row sc-so-row--${r.state} sc-so-row--${i + 1}`} key={i}>
                <span className="sc-so-mail">{r.mail}</span>
                <span className={r.state === "ok" ? "sx-chip sx-chip--success sc-so-tag" : "sx-chip sc-so-tag"}>{r.tag}</span>
              </li>
            ))}
          </ol>
          <p className="sc-so-sum"><span className="sx-tabular">3</span> contacts prêts · <span className="sx-tabular">3</span> écartés avant l’envoi</p>
        </div>
      </ScenePlayer>
    </div>
  );
}
