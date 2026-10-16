import {redirect} from 'next/navigation';
import {emailDestination} from '@/lib/email-destination';
import type {Metadata} from 'next';
import Link from 'next/link';
import {Brand} from '@/components/brand';
import {EmailAction} from '@/components/email-action';
import {Skyline} from '@/components/sx/ambient';
import {resolveEmailToken,isSuppressed} from '@/lib/email-campaign';
import './email-action.css';
/* Pages des liens d'email (lot 9) : comportement inchangé.
   - noindex, nofollow, sans référent ; Disallow /email/ dans robots.txt.
   - interest → 307 vers emailDestination(campagne), même si le jeton est invalide.
   - stop et preferences : jeton vérifié côté serveur, action confirmée par POST /api/email/action.
   - jeton invalide ou action inconnue : 200 noindex, repli « mailto STOP ».
   Présentation seulement : jetons --sx- (email-action.css), plus d'import de legacy-tokens.css. La ville
   du fond est statique (pas de MotionGate ici : aucune animation). */
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Votre échange avec SmartFixx',robots:{index:false,follow:false},referrer:'no-referrer'};
export default async function EmailPage({params}:{params:Promise<{action:string;token:string}>}){const{action,token}=await params;if(action==='interest'){let campaign;try{campaign=(await resolveEmailToken(token,'interest'))?.campaign}catch{}redirect(emailDestination(campaign))}let valid=false,done=false,unavailable=false;try{if(action==='stop'||action==='preferences'){const r=await resolveEmailToken(token,action,true);if(r){valid=true;done=action==='preferences'?!!r.tracking_revoked_at:await isSuppressed(r.email)}}}catch{unavailable=true}
 return <main className="email-action-page">
  <div className="email-action-city" aria-hidden="true"><Skyline seed={7} depth={false}/></div>
  <header className="email-action-head"><Brand/><Link href="/" className="email-action-home">Découvrir SmartFixx<span aria-hidden="true">{"\u00A0"}↗</span></Link></header>
  {valid?<EmailAction action={action as 'stop'|'preferences'} token={token} initialDone={done}/>:<section className="email-action-card" aria-labelledby="email-action-titre"><span className="email-action-window is-off" aria-hidden="true"/><p className="email-action-kicker">SmartFixx · Votre email</p><h1 id="email-action-titre">{unavailable?'Un instant, s’il vous plaît.':'Ce lien n’est plus disponible.'}</h1><p className="email-action-text">{unavailable?'Réessayez dans un instant.':'Il peut être incomplet ou arrivé à échéance.'} Pour ne plus recevoir de prospection, écrivez-nous avec l’objet STOP depuis l’adresse concernée.</p><div className="email-action-actions"><a className="sx-btn sx-btn--primary email-action-button" href="mailto:contact@smartfixx.fr?subject=STOP"><span>Demander l’arrêt des emails</span></a></div></section>}
  <footer className="email-action-foot"><Link href="/confidentialite">Confidentialité</Link><a href="mailto:contact@smartfixx.fr">contact@smartfixx.fr</a></footer>
 </main>;
}
