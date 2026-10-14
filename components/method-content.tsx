/* Méthode de prospection emailing en 4 étapes (lot 8, /methode) — composant serveur, au « je », sans
   durée chiffrée. Moment signature : un immeuble de quatre étages, collant à partir de 1024 px ; chaque
   étage s'allume quand son étape traverse l'écran (timelines de vue nommées, opacité seulement, sous
   html[data-motion=on] sans pause globale). Sans mouvement, sans prise en charge ou sur mobile, tout est
   allumé et chaque étape porte son propre numéro. Styles : components/secondary/secondary.css (sc-mt-…). */
const STEPS = [
  { title: "Cadrer", text: "Votre offre, la cible visée, l’objectif de la campagne et le volume d’envois. Je vérifie aussi d’où viennent vos contacts et sur quelle base vous pouvez leur écrire." },
  { title: "Préparer", text: "Je contrôle votre fichier (doublons, adresses invalides, personnes désinscrites), je rédige les messages, vous les relisez et les validez. Un envoi de test part vers votre boîte avant tout lancement." },
  { title: "Envoyer", text: "Les envois sont étalés selon une cadence maîtrisée. Chaque message porte un lien de désinscription ; une adresse désinscrite n’est plus sollicitée, quelle que soit la campagne." },
  { title: "Faire le bilan", text: "Envois, réponses, désinscriptions : je vous présente ce qui s’est passé et on décide ensemble de la suite à donner." },
];
export function MethodContent() {
  return (
    <div className="sc-mt">
      <div className="sc-mt-building" aria-hidden="true" data-sx-tone="night">
        <span className="sc-mt-roof" />
        {[4, 3, 2, 1].map((n) => (
          <span className={`sc-mt-floor sc-mt-floor--${n}`} key={n}>
            <span className="sc-mt-floor-num">{String(n).padStart(2, "0")}</span>
            <span className="sc-mt-wins"><i /><i /><i /><i /></span>
          </span>
        ))}
        <span className="sc-mt-door" />
      </div>
      <ol className="sc-mt-steps">
        {STEPS.map((s, i) => (
          <li className={`sc-mt-step sc-mt-step--${i + 1}`} key={s.title}>
            <span className="sc-mt-num sx-figure" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="sc-mt-title">{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
