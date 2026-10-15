/* Redirections permanentes (308) des anciennes URL du site « Signal », source de vérité unique.
   Lue par vps/overlay/next.config.ts (production) et par next.config.ts à la racine (variante Sites).
   Règles (plan « redirections ») :
   - une entrée = une ancienne URL qui a un équivalent RÉEL sur le site actuel ; sinon 404 assumée ;
   - jamais vers l'accueil, jamais de chaîne (une destination n'est la source d'aucune autre entrée) ;
   - aucune source ne doit être une page servie aujourd'hui (tests/legacy-redirects.test.mjs) ;
   - rien dans Nginx ni dans proxy.ts : Next applique ces règles avant le proxy, garde la requête (?utm_…)
     et répond par une Location relative.
   Avant la mise en ligne : croiser avec l'export Search Console du propriétaire (Pages → Introuvable (404)
   et Pages indexées) ; les URL du site encore antérieur restent inconnues tant que cet export manque.
   Ce module ne doit rien importer : next.config.ts le charge hors du bundler (pas d'alias « @/ »). */
export type LegacyRedirect = { source: string; destination: string; note: string };

const IDF = "/agence-web-ile-de-france";
/* Anciennes pages de villes : redirigées SEULEMENT parce que la page Île-de-France nomme chaque commune
   dans « Communes où j'interviens » (lib/locations.ts, liste à valider par le propriétaire). Une commune
   retirée de cette liste doit être retirée d'ici dans le même commit : elle passe en 404 assumée. */
const CITY_NOTE = "Ancienne page de ville ; la commune est nommée sur la page Île-de-France (liste à valider).";

export const legacyRedirects: ReadonlyArray<LegacyRedirect> = [
  // Ancienne URL de la politique de confidentialité (site Signal, 404 aujourd'hui) : même contenu.
  { source: "/politique-de-confidentialite", destination: "/confidentialite", note: "Même contenu sous l'URL actuelle." },
  // Même intention de recherche : création de site en Île-de-France.
  { source: "/creation-site-internet-ile-de-france", destination: IDF, note: "Même intention : création de site en Île-de-France." },
  // Liste des zones : la page cible nomme départements et communes.
  { source: "/zones-desservies", destination: IDF, note: "Liste des zones ; la cible nomme départements et communes." },
  // Anciennes pages départementales : chaque département est cité sur la cible. Hauts-de-Seine : à
  // trancher AVANT la mise en ligne (une vraie page départementale ? une 308 reste en cache navigateur).
  { source: "/agence-web-hauts-de-seine", destination: IDF, note: "Département cité sur la cible ; page dédiée éventuelle à décider avant la mise en ligne." },
  { source: "/agence-web-paris", destination: IDF, note: "Paris est cité sur la cible." },
  { source: "/agence-web-seine-saint-denis", destination: IDF, note: "La Seine-Saint-Denis est citée sur la cible." },
  { source: "/agence-web-val-d-oise", destination: IDF, note: "Le Val-d'Oise est cité sur la cible." },
  // Anciennes pages de villes (12) : condition de citation ci-dessus.
  { source: "/creation-site-internet-clichy", destination: IDF, note: CITY_NOTE },
  { source: "/creation-site-internet-levallois-perret", destination: IDF, note: CITY_NOTE },
  { source: "/creation-site-internet-courbevoie", destination: IDF, note: CITY_NOTE },
  { source: "/creation-site-internet-colombes", destination: IDF, note: CITY_NOTE },
  { source: "/creation-site-internet-bois-colombes", destination: IDF, note: CITY_NOTE },
  { source: "/creation-site-internet-gennevilliers", destination: IDF, note: CITY_NOTE },
  { source: "/creation-site-internet-nanterre", destination: IDF, note: CITY_NOTE },
  { source: "/creation-site-internet-boulogne-billancourt", destination: IDF, note: CITY_NOTE },
  { source: "/creation-site-internet-neuilly-sur-seine", destination: IDF, note: CITY_NOTE },
  { source: "/creation-site-internet-issy-les-moulineaux", destination: IDF, note: CITY_NOTE },
  { source: "/creation-site-internet-saint-ouen-sur-seine", destination: IDF, note: CITY_NOTE },
  { source: "/creation-site-internet-argenteuil", destination: IDF, note: "Ancienne page de ville (Val-d'Oise) ; la commune est nommée sur la page Île-de-France (liste à valider)." },
];

/* Forme attendue par redirects() de next.config (Next et vinext) : 308, paramètres de requête conservés. */
export function nextRedirects() {
  return legacyRedirects.map((r) => ({ source: r.source, destination: r.destination, permanent: true as const }));
}
