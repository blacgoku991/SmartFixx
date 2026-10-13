import Link from "@/components/campaign-link";
import { ArrowUpRight } from "lucide-react";
export function NextStep(){return <section className="next-step"><div className="container next-step-inner"><div><p className="eyebrow">VOTRE PROCHAIN CHAPITRE COMMENCE ICI.</p><h2>Et si on passait<br/><span>à la suite ?</span></h2><Link href="/contact" className="button">Parlons de votre projet <ArrowUpRight size={21}/></Link></div><img src="/mail-sculpture.webp" width="1254" height="1254" alt="" loading="lazy"/></div></section>}
