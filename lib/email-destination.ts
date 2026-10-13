import {emailServices,type EmailService} from './email-service-links';
import {SITE_URL} from './seo';
import {cleanCampaign} from './project-options';
export const discoveryCta='Découvrir les services';
export function emailDestination(campaign?:string,service?:string|null){
 const url=new URL(service&&Object.hasOwn(emailServices,service)?emailServices[service as EmailService]:'/services',SITE_URL);
 if(campaign){url.searchParams.set('utm_source','smartfixx');url.searchParams.set('utm_medium','email');url.searchParams.set('utm_campaign',cleanCampaign(campaign))}
 return url.toString();
}
export function withCampaign(href:string,campaign:string){
 if(!href.startsWith('/')||href.startsWith('//')||/^\/(?:admin|api|email)(?:\/|\?|$)/.test(href)||cleanCampaign(campaign)==='site')return href;
 const url=new URL(href,SITE_URL);
 if(!url.searchParams.has('utm_campaign')||url.searchParams.get('utm_campaign')==='site')url.searchParams.set('utm_campaign',cleanCampaign(campaign));
 return url.pathname+url.search+url.hash;
}
