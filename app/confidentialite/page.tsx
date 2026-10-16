import Link from "next/link";
import { LegalLayout } from "@/components/legal-layout";
import { Chapter } from "@/components/editorial/reading";
import { pageMeta } from "@/lib/seo";
import { SITE_IDENTITY, mailHref } from "@/lib/site-identity";
/* Politique de confidentialité (lot 9). Fond conservé (consentement, mesure, conservation de douze mois,
   prospection par email, STOP, mesure facultative des emails), liste des données alignée sur les
   formulaires réels (formulaire court du lot 5 et formulaire de prospection emailing), événement
   « demande enregistrée » soumis au consentement. La phrase « Des mécanismes techniques nécessaires… »
   est conservée MOT POUR MOT : vps/prepare.py la remplace par celle du cookie de session du VPS (ne pas
   déplacer ce fichier). Moment signature : le registre « quoi, pourquoi, combien de temps ». */
export const metadata = pageMeta(
  "Politique de confidentialité | SmartFixx",
  "Données recueillies lors d’une demande de devis, finalités, conservation, mesure d’audience facultative et exercice de vos droits auprès de SmartFixx.",
  "/confidentialite",
);
const TOC = [
  { id: "responsable", label: "Qui traite vos données" },
  { id: "demande", label: "Ce que je recueille lors d’une demande" },
  { id: "registre", label: "Quoi, pourquoi, combien de temps" },
  { id: "conservation", label: "Accès et conservation" },
  { id: "audience", label: "Mesure d’audience facultative" },
  { id: "prospection", label: "Propositions par email" },
  { id: "stockage", label: "Stockage local, cookies et liens" },
  { id: "droits", label: "Vos droits" },
];
const LEDGER: [string, string, string][] = [
  ["Votre demande : besoin, nom, activité, email ou téléphone, site actuel, message ; entreprise pour une demande d’emailing", "Vous répondre et préparer une proposition", "12 mois après la demande"],
  ["Référence, date, accord de contact, campagne déclarée", "Suivre la demande et connaître son origine déclarée", "Avec la demande, 12 mois"],
  ["Compteurs d’audience regroupés par jour, page et action", "Améliorer le site, seulement avec votre accord", "90 jours au plus"],
  ["Votre choix sur la mesure d’audience", "Ne pas vous reposer la question", "6 mois, sur votre appareil"],
  ["Fiches de campagne email (destinataire, état des envois)", "Effectuer et suivre les envois demandés", "12 mois après leur préparation"],
  ["Première ouverture et premier clic détectés", "Mesure des emails, seulement avec votre accord préalable", "90 jours après la préparation du message"],
  ["Liste d’opposition : adresse, date et motif du STOP", "Ne plus vous solliciter", "Tant que SmartFixx prospecte"],
];
export default function Confidentialite() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      path="/confidentialite"
      crumb="Confidentialité"
      lead="Ce que deviennent les informations que vous m’envoyez, la mesure d’audience facultative du site et la manière d’exercer vos droits."
      toc={TOC}
    >
      <Chapter id="responsable" n={1} title="Qui traite vos données">
        <p>SmartFixx ({SITE_IDENTITY.LEGAL}, Mohamed) traite les demandes relatives à ses prestations digitales. Pour toute question : <a href={mailHref}>{SITE_IDENTITY.EMAIL}</a>. Les informations de l’entreprise figurent dans les <Link href="/mentions-legales">mentions légales</Link>.</p>
      </Chapter>
      <Chapter id="demande" n={2} title="Ce que je recueille lors d’une demande">
        <p>Le formulaire de projet recueille le type de projet (création, refonte ou autre besoin, avec sa précision), votre nom, votre activité et un moyen de vous recontacter : votre email ou votre téléphone, l’un des deux suffit. Votre site actuel, les autres besoins éventuellement cochés et votre message sont facultatifs.</p>
        <p>Le formulaire de prospection emailing recueille votre nom, votre entreprise, votre email professionnel, votre téléphone si vous le renseignez, votre activité et votre objectif, ainsi que la cible, le volume, l’origine des données et la formule envisagés.</p>
        <p>Une référence, la date de réception et votre accord de contact sont enregistrés avec la demande. Le nom de campagne présent dans le lien utilisé peut aussi être enregistré, pour connaître l’origine déclarée de la demande, sans suivi individuel de navigation.</p>
        <p>Ces éléments servent à comprendre votre besoin, préparer une proposition et échanger avec vous. Les champs facultatifs sont signalés comme tels ; les autres sont nécessaires pour traiter la demande. Ils ne donnent lieu à aucune inscription automatique à une newsletter. Le traitement vise les démarches précontractuelles que vous sollicitez.</p>
      </Chapter>
      <Chapter id="registre" n={3} title="Quoi, pourquoi, combien de temps">
        <p>Le résumé des informations conservées, de leur usage et de leur durée. Le détail figure dans les autres parties de cette page.</p>
        <div className="ed-ledger-wrap">
          <table className="ed-ledger">
            <caption className="ed-sr">Informations conservées, usage et durée de conservation</caption>
            <thead><tr><th scope="col">Information</th><th scope="col">Pourquoi</th><th scope="col">Combien de temps</th></tr></thead>
            <tbody>
              {LEDGER.map(([what, why, how]) => (
                <tr key={what}><th scope="row" data-label="Information">{what}</th><td data-label="Pourquoi">{why}</td><td data-label="Combien de temps">{how}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Chapter>
      <Chapter id="conservation" n={4} title="Accès et conservation">
        <p>Les demandes sont destinées à SmartFixx et aux prestataires techniques nécessaires au fonctionnement du site. Elles ne sont pas affichées publiquement. Leur suivi est réservé au compte administrateur autorisé ; il peut inclure des notes internes, un statut et l’historique des modifications. Aucun fichier de prospects ne doit être collé dans le champ de message : son éventuel transfert sera organisé séparément après définition du périmètre.</p>
        <p>La durée de suivi prévue est de douze mois après la demande, hors nécessité liée à une relation contractuelle ou à une obligation de conservation. Les demandes arrivées à échéance sont retirées lors des opérations de nettoyage. Vous pouvez demander une suppression anticipée.</p>
      </Chapter>
      <Chapter id="audience" n={5} title="Mesure d’audience facultative">
        <p>Aucun outil publicitaire n’est intégré. Avec votre accord, SmartFixx compte les pages publiques consultées, les choix d’expertise, les clics vers le contact, les débuts de formulaire et les demandes enregistrées. Les compteurs sont regroupés par jour, page, type d’action et expertise : aucun identifiant de visiteur, contenu saisi, adresse IP, paramètre d’URL ou empreinte de navigateur n’est conservé dans ces statistiques.</p>
        <p>L’événement « demande enregistrée » n’est compté que si vous avez accepté la mesure, et seulement après l’enregistrement effectif de votre demande par le serveur. Il est compté une fois par demande : il ne contient ni votre nom, ni vos coordonnées, ni le contenu ou la référence de la demande, seulement la page et le type de prestation. Un marqueur temporaire, conservé par votre navigateur pendant la session, évite de compter deux fois la même demande.</p>
        <p>Ce traitement facultatif repose sur votre consentement. Les statistiques sont visibles uniquement dans l’administration et conservées au maximum 90 jours ; les compteurs expirés sont exclus des rapports et supprimés progressivement lors du nettoyage. Votre choix de statistiques est mémorisé sur cet appareil pendant six mois. Vous pouvez refuser ou retirer votre accord à tout moment via « Préférences de statistiques » en bas de page ; le site reste utilisable. Le retrait arrête les nouveaux événements et ne permet pas d’isoler les anciens compteurs agrégés.</p>
      </Chapter>
      <Chapter id="prospection" n={6} title="Mes propositions par email">
        <p>Pour une proposition pertinente adressée à une entreprise, SmartFixx peut conserver l’adresse professionnelle, le nom, l’entreprise, l’origine de l’adresse et la campagne concernée sur le fondement de son intérêt légitime à présenter ses services. L’origine figure dans le message. Vous pouvez vous opposer gratuitement à cette prospection via « Stop prospection » puis confirmation, le bouton de désinscription de votre messagerie lorsqu’il est disponible, ou une réponse STOP. Les destinataires particuliers ne relèvent pas de ce parcours de prospection professionnelle.</p>
        <p>Les liens personnels contiennent un identifiant aléatoire signé, sans votre adresse email. Le bouton principal ouvre le site et ses services. Une visite ou un clic ne crée aucune demande : seuls les formulaires que vous envoyez volontairement avec vos coordonnées sont enregistrés pour préparer un échange. Le nom de la campagne peut accompagner les liens entre pages afin de le joindre à votre demande ; il ne contient ni votre adresse email ni un identifiant individuel. Un envoi peut être déclaré manuellement ou exécuté par le relais SMTP configuré par SmartFixx. Son acceptation par le SMTP ne prouve ni la livraison ni la lecture. Les campagnes conservent aussi l’état des tentatives, les erreurs techniques synthétiques et un identifiant de message. Les adresses refusées comme inexistantes sont ajoutées à la liste d’exclusion. Les coordonnées et le contenu sont transmis au relais puis au prestataire SMTP uniquement pour effectuer les envois demandés. Les réponses à l’email sont reçues dans ma messagerie, séparément de cet espace.</p>
        <h3 className="ed-sub">Mesure facultative des emails</h3>
        <p>Uniquement avec votre accord préalable documenté, un pixel et un lien de redirection peuvent enregistrer la première ouverture détectée et le premier clic détecté. Ces signaux sont liés au destinataire et à sa campagne. Ils ne prouvent pas une lecture humaine : les mécanismes de protection et les robots des messageries peuvent les déclencher ou les masquer. Aucun historique détaillé, adresse IP, géolocalisation ou empreinte d’appareil n’est enregistré par cette mesure. Elle est désactivée par défaut, sans incidence sur la possibilité de demander un échange ou de se désinscrire.</p>
        <p>La mesure est limitée aux 90 jours suivant la préparation du message. Passé ce délai, ses signaux sont exclus des rapports et supprimés lors du nettoyage. Le lien de préférences de l’email permet de retirer votre accord : les nouveaux événements sont ignorés et les premières ouvertures et premiers clics déjà enregistrés pour votre adresse sont supprimés. La désinscription de la prospection retire également cette mesure. La référence du consentement et son éventuel retrait restent conservés pendant la durée de suivi du contact.</p>
        <p>Les fiches de campagne sont consultables pendant douze mois après leur préparation, puis retirées progressivement lors du nettoyage. Les demandes confirmées suivent leur propre durée de conservation de douze mois. Une liste d’opposition séparée conserve le minimum nécessaire — adresse email, date et motif du STOP — aussi longtemps que SmartFixx poursuit sa prospection, afin de ne pas vous solliciter à nouveau. Elle est réservée au propriétaire et peut être exportée pour appliquer les exclusions dans son outil d’envoi. Les envois gérés dans le panel sont vérifiés contre la liste d’exclusion avant leur transmission. Un envoi déjà transmis ne peut pas être rappelé. Les fichiers exportés vers un autre outil doivent également y être exclus. Les identifiants de connexion SMTP et les éventuelles clés de signature sont chiffrés à l’enregistrement et ne sont transmis qu’au relais autorisé ; les journaux de reprise du relais conservent uniquement les identifiants techniques et résultats en attente de synchronisation.</p>
      </Chapter>
      <Chapter id="stockage" n={7} title="Stockage local, cookies et liens externes">
        <p>Le choix clair ou sombre est conservé localement jusqu’à modification ou suppression des données du navigateur ; il sert uniquement à l’affichage. Le choix de mettre en pause les animations est conservé de la même manière. Le formulaire et la collecte statistique utilisent des compteurs temporaires pour limiter les envois abusifs ; les identifiants correspondants sont pseudonymisés et retirés lors du nettoyage après expiration. Des mécanismes techniques nécessaires à l’hébergement et au contrôle d’accès peuvent être utilisés par la plateforme. Les liens vers d’autres sites sont soumis aux politiques de ces sites.</p>
      </Chapter>
      <Chapter id="droits" n={8} title="Vos droits">
        <p>Vous pouvez me demander l’accès, la rectification ou la suppression des informations vous concernant, ainsi que la limitation du traitement lorsque cela s’applique. Adressez votre demande à <a href={mailHref}>{SITE_IDENTITY.EMAIL}</a> en précisant votre email et, si possible, votre référence de demande. Vous pouvez également contacter la <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">CNIL<span className="ed-sr"> (nouvel onglet)</span></a>.</p>
      </Chapter>
    </LegalLayout>
  );
}
