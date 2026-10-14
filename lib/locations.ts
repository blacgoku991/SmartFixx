/* Pages locales (lot 4) : Asnières-sur-Seine, Île-de-France, France à distance.
   Ce fichier ne porte que les données partagées : slug, libellé, titre et description SEO (table du champ
   « pages » du plan), et les listes de communes. Le contenu éditorial de chaque page vit dans son composant
   (components/local/*) : trois pages distinctes, pas un gabarit dont on remplace le nom de ville.
   Consommateurs : app/sitemap.ts (slug), lib/analytics-config.ts (title = libellé du panel),
   lib/measured-paths.ts (slugs recopiés, vérifiés par tests/measured-paths.test.mjs). */
export type LocationSlug='agence-web-ile-de-france'|'creation-site-internet-asnieres-sur-seine'|'agence-web-france';
export type Location={slug:LocationSlug;title:string;seoTitle:string;seoDescription:string};
export const locations:Location[]=[
  {slug:'agence-web-ile-de-france',title:'Agence web en Île-de-France',
   seoTitle:'Agence web en Île-de-France : communes et modalités | SmartFixx',
   seoDescription:'Création et refonte de sites pour artisans, commerces et PME d’Île-de-France, des Hauts-de-Seine à Paris : communes desservies, rendez-vous et contact simple.'},
  {slug:'creation-site-internet-asnieres-sur-seine',title:'Création de site à Asnières-sur-Seine',
   seoTitle:'Création de site et agence web à Asnières-sur-Seine | SmartFixx',
   seoDescription:'Création et refonte de site internet à Asnières-sur-Seine (92) : un seul interlocuteur, rendez-vous possible, site lisible sur mobile et devis simple.'},
  {slug:'agence-web-france',title:'Création de site à distance en France',
   seoTitle:'Création de site internet à distance en France | SmartFixx',
   seoDescription:'Création, refonte ou automatisation à distance pour les entreprises en France : étapes de validation claires, échanges regroupés et livrables définis au devis.'},
];
export function getLocation(slug:LocationSlug):Location{
  const l=locations.find(x=>x.slug===slug);
  if(!l) throw new Error(`Page locale inconnue : ${slug}`);
  return l;
}
/* Communes citées sur /agence-web-ile-de-france : EXACTEMENT les 12 communes visées par les redirections 308
   des anciennes pages de villes (lot 7, lib/legacy-redirects.ts), plus Asnières-sur-Seine, et les 4
   départements visés par les anciennes pages départementales. validated:false : liste PROPOSÉE, à valider
   par le propriétaire avant la mise en ligne (décision n° 4). Une commune retirée ici = retirer sa 308
   (404 assumée), jamais une redirection vers l'accueil. Noms en traits d'union ASCII (recherche, grep). */
export const ILE_DE_FRANCE_ZONE={
  communes:['Asnières-sur-Seine','Clichy','Levallois-Perret','Courbevoie','Colombes','Bois-Colombes','Gennevilliers','Nanterre','Boulogne-Billancourt','Neuilly-sur-Seine','Issy-les-Moulineaux','Saint-Ouen-sur-Seine','Argenteuil'] as string[],
  departments:['Hauts-de-Seine','Paris','Seine-Saint-Denis','Val-d’Oise'] as string[],
  validated:false,
};
/* Département de chaque commune citée (numéro affiché sur la page Île-de-France). */
export const COMMUNE_DEPARTMENT:Record<string,'92'|'93'|'95'>={
  'Asnières-sur-Seine':'92',Clichy:'92','Levallois-Perret':'92',Courbevoie:'92',Colombes:'92','Bois-Colombes':'92',Gennevilliers:'92',Nanterre:'92','Boulogne-Billancourt':'92','Neuilly-sur-Seine':'92','Issy-les-Moulineaux':'92','Saint-Ouen-sur-Seine':'93',Argenteuil:'95',
};
/* Communes voisines citées sur la page Asnières-sur-Seine (texte et schéma indicatif). validated:false :
   proposition à valider par le propriétaire (décision n° 4). Villeneuve-la-Garenne n'a pas d'ancienne page
   (aucune 308). */
export const ASNIERES_NEIGHBOURS={
  communes:['Bois-Colombes','Colombes','Gennevilliers','Villeneuve-la-Garenne','Clichy','Levallois-Perret','Courbevoie'] as string[],
  validated:false,
};
