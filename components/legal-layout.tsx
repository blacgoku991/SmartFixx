import { Footer } from "@/components/brand";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
export function LegalLayout({title, eyebrow, children}: {title:string;eyebrow:string;children:React.ReactNode}) {
  return <><SiteHeader/><main id="contenu" className={`legal-page ${eyebrow==="NOS GARANTIES"?"guarantees-page":""}`}><div className="container legal-intro"><p className="eyebrow">{eyebrow} / SMARTFIXX REACH</p><h1>{title}</h1>{eyebrow==="NOS GARANTIES"&&<div className="guarantees-seal"><ShieldCheck size={44}/><span>UN CADRE CLAIR.<br/><strong>Avant le premier envoi.</strong></span></div>}</div><div className="container legal-body"><aside className="legal-side"><span>EN TOUTE CLARTÉ</span><p>Des conditions lisibles, des choix éclairés et une équipe à votre écoute.</p><Link href="/contact" className="text-link">Une question ? <ArrowUpRight size={18}/></Link></aside><div className="legal-main">{children}</div></div></main><Footer/></>;
}
