import {services} from './services';
import {locations} from './locations';
import {guides} from './guides';
import {measuredPaths} from './measured-paths';
/* Côté serveur seulement (route /api/analytics, panel) : la liste des chemins vient de lib/measured-paths,
   seul fichier que le composant client AudienceMeasurement a le droit d'importer. */
export {measuredPaths};
export const analyticsEvents=['view','service','contact','form_start','lead'] as const;
export const pageLabel=(path:string)=>({'/':'Accueil','/services':'Expertises','/prospection-emailing':'Prospection emailing','/solutions':'Data & fichiers','/methode':'Méthode emailing','/tarifs':'Tarifs emailing','/garanties':'Garanties','/contact':'Contact','/diagnostic':'Diagnostic','/conseils':'Conseils','/confidentialite':'Confidentialité','/mentions-legales':'Mentions légales'}[path]||services.find(s=>`/${s.slug}`===path)?.title||locations.find(l=>`/${l.slug}`===path)?.title||guides.find(g=>`/conseils/${g.slug}`===path)?.title||path);
