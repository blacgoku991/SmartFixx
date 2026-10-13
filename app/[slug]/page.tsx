import { notFound } from "next/navigation";
import { ServicePage } from "@/components/service-page";
import { services,findService } from "@/lib/services";
import { pageMeta } from "@/lib/seo";
export function generateStaticParams(){return services.map(s=>({slug:s.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const s=findService((await params).slug);if(!s)return {};return pageMeta(`${s.title} pour les entreprises — SmartFixx`,s.intro.slice(0,160),`/${s.slug}`);}
export default async function Page({params}:{params:Promise<{slug:string}>}){const s=findService((await params).slug);if(!s)notFound();return <ServicePage service={s}/>;}
