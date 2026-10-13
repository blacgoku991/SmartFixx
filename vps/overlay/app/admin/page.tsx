import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {getAdmin} from '@/lib/admin-auth';
import {AdminWorkspace} from '@/components/admin-workspace';
import './legacy-tokens.css';import './admin.css';import './workspace.css';import './sending.css';import './campaigns.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Administration — SmartFixx',robots:{index:false,follow:false}};
export default async function Admin({searchParams}:{searchParams:Promise<{tab?:string}>}){const admin=await getAdmin();if(!admin)redirect('/admin/login');const {tab}=await searchParams;return <AdminWorkspace name={admin.fullName} initialTab={['overview','requests','analytics','acquisition','emails','campaigns'].includes(tab||'')?tab:'overview'}/>}
