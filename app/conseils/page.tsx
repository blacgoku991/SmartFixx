import Link from "@/components/campaign-link";
import {ArrowUpRight} from "lucide-react";
import {SiteHeader} from "@/components/site-header";
import {Footer} from "@/components/brand";
import {guides} from "@/lib/guides";
import {pageMeta} from "@/lib/seo";
export const metadata=pageMeta("Conseils web, automatisation & prospection — SmartFixx","Des guides concrets pour préparer une refonte, organiser le suivi de vos demandes et lancer votre prospection B2B.","/conseils");
export default function Guides(){return <><SiteHeader/><main id="contenu"><section className="container expertise-directory-hero"><p className="eyebrow">DES REPÈRES POUR MIEUX DÉCIDER.</p><h1>Avant de construire,<br/><span>comprendre.</span></h1><p>Des conseils concrets pour préparer votre projet et poser les bonnes questions.</p></section><section className="container guides-grid">{guides.map((g,i)=><Link href={`/conseils/${g.slug}`} key={g.slug}><div className={`guide-cover cover-${i}`} aria-hidden="true"><span>0{i+1}</span><ArrowUpRight size={60} strokeWidth={1}/></div><p className="eyebrow">{g.category}</p><h2>{g.title}</h2><p>{g.description}</p><span className="text-link">Lire le guide <ArrowUpRight size={18}/></span></Link>)}</section></main><Footer/></>}
