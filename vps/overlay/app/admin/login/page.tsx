import {redirect} from 'next/navigation';
import {getAdmin} from '@/lib/admin-auth';
import {LoginForm} from './form';
import '../legacy-tokens.css';import '../workspace.css';
export const dynamic='force-dynamic';
export const metadata={title:'Connexion — SmartFixx',robots:{index:false,follow:false}};
const TABS=['overview','requests','analytics','acquisition','emails','campaigns'];
/* Connexion du propriétaire (VPS). ?retour=<onglet> ramène à l'onglet quitté par une session expirée. */
export default async function Login({searchParams}:{searchParams:Promise<{retour?:string}>}){const {retour}=await searchParams;const tab=TABS.includes(retour||'')?retour!:'';if(await getAdmin())redirect(tab&&tab!=='overview'?`/admin?tab=${tab}`:'/admin');return <main className="pn-gate"><div className="pn-gate-top"><a href="/" className="pn-gate-brand" aria-label="SmartFixx, retour au site"><img src="/smartfixx-logo.webp" width="40" height="40" alt=""/><span>SmartFixx</span></a><a href="/" className="pn-link">Retour au site</a></div><section className="pn-gate-card" aria-labelledby="pn-gate-title"><p className="pn-eyebrow">Administration</p><h1 id="pn-gate-title" className="pn-gate-title">Votre espace. Vos demandes.</h1><p className="pn-gate-text">{tab?'Votre session a expiré ou n’est pas ouverte. Reconnectez-vous pour reprendre là où vous en étiez.':'Connectez-vous pour retrouver vos demandes et vos campagnes.'}</p><LoginForm tab={tab}/></section><div className="pn-gate-city" aria-hidden="true"><span/><span/><span className="is-on"/><span/><span/><span/><span className="is-on"/><span/></div></main>}
