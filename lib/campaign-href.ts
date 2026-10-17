/* Paramètre de campagne des liens internes (utm_campaign), sans aucune dépendance.
   CampaignLink, composant client rendu par chaque page publique (en-tête, pied, cartes), n'importe que ce
   module : il tirait auparavant lib/project-options (libellés de budget du panel, messages du formulaire) et
   lib/email-destination, donc lib/seo et lib/site-identity, soit environ 2,8 Ko gzip de JavaScript inutile
   dans le morceau partagé de toutes les pages. Les deux anciens modules réexportent ces fonctions.
   La base d'URL ne sert qu'à l'analyse : le résultat est toujours un chemin relatif (pathname, requête, ancre). */
export function cleanCampaign(value:unknown){return typeof value==="string"&&/^[a-zA-Z0-9_-]{1,80}$/.test(value)?value:"site";}
const PARSE_BASE="https://campagne.invalid";
export function withCampaign(href:string,campaign:string){
 if(!href.startsWith('/')||href.startsWith('//')||/^\/(?:admin|api|email)(?:\/|\?|$)/.test(href)||cleanCampaign(campaign)==='site')return href;
 const url=new URL(href,PARSE_BASE);
 if(!url.searchParams.has('utm_campaign')||url.searchParams.get('utm_campaign')==='site')url.searchParams.set('utm_campaign',cleanCampaign(campaign));
 return url.pathname+url.search+url.hash;
}
