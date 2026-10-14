/* Textes de l'accueil (lot 1). Voix : « je » (Mohamed), sans prix, délai, avis, chiffre ni client.
   Les réponses aux objections et la phrase « Je le conçois, je le construis… » sont à valider par le
   propriétaire avant la mise en ligne (décision n° 6). Espaces fines insécables (U+202F) avant « ; : ! ? ». */
const T = " ";

export const HERO = {
  eyebrow: "Mohamed · SmartFixx · ",
  eyebrowShort: "Mohamed · Asnières (92)",
  lead: "Un site qui présente votre entreprise et facilite les prises de contact. Je le conçois, je le construis et je reste votre seul interlocuteur.",
  proofs: ["Un seul interlocuteur : moi, Mohamed".replace(" :", `${T}:`), "Téléphone direct, sans standard", "Pensé d’abord pour le mobile"],
  sceneLabel: "Démonstration : une demande arrive, du site au tableau de suivi",
  sceneDescription:
    "Animation de démonstration, avec des données fictives : le site d’un artisan imaginaire s’affiche sur ordinateur, puis sur téléphone ; un visiteur remplit le formulaire court et la demande arrive dans le tableau de suivi avec sa référence.",
};

export const AUDIENCE = [
  { name: "Artisans", need: "Des demandes de devis claires, un numéro toujours visible." },
  { name: "Commerces de quartier", need: "Vos horaires, votre accès et votre contact, en un coup d’œil." },
  { name: "Professions libérales", need: "Présenter votre pratique simplement, avec sérieux." },
  { name: "TPE et PME", need: "Des prestations bien expliquées, des demandes suivies." },
];

export const CHOICE = {
  creation: {
    kicker: "Création",
    title: "Vous partez de zéro",
    signs: [
      "Vous lancez ou développez votre activité.",
      "On vous demande souvent si vous avez un site.",
      "Vos clients vous trouvent surtout par le bouche-à-oreille.",
    ],
  },
  refonte: {
    kicker: "Refonte",
    title: "Votre site existe, mais il vous dessert",
    signs: [
      "Il est difficile à lire sur un téléphone.",
      "Votre numéro ou votre formulaire se cherche.",
      "Vous ne pouvez plus le modifier vous-même.",
    ],
  },
};

/* Autres prestations : libellés lus dans lib/service-experience.ts (« Gagner du temps », « Protéger mes
   outils »… exigés par production-security), phrases réécrites au « je ». Emailing en dernier. */
export const OTHER_SERVICES: { id: "automatisation" | "cybersecurite" | "developpement" | "seo" | "emailing"; text: string }[] = [
  { id: "automatisation", text: "Je relie votre formulaire et vos outils pour éviter les ressaisies." },
  { id: "cybersecurite", text: "Je vérifie vos accès et vos applications, puis je traite les priorités." },
  { id: "developpement", text: "Je construis l’outil métier qui manque à votre site : espace client, suivi, tableau de bord." },
  { id: "seo", text: "Je structure vos pages pour les recherches de vos futurs clients, à commencer par les recherches locales." },
  { id: "emailing", text: "Je prépare des campagnes de prospection par email, au volume convenu avec vous." },
];

export const JOURNEY = [
  {
    title: "Un client vous cherche",
    text: "Il a un besoin précis et il tape quelques mots dans un moteur de recherche. Votre site doit dire clairement ce que vous faites et où vous intervenez, pour qu’il s’y reconnaisse.",
  },
  {
    title: "Il comprend votre offre sur son téléphone",
    text: "Il lit vos prestations sur un petit écran, souvent entre deux rendez-vous. Des titres nets, des textes courts et un bouton d’appel à portée de pouce.",
  },
  {
    title: "Il envoie une demande courte",
    text: "Son projet, son nom, un email ou un téléphone : rien de plus. La demande n’est confirmée qu’une fois enregistrée, avec une référence.".replace(" :", `${T}:`),
  },
  {
    title: "Elle arrive dans votre tableau de suivi",
    text: "Chaque demande a sa fiche : projet, contact, date et statut. Vous savez qui rappeler, et rien ne se perd dans une boîte mail.",
  },
];

export const DELIVERABLES = [
  { title: "Un design sur mesure", text: "Une mise en page construite autour de votre métier et de vos couleurs, pas un thème générique." },
  { title: "Une lecture pensée pour le mobile", text: "Des textes lisibles, des boutons à portée de pouce et votre téléphone toujours visible." },
  { title: "Des pages de prestations claires", text: "Chaque prestation a sa page : ce que vous faites, pour qui, et comment vous joindre.".replace(" :", `${T}:`) },
  { title: "Un formulaire relié à un tableau de suivi", text: "Chaque demande est enregistrée avec une référence et vous la retrouvez dans votre tableau de suivi." },
];

export const METHOD = [
  { title: "Un premier échange", text: "Par téléphone, en visio ou en rendez-vous : vous me présentez votre activité, vos clients et ce qui doit changer.".replace(" :", `${T}:`) },
  { title: "Une proposition et un devis détaillé", text: "Je vous propose la structure du site et un devis qui sépare ce qui est inclus de ce qui est en option." },
  { title: "La conception, avec vos validations", text: "Je conçois les pages et vous validez chaque étape avant que je passe à la suivante." },
  { title: "La mise en ligne et la prise en main", text: "Je mets le site en ligne et je vous montre comment suivre vos demandes et faire évoluer vos contenus." },
];

/* Réponses à valider par le propriétaire (listées dans la PR). */
export const FAQ = [
  {
    q: `Combien coûte un site${T}?`,
    a: `Je ne publie pas de tarif : chaque site est chiffré sur devis, après un premier échange. Le prix dépend surtout du nombre de pages, des contenus à rédiger et des fonctions à prévoir.`.replace(" :", `${T}:`),
  },
  {
    q: `Combien de temps faut-il${T}?`,
    a: "Cela dépend du périmètre et du moment où vos contenus sont prêts. Le calendrier est fixé avec vous dans le devis, étape par étape.",
  },
  {
    q: "Je n’ai ni textes ni photos.",
    a: "Ce n’est pas bloquant. Je peux structurer vos contenus à partir d’un premier échange et vous dire précisément quoi fournir. La rédaction complète est une option, chiffrée au devis.",
  },
  {
    q: `Pourrai-je modifier mon site${T}?`,
    a: "Une prise en main est prévue à la mise en ligne. Les modifications ensuite se font selon ce qui est convenu au devis : par vous-même, avec mon aide, ou les deux.".replace(" :", `${T}:`),
  },
  {
    q: `Et l’hébergement, le nom de domaine${T}?`,
    a: "Le nom de domaine et l’hébergement sont à votre nom. Ce qu’ils comprennent et leurs frais sont détaillés au devis.",
  },
  {
    q: `Vous travaillez seul${T}?`,
    a: "Oui : vous parlez à la personne qui conçoit et construit votre site, du premier échange à la mise en ligne.".replace(" :", `${T}:`),
  },
];

export const ZONE_LINKS = [
  { href: "/creation-site-internet-asnieres-sur-seine", label: "Création de site internet à Asnières-sur-Seine", text: "Rendez-vous possible chez vous, en visio ou par téléphone." },
  { href: "/agence-web-ile-de-france", label: "Création et refonte de sites en Île-de-France", text: "Les communes où j’interviens et la façon de travailler ensemble." },
  { href: "/agence-web-france", label: "Projets à distance, partout en France", text: "Le même suivi, avec des échanges en visio et par téléphone." },
];
