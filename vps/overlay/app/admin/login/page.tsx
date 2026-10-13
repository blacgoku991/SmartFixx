import {redirect} from 'next/navigation';
import {getAdmin} from '@/lib/admin-auth';
import {Brand} from '@/components/brand';
import {LoginForm} from './form';
import '../legacy-tokens.css';import '../admin.css';
export const dynamic='force-dynamic';
export const metadata={title:'Connexion — SmartFixx',robots:{index:false,follow:false}};
export default async function Login(){if(await getAdmin())redirect('/admin');return <main className="admin-gate"><div className="admin-gate-brand"><Brand/><a href="/">Retour au site</a></div><section className="admin-login-card"><p className="eyebrow">SMARTFIXX / ADMINISTRATION</p><h1>Votre espace.<br/><em>Vos opportunités.</em></h1><p>Connectez-vous pour retrouver vos demandes et vos campagnes.</p><LoginForm/></section></main>}
