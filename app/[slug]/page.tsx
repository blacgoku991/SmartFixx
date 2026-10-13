import { notFound } from "next/navigation";
import { ServicePage } from "@/components/service-page";
import { AcquisitionPage } from "@/components/acquisition-page";
import { services,findService } from "@/lib/services";
import { pageMeta } from "@/lib/seo";
/* GELÉ après le lot 0. Création et refonte → AcquisitionPage (lot 2) ; les 4 autres prestations →
   ServicePage (lot 3). Titres et descriptions : seoTitle et seoDescription de lib/services.ts. */
export function generateStaticParams(){return services.map(s=>({slug:s.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const s=findService((await params).slug);if(!s)return {};return pageMeta(s.seoTitle,s.seoDescription,`/${s.slug}`);}
export default async function Page({params}:{params:Promise<{slug:string}>}){const s=findService((await params).slug);if(!s)notFound();if(s.id==="creation"||s.id==="refonte")return <AcquisitionPage service={s.id}/>;return <ServicePage service={s}/>;}
