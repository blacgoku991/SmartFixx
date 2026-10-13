import { volumes, type Audience, type DataSource, type PlanId } from "./offers";
import { cleanCampaign } from "./project-options";
export type CampaignConfig={audience:Audience;source:DataSource;volume:number;plan:PlanId;campaign?:string};
export function readCampaignConfig(params:Record<string,string|string[]|undefined>):CampaignConfig{
 return {campaign:cleanCampaign(params.utm_campaign),audience:params.audience==="b2c"?"b2c":"b2b",source:params.source==="included"?"included":"client",volume:volumes.includes(Number(params.volume) as typeof volumes[number])?Number(params.volume):10000,plan:params.plan==="essentiel"||params.plan==="performance"?params.plan:"acceleration"};
}
export function campaignHref(path:"/tarifs"|"/contact",config:CampaignConfig){return `${path}?${new URLSearchParams({audience:config.audience,source:config.source,volume:String(config.volume),plan:config.plan,service:"emailing",utm_campaign:config.campaign||"site"})}`;}
