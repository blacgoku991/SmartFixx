import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/brand";
import { CampaignFlow } from "@/components/campaign-flow";
import { Faq } from "@/components/faq";
import { readCampaignConfig } from "@/lib/campaign-config";
export const metadata:Metadata={title:"Tarifs de prospection emailing — SmartFixx Reach",description:"Configurez votre campagne de 5 000 à 50 000 emails. Trois formules, professionnels ou particuliers, avec votre fichier ou de la data ciblée.",alternates:{canonical:"/tarifs"}};
export default async function Pricing({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const config=readCampaignConfig(await searchParams);return <><SiteHeader/><main id="contenu" className="pricing-page"><CampaignFlow kind="pricing" initial={config} key={JSON.stringify(config)}/><Faq/></main><Footer/></>}
