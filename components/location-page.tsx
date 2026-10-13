import Link from "@/components/campaign-link";
import { ArrowUpRight, MapPin, Check } from "lucide-react";
import { SiteHeader } from "./site-header";
import { Footer } from "./brand";
import { NextStep } from "./next-step";
import { JsonLd } from "./json-ld";
import { breadcrumb } from "@/lib/seo";
import { locations } from "@/lib/locations";
export function LocationPage({location:l}:{location:typeof locations[number]}){return <><SiteHeader/><main id="contenu"><JsonLd data={breadcrumb([{name:l.title,path:`/${l.slug}`}])}/><section className="location-hero"><div className="container"><p className="eyebrow">SMARTFIXX / {l.title.toUpperCase()}</p><h1>{l.headline}<br/><em>{l.accent}</em></h1><p>{l.intro}</p><Link href={`/contact?service=${l.service}`} className="button button-primary">Décrire mon projet <ArrowUpRight size={20}/></Link><div className="location-foot"><MapPin size={19}/>{l.cities}</div></div></section><section className="section location-content"><div className="container">{l.sections.map((s,i)=><article key={s.title}><span>0{i+1}</span><div><h2>{s.title}</h2><p>{s.text}</p></div></article>)}</div></section><section className="section location-offers"><div className="container"><div><p className="eyebrow">LE BON POINT DE DÉPART.</p><h2>De quoi avez-vous<br/><span>besoin aujourd’hui ?</span></h2></div><div>{[["Créer ou moderniser un site","/creation-site-internet"],["Simplifier une tâche répétitive","/automatisation-informatique"],["Travailler la visibilité locale","/referencement-seo"],["Prospecter une audience B2B","/prospection-emailing"]].map(([label,href])=><Link href={href} key={href}><Check size={19}/>{label}<ArrowUpRight size={19}/></Link>)}</div></div></section><NextStep/></main><Footer/></>}
