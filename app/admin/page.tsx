import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, ArrowUpRight, ShieldCheck } from "lucide-react";
import { getAdmin } from "@/lib/admin-auth";
import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { AdminWorkspace } from "@/components/admin-workspace";
/* Imports CSS, onglets acceptés et props d'AdminWorkspace : à reporter À L'IDENTIQUE dans
   vps/overlay/app/admin/page.tsx. legacy-tokens.css reste importé jusqu'au lot 10. */
import "./legacy-tokens.css";
import "./admin.css";
import "./workspace.css";
import "./sending.css";
import "./campaigns.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Administration — SmartFixx",robots:{index:false,follow:false}};
export default async function AdminPage({searchParams}:{searchParams:Promise<{tab?:string}>}){
 const query=await searchParams;const initialTab=["overview","requests","analytics","acquisition","emails","campaigns"].includes(query.tab||"")?query.tab:"overview";
 let admin=null;let unavailable=false;const user=await getChatGPTUser();
 try{admin=await getAdmin();}catch{unavailable=true;}
 if(admin)return <AdminWorkspace name={admin.fullName||"Mohamed"} initialTab={initialTab}/>;
 return <main className="pn-gate"><div className="pn-gate-top"><Link href="/" className="pn-gate-brand" aria-label="SmartFixx, retour au site"><img src="/smartfixx-logo.webp" width="40" height="40" alt=""/><span>SmartFixx</span></Link><Link href="/" className="pn-link">Retour au site <ArrowUpRight size={16} aria-hidden="true"/></Link></div><section className="pn-gate-card" aria-labelledby="pn-gate-title"><span className="pn-gate-lock" aria-hidden="true"><LockKeyhole size={26}/></span><p className="pn-eyebrow">Administration</p><h1 id="pn-gate-title" className="pn-gate-title">Votre espace. Vos demandes.</h1><p className="pn-gate-text">{unavailable?"L’espace administrateur est momentanément indisponible. Réessayez dans un instant.":user?"Ce compte n’est pas autorisé à accéder à l’administration. Utilisez le compte ChatGPT propriétaire de ce site.":"Connectez-vous avec le compte ChatGPT propriétaire de ce site pour consulter les demandes et leur suivi."}</p>{!user?<a className="pn-btn pn-btn--primary pn-btn--block" href={chatGPTSignInPath(initialTab!=="overview"?`/admin?tab=${initialTab}`:"/admin")} target="_top">Se connecter avec ChatGPT <ArrowUpRight size={18} aria-hidden="true"/></a>:unavailable?<Link className="pn-btn pn-btn--primary pn-btn--block" href="/admin">Réessayer</Link>:<a className="pn-btn pn-btn--ghost pn-btn--block" href={chatGPTSignOutPath("/admin")} target="_top">Changer de compte</a>}<p className="pn-gate-note"><ShieldCheck size={16} aria-hidden="true"/> Accès réservé au propriétaire</p></section><div className="pn-gate-city" aria-hidden="true"><span/><span/><span className="is-on"/><span/><span/><span/><span className="is-on"/><span/></div></main>;
}
