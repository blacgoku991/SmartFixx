"use client";
import Link from "@/components/campaign-link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu } from "lucide-react";
import { Brand } from "@/components/brand";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
const nav=[["Expertises","/services"],["Emailing","/prospection-emailing"],["Île-de-France","/agence-web-ile-de-france"],["Conseils","/conseils"]];
export function SiteHeader(){const pathname=usePathname();return <><a className="skip-link" href="#contenu">Aller au contenu</a><header className="site-header"><div className="container header-inner"><Brand/><nav className="desktop-nav" aria-label="Navigation principale">{nav.map(([label,href])=><Link href={href} key={href} aria-current={pathname===href?"page":undefined}>{label}</Link>)}</nav><Link href="/contact" className="button button-small header-cta">Parlons de votre projet <ArrowUpRight size={17}/></Link><Sheet><SheetTrigger asChild><button className="mobile-menu" aria-label="Ouvrir le menu"><Menu size={24}/></button></SheetTrigger><SheetContent className="mobile-sheet"><SheetTitle>SmartFixx</SheetTitle><nav aria-label="Navigation mobile">{[["Accueil","/"],...nav,["Contact","/contact"]].map(([label,href])=><SheetClose asChild key={href}><Link href={href} aria-current={pathname===href?"page":undefined}>{label}<ArrowUpRight size={20}/></Link></SheetClose>)}</nav></SheetContent></Sheet></div></header></>}
