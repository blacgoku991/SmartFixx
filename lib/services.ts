/* Prestations SmartFixx : données partagées par les pages /[slug], /services, l'accueil, le formulaire,
   le panel, l'API (serviceLabels), l'analytics et le sitemap. Voix « je » (Mohamed), sans prix, délai,
   classement garanti ni client. Les id et slug sont figés (liens des emails déjà envoyés, mesure
   d'audience : lib/measured-paths.ts recopie les slugs et les clés de serviceLabels).
   Ce module est aussi importé par des composants clients (formulaire, panel) : il reste sobre ; le
   contenu propre aux pages de prestations (planches, exemples, signes) vit dans components/services. */
export const serviceLabels={creation:"Création de site",refonte:"Refonte de site",developpement:"Développement sur mesure",automatisation:"Automatisation",cybersecurite:"Cybersécurité",seo:"Référencement SEO",emailing:"Prospection emailing",conseil:"Diagnostic & conseil"} as const;
export type ServiceId=keyof typeof serviceLabels;
export type Service={
  id:ServiceId;slug:string;seoTitle:string;seoDescription:string;related:ServiceId[];
  /* Guide de /conseils cité dans le texte de la page (slug de lib/guides.ts). */
  guide?:string;
  number:string;title:string;short:string;headline:string;accent:string;intro:string;audience:string;problem:string;
  deliverables:{title:string;text:string}[];steps:string[];faqs:[string,string][];
};
export const services:Service[]=[
{id:"creation",slug:"creation-site-internet",
 seoTitle:"Création de site internet vitrine sur mesure | SmartFixx",
 seoDescription:"Création de site vitrine pour entreprises : structure pensée pour vos clients, design adapté au mobile, bases SEO et formulaire de demande. Devis sur demande.",
 related:["refonte","seo","automatisation"],guide:"preparer-refonte-site-internet",
 number:"01",title:"Création de site internet",short:"Un site qui donne envie de vous choisir.",headline:"Votre savoir-faire.",accent:"Enfin à sa hauteur.",
 intro:"Un site internet doit permettre à un visiteur de comprendre votre offre, de vous faire confiance et de vous contacter. Je conçois des sites vitrines pour les entreprises, les artisans et les indépendants, depuis Asnières-sur-Seine, en Île-de-France comme à distance.",
 audience:"Pour lancer une activité, structurer votre présence en ligne ou présenter une nouvelle offre.",
 problem:"Un visiteur ne connaît pas votre métier aussi bien que vous. Une navigation lisible, des prestations précises et des moyens de contact accessibles l’aident à décider. Je construis le parcours autour des questions de vos futurs clients, puis le design autour de votre identité.",
 deliverables:[
  {title:"Une structure pensée pour vos clients",text:"Pages de prestations, preuves que vous fournissez, réponses aux objections et appels à l’action adaptés à votre façon de vendre."},
  {title:"Un design sur mesure, lisible sur mobile",text:"Une hiérarchie visuelle claire, des contenus lisibles et des formulaires utilisables sur téléphone, tablette et ordinateur."},
  {title:"Les bases techniques du référencement",text:"Titres, descriptions, structure des pages, sitemap et liens internes sont prévus dès la conception."},
  {title:"Une prise en main organisée",text:"L’administration, la gestion des contenus, l’hébergement et la maintenance sont définis dans le devis."}],
 steps:["Je précise avec vous votre activité, vos clients et l’action attendue sur le site.","J’organise les pages et je vous soumets la direction graphique.","Je développe, j’intègre les contenus et je vérifie les parcours importants.","Je prépare la mise en ligne, les accès et votre prise en main."],
 faqs:[
  ["Quel est le prix d’un site internet ?","Le nombre de pages ne suffit pas à fixer le prix : le design, les contenus à rédiger, les fonctions et le niveau d’administration comptent aussi. Je ne publie pas de tarif ; le devis détaille les livrables et les éventuels frais récurrents avant votre accord."],
  ["Pouvez-vous m’aider si je n’ai pas encore de contenu ?","Oui. Je peux organiser les informations nécessaires et vous accompagner sur les textes ; la rédaction complète est une option chiffrée au devis. Les photos, logos et autorisations d’utilisation sont identifiés au démarrage."],
  ["Est-ce que je pourrai modifier mon site ?","Le niveau d’autonomie souhaité est défini au devis : textes, images, pages. L’outil retenu dépend de vos usages et de votre besoin de maintenance."]]},
{id:"refonte",slug:"refonte-site-internet",
 seoTitle:"Refonte de site internet : design, mobile et SEO | SmartFixx",
 seoDescription:"Refonte de site internet : état des lieux, parcours plus directs, migration préparée avec redirections et contrôle après la mise en ligne. Devis sur demande.",
 related:["creation","seo","cybersecurite"],guide:"preparer-refonte-site-internet",
 number:"02",title:"Refonte de site internet",short:"Gardez votre histoire. Changez l’expérience.",headline:"Votre site a évolué.",accent:"Vos ambitions aussi.",
 intro:"Un site lent, daté ou difficile à parcourir peut freiner la prise de contact. Je repense son design, ses contenus et ses parcours en tenant compte de ce qui existe déjà : pages indexées, formulaires, outils connectés et habitudes de vos clients.",
 audience:"Pour les entreprises qui ont déjà un site et veulent le rendre plus efficace sans repartir à l’aveugle.",
 problem:"Une refonte ne se résume pas à changer les couleurs. Il faut repérer les pages utiles, comprendre les points de friction et préparer la migration. Si des adresses changent, un plan de redirections relie chaque ancienne page à son équivalent ; aucun maintien de position Google ne peut être garanti.",
 deliverables:[
  {title:"Un état des lieux avant les maquettes",text:"Je recense les contenus, les formulaires, les intégrations et les contraintes de votre site actuel."},
  {title:"Des parcours plus directs",text:"Navigation, pages de prestations, demandes de devis et lecture mobile sont repensées selon votre objectif."},
  {title:"Une migration préparée",text:"Les URL importantes, les redirections nécessaires, le sitemap et les liens internes font partie des points vérifiés."},
  {title:"Un contrôle après la mise en ligne",text:"Je vérifie les pages importantes, les formulaires et les accès. Le suivi de l’indexation est cadré avec vous."}],
 steps:["Inventorier le site, ses contenus et ses fonctions utiles.","Prioriser les améliorations de design, de contenu et de prise de contact.","Développer la nouvelle version et préparer la migration.","Mettre en ligne, puis contrôler les parcours et les redirections."],
 faqs:[
  ["Puis-je conserver mon nom de domaine ?","Oui. Je vérifie la propriété du domaine et les accès à l’hébergement avant toute bascule ; la messagerie associée au domaine est préservée."],
  ["La refonte peut-elle affecter mon référencement ?","Oui. Des changements de contenu, de structure ou d’URL peuvent modifier les positions. Je prépare les redirections des pages utiles et je contrôle après la mise en ligne ; le référencement dépend aussi de facteurs que je ne maîtrise pas."],
  ["Pouvez-vous reprendre un site que vous n’avez pas créé ?","Je commence par examiner la technologie, les accès et les possibilités de reprise. Le devis indique ce qui peut être conservé et ce qui doit être remplacé."]]},
{id:"developpement",slug:"developpement-sur-mesure",
 seoTitle:"Développement web sur mesure pour entreprises | SmartFixx",
 seoDescription:"Espace client, application métier, tableau de bord ou portail interne : je développe des outils web adaptés à votre fonctionnement, sur un périmètre précis.",
 related:["automatisation","cybersecurite","creation"],guide:"automatiser-suivi-demandes-clients",
 number:"03",title:"Développement web sur mesure",short:"L’outil qui s’adapte à votre façon de travailler.",headline:"Moins de contournements.",accent:"Le bon outil.",
 intro:"Espace client, application métier, tableau de bord ou portail interne : je développe des outils web qui répondent à un besoin précis. L’objectif est de faciliter une tâche réelle, avec des accès adaptés, des données organisées et des échanges fiables avec vos logiciels.",
 audience:"Pour les entreprises dont le fonctionnement dépasse ce qu’un site vitrine ou un tableur peut porter.",
 problem:"Les fichiers dispersés, les doubles saisies et les échanges par email deviennent difficiles à suivre quand l’activité grandit. Un outil métier peut réunir les informations utiles et rendre les actions claires, à condition de partir de vos usages et non d’une liste de fonctions génériques.",
 deliverables:[
  {title:"Un périmètre fonctionnel précis",text:"Utilisateurs, rôles, écrans, actions et règles de gestion sont identifiés avant le développement."},
  {title:"Des accès adaptés à chaque rôle",text:"Les autorisations sont vérifiées côté serveur et les données sensibles ne sont jamais rendues publiques."},
  {title:"Des intégrations cadrées",text:"Je vérifie la disponibilité des API, les droits d’accès, les limites et les coûts des outils tiers avant de m’engager."},
  {title:"Un outil maintenable",text:"Gestion des erreurs, sauvegardes, évolutions et reprise en main sont prévues dès le cadrage."}],
 steps:["Décrire votre fonctionnement actuel et le résultat attendu.","Valider les écrans et les règles de gestion prioritaires.","Développer et tester les parcours utiles avec les bons rôles.","Livrer l’outil, sa documentation et planifier les évolutions."],
 faqs:[
  ["Pouvez-vous créer un espace client ou un panel d’administration ?","Oui. Je définis en amont les profils et leurs permissions. La connexion, les données visibles et les actions autorisées sont contrôlées côté serveur, jamais seulement dans le navigateur."],
  ["Mon outil peut-il communiquer avec mon CRM ?","Cela dépend des API et des accès que propose votre CRM. Je vérifie les possibilités et leurs conditions avant de confirmer l’intégration au devis."],
  ["Comment éviter un projet trop complexe ?","Je commence par un premier périmètre utile et vérifiable. Les fonctions suivantes sont planifiées une fois ce premier fonctionnement validé par l’usage."],
  ["À qui appartient le code de l’outil ?","La propriété du code, l’hébergement et les accès sont précisés dans le devis avant le développement, pour que vous ne dépendiez pas d’une seule personne pour faire évoluer l’outil."]]},
{id:"automatisation",slug:"automatisation-informatique",
 seoTitle:"Automatisation informatique pour entreprises | SmartFixx",
 seoDescription:"Je connecte vos formulaires, tableurs, CRM et logiciels pour réduire les tâches répétitives, avec des erreurs visibles et un contrôle humain là où il compte.",
 related:["developpement","creation","cybersecurite"],guide:"automatiser-suivi-demandes-clients",
 number:"04",title:"Automatisation informatique",short:"Votre temps mérite mieux que la double saisie.",headline:"Moins de répétitions.",accent:"Plus de temps utile.",
 intro:"Je connecte vos formulaires, tableurs, CRM et logiciels pour simplifier les tâches répétitives. Une automatisation utile transmet la bonne information au bon endroit, avec un contrôle des erreurs et la possibilité de reprendre la main.",
 audience:"Pour les entreprises qui répètent chaque semaine les mêmes manipulations entre plusieurs outils.",
 problem:"Un formulaire reçu, une fiche à créer, une information à recopier, une relance à préparer : ces petites tâches s’accumulent. Je pars d’un flux concret, de ses exceptions et de ses contraintes avant de proposer une automatisation. Le temps gagné dépend du volume réel et de vos outils.",
 deliverables:[
  {title:"Un flux compréhensible",text:"Déclencheur, données nécessaires, étapes et résultat attendu sont décrits avant la mise en place."},
  {title:"Des connexions adaptées",text:"Je privilégie les connexions officielles de vos logiciels et je vérifie les droits nécessaires."},
  {title:"Des erreurs visibles",text:"Échecs, doublons, informations manquantes et reprises sont prévus selon le périmètre convenu."},
  {title:"Un contrôle humain là où il compte",text:"Les opérations sensibles gardent une étape de validation. Les accès et la maintenance restent identifiés."}],
 steps:["Choisir une tâche fréquente et observer comment elle se passe aujourd’hui.","Vérifier les outils, les autorisations et la qualité des données.","Construire le flux, puis tester les cas normaux comme les erreurs.","Documenter le fonctionnement et suivre les premières exécutions."],
 faqs:[
  ["Quelles tâches peut-on automatiser ?","Par exemple : transférer une demande de formulaire dans un tableur ou un CRM, créer un dossier, synchroniser des informations ou préparer un récapitulatif. La faisabilité dépend de vos outils et de leurs accès."],
  ["Faut-il remplacer mes logiciels ?","Pas nécessairement. J’étudie d’abord ce que permet votre environnement actuel. Les abonnements ou coûts supplémentaires éventuels sont précisés au devis."],
  ["Peut-on garder une validation avant une action ?","Oui. Une étape de contrôle peut précéder un envoi ou une modification sensible. Une automatisation ne doit pas supprimer une vérification nécessaire."],
  ["Que se passe-t-il si un outil change ou tombe en panne ?","L’erreur doit se voir au lieu de passer inaperçue : je prévois une alerte et une reprise manuelle possible. Le suivi après la mise en place est défini au devis."]]},
{id:"cybersecurite",slug:"cybersecurite",
 seoTitle:"Audit de sécurité web pour sites et applications | SmartFixx",
 seoDescription:"Revue de sécurité de votre site ou application dans un périmètre autorisé : points exposés, plan de correction priorisé et validation des correctifs appliqués.",
 related:["developpement","refonte","automatisation"],guide:"preparer-refonte-site-internet",
 number:"05",title:"Audit et sécurisation web",short:"Comprendre les risques. Corriger les priorités.",headline:"La confiance se construit.",accent:"La sécurité aussi.",
 intro:"Je passe en revue la sécurité de vos sites et applications web, dans un périmètre que vous autorisez par écrit. Les constats sont expliqués, les corrections priorisées et leur vérification organisée avec vous.",
 audience:"Pour les entreprises qui veulent faire le point sur les accès, la configuration et les risques de leurs outils web.",
 problem:"La sécurité ne se résume pas au cadenas du navigateur. Elle concerne aussi les comptes, les permissions, les composants, les formulaires et les sauvegardes. Je travaille sur un périmètre écrit, avec les autorisations nécessaires, et je distingue les points urgents des améliorations de fond.",
 deliverables:[
  {title:"Un périmètre et une autorisation écrits",text:"Sites, applications, environnements et limites d’intervention sont définis avant tout contrôle technique."},
  {title:"Une revue des points exposés",text:"Configuration, connexion, autorisations et composants sont examinés selon les accès convenus."},
  {title:"Un plan de correction priorisé",text:"Chaque constat est expliqué avec son impact, la mesure proposée et qui doit la mettre en œuvre."},
  {title:"Une vérification des correctifs",text:"Les changements convenus sont contrôlés. Une revue ne garantit pas l’absence totale de failles."}],
 steps:["Définir le périmètre, les interlocuteurs et l’autorisation écrite.","Examiner les contrôles convenus et documenter les constats.","Prioriser et appliquer les corrections prévues au devis.","Vérifier les correctifs et vous transmettre les points de suivi."],
 faqs:[
  ["Est-ce un test d’intrusion automatique ?","Non. Le formulaire de contact ne lance aucun scan. L’intervention technique est définie après un échange, dans un périmètre explicitement autorisé."],
  ["Pouvez-vous garantir qu’un site ne sera jamais piraté ?","Non. Les risques évoluent avec les logiciels, les usages et les configurations. Mon objectif est de réduire les risques identifiés et de rendre les protections vérifiables."],
  ["Dois-je transmettre mes mots de passe dans le formulaire ?","Non. Le premier échange demande seulement une description du besoin. Si des accès sont nécessaires ensuite, je vous propose un mode de partage adapté."],
  ["Intervenez-vous sur un site que vous n’avez pas développé ?","Oui, si vous en êtes responsable et que vous m’autorisez par écrit à l’examiner. Les éléments hébergés par des tiers ne sont contrôlés qu’avec leur accord."]]},
{id:"seo",slug:"referencement-seo",
 seoTitle:"Référencement naturel SEO local et technique | SmartFixx",
 seoDescription:"Référencement organisé autour de vos offres et de votre zone : structure technique, contenus utiles, liens internes et suivi des résultats réellement observés.",
 related:["refonte","creation","automatisation"],guide:"preparer-refonte-site-internet",
 number:"06",title:"Référencement naturel SEO",short:"Être trouvé pour ce que vous faites vraiment.",headline:"Être visible.",accent:"Pour les bonnes raisons.",
 intro:"J’organise le référencement autour de vos offres, de vos clients et de votre zone d’intervention : structure du site, contenus utiles, liens internes et suivi de l’indexation. Une base cohérente pour développer votre visibilité, locale ou nationale.",
 audience:"Pour les entreprises qui veulent être trouvées sur leurs prestations, et pas seulement sur leur nom.",
 problem:"Un site peut être beau sans répondre aux recherches de vos clients. Je distingue les intentions : chercher une prestation, comparer des solutions, trouver un prestataire proche. Chaque page doit apporter une réponse utile ; multiplier des pages presque identiques par ville ne crée pas cette valeur.",
 deliverables:[
  {title:"Des pages alignées sur vos offres",text:"Chaque prestation a une intention claire, un contenu propre et un chemin logique vers la prise de contact."},
  {title:"Une structure technique propre",text:"Titres, descriptions, URL canoniques, sitemap, exploration et données structurées sont contrôlés."},
  {title:"Une présence locale cohérente",text:"Zones réellement desservies, informations d’entreprise exactes et fiche d’établissement soutiennent le travail local."},
  {title:"Un suivi des résultats observés",text:"Impressions, clics, requêtes et demandes reçues servent à prioriser les améliorations, une fois les outils de suivi raccordés."}],
 steps:["Définir vos prestations prioritaires et les recherches auxquelles répondre.","Repérer les freins techniques et les contenus à travailler.","Publier des pages utiles, reliées entre elles et correctement décrites.","Suivre l’indexation et ajuster à partir des données disponibles."],
 faqs:[
  ["Pouvez-vous garantir la première place sur Google ?","Non. Le classement dépend de nombreux facteurs, dont la concurrence et les systèmes de Google. Je m’engage sur un travail et des livrables, pas sur une position."],
  ["Est-il possible de viser toute la France ?","Oui pour les prestations réalisables à distance. Les recherches nationales sont plus disputées : je conseille de commencer par les prestations et les zones où votre offre est la plus pertinente."],
  ["Le référencement est-il terminé une fois le site publié ?","La publication est un point de départ. L’indexation, les contenus et les performances se suivent dans la durée ; les évolutions se décident à partir des résultats observés, sans délai garanti."],
  ["Faut-il une fiche Google Business Profile ?","Pour une activité locale, c’est souvent le levier le plus direct. Elle se crée à votre nom ; je veille à ce que le site et la fiche donnent les mêmes informations."]]}
];
export const findService=(slug:string)=>services.find(s=>s.slug===slug);
