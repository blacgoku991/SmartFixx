/* Contenu des pages d'acquisition (lot 2) : /creation-site-internet et /refonte-site-internet, pages
   d'arrivée des deux groupes d'annonces Search préparés dans docs/SEO_ADS.md. Le titre, le chapeau et le
   CTA tiennent la promesse des annonces :
   - création : « Création de site professionnel », « Un site adapté au mobile », « Mettez vos services en
     avant », « Demandez votre devis » ;
   - refonte : « Modernisez votre site internet », « Valorisez vos services », « Un site adapté au mobile »,
     « Présentez-nous votre projet » (dit au « je » : « Présentez-moi votre projet », décision n° 19).
   Voix : « je » (Mohamed), sans « nous » ni « équipe ». Aucun prix, montant, délai, avis, compteur,
   classement ni client : les maquettes sont des démonstrations fictives. Les réponses aux objections, le
   tableau Inclus / En option / Défini au devis et les preuves du hero sont À VALIDER par le propriétaire
   (décision n° 6) avant la mise en ligne.
   Les métadonnées (titre, description) restent dans lib/services.ts (seoTitle, seoDescription), lues par
   app/[slug]/page.tsx. Typographie : espaces fines insécables (U+202F) avant « ; : ! ? » et dans « ». */
import { SITE_IDENTITY } from "@/lib/site-identity";

export type AcquisitionId = "creation" | "refonte";
/* Texte enrichi minimal : une suite de morceaux de texte et de liens internes (ancres descriptives). */
export type RichLink = { href: string; label: string; place?: string };
export type Rich = (string | RichLink)[];
export type Item = { title: string; text: string };
export type Step = { title: string; text: string };
export type Faq = { q: string; a: Rich };
export type RelatedLink = { href: string; label: string; text: string };

export type AcquisitionContent = {
  id: AcquisitionId;
  path: string;
  /* Nom dans le fil d'Ariane (Accueil › Prestations › …) et dans le JSON-LD Service. */
  crumb: string;
  hero: {
    /* H1 : partie principale (mot-clé souligné ambre) puis sous-titre en ligne, séparés par une espace. */
    titleBefore: string;
    titleKeyword: string;
    titleAfter: string;
    tagline: string;
    lead: string;
    cta: string;
    proofs: string[];
  };
  form: { eyebrow: string; note: string };
  steps: { eyebrow: string; title: string; text: string; items: Step[] };
  faq: { eyebrow: string; title: string; text: string; items: Faq[] };
  related: { title: string; intro: Rich; links: RelatedLink[] };
  band: { title: string; text: string };
};

const ASNIERES: RichLink = { href: "/creation-site-internet-asnieres-sur-seine", label: "création de site à ", place: SITE_IDENTITY.WORK_CITY };
const GUIDE_REFONTE = { href: "/conseils/preparer-refonte-site-internet", label: "Préparer la refonte de son site" };

export const creation: AcquisitionContent & {
  scope: { eyebrow: string; title: string; text: string; included: string[]; options: string[]; quote: string[]; note: string };
  anatomy: { eyebrow: string; title: string; text: string; marks: Item[]; caption: string; description: string };
} = {
  id: "creation",
  path: "/creation-site-internet",
  crumb: "Création de site internet",
  hero: {
    titleBefore: "Création de ",
    titleKeyword: "site internet",
    titleAfter: " vitrine pour votre entreprise",
    tagline: "pensé pour être compris et contacté",
    lead: "Création de site professionnel, adapté au mobile, qui met vos services en avant. Demandez votre devis : je vous réponds moi-même.",
    cta: "Recevoir mon devis",
    proofs: ["Un seul interlocuteur : moi, Mohamed", "Pensé d’abord pour le mobile", "Formulaire relié à un tableau de suivi"],
  },
  form: { eyebrow: "Votre demande de devis", note: "Votre demande est enregistrée et arrive dans mon tableau de suivi : je la lis moi-même." },
  scope: {
    eyebrow: "Le périmètre, sans zone grise",
    title: "Ce qui est inclus, en option ou défini au devis",
    text: "Je ne publie pas de tarif : chaque projet est chiffré après un premier échange. Voici ce que comprend un site vitrine, ce qui s’ajoute si vous en avez besoin, et ce que le devis précise noir sur blanc.",
    included: [
      "Un design sur mesure, à votre image",
      "Une lecture confortable sur mobile, tablette et ordinateur",
      "Une page claire pour chacune de vos prestations",
      "Un formulaire de demande relié à votre tableau de suivi",
      "La mise en ligne et la prise en main",
      "Les bases du référencement : titres, descriptions, structure, sitemap",
    ],
    options: [
      "Rédaction complète de vos textes",
      "Référencement local renforcé",
      "Automatisation de vos demandes",
      "Maintenance et évolutions",
    ],
    quote: [
      "Le nombre de pages et leur contenu",
      "Les fonctions particulières (réservation, catalogue, espace client)",
      "Le nom de domaine et l’hébergement, à votre nom",
      "Les frais récurrents éventuels",
      "Le calendrier de réalisation",
    ],
    note: "Chaque option est chiffrée au devis : rien n’est ajouté sans votre accord.",
  },
  anatomy: {
    eyebrow: "Planche annotée",
    title: "Anatomie d’un site qui fait appeler",
    text: "Un visiteur décide en quelques gestes s’il vous contacte. Quatre repères comptent plus que tout le reste, et je les place dès la maquette.",
    marks: [
      { title: "Le téléphone, toujours visible", text: "Votre numéro reste en haut de l’écran et s’appelle d’un geste depuis un mobile." },
      { title: "Une prestation claire", text: "En une phrase, le visiteur sait ce que vous faites, pour qui et où." },
      { title: "Des preuves qui rassurent", text: "Votre façon de travailler, vos réalisations et vos réponses aux questions qu’on se pose avant d’appeler." },
      { title: "Un formulaire court", text: "Quelques champs, une demande enregistrée et visible dans votre tableau de suivi." },
    ],
    caption: "Démonstration : maquette fictive",
    description: "Maquette d’un site vitrine sur téléphone, annotée de quatre repères : le bouton d’appel en haut de l’écran, le titre qui décrit la prestation, une rangée de preuves et un formulaire de demande court.",
  },
  steps: {
    eyebrow: "Déroulement",
    title: "Du premier échange à la mise en ligne",
    text: "Quatre étapes, avec une validation de votre part avant chaque passage à la suivante. Le calendrier est fixé dans le devis.",
    items: [
      { title: "On échange", text: "Par téléphone, en visio ou en rendez-vous : votre activité, vos clients, ce que le site doit leur faire faire." },
      { title: "Je vous propose un devis détaillé", text: "Les pages, les fonctions, ce qui est inclus et ce qui est en option. Vous décidez en connaissance de cause." },
      { title: "Je conçois, vous validez", text: "La structure, puis le design, puis les pages : vous relisez et validez à chaque étape." },
      { title: "Mise en ligne et prise en main", text: "Je publie le site, je vérifie les parcours importants et je vous montre comment le faire vivre." },
    ],
  },
  faq: {
    eyebrow: "Vos questions, mes réponses",
    title: "Avant de vous lancer",
    text: "Les questions qu’on me pose le plus souvent avant une création de site.",
    items: [
      { q: "Combien coûte la création d’un site ?", a: ["Je ne publie pas de tarif. Le prix dépend du nombre de pages, des contenus à rédiger et des fonctions dont vous avez besoin. Après un premier échange, je vous envoie un devis détaillé, avec les éventuels frais récurrents, avant tout engagement."] },
      { q: "Je n’ai pas de logo : est-ce un problème ?", a: ["Non. Je peux partir de votre nom et d’une typographie soignée pour construire une identité simple et cohérente. La création d’un logo complet est une option, chiffrée au devis si vous la souhaitez."] },
      { q: "Nom de domaine et hébergement : comment ça se passe ?", a: ["Le nom de domaine et l’hébergement sont réservés à votre nom. Le devis précise qui s’en occupe, ce que cela comprend et les frais récurrents éventuels. Si vous avez déjà un nom de domaine, on le garde, ainsi que votre messagerie."] },
      { q: "Le site m’appartient-il ?", a: ["Oui. Vos textes, vos images et votre nom de domaine restent les vôtres. Les accès vous sont remis à la mise en ligne, dans les conditions précisées au devis."] },
      { q: "Et après la mise en ligne ?", a: ["Je vous montre comment modifier ce qui doit l’être. Les évolutions et la maintenance se font ensuite selon ce qui est convenu au devis. Si vous avez déjà un site à moderniser, voyez plutôt la ", { href: "/refonte-site-internet", label: "refonte de site internet" }, "."] },
    ],
  },
  related: {
    title: "Pour aller plus loin",
    intro: ["Vous êtes près de chez moi ? Voyez la page ", ASNIERES, ". Votre site existe déjà mais ne vous ressemble plus ? La ", { href: "/refonte-site-internet", label: "refonte de site internet" }, " part de ce qui fonctionne. Et pour être trouvé sur vos prestations, le ", { href: "/referencement-seo", label: "référencement SEO" }, " prolonge le travail."],
    links: [
      { href: "/creation-site-internet-asnieres-sur-seine", label: "Création de site à Asnières-sur-Seine", text: "Rendez-vous possible, un seul interlocuteur, à deux pas de chez vous." },
      { href: "/refonte-site-internet", label: "Refonte de site internet", text: "Moderniser un site existant sans perdre ce qui fonctionne déjà." },
      { href: "/referencement-seo", label: "Référencement SEO local", text: "Être trouvé pour ce que vous faites vraiment, dans votre zone." },
      { href: GUIDE_REFONTE.href, label: "Guide : préparer la refonte de son site", text: "Les décisions à prendre avant le design, utiles aussi pour un premier site." },
    ],
  },
  band: { title: "Votre site, pensé pour être compris et contacté", text: "Décrivez votre activité en quelques lignes : je vous réponds moi-même avec une proposition claire." },
};

export const refonte: AcquisitionContent & {
  compare: { eyebrow: string; title: string; text: string; before: Item[]; after: Item[]; caption: string; description: string };
  keep: { eyebrow: string; title: string; text: Rich; items: Item[] };
  change: { eyebrow: string; title: string; text: string; items: Item[] };
  urls: { title: string; caption: string; description: string; rows: { from: string; to: string; kind: "keep" | "308" }[] };
} = {
  id: "refonte",
  path: "/refonte-site-internet",
  crumb: "Refonte de site internet",
  hero: {
    titleBefore: "Refonte de site internet pour ",
    titleKeyword: "moderniser",
    titleAfter: " votre présence",
    tagline: "sans perdre ce qui fonctionne déjà",
    lead: "Modernisez votre site internet et valorisez vos services, sur un site adapté au mobile. Présentez-moi votre projet.",
    cta: "Présenter mon projet",
    proofs: ["État des lieux avant toute maquette", "Redirections préparées pour vos pages utiles", "Un seul interlocuteur : moi, Mohamed"],
  },
  form: { eyebrow: "Votre projet de refonte", note: "Indiquez l’adresse de votre site actuel : je le regarde avant de vous répondre." },
  compare: {
    eyebrow: "Avant, après",
    title: "Ce que la refonte change, d’un seul geste",
    text: "Faites glisser le curseur. À droite, un site daté comme on en voit souvent ; à gauche, la même entreprise après la refonte.",
    before: [
      { title: "Texte illisible sur mobile", text: "Des lignes minuscules qu’il faut agrandir du bout des doigts." },
      { title: "Téléphone introuvable", text: "Le numéro est caché en bas de page, et il ne s’appelle pas d’un geste." },
      { title: "Offre floue", text: "« Bienvenue sur notre site » ne dit ni ce que vous faites, ni pour qui." },
    ],
    after: [
      { title: "Une promesse lisible", text: "Le métier, la zone et le bénéfice en une phrase." },
      { title: "L’appel à portée de pouce", text: "Le téléphone et la demande de devis restent en vue." },
      { title: "Des services mis en valeur", text: "Chaque prestation a sa carte, puis sa page." },
    ],
    caption: "Démonstration : maquette fictive, pas un client",
    description: "Comparaison de deux maquettes fictives d’un même site de menuiserie. L’ancienne version a un texte minuscule, un téléphone caché en bas de page et un message d’accueil vague. La nouvelle version affiche le métier et la ville dans le titre, un bouton d’appel et un bouton de devis en haut, et trois cartes de services.",
  },
  keep: {
    eyebrow: "Ce que je reprends",
    title: "Je pars de ce qui fonctionne déjà",
    text: ["Une refonte commence par un état des lieux, pas par les couleurs. J’en détaille la méthode dans le guide ", GUIDE_REFONTE, ". Concrètement :"],
    items: [
      { title: "L’état des lieux", text: "Pages visitées, formulaires, outils connectés, accès au domaine et à l’hébergement : je recense tout avant la première maquette." },
      { title: "Vos contenus utiles", text: "Les textes, photos et pages qui servent encore sont conservés, retravaillés si besoin." },
      { title: "Le plan des URL", text: "Chaque adresse utile est conservée ou redirigée (redirection permanente 308) vers la page qui répond au même besoin, jamais vers l’accueil par défaut." },
      { title: "Le contrôle après la mise en ligne", text: "Je vérifie les pages importantes, les formulaires et les redirections une fois le nouveau site publié." },
    ],
  },
  change: {
    eyebrow: "Ce que je change",
    title: "Ce que vos visiteurs remarqueront",
    text: "Le fond reste le vôtre ; la forme et le parcours changent pour que l’on vous comprenne et vous contacte plus facilement.",
    items: [
      { title: "Le design", text: "Une identité nette et actuelle, une hiérarchie claire, des services mis en valeur." },
      { title: "La lecture sur mobile", text: "Un texte confortable, des boutons à la taille du pouce, des pages légères." },
      { title: "Le parcours de contact", text: "Un téléphone visible, un formulaire court et chaque demande dans votre tableau de suivi." },
    ],
  },
  urls: {
    title: "URL conservée ou redirection 308",
    caption: "Démonstration : plan d’URL fictif",
    description: "Extrait d’un plan d’URL fictif : la page d’accueil et la page contact gardent leur adresse ; trois anciennes pages sont redirigées de façon permanente vers leur nouvelle équivalente.",
    rows: [
      { from: "/", to: "/", kind: "keep" },
      { from: "/nos-services.html", to: "/menuiserie", kind: "308" },
      { from: "/cuisines-2019", to: "/cuisines", kind: "308" },
      { from: "/contact", to: "/contact", kind: "keep" },
      { from: "/page.php?id=12", to: "/escaliers", kind: "308" },
    ],
  },
  steps: {
    eyebrow: "Déroulement",
    title: "Une refonte sans saut dans le vide",
    text: "Quatre étapes, validées avec vous une à une. Le calendrier est fixé dans le devis.",
    items: [
      { title: "État des lieux", text: "Je parcours votre site actuel, ses contenus, ses formulaires, ses accès et les pages qui comptent." },
      { title: "Le plan", text: "Ce que je garde, ce que je change et le plan des URL, dans un devis détaillé." },
      { title: "La nouvelle version", text: "Design et pages validés avec vous, redirections préparées avant la bascule." },
      { title: "Bascule et contrôle", text: "Mise en ligne, puis vérification des pages importantes, des formulaires et des redirections." },
    ],
  },
  faq: {
    eyebrow: "Vos questions, mes réponses",
    title: "Les inquiétudes avant une refonte",
    text: "Une refonte touche à quelque chose qui existe déjà : voici mes réponses franches.",
    items: [
      { q: "Vais-je perdre mon référencement ?", a: ["Je prépare les redirections des pages utiles et je contrôle après la mise en ligne. Le référencement dépend aussi de facteurs que je ne maîtrise pas : je ne promets donc ni maintien ni gain de position, mais une migration préparée avec soin."] },
      { q: "Mon site est sur WordPress ou Wix : pouvez-vous le reprendre ?", a: ["Je regarde d’abord la technologie, les accès et ce qui peut être conservé. Le devis indique ce que je reprends, ce que je remplace et pourquoi."] },
      { q: "Puis-je garder mes textes ?", a: ["Oui. Les contenus utiles sont conservés ; je peux les réorganiser et les clarifier. Une réécriture complète est une option, chiffrée au devis."] },
      { q: "Y aura-t-il une coupure ?", a: ["La nouvelle version est préparée à part, sans toucher au site en ligne. La bascule se fait au moment convenu, en préservant votre nom de domaine et votre messagerie. Si vous partez de zéro, voyez plutôt la ", { href: "/creation-site-internet", label: "création de site internet" }, "."] },
    ],
  },
  related: {
    title: "Pour aller plus loin",
    intro: ["Pas encore de site ? La ", { href: "/creation-site-internet", label: "création de site internet" }, " part d’une page blanche. Vous êtes près de chez moi ? Voyez la page ", ASNIERES, ". Et pour que la nouvelle version soit trouvée, le ", { href: "/referencement-seo", label: "référencement SEO" }, " prend le relais."],
    links: [
      { href: GUIDE_REFONTE.href, label: "Guide : préparer la refonte de son site", text: "Objectifs, contenus, URL et redirections : les décisions avant le design." },
      { href: "/creation-site-internet-asnieres-sur-seine", label: "Création et refonte à Asnières-sur-Seine", text: "Rendez-vous possible, un seul interlocuteur, à deux pas de chez vous." },
      { href: "/creation-site-internet", label: "Création de site internet", text: "Un premier site vitrine, pensé pour être compris et contacté." },
      { href: "/referencement-seo", label: "Référencement SEO local", text: "Être trouvé pour ce que vous faites vraiment, dans votre zone." },
    ],
  },
  band: { title: "Votre site mérite une nouvelle version ?", text: "Donnez-moi l’adresse de votre site actuel et ce qui vous gêne : je vous réponds moi-même." },
};

export const acquisition: Record<AcquisitionId, AcquisitionContent> = { creation, refonte };
