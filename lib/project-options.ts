/* Les libellés des anciennes demandes (budget, calendrier), lus par le panel seulement, sont dans
   lib/legacy-request-labels.ts : ce module-ci est chargé par le formulaire public. */
/* cleanCampaign vit dans lib/campaign-href.ts (sans dépendance, importé par CampaignLink) ; réexporté ici. */
export {cleanCampaign} from "./campaign-href";

/* Formulaire court : type de projet (radio) et précision « Autre besoin » (liste native). */
export const projectKinds=[
 {id:"creation",label:"Création",hint:"Un nouveau site"},
 {id:"refonte",label:"Refonte",hint:"Moderniser l’existant"},
 {id:"autre",label:"Autre besoin",hint:"Outil, sécurité, SEO…"},
] as const;
export type ProjectKind=typeof projectKinds[number]["id"];
export const otherNeeds=[
 {id:"developpement",label:"Développement sur mesure"},
 {id:"automatisation",label:"Automatisation"},
 {id:"cybersecurite",label:"Sécurité web"},
 {id:"seo",label:"Référencement SEO"},
 {id:"conseil",label:"Faire le point (conseil)"},
] as const;
export type OtherNeed=typeof otherNeeds[number]["id"];
/* Besoins complémentaires proposés dans « Votre projet touche aussi… ». */
export const extraNeeds=[
 {id:"creation",label:"Création de site"},
 {id:"refonte",label:"Refonte de site"},
 {id:"seo",label:"Référencement SEO"},
 {id:"automatisation",label:"Automatisation"},
 {id:"developpement",label:"Développement sur mesure"},
 {id:"cybersecurite",label:"Sécurité web"},
 {id:"emailing",label:"Prospection emailing"},
] as const;

/* Site actuel : « monsite.fr » → « https://monsite.fr ». Un schéma explicite (javascript:, data:, ftp:…)
   est conservé tel quel pour être refusé ; « hôte:port » n'est pas pris pour un schéma. */
export function completeWebsiteUrl(value:string){
 const v=value.trim();if(!v)return "";
 if(v.startsWith("//"))return "https:"+v;
 const hasScheme=/^[a-z][a-z0-9+.-]*:/i.test(v)&&!/^[^/:]+:\d+(\/|$)/.test(v);
 return hasScheme?v:"https://"+v;
}
export function isWebsiteUrl(value:string){
 if(value.length>500||!/^https?:\/\//i.test(value))return false;
 try{const u=new URL(value);return (u.protocol==="https:"||u.protocol==="http:")&&u.hostname.includes(".")&&!u.username&&!u.password;}catch{return false;}
}

export const CONTACT_REQUIRED="Indiquez un email ou un téléphone.";
/* Messages français FIXES par champ (jamais la valeur saisie). Partagés par l'API (400 détaillé) et le
   formulaire (validation identique avant l'envoi). */
export const fieldMessages:Record<string,string>={
 service:"Choisissez le type de projet.",
 name:"Indiquez votre nom (2 caractères au moins).",
 activity:"Décrivez votre activité en 120 caractères au plus.",
 company:"Indiquez le nom de l’entreprise (2 à 150 caractères).",
 email:"Indiquez une adresse email valide, par exemple nom@domaine.fr.",
 phone:"Indiquez un numéro de téléphone valide, par exemple 06 12 34 56 78.",
 websiteUrl:"Indiquez une adresse de site valide, par exemple monsite.fr.",
 message:"Vérifiez la longueur de votre message (3 000 caractères au plus).",
 consent:"Cochez la case d’accord pour que je puisse vous recontacter.",
 requestedServices:"Vérifiez les besoins complémentaires cochés.",
 campaign:"Le lien de campagne est invalide : rechargez la page.",
 city:"Vérifiez la ville indiquée.",
 budget:"Vérifiez le budget indiqué.",
 timeline:"Vérifiez le calendrier indiqué.",
 audience:"Vérifiez l’audience choisie.",
 source:"Vérifiez la source des contacts.",
 volume:"Vérifiez le volume choisi.",
 plan:"Vérifiez la formule choisie.",
};
