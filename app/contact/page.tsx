import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/brand";
import { CampaignFlow } from "@/components/campaign-flow";
import { ProjectForm } from "@/components/project-form";
import { readCampaignConfig } from "@/lib/campaign-config";
import { serviceLabels,type ServiceId } from "@/lib/services";
import { cleanCampaign } from "@/lib/project-options";
import { pageMeta } from "@/lib/seo";
import {CheckCircle2,Mail} from "lucide-react";
export const metadata=pageMeta("Contact & devis pour votre projet digital — SmartFixx","Décrivez votre projet de site, refonte, automatisation, cybersécurité ou prospection. SmartFixx vous accompagne avec une proposition adaptée.","/contact");
export default async function Contact({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const p=await searchParams;const emailing=p.service==="emailing"||(!p.service&&(!!p.plan||!!p.volume));const requested=typeof p.service==="string"&&Object.prototype.hasOwnProperty.call(serviceLabels,p.service)?p.service as ServiceId:"conseil";return <><SiteHeader/><main id="contenu" className="contact-page">{emailing?<CampaignFlow kind="contact" initial={readCampaignConfig(p)}/>:<section className="section general-contact"><div className="container contact-layout"><div className="contact-copy"><p className="eyebrow">LA SUITE COMMENCE PAR UN ÉCHANGE.</p><h1>Votre projet.<br/><span>Notre prochain<br/>chapitre.</span></h1><p>Un site à créer, un outil à simplifier ou une présence à développer ? Donnez-nous le contexte. Nous vous aiderons à préciser le bon périmètre.</p><div className="contact-points"><span><CheckCircle2 size={20}/> Un devis avant tout engagement</span><span><CheckCircle2 size={20}/> Une réponse adaptée à votre besoin</span><span><Mail size={20}/> contact@smartfixx.fr</span></div><img className="contact-mail" src="/mail-sculpture.webp" width="1254" height="1254" alt="" loading="lazy"/></div><div className="contact-form-card"><ProjectForm initialService={requested} campaign={cleanCampaign(p.utm_campaign)}/></div></div></section>}</main><Footer/></>}
