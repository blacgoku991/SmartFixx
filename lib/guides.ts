/* Guides de /conseils (lot 9). Contenu d'origine conservé (sources Google et CNIL) ; seuls la voix (« je »
   là où le prestataire parle), les liens contextuels et l'encadré final changent.
   - slug, title et description sont lus par l'accueil (components/home/sections.tsx) et par la mesure
     d'audience (lib/analytics-config.ts) : ne pas les renommer. Un slug ajouté, renommé ou retiré se
     reporte dans lib/measured-paths.ts (tests/measured-paths.test.mjs).
   - seoTitle (≤ 65 caractères, « … | SmartFixx ») et seoDescription (120 à 160) servent aux métadonnées ;
     title est le H1, distinct du seoTitle.
   - Liens dans le texte : [ancre descriptive](/chemin), rendus par components/editorial/rich-text.tsx.
   - datePublished : date d'origine de la version ChatGPT ; dateModified : date de la réécriture (voix,
     liens), reprise par l'Article JSON-LD et le sitemap (app/sitemap.ts lit dateModified). */
export type GuideService = "refonte" | "automatisation" | "emailing";
export type GuideSection = { id: string; title: string; paragraphs: string[] };
export type Guide = {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  category: string;
  /* Situation du lecteur, affichée sur la carte de /conseils (« Pour vous si… »). */
  forWhom: string;
  title: string;
  description: string;
  service: GuideService;
  /* Prestation liée : lien dans le texte et dans l'encadré final. */
  related: { href: string; label: string };
  datePublished: string;
  dateModified: string;
  sections: GuideSection[];
  source: { label: string; url: string } | null;
  /* label sert au bouton du hero et à l’encadré : il doit tenir sur une ligne à 360 px (≤ 270 px, budget de lignes du hero mobile). */
  cta: { title: string; text: string; label: string; href: string; secondary: { href: string; label: string } };
};
export const guides: Guide[] = [
  {
    slug: "preparer-refonte-site-internet",
    seoTitle: "Préparer la refonte de son site : décisions clés | SmartFixx",
    seoDescription: "Objectifs, contenus à garder, URL et redirections, autonomie après la mise en ligne : les décisions à prendre avant le design pour réussir la refonte d’un site.",
    category: "Web et refonte",
    forWhom: "votre site ne vous ressemble plus, ou ne vous apporte plus de demandes.",
    title: "Refaire son site : les décisions à prendre avant le design",
    description: "Objectifs, contenus, URL et fonctionnalités : une checklist pour préparer une refonte utile et limiter les mauvaises surprises.",
    service: "refonte",
    related: { href: "/refonte-site-internet", label: "Refonte de site internet" },
    datePublished: "2026-09-15",
    dateModified: "2026-10-16",
    sections: [
      { id: "probleme", title: "Commencer par le problème, pas par les couleurs", paragraphs: [
        "Votre site ne génère pas assez de demandes ? Les visiteurs ne comprennent pas votre offre ? Vous ne pouvez plus modifier les contenus ? Ces situations n’appellent pas forcément la même solution. Définissez d’abord une action principale : demander un devis, réserver, appeler ou consulter une information.",
        "Rassemblez les questions que vos clients posent avant d’acheter. Elles constituent souvent une meilleure base pour vos pages que le vocabulaire interne de votre entreprise.",
        "C’est d’ailleurs la première question que je pose avant une [refonte de site internet](/refonte-site-internet) : qu’est-ce qui ne fonctionne plus aujourd’hui, et pour qui ?",
      ] },
      { id: "inventaire", title: "Inventorier ce qui doit être conservé", paragraphs: [
        "Listez les pages, formulaires, documents, outils connectés et accès. Identifiez les contenus encore utiles, les coordonnées publiées et les éventuelles fonctionnalités métier. Faites également le point sur le domaine, la messagerie et l’hébergement : remplacer le site ne doit pas interrompre vos emails.",
        "Si vous disposez de Search Console ou de statistiques, relevez les pages qui reçoivent des visites et les recherches associées. Leur devenir doit être décidé avant la bascule.",
      ] },
      { id: "url-redirections", title: "Préparer les URL et les redirections", paragraphs: [
        "Conserver une adresse pertinente peut éviter une migration inutile. Lorsqu’une URL change, prévoyez une redirection permanente vers la page qui répond au même besoin, plutôt que vers l’accueil par défaut.",
        "Les URL canoniques, le sitemap et les liens internes doivent pointer vers les bonnes adresses. Vérifiez les formulaires, les pages importantes et les erreurs après la mise en ligne. Une refonte peut faire évoluer le classement ; aucune position ne se conserve par simple promesse.",
        "Quand je mène une refonte, je dresse cette liste d’adresses avec vous avant la mise en ligne, puis je vérifie chaque redirection une fois le nouveau site publié.",
      ] },
      { id: "livraison", title: "Définir la livraison et l’autonomie", paragraphs: [
        "Précisez qui fournit les textes et les images, qui valide les pages et ce que vous souhaitez modifier ensuite. Le devis doit distinguer la création initiale, les abonnements éventuels et la maintenance.",
        "Un projet se clôture mieux lorsque les critères sont concrets : un formulaire reçu, un catalogue modifiable, une redirection vérifiée ou une personne capable d’utiliser l’administration.",
      ] },
    ],
    source: { label: "Google : déplacements de sites avec changement d’URL", url: "https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes?hl=fr" },
    cta: {
      title: "Votre site mérite une refonte ?",
      text: "Décrivez-moi votre site actuel et ce qui vous freine : je vous dis ce que je garderais, ce que je changerais, puis je vous propose un devis détaillé.",
      label: "Présenter mon projet",
      href: "/contact?service=refonte",
      secondary: { href: "/refonte-site-internet", label: "Voir comment je mène une refonte de site" },
    },
  },
  {
    slug: "automatiser-suivi-demandes-clients",
    seoTitle: "Automatiser le suivi des demandes clients | SmartFixx",
    seoDescription: "Du formulaire au suivi client : décrire une demande de bout en bout, choisir un résultat limité et garder un contrôle humain sur les actions sensibles.",
    category: "Automatisation",
    forWhom: "les demandes arrivent par plusieurs canaux et vous les recopiez à la main.",
    title: "Du formulaire au suivi client : automatiser sans perdre la main",
    description: "Un exemple concret pour relier les demandes de votre site à votre organisation, avec contrôle des erreurs et validation humaine.",
    service: "automatisation",
    related: { href: "/automatisation-informatique", label: "Automatisation informatique" },
    datePublished: "2026-09-15",
    dateModified: "2026-10-16",
    sections: [
      { id: "bout-en-bout", title: "Décrire une demande de bout en bout", paragraphs: [
        "Une demande arrive sur le site. Quelqu’un la lit, vérifie les informations, crée une fiche et prépare une réponse. Avant d’automatiser, décrivez ces étapes avec la personne qui les réalise. Notez les informations réellement nécessaires et les cas où la demande doit être renvoyée vers un autre interlocuteur.",
        "Une automatisation ne corrige pas à elle seule des champs ambigus ou un processus mal défini. Simplifier le formulaire et clarifier les responsabilités peut être la première amélioration.",
        "C’est par ce relevé que je commence une mission d’[automatisation informatique](/automatisation-informatique), avec la personne qui traite les demandes au quotidien.",
      ] },
      { id: "resultat", title: "Choisir un résultat limité et observable", paragraphs: [
        "Un bon premier périmètre peut être : enregistrer chaque demande valide, l’associer à un service et la rendre visible dans un tableau de suivi. La préparation d’une réponse ou la création d’une fiche dans un outil tiers peut venir ensuite.",
        "Pour chaque étape, posez trois questions : comment reconnaître le succès, comment signaler l’échec et comment reprendre sans créer de doublon ? Les réponses permettent de rendre le flux plus fiable.",
        "C’est le principe que j’applique au formulaire d’un [site internet que je crée](/creation-site-internet) : chaque demande enregistrée reçoit une référence et apparaît dans un tableau de suivi, plutôt que de se perdre dans une boîte mail.",
      ] },
      { id: "logiciels", title: "Vérifier les possibilités de vos logiciels", paragraphs: [
        "Un CRM ou un logiciel métier peut proposer une API, un import ou une connexion native. Les fonctionnalités disponibles dépendent parfois de l’abonnement. Avant de promettre une intégration, vérifiez les droits, les limites d’usage et les champs qui peuvent être lus ou modifiés.",
        "Les accès doivent correspondre au besoin. Une automatisation qui crée une fiche contact n’a pas nécessairement besoin de pouvoir supprimer toutes les données du logiciel.",
      ] },
      { id: "controle", title: "Garder un contrôle sur les actions sensibles", paragraphs: [
        "La création d’un dossier et l’envoi d’une proposition commerciale n’ont pas les mêmes conséquences. Une validation humaine peut rester nécessaire avant certains messages, paiements ou changements de données.",
        "Après le lancement, comparez le volume traité, les erreurs et le temps de reprise. Le bénéfice se mesure sur votre fonctionnement réel, pas sur un pourcentage de gain annoncé sans observation.",
      ] },
    ],
    source: null,
    cta: {
      title: "Des demandes qui se perdent ?",
      text: "Racontez-moi comment une demande circule aujourd’hui chez vous : je vous propose un premier périmètre simple, que l’on peut vérifier ensemble.",
      label: "Parler de mon besoin",
      href: "/contact?service=automatisation",
      secondary: { href: "/automatisation-informatique", label: "Voir mon approche de l’automatisation" },
    },
  },
  {
    slug: "preparer-campagne-emailing-b2b",
    seoTitle: "Préparer une campagne d’emailing B2B | SmartFixx",
    seoDescription: "Choisir une cible et un seul sujet, vérifier l’usage des coordonnées et demander une petite action : préparer une première campagne d’emailing B2B utile.",
    category: "Prospection",
    forWhom: "vous voulez contacter de nouveaux clients professionnels par email.",
    title: "Préparer une première campagne B2B qui ouvre une conversation",
    description: "Ciblage, message, désinscription et suivi : les points à clarifier avant de prospecter les professionnels par email.",
    service: "emailing",
    related: { href: "/prospection-emailing", label: "Prospection emailing" },
    datePublished: "2026-09-15",
    dateModified: "2026-10-16",
    sections: [
      { id: "cible", title: "Choisir une cible et un seul sujet", paragraphs: [
        "Un artisan qui souhaite moderniser son site n’a pas le même besoin qu’une PME qui cherche à connecter son CRM. Séparez les audiences et proposez un sujet utile à chacune. Commencer par une prestation précise rend le message plus facile à comprendre qu’une liste de tous vos services.",
        "La personnalisation doit reposer sur un fait réellement observé : une prestation proposée, une zone couverte ou une information visible. N’inventez pas un audit, un problème de sécurité ou une baisse de performance.",
      ] },
      { id: "coordonnees", title: "Vérifier l’utilisation des coordonnées", paragraphs: [
        "Pour la prospection de professionnels, l’objet du message doit être en rapport avec leur activité. La personne doit être informée et disposer d’un moyen simple de s’opposer aux sollicitations. Si les coordonnées viennent d’un tiers, vérifiez les conditions dans lesquelles elles ont été recueillies et peuvent être utilisées.",
        "Chaque email doit identifier l’expéditeur et permettre de refuser les suivants. Les règles diffèrent pour les particuliers, dont le consentement préalable est généralement requis. La source CNIL en fin de page détaille le cadre applicable.",
      ] },
      { id: "petite-action", title: "Demander une petite action", paragraphs: [
        "Une première prise de contact peut simplement proposer de poursuivre l’échange sur un besoin précis. Un appel à l’action court — répondre avec une priorité ou indiquer le bon interlocuteur — peut être plus adapté qu’une demande immédiate de rendez-vous.",
        "Le message doit rester lisible sans images. Une version texte soignée et une version HTML sobre permettent de tester différentes présentations sans changer la promesse.",
      ] },
      { id: "reponses", title: "Piloter les réponses plutôt que les promesses", paragraphs: [
        "Avant l’envoi, vérifiez la configuration du domaine, la qualité des adresses et le fonctionnement de l’opposition. Testez les liens et arrêtez les relances dès qu’une personne répond, refuse ou se désinscrit.",
        "Suivez les réponses positives, les rendez-vous et les demandes qualifiées. Les ouvertures et les clics peuvent être influencés par les protections des messageries. Aucun template ne garantit des ventes ; le ciblage, l’offre et le traitement des réponses comptent autant que le texte.",
        "Dans les campagnes de [prospection emailing](/prospection-emailing) que je prépare, chaque email contient un lien de désinscription, et une adresse désinscrite est exclue de toutes les campagnes suivantes.",
      ] },
    ],
    source: { label: "CNIL : prospection commerciale par courrier électronique", url: "https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique-sms-mms-et-automate-dappel" },
    cta: {
      title: "Une première campagne en vue ?",
      text: "Je vous aide à choisir la cible, le sujet et le volume, puis je prépare un message que vous validez avant tout envoi.",
      label: "Parler de ma campagne",
      href: "/contact?service=emailing",
      secondary: { href: "/prospection-emailing", label: "Comment je prépare une campagne d’emailing" },
    },
  },
];
/* Temps de lecture affiché : mots du corps / 200 par minute, arrondi au-dessus (calculé, jamais saisi). */
export function readingMinutes(g: Guide): number {
  const words = [g.title, g.description, ...g.sections.flatMap((s) => [s.title, ...s.paragraphs])].join(" ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
