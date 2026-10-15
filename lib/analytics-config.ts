import {services} from './services';
import {locations} from './locations';
import {guides} from './guides';
import {measuredPaths} from './measured-paths';
/* Côté serveur seulement (route /api/analytics, panel) : la liste des chemins vient de lib/measured-paths,
   seul fichier que le composant client AudienceMeasurement a le droit d'importer. */
export {measuredPaths};
export const analyticsEvents=['view','service','contact','form_start','lead'] as const;
/* Libellés du panel (statistiques), alignés sur les titres de la refonte : plus aucun « Tarifs » (aucun prix
   publié), « Prestations » comme dans la navigation. Une nouvelle route publique s'ajoute ici et dans
   lib/measured-paths.ts. */
export const pageLabel=(path:string)=>({'/':'Accueil','/services':'Prestations','/prospection-emailing':'Prospection emailing','/solutions':'Fichier et audience emailing','/methode':'Méthode emailing','/tarifs':'Formules emailing','/garanties':'Engagements emailing','/contact':'Contact','/diagnostic':'Diagnostic','/conseils':'Conseils','/confidentialite':'Confidentialité','/mentions-legales':'Mentions légales'}[path]||services.find(s=>`/${s.slug}`===path)?.title||locations.find(l=>`/${l.slug}`===path)?.title||guides.find(g=>`/conseils/${g.slug}`===path)?.title||path);
