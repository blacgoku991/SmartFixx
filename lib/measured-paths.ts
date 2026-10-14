/* Chemins mesurés et services reconnus par la mesure d'audience, SANS contenu éditorial.
   Importé par le composant client AudienceMeasurement, rendu sur toutes les pages : tout ce que ce
   fichier importe part dans le JS de chaque page. Il ne doit donc importer ni lib/services, ni
   lib/locations, ni lib/guides (titres, textes, FAQ : environ 11 Ko gzip mesurés au tour 3 du lot 0).
   lib/analytics-config.ts le réutilise côté serveur (validation de /api/analytics, libellés du panel).
   Les slugs doivent rester ÉGAUX à ceux de lib/services.ts, lib/locations.ts et lib/guides.ts, et
   serviceIds aux clés de serviceLabels : tests/measured-paths.test.mjs le vérifie. Un lot qui ajoute,
   renomme ou retire une page de service, de ville ou de conseil met ces listes à jour dans le même commit. */
export const serviceIds=['creation','refonte','developpement','automatisation','cybersecurite','seo','emailing','conseil'] as const;
export const serviceSlugs=['creation-site-internet','refonte-site-internet','developpement-sur-mesure','automatisation-informatique','cybersecurite','referencement-seo'] as const;
export const locationSlugs=['agence-web-ile-de-france','creation-site-internet-asnieres-sur-seine','agence-web-france'] as const;
export const guideSlugs=['preparer-refonte-site-internet','automatiser-suivi-demandes-clients','preparer-campagne-emailing-b2b'] as const;
export const staticMeasuredPaths=['/','/services','/prospection-emailing','/solutions','/methode','/tarifs','/garanties','/contact','/diagnostic','/conseils','/confidentialite','/mentions-legales'] as const;
export const measuredPaths:readonly string[]=[...staticMeasuredPaths,...serviceSlugs.map(s=>`/${s}`),...locationSlugs.map(s=>`/${s}`),...guideSlugs.map(s=>`/conseils/${s}`)];
export const isMeasuredPath=(path:string)=>measuredPaths.includes(path);
export const isServiceId=(value:unknown):value is (typeof serviceIds)[number]=>typeof value==='string'&&(serviceIds as readonly string[]).includes(value);
