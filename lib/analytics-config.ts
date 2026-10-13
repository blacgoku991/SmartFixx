import {services} from './services';
import {locations} from './locations';
import {guides} from './guides';
export const measuredPaths=['/','/services','/prospection-emailing','/solutions','/methode','/tarifs','/garanties','/contact','/diagnostic','/conseils','/confidentialite','/mentions-legales',...services.map(s=>`/${s.slug}`),...locations.map(l=>`/${l.slug}`),...guides.map(g=>`/conseils/${g.slug}`)];
export const analyticsEvents=['view','service','contact','form_start'] as const;
export const pageLabel=(path:string)=>({'/':'Accueil','/services':'Expertises','/prospection-emailing':'Prospection emailing','/solutions':'Data & fichiers','/methode':'Méthode emailing','/tarifs':'Tarifs emailing','/garanties':'Garanties','/contact':'Contact','/diagnostic':'Diagnostic','/conseils':'Conseils','/confidentialite':'Confidentialité','/mentions-legales':'Mentions légales'}[path]||services.find(s=>`/${s.slug}`===path)?.title||locations.find(l=>`/${l.slug}`===path)?.title||guides.find(g=>`/conseils/${g.slug}`===path)?.title||path);
