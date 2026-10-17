/* Contenu propre aux pages de prestations (lot 3) : développement, automatisation, cybersécurité et SEO.
   Les données partagées (livrables, étapes, FAQ, related, guide) restent dans lib/services.ts ; ce module,
   importé seulement par des composants serveur, porte ce qui ne sert qu'à ces pages. Voix « je »
   (Mohamed) ; aucun prix, délai, client, avis ni classement promis. Les exemples sont des situations
   types, étiquetées comme telles. */
import type { MediaBase } from "@/components/sx/media";

export type PlateKind = "dev" | "auto" | "secu" | "seo";
export type ServicePageContent = {
  /* Nom court : fil d'Ariane et nom du Service (JSON-LD). */
  crumb: string;
  /* H1 = mot-clé (title, dont la partie soulignée), puis une vraie espace et l'accroche (tagline). */
  title: { before: string; keyword: string; after: string };
  tagline: string;
  lead: string;
  proofs: string[];
  plate: { kind: PlateKind; label: string; description: string };
  media: { base: MediaBase; src: string; alt: string };
  when: { title: string; signs: string[] };
  limits: string[];
  example: { title: string; context: string; beats: { label: string; text: string }[] };
  guideText: { before: string; after: string };
  band: { title: string; text: string };
};

export const servicePages: Partial<Record<"developpement" | "automatisation" | "cybersecurite" | "seo", ServicePageContent>> = {
  developpement: {
    crumb: "Développement web sur mesure",
    title: { before: "Développement web ", keyword: "sur mesure", after: "" },
    tagline: "pour les entreprises qui ont dépassé le tableur",
    lead: "Espace client, outil métier ou tableau de bord : je développe l’outil qui suit votre façon de travailler, avec des accès contrôlés.",
    proofs: ["Un premier périmètre utile, puis des évolutions", "Des accès vérifiés côté serveur", "Un seul interlocuteur : moi, Mohamed"],
    plate: {
      kind: "dev",
      label: "Démonstration : tableau de bord et rôles, données fictives",
      description: "Un tableau de bord d’interventions fictif. Trois rôles y accèdent à travers un contrôle des accès côté serveur : le gérant voit tout, le technicien ses dossiers, le client le suivi de son seul dossier.",
    },
    media: { base: "studio-web", src: "/studio-web.webp", alt: "" },
    when: {
      title: "Quand un outil sur mesure devient utile",
      signs: [
        "Vos informations vivent dans plusieurs tableurs qui ne se parlent pas.",
        "Vous ressaisissez les mêmes données dans deux ou trois outils.",
        "Vos clients vous écrivent pour savoir où en est leur dossier.",
        "Vous voulez ouvrir un accès à un collaborateur ou à un partenaire, mais pas à tout.",
      ],
    },
    limits: [
      "Je ne développe pas une liste de fonctions « au cas où » : chaque écran répond à un usage identifié.",
      "Une intégration n’est confirmée qu’après vérification de l’API de l’outil tiers et de ses conditions.",
      "Je ne reprends pas de données sans votre accord sur leur origine et leur usage.",
    ],
    example: {
      title: "Un atelier de réparation qui suit ses interventions",
      context: "Situation type : un atelier note ses interventions dans un tableur partagé et répond au téléphone aux clients qui demandent où en est leur appareil.",
      beats: [
        { label: "Aujourd’hui", text: "Un tableur partagé, des colonnes ajoutées au fil du temps, des appels pour donner l’avancement." },
        { label: "L’outil", text: "Un tableau de bord des interventions ; chaque technicien voit les siennes, chaque client consulte l’état de son dossier." },
        { label: "Le contrôle", text: "Chaque rôle est vérifié côté serveur et le gérant garde l’historique des changements." },
      ],
    },
    guideText: { before: "Avant de développer un outil, je conseille de suivre le parcours réel d’une demande, de sa réception à sa clôture. C’est l’objet du guide ", after: ", utile même si vous ne comptez rien automatiser." },
    band: { title: "Un outil qui suit votre façon de travailler ?", text: "Décrivez-moi la tâche qui vous coûte le plus de temps aujourd’hui. Je vous réponds avec un premier périmètre réaliste." },
  },
  automatisation: {
    crumb: "Automatisation informatique",
    title: { before: "", keyword: "Automatisation", after: " informatique" },
    tagline: "pour les entreprises lassées de la double saisie",
    lead: "Je relie vos formulaires, tableurs et logiciels : l’information circule seule, les erreurs se voient et vous validez ce qui compte.",
    proofs: ["Un flux concret, décrit avant d’être construit", "Un contrôle humain sur les étapes sensibles", "Les connexions officielles de vos outils"],
    plate: {
      kind: "auto",
      label: "Démonstration : formulaire, tableur, contrôle humain, notification",
      description: "Une demande fictive part d’un formulaire, arrive dans un tableur, passe par une validation humaine puis déclenche une notification. Une erreur éventuelle déclenche une alerte et une reprise à la main.",
    },
    media: { base: "studio-automation", src: "/studio-automation.webp", alt: "" },
    when: {
      title: "Quand automatiser vaut la peine",
      signs: [
        "Chaque demande reçue est recopiée à la main dans un tableur ou un CRM.",
        "Une relance oubliée vous a déjà fait perdre une affaire.",
        "Vous préparez chaque semaine le même récapitulatif à partir des mêmes fichiers.",
        "Personne ne sait vraiment quand une tâche automatique a échoué.",
      ],
    },
    limits: [
      "Je n’automatise pas une étape qui demande votre jugement : elle garde une validation.",
      "Je ne promets pas un nombre d’heures gagnées : cela dépend de votre volume réel.",
      "Je n’utilise pas de contournement fragile quand l’outil propose une connexion officielle.",
    ],
    example: {
      title: "Une demande de devis qui arrive un vendredi soir",
      context: "Situation type : une entreprise reçoit ses demandes par un formulaire et les recopie le lundi dans son tableur de suivi.",
      beats: [
        { label: "Aujourd’hui", text: "La demande attend le lundi, puis elle est recopiée à la main ; une erreur de saisie passe inaperçue." },
        { label: "Le flux", text: "La demande arrive dans le tableur dès son envoi, avec sa date et sa source ; la personne concernée est prévenue." },
        { label: "Le contrôle", text: "Rien ne part chez le client sans validation ; si une étape échoue, l’erreur est signalée au lieu d’être perdue." },
      ],
    },
    guideText: { before: "Pour cartographier vos propres flux avant de les automatiser, j’ai rassemblé la méthode dans le guide ", after: "." },
    band: { title: "Une tâche répétitive à confier ?", text: "Décrivez-moi la manipulation que vous refaites chaque semaine. Je vous dis honnêtement si l’automatiser en vaut la peine." },
  },
  cybersecurite: {
    crumb: "Audit de sécurité web",
    title: { before: "Audit de ", keyword: "sécurité", after: " de site web et d’application" },
    tagline: "dans un périmètre que vous autorisez",
    lead: "Je passe en revue vos accès, votre configuration et vos composants, puis je priorise les corrections et je vérifie les correctifs.",
    proofs: ["Un périmètre et une autorisation écrits", "Aucun contrôle lancé sans votre accord", "Pas de promesse de site « inviolable »"],
    plate: {
      kind: "secu",
      label: "Démonstration : périmètre autorisé et points exposés, cas fictif",
      description: "Un périmètre autorisé contient le site public, un formulaire, un espace d’administration et des composants ; la messagerie et les postes restent hors périmètre. Trois points exposés sont repérés puis classés : urgent, important, plus tard.",
    },
    media: { base: "studio-security", src: "/studio-security.webp", alt: "" },
    when: {
      title: "Quand faire relire sa sécurité",
      signs: [
        "Plusieurs personnes partagent le même compte d’administration.",
        "Votre site n’a pas été mis à jour depuis longtemps et personne ne sait qui s’en charge.",
        "Un ancien prestataire a gardé des accès que vous n’avez jamais révoqués.",
        "Vous ouvrez un espace client ou un formulaire qui recueille des données personnelles.",
      ],
    },
    limits: [
      "Je n’interviens que sur un périmètre écrit, avec l’accord de son responsable.",
      "Je ne garantis pas l’absence de faille : je réduis les risques identifiés et je les rends vérifiables.",
      "Je ne demande jamais de mot de passe par formulaire ni par email.",
    ],
    example: {
      title: "Un site vitrine administré à trois avec un seul compte",
      context: "Situation type : un commerce gère son site à trois, avec un seul compte d’administration et des extensions jamais mises à jour.",
      beats: [
        { label: "Le périmètre", text: "Le site public et son administration, autorisés par écrit ; la messagerie reste hors périmètre." },
        { label: "Les constats", text: "Compte partagé, extensions obsolètes, formulaire sans limite d’envoi : chacun est expliqué avec son impact." },
        { label: "Les corrections", text: "Un compte par personne, des mises à jour planifiées, une limite d’envoi ; puis je vérifie chaque correctif." },
      ],
    },
    guideText: { before: "Avant une refonte ou un changement de prestataire, l’inventaire des accès compte autant que le design : le guide ", after: " liste ce qu’il faut relever (domaine, messagerie, hébergement)." },
    band: { title: "Faire le point sur vos accès ?", text: "Décrivez-moi votre site ou votre application et qui y a accès. Je vous propose un périmètre de revue clair, à valider par écrit." },
  },
  seo: {
    crumb: "Référencement naturel SEO",
    title: { before: "Référencement naturel (", keyword: "SEO", after: ") local et technique" },
    tagline: "pour être trouvé sur votre métier",
    lead: "J’organise vos pages autour de vos prestations et de votre zone, je soigne la technique et je suis les résultats observés.",
    proofs: ["Aucune position garantie, un travail concret", "Une page utile par intention, pas par ville", "Un suivi des résultats réellement observés"],
    plate: {
      kind: "seo",
      label: "Démonstration : arborescence et requête, résultat sans position",
      description: "Une recherche « création site internet asnières » correspond à la page Asnières de l’arborescence d’un site fictif (accueil, puis pages Asnières, création de site et refonte), qui s’allume. Un résultat type s’affiche, sans aucune position.",
    },
    media: { base: "studio-web", src: "/studio-web.webp", alt: "" },
    when: {
      title: "Quand travailler son référencement",
      signs: [
        "On vous trouve en tapant votre nom, mais pas votre métier.",
        "Votre site a plusieurs pages presque identiques pour différentes villes.",
        "Vous ne savez pas quelles recherches mènent à votre site.",
        "Votre fiche d’établissement et votre site ne donnent pas les mêmes informations.",
      ],
    },
    limits: [
      "Je ne promets ni première place ni volume de trafic.",
      "Je ne crée pas de pages de villes presque identiques pour grossir le site.",
      "Je n’achète pas de liens et je n’utilise aucune technique contraire aux consignes de Google.",
    ],
    example: {
      title: "Un artisan qu’on ne trouve que par son nom",
      context: "Situation type : un artisan a un site d’une seule page ; il apparaît quand on tape son nom, jamais quand on cherche son métier près de chez lui.",
      beats: [
        { label: "L’arborescence", text: "Une page par prestation, une page pour sa zone réelle et des liens internes qui les relient." },
        { label: "La technique", text: "Titres et descriptions uniques, sitemap, données structurées exactes, pages rapides sur mobile." },
        { label: "Le suivi", text: "Les requêtes et les demandes reçues désignent les pages à enrichir ; aucune position n’est promise." },
      ],
    },
    guideText: { before: "Si votre site change d’adresses, les redirections comptent autant que les contenus : le guide ", after: " explique comment les préparer avant la mise en ligne." },
    band: { title: "Être trouvé sur votre métier ?", text: "Dites-moi ce que vous faites et où vous intervenez. Je regarde votre site actuel et je vous dis par quoi commencer." },
  },
};
