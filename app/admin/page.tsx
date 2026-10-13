import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { getAdmin } from "@/lib/admin-auth";
import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { AdminWorkspace } from "@/components/admin-workspace";
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
 return <main className="admin-gate"><div className="admin-gate-brand"><Brand/><Link href="/" className="text-link">Retour au site <ArrowUpRight size={17}/></Link></div><div className="admin-login-card"><span className="login-lock"><LockKeyhole size={35}/></span><p className="eyebrow">SMARTFIXX / ADMINISTRATION</p><h1>Votre espace.<br/><em>Vos opportunités.</em></h1><p>{unavailable?"L’espace administrateur est momentanément indisponible. Réessayez dans un instant.":user?"Ce compte n’est pas autorisé à accéder à l’administration. Utilisez le compte ChatGPT propriétaire de ce site.":"Connectez-vous avec le compte ChatGPT propriétaire de ce site pour consulter les demandes et leur suivi."}</p>{!user?<a className="button button-primary full-width" href={chatGPTSignInPath(initialTab!=="overview"?`/admin?tab=${initialTab}`:"/admin")} target="_top">Se connecter avec ChatGPT <ArrowUpRight size={19}/></a>:unavailable?<a className="button button-primary full-width" href="/admin">Réessayer</a>:<a className="button button-outline full-width" href={chatGPTSignOutPath("/admin")} target="_top">Changer de compte</a>}<div className="login-note"><ShieldCheck size={16}/> Accès réservé au propriétaire</div></div></main>;
}
