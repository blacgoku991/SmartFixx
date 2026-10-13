import {redirect} from 'next/navigation';
import {emailDestination} from '@/lib/email-destination';
import type {Metadata} from 'next';
import Link from 'next/link';
import {Brand} from '@/components/brand';
import {EmailAction} from '@/components/email-action';
import {resolveEmailToken,isSuppressed} from '@/lib/email-campaign';
import './email-action.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Votre échange avec SmartFixx',robots:{index:false,follow:false},referrer:'no-referrer'};
export default async function EmailPage({params}:{params:Promise<{action:string;token:string}>}){const{action,token}=await params;if(action==='interest'){let campaign;try{campaign=(await resolveEmailToken(token,'interest'))?.campaign}catch{}redirect(emailDestination(campaign))}let valid=false,done=false,unavailable=false;try{if(action==='stop'||action==='preferences'){const r=await resolveEmailToken(token,action,true);if(r){valid=true;done=action==='preferences'?!!r.tracking_revoked_at:await isSuppressed(r.email)}}}catch{unavailable=true}
 return <main className="email-action-page"><header><Brand/><Link href="/">Découvrir SmartFixx ↗</Link></header>{valid?<EmailAction action={action as 'stop'|'preferences'} token={token} initialDone={done}/>:<section className="email-action-card"><p className="eyebrow">SMARTFIXX · VOTRE EMAIL</p><h1>{unavailable?'Un instant, s’il vous plaît.':'Ce lien n’est plus disponible.'}</h1><p>{unavailable?'Réessayez dans un instant.':'Il peut être incomplet ou arrivé à échéance.'} Pour ne plus recevoir de prospection, écrivez-nous avec l’objet STOP depuis l’adresse concernée.</p><a className="button button-primary" href="mailto:contact@smartfixx.fr?subject=STOP">Demander l’arrêt des emails</a></section>}<footer><Link href="/confidentialite">Confidentialité</Link><a href="mailto:contact@smartfixx.fr">contact@smartfixx.fr</a></footer></main>;
}
