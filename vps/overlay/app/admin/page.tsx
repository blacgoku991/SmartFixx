import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {getAdmin} from '@/lib/admin-auth';
import {AdminWorkspace} from '@/components/admin-workspace';
/* Copie VPS de app/admin/page.tsx : mêmes imports CSS, mêmes onglets acceptés, mêmes props d'AdminWorkspace.
   Sans session : /admin/login, onglet demandé conservé (?retour=). */
import './legacy-tokens.css';import './admin.css';import './workspace.css';import './sending.css';import './campaigns.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Administration — SmartFixx',robots:{index:false,follow:false}};
export default async function Admin({searchParams}:{searchParams:Promise<{tab?:string}>}){const {tab}=await searchParams;const initialTab=['overview','requests','analytics','acquisition','emails','campaigns'].includes(tab||'')?tab:'overview';const admin=await getAdmin();if(!admin)redirect(initialTab==='overview'?'/admin/login':`/admin/login?retour=${initialTab}`);return <AdminWorkspace name={admin.fullName} initialTab={initialTab}/>}
