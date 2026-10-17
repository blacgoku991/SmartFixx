import {emailServices,type EmailService} from './email-service-links';
import {SITE_URL} from './seo';
import {cleanCampaign} from './campaign-href';
export const discoveryCta='Découvrir les services';
export function emailDestination(campaign?:string,service?:string|null){
 const url=new URL(service&&Object.hasOwn(emailServices,service)?emailServices[service as EmailService]:'/services',SITE_URL);
 if(campaign){url.searchParams.set('utm_source','smartfixx');url.searchParams.set('utm_medium','email');url.searchParams.set('utm_campaign',cleanCampaign(campaign))}
 return url.toString();
}
/* withCampaign vit dans lib/campaign-href.ts (module client sans dépendance) ; réexporté ici pour les appels existants. */
export {withCampaign} from './campaign-href';
