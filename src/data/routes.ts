/**
 * Plan du site : source unique pour le routeur, le pré-rendu, le sitemap et le
 * maillage interne. Ajouter une entrée ici suffit à créer une vraie page HTML
 * statique servie à son URL propre.
 *
 * ⚠️ Pages locales : Google déclasse les « pages satellites » — des pages
 * identiques où seul le nom de la ville change. Chaque page ci-dessous a donc
 * un contenu écrit spécifiquement. N'ajoutez une nouvelle commune que si vous y
 * avez réellement des clients ou une présence, et écrivez-lui un vrai texte.
 */

export type PageKind = "home" | "landing" | "legal" | "city" | "hub" | "zones" | "notFound";

export type RouteDef = {
  path: string;
  kind: PageKind;
  /** Balise <title> — le mot-clé doit être en tête. */
  title: string;
  description: string;
  /** Priorité dans le sitemap. */
  priority: number;
};

import { CITIES, HUBS } from "./cities";

const STATIC_ROUTES: RouteDef[] = [
  {
    path: "/",
    kind: "home",
    title: "Agence web à Asnières-sur-Seine — Sites & automatisation",
    description:
      "Agence web à Asnières-sur-Seine (92600) : création de site internet sur-mesure, refonte et automatisation de vos logiciels métiers. Maquette en 48 h.",
    priority: 1.0,
  },
  {
    path: "/creation-site-internet-asnieres-sur-seine",
    kind: "landing",
    title: "Création de site internet à Asnières-sur-Seine (92600)",
    description:
      "Création de site internet sur-mesure pour les commerces, artisans et PME d'Asnières-sur-Seine. Rendez-vous sur place, livraison en 2 à 3 semaines.",
    priority: 0.9,
  },
  {
    path: "/creation-site-internet-ile-de-france",
    kind: "landing",
    title: "Création de site internet en Île-de-France | SmartFixx",
    description:
      "Création et refonte de site internet en Île-de-France : Hauts-de-Seine, Paris, proche banlieue. Design sur-mesure, SEO local, automatisation.",
    priority: 0.9,
  },
  {
    path: "/refonte-site-internet",
    kind: "landing",
    title: "Refonte de site internet sans perdre son référencement",
    description:
      "Refonte menée sans perte de référencement : audit technique et SEO, plan de redirections 301, migration des données, reprise de la Search Console.",
    priority: 0.8,
  },
  {
    path: "/automatisation-informatique",
    kind: "landing",
    title: "Automatisation informatique & interconnexion de logiciels",
    description:
      "Automatisation des tâches répétitives et interconnexion de vos logiciels métiers, ERP, CRM et tableurs. Fin de la double saisie et des exports manuels.",
    priority: 0.8,
  },
  {
    path: "/mentions-legales",
    kind: "legal",
    title: "Mentions légales | SmartFixx",
    description:
      "Mentions légales de SmartFixx : éditeur du site, identification de l'entreprise, hébergement, propriété intellectuelle et médiation de la consommation.",
    priority: 0.2,
  },
  {
    path: "/politique-de-confidentialite",
    kind: "legal",
    title: "Politique de confidentialité | SmartFixx",
    description:
      "Comment SmartFixx traite vos données personnelles : finalités, base légale, durées de conservation, absence de cookies de suivi et exercice de vos droits RGPD.",
    priority: 0.2,
  },
];

/* Une route par commune : c'est ce qui permet d'être trouvé sur « création site
   internet + <ville> », requête sur laquelle une page unique ne peut rien. */
const CITY_ROUTES: RouteDef[] = CITIES.map((city) => ({
  path: `/creation-site-internet-${city.slug}`,
  kind: "city",
  title: `Création de site internet à ${city.name} (${city.postalCode})`,
  description: `Création de site internet à ${city.name} (${city.postalCode}) : sur-mesure, refonte, automatisation. Basés à Asnières-sur-Seine, ${city.reach}.`,
  priority: 0.8,
}));

/* Hubs départementaux : ils regroupent les communes et captent les requêtes
   « agence web + département », moins précises mais plus volumineuses. */
const HUB_ROUTES: RouteDef[] = HUBS.map((hub) => ({
  path: hub.slug,
  kind: "hub",
  title: hub.title,
  description: hub.description,
  priority: 0.7,
}));

const ZONES_ROUTE: RouteDef = {
  path: "/zones-desservies",
  kind: "zones",
  title: "Zones desservies en Île-de-France | SmartFixx",
  description:
    "Les communes d'Île-de-France où SmartFixx intervient : Hauts-de-Seine, Paris, Seine-Saint-Denis et Val-d'Oise. Une page par commune, avec son tissu économique local.",
  priority: 0.6,
};

/**
 * Page d'erreur. Volontairement hors de `ROUTES` : elle ne doit apparaître ni
 * dans le sitemap, ni dans le maillage interne. Le pré-rendu l'écrit dans
 * `dist/404.html`, que Vercel sert avec un vrai code 404.
 */
export const NOT_FOUND_ROUTE: RouteDef = {
  path: "/404",
  kind: "notFound",
  title: "Page introuvable | SmartFixx",
  description:
    "Cette adresse n'existe pas ou a changé. Retrouvez la création de site internet, la refonte et l'automatisation informatique depuis l'accueil.",
  priority: 0,
};

export const ROUTES: RouteDef[] = [...STATIC_ROUTES, ZONES_ROUTE, ...HUB_ROUTES, ...CITY_ROUTES];

/**
 * Une URL inconnue renvoyait auparavant la route de l'accueil : côté navigateur,
 * une faute de frappe affichait la page d'accueil sans le dire, ce qui empêche
 * de comprendre qu'on s'est trompé.
 */
export const routeFor = (pathname: string): RouteDef => {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return ROUTES.find((route) => route.path === clean) ?? NOT_FOUND_ROUTE;
};
