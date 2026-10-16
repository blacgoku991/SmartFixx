import {redirect} from 'next/navigation';
import {getAdmin} from '@/lib/admin-auth';
import {AdminTransfer} from '@/components/admin-transfer';
import '../legacy-tokens.css';import '../admin.css';import '../workspace.css';
export const dynamic='force-dynamic';
export const metadata={title:'Transfert VPS — SmartFixx',robots:{index:false,follow:false}};
/* Export chiffré de migration : page conservée telle quelle (fonction et adresse), seulement remise au
   design. Son retrait ou son renommage dans la variante VPS attend la décision du propriétaire. */
export default async function Transfer(){if(!await getAdmin())redirect('/admin');return <main className="pn-gate pn-gate--wide"><div className="pn-gate-top"><a href="/admin" className="pn-link">← Retour au panel</a></div><section className="pn-gate-card pn-gate-card--wide" aria-labelledby="pn-gate-title"><p className="pn-eyebrow">Migration des données</p><h1 id="pn-gate-title" className="pn-gate-title">Transférer votre activité.</h1><AdminTransfer/></section></main>}
