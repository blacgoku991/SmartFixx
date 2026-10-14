import CampaignLink from "@/components/campaign-link";
import { FaqList } from "@/components/sx/faq-list";
/* Questions sur la prospection emailing (lot 8, /tarifs) — composant serveur, <details> natifs (FaqList),
   sans JSON-LD FAQPage. Au « je ». Retirés : « montants HT », la garantie de l'offre Performance, l'audience
   de particuliers « fournie par nos soins » et la data ciblée (non confirmées par le propriétaire). */
const QUESTIONS = [
  { q: "Dois-je déjà avoir un fichier de contacts ?", a: "Aujourd’hui, je travaille avec votre propre fichier : je le contrôle, je le prépare et je vérifie avec vous d’où viennent les contacts. Vous n’avez pas encore de fichier ? Décrivez votre cible : je regarde avec vous ce qui est envisageable avant tout devis." },
  { q: "À quoi correspond le volume d’envois ?", a: "Au nombre total d’emails envoyés pendant la campagne, relances comprises : 5 000 contacts sollicités deux fois représentent 10 000 envois. Les adresses écartées pendant la préparation du fichier ne comptent pas comme des envois." },
  { q: "Pourquoi aucun prix n’est affiché ?", a: "Parce que chaque campagne est différente : volume, état du fichier, nombre de messages et de relances, accompagnement souhaité. Le devis détaille le prix, ce qui est inclus et la TVA applicable, avant tout engagement." },
  { q: "Quels résultats sont garantis ?", a: <><p>Je m’engage sur ce que je maîtrise : le volume convenu, la validation des messages avant l’envoi, une cadence maîtrisée et la désinscription respectée. Je ne garantis ni un nombre de ventes, ni un taux d’ouverture, ni l’arrivée en boîte principale.</p><p><CampaignLink className="sc-textlink" href="/garanties">Lire mes engagements pour vos campagnes d’emailing</CampaignLink></p></> },
  { q: "Comment se déroule le lancement ?", a: "On cadre l’offre, la cible et le volume ; je prépare le fichier et les messages ; vous les validez ; un envoi de test part vers votre boîte. Le calendrier est fixé une fois ces éléments réunis." },
  { q: "Y a-t-il un abonnement ?", a: "Non. Une formule correspond à une campagne ponctuelle, sans reconduction automatique. Aucun supplément n’est engagé sans votre accord écrit." },
];
export function Faq() {
  return <FaqList items={QUESTIONS} className="sc-faq" />;
}
