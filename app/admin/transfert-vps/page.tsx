import {redirect} from 'next/navigation';
import {getAdmin} from '@/lib/admin-auth';
import {AdminTransfer} from '@/components/admin-transfer';
import '../legacy-tokens.css';import '../admin.css';import '../workspace.css';
export const dynamic='force-dynamic';
export const metadata={title:'Transfert VPS — SmartFixx',robots:{index:false,follow:false}};
export default async function Transfer(){if(!await getAdmin())redirect('/admin');return <main className="section" style={{paddingTop:100,maxWidth:900,margin:'auto'}}><a href="/admin">Retour au panel</a><h1>Transférer votre activité.</h1><AdminTransfer/></main>}
