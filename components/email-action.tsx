'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowRight,CheckCircle2,LoaderCircle,ShieldCheck} from 'lucide-react';
import {postJson} from '@/lib/fetch-json';
/* STOP et préférences de mesure (pages /email/stop|preferences/<jeton>). Comportement inchangé : un seul
   POST /api/email/action {action, token, consent:true} ; l'état « fait » n'est affiché qu'après une réponse
   2xx du serveur. Textes juridiques inchangés (sauf accord du propriétaire). Client défensif (postJson ne
   lève jamais) : réseau coupé, réponse HTML ou JSON illisible donnent un message français, avec le repli
   STOP par email. Boutons de 44 px au moins (sx-btn : 48 px). */
const MAILTO_STOP='mailto:contact@smartfixx.fr?subject=STOP';
function failure(kind:string,status:number,data:unknown){
 const server=data&&typeof data==='object'&&'error' in data&&typeof (data as {error:unknown}).error==='string'?(data as {error:string}).error:'';
 if(kind==='network')return 'Connexion impossible. Vérifiez votre connexion internet puis réessayez.';
 if(kind==='invalid-json')return 'Le service a renvoyé une réponse inattendue. Réessayez dans un instant.';
 if(server&&status<500)return server;
 if(status===403)return 'La demande n’a pas pu être vérifiée. Rechargez la page puis réessayez.';
 return 'L’action n’a pas abouti. Réessayez dans un instant.';
}
export function EmailAction({action,token,initialDone}:{action:'stop'|'preferences';token:string;initialDone:boolean}){
 const[done,setDone]=useState(initialDone),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(){
  if(busy)return;
  setBusy(true);setError('');
  const r=await postJson<{ok?:boolean}>('/api/email/action',{action,token,consent:true});
  if(r.ok)setDone(true);else setError(failure(r.kind,r.status,r.data));
  setBusy(false);
 }
 const stop=action==='stop';
 return <section className="email-action-card" data-state={done?'done':'pending'} aria-labelledby="email-action-titre">
  <span className={`email-action-window${done?(stop?' is-off':' is-done'):''}`} aria-hidden="true"><span className="email-action-icon">{done?<CheckCircle2 size={26}/>:<ShieldCheck size={26}/>}</span></span>
  <p className="email-action-kicker">SmartFixx · {stop?'Prospection par email':'Mesure des emails'}</p>
  <h1 id="email-action-titre">{done?(stop?'Vous êtes désinscrit.':'La mesure est désactivée.'):(stop?'Arrêter la prospection.':'Vous gardez la main.')}</h1>
  <p className="email-action-text" aria-live="polite">{done?(stop?'Votre adresse est ajoutée à notre liste d’exclusion. Le suivi des ouvertures et des clics est également retiré.':'Les prochaines ouvertures et les prochains clics ne seront plus mesurés pour votre adresse. Les mesures précédentes sont supprimées.'):(stop?'Confirmez pour ne plus recevoir de prospection SmartFixx à l’adresse associée à cet email. Aucun compte ni formulaire à remplir.':'Vous pouvez retirer votre accord à la mesure des ouvertures et des clics. Ce choix conserve la possibilité de recevoir nos emails ; le lien « Stop prospection » permet de les arrêter.')}</p>
  <div className="email-action-actions">
   {!done?<button type="button" className="sx-btn sx-btn--primary email-action-button" onClick={submit} disabled={busy} aria-busy={busy||undefined}>{busy?<LoaderCircle className="spin sx-btn-icon" aria-hidden="true"/>:null}<span>{busy?'Enregistrement…':stop?'Confirmer l’arrêt':'Désactiver la mesure'}</span></button>
   :<Link className="sx-btn sx-btn--ghost email-action-button" href="/services"><span>Découvrir SmartFixx</span><ArrowRight className="sx-btn-icon" aria-hidden="true"/></Link>}
  </div>
  {error?<div className="email-action-error" role="alert"><p className="form-error">{error}</p><p className="email-action-fallback">{stop?<>Vous pouvez aussi <a href={MAILTO_STOP}>demander l’arrêt des emails par email</a>, avec l’objet STOP, depuis l’adresse concernée.</>:<>Vous pouvez aussi écrire à <a href="mailto:contact@smartfixx.fr">contact@smartfixx.fr</a> depuis l’adresse concernée.</>}</p></div>:null}
 </section>
}
