'use client';
/* Réglages d'envoi, en parcours guidé : 1. compte SMTP, 2. relais et clé, 3. vérifications, 4. cadence.
   Corps INCHANGÉS envoyés à /api/admin/smtp : save {action, revision, config{…, intervalSeconds:1/ratePerSecond,
   ratePerSecond, …}}, cadence {action, revision, ratePerSecond, providerMaxRate, maxConnections, dailyLimit},
   verify, pair, dns. Confirmation conservée avant le renouvellement de la clé du relais. La cadence se saisit
   en « secondes entre deux emails » ou en « emails par seconde » : la valeur envoyée reste ratePerSecond.
   L'avertissement « relais v3 » n'apparaît que si la cadence dépasse 1 email par seconde. */
import {sendingRate} from '@/lib/campaign-sending-config';
import {SmtpErrorDetail} from './campaign-terminal';
import {useState,type FormEvent,type ReactNode} from 'react';
import {Check,Copy,Download,KeyRound,LockKeyhole,RefreshCw,Save,ShieldCheck} from 'lucide-react';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from './ui/select';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogCancel,AlertDialogFooter} from './ui/alert-dialog';
import {campaignApi,humanDate,type SenderState} from './campaign-api';
import {cadenceLabel,cadencePerDay} from './admin-panel/format';

function Step({n,title,done,status,children}:{n:number;title:string;done:boolean;status:string;children:ReactNode}){
 return <section className={`pn-smtp-step${done?' is-done':''}`} aria-labelledby={`pn-smtp-step-${n}`}>
  <div className="pn-smtp-step-head"><span className="pn-step-num" aria-hidden="true">{done?<Check size={16}/>:n}</span><h3 id={`pn-smtp-step-${n}`} className="pn-h3"><span className="pn-sr">Étape {n} : </span>{title}</h3><span className={`pn-state ${done?'pn-state--ok':'pn-state--todo'}`}><i aria-hidden="true"/>{status}</span></div>
  <div className="pn-smtp-step-body">{children}</div>
 </section>
}
const round=(n:number,d=2)=>Math.round(n*10**d)/10**d;

export function AdminSmtpSettings({state,onRefresh}:{state:SenderState;onRefresh:()=>void}){const initial={host:'',port:587 as 465|587|2525,user:'',fromName:'Mohamed — SmartFixx',fromEmail:'contact@smartfixx.fr',replyTo:'contact@smartfixx.fr',intervalSeconds:30,dailyLimit:100,dkimSelector:'',dkimMode:'provider' as 'provider'|'local',...(state.config||{}),ratePerSecond:state.config?.ratePerSecond||1/(state.config?.intervalSeconds||30),providerMaxRate:state.config?.providerMaxRate||null,maxConnections:state.config?.maxConnections||20,password:'',dkimPrivateKey:''};const [form,setForm]=useState(initial),[revision,setRevision]=useState(state.revision),[busy,setBusy]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[pairToken,setPairToken]=useState(''),[confirmPair,setConfirmPair]=useState(false),[last,setLast]=useState(0);
 const[unit,setUnit]=useState<'interval'|'rate'>(initial.ratePerSecond<1?'interval':'rate'),[rateText,setRateText]=useState(String(initial.ratePerSecond<1?round(1/initial.ratePerSecond):round(initial.ratePerSecond,3)));
 async function act(action:'save'|'verify'|'pair'|'dns'|'cadence'){setBusy(action);setLast(({save:1,pair:2,verify:3,dns:3,cadence:4} as const)[action]);setError('');setNotice('');try{const payload=action==='cadence'?{action,revision,ratePerSecond:form.ratePerSecond,providerMaxRate:form.providerMaxRate,maxConnections:form.maxConnections,dailyLimit:form.dailyLimit}:action==='save'?{action,revision,config:{host:form.host,port:form.port,user:form.user,password:form.password,fromName:form.fromName,fromEmail:form.fromEmail,replyTo:form.replyTo,intervalSeconds:1/form.ratePerSecond,ratePerSecond:form.ratePerSecond,providerMaxRate:form.providerMaxRate,maxConnections:form.maxConnections,dailyLimit:form.dailyLimit,dkimSelector:form.dkimSelector,dkimMode:form.dkimMode,dkimPrivateKey:form.dkimPrivateKey}}:{action};const data=await campaignApi<SenderState & {token?:string}>('/api/admin/smtp',payload);if(action==='cadence'){setRevision(data.revision);setNotice('Cadence enregistrée. Les prochaines transmissions suivent ce réglage ; les emails déjà en cours peuvent se terminer.')}else if(action==='save'){setRevision(data.revision);setForm({...form,password:'',dkimPrivateKey:''});setNotice('Réglages enregistrés et secrets chiffrés. Les campagnes actives sont mises en pause ; testez la connexion avant de reprendre.')}else if(action==='pair'){setPairToken(data.token||'');setConfirmPair(false);setNotice('Clé générée. Copiez-la dans le fichier .env du relais ; elle ne sera plus affichée après fermeture.')}else if(action==='verify')setNotice('Test demandé. Le relais vérifiera la connexion TLS et les identifiants, sans envoyer de message.');else setNotice('Lecture DNS terminée. Ces contrôles constatent des enregistrements ; ils ne valident pas encore la signature d’un email réel.');onRefresh()}catch(e){setError(e instanceof Error?e.message:'Opération impossible.')}finally{setBusy('')}}
 async function copy(){try{await navigator.clipboard.writeText(pairToken);setNotice('Clé copiée. Conservez-la uniquement dans le .env du relais.')}catch{setError('La copie automatique est indisponible. Sélectionnez la clé affichée.')}}
 /* Saisie de la cadence : le texte suit la frappe, ratePerSecond n'est mis à jour que pour une valeur > 0. */
 function changeRate(text:string){setRateText(text);const n=Number(text.replace(',','.'));if(Number.isFinite(n)&&n>0)setForm({...form,ratePerSecond:unit==='interval'?1/n:n})}
 function changeUnit(next:'interval'|'rate'){setUnit(next);setRateText(String(next==='interval'?round(1/form.ratePerSecond):round(form.ratePerSecond,3)))}
 const rate=sendingRate(form);
 const needsV3=rate>1&&state.runnerVersion!=='3';
 const verifyLabel=({ok:'Validée',error:'À corriger',checking:'Test en attente',untested:'À tester',unconfigured:'À configurer'} as Record<string,string>)[state.verifyStatus]||'À tester';
 /* Le message s'affiche dans l'étape de l'action qui l'a produit (visible sans défiler). */
 const message=(n:number)=>last===n&&(error||notice)?<p className={error?'pn-alert pn-alert--error':'pn-alert pn-alert--success'} role={error?'alert':'status'}>{error||notice}</p>:null;
 const dnsOk=(['spf','dkim','dmarc'] as const).every(k=>state.dns?.[k]==='present');
 return <div className="pn-smtp">
 <ol className="pn-smtp-steps">
 <li><Step n={1} title="Votre compte d’envoi" done={state.configured} status={state.configured?'Enregistré':'À renseigner'}>
  <form onSubmit={(e:FormEvent)=>{e.preventDefault();void act('save')}} className="pn-form">
   <p className="pn-muted">Renseignez ces paramètres une fois. Le relais gère ensuite les envois automatiquement.</p>
   <div className="pn-fields pn-fields--2">
    <label className="pn-field">Serveur SMTP<input className="pn-input" required value={form.host} onChange={e=>setForm({...form,host:e.target.value})} placeholder="smtp.votre-fournisseur.fr" maxLength={253}/></label>
    <div className="pn-field"><span className="pn-label" id="pn-smtp-port">Port sécurisé</span><Select value={String(form.port)} onValueChange={v=>setForm({...form,port:Number(v) as 465|587|2525})}><SelectTrigger className="pn-select" aria-labelledby="pn-smtp-port"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="587">587 · STARTTLS obligatoire</SelectItem><SelectItem value="465">465 · TLS direct</SelectItem><SelectItem value="2525">2525 · STARTTLS obligatoire</SelectItem></SelectContent></Select></div>
    <label className="pn-field">Identifiant SMTP<input className="pn-input" required value={form.user} autoComplete="off" onChange={e=>setForm({...form,user:e.target.value})} maxLength={254}/></label>
    <label className="pn-field">Mot de passe<input className="pn-input" type="password" autoComplete="new-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder={state.config?.passwordSaved?'Enregistré · vide pour conserver':'Mot de passe SMTP'} maxLength={2000}/></label>
    <label className="pn-field">Nom de l’expéditeur<input className="pn-input" required value={form.fromName} onChange={e=>setForm({...form,fromName:e.target.value})} maxLength={100}/></label>
    <label className="pn-field">Adresse d’expédition<input className="pn-input" required type="email" value={form.fromEmail} onChange={e=>setForm({...form,fromEmail:e.target.value})} maxLength={254}/></label>
    <label className="pn-field pn-span-2">Adresse des réponses<input className="pn-input" required type="email" value={form.replyTo} onChange={e=>setForm({...form,replyTo:e.target.value})} maxLength={254}/></label>
   </div>
   <details className="pn-disclosure"><summary>Signature DKIM et contrôle du domaine</summary><div className="pn-disclosure-body"><div className="pn-fields pn-fields--2"><div className="pn-field"><span className="pn-label" id="pn-smtp-dkim">Signature DKIM</span><Select value={form.dkimMode} onValueChange={v=>setForm({...form,dkimMode:v as 'provider'|'local'})}><SelectTrigger className="pn-select" aria-labelledby="pn-smtp-dkim"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="provider">Gérée par mon fournisseur</SelectItem><SelectItem value="local">Signer avec ma clé DKIM</SelectItem></SelectContent></Select></div><label className="pn-field">Sélecteur DKIM<input className="pn-input" value={form.dkimSelector} onChange={e=>setForm({...form,dkimSelector:e.target.value})} placeholder="Ex. : selector1" maxLength={63}/></label></div>{form.dkimMode==='local'&&<label className="pn-field">Clé privée DKIM <small className="pn-help">RSA 2048 bits minimum · chiffrée à l’enregistrement</small><textarea className="pn-input pn-textarea pn-input--mono" rows={5} value={form.dkimPrivateKey} onChange={e=>setForm({...form,dkimPrivateKey:e.target.value})} placeholder={state.config?.dkimKeySaved?'Clé enregistrée · vide pour conserver':'-----BEGIN PRIVATE KEY-----'} maxLength={12000}/></label>}<p className="pn-hint">La clé publique correspondante doit être publiée dans le DNS. Si votre fournisseur signe les emails, vérifiez qu’il signe aussi les en-têtes de désinscription.</p></div></details>
   <div className="pn-actions"><button type="submit" className="pn-btn pn-btn--primary" disabled={!!busy}><Save size={18} aria-hidden="true"/>{busy==='save'?'Enregistrement…':'Enregistrer les réglages'}</button><p className="pn-hint"><LockKeyhole size={16} aria-hidden="true"/> Les secrets enregistrés ne sont jamais renvoyés au navigateur.</p></div>
   {message(1)}
  </form>
 </Step></li>

 <li><Step n={2} title="Le relais et sa clé" done={state.runnerConnected} status={state.runnerConnected?(state.runnerVersion?'Relais v'+state.runnerVersion+' connecté':'Relais connecté'):state.runnerPaired?'Clé générée, relais hors ligne':'Hors ligne'}>
  <p className="pn-muted">Le relais effectue les envois, même quand le panel est fermé. Il contacte uniquement votre panel en HTTPS et votre serveur SMTP : aucun port entrant n’est à ouvrir. Dernier contact : {humanDate(state.runnerSeenAt)}.</p>
  <details className="pn-disclosure" open={!state.runnerConnected}><summary>{state.runnerConnected?'Installation et mise à jour du relais':'Connecter mon VPS'}</summary><div className="pn-disclosure-body"><ol className="pn-ol"><li>Téléchargez le relais v3. Si le relais est déjà installé, utilisez le script de mise à jour pour conserver la clé et les reçus.</li><li>Générez une clé de liaison et ajoutez-la dans son fichier <code>.env</code>.</li><li>Démarrez le relais, puis testez votre connexion SMTP à l’étape 3.</li></ol><div className="pn-actions"><a href="/downloads/SmartFixx-relais-SMTP.zip" download className="pn-btn pn-btn--ghost"><Download size={18} aria-hidden="true"/>Télécharger le relais + guide</a><a href="/downloads/SmartFixx-mettre-a-jour-relais.sh" download className="pn-btn pn-btn--ghost"><Download size={18} aria-hidden="true"/>Script de mise à jour v3</a></div></div></details>
  <div className="pn-actions"><button type="button" className="pn-btn pn-btn--ghost" disabled={!!busy} onClick={()=>state.runnerPaired?setConfirmPair(true):void act('pair')}><KeyRound size={18} aria-hidden="true"/>{state.runnerPaired?'Renouveler la clé de liaison':'Générer la clé de liaison'}</button></div>
  {pairToken&&<label className="pn-field">Votre clé · affichée une seule fois<span className="pn-copy-row"><input className="pn-input pn-input--mono" readOnly value={pairToken} aria-label="Clé de liaison du relais" onFocus={e=>e.currentTarget.select()}/><button type="button" className="pn-btn pn-btn--ghost" onClick={copy}><Copy size={18} aria-hidden="true"/>Copier la clé</button></span></label>}
  {message(2)}
 </Step></li>

 <li><Step n={3} title="Les vérifications" done={state.verifyStatus==='ok'} status={`SMTP : ${verifyLabel}${dnsOk?' · DNS présent':''}`}>
  <div className="pn-checks"><div><span>Connexion SMTP</span><strong className={state.verifyStatus==='ok'?'pn-positive':undefined}>{verifyLabel}</strong></div>{(['spf','dkim','dmarc'] as const).map(k=><div key={k}><span>{k.toUpperCase()}</span><strong className={state.dns?.[k]==='present'?'pn-positive':undefined}>{state.dns?.[k]==='present'?'Enregistrement présent':state.dns?.[k]==='selector_required'?'Sélecteur à préciser':state.dns?.[k]?'À vérifier':'Non vérifié'}</strong></div>)}</div>
  {state.verifyError&&<SmtpErrorDetail error={state.verifyErrorCode||'REJECTED'} diagnostic={state.verifyDiagnostic}/>}
  <div className="pn-actions"><button type="button" disabled={!!busy||!state.configured} className="pn-btn pn-btn--ghost" onClick={()=>void act('verify')}><RefreshCw size={18} aria-hidden="true"/>{busy==='verify'?'Demande…':'Tester la connexion SMTP'}</button><button type="button" disabled={!!busy||!state.configured} className="pn-btn pn-btn--ghost" onClick={()=>void act('dns')}><ShieldCheck size={18} aria-hidden="true"/>{busy==='dns'?'Vérification…':'Contrôler SPF, DKIM et DMARC'}</button></div>
  {!state.configured&&<p className="pn-hint">Enregistrez d’abord votre compte d’envoi (étape 1).</p>}
  {message(3)}
  <p className="pn-hint">DNS vérifié le {humanDate(state.dnsCheckedAt)}. L’authentification complète doit être vérifiée dans les en-têtes d’un email test reçu. La boîte de réception n’est jamais garantie.</p>
 </Step></li>

 <li><Step n={4} title="La cadence d’envoi" done={state.configured} status={cadenceLabel(rate)}>
  <p className="pn-cadence-now"><strong>{cadenceLabel(rate)}</strong><span>{cadencePerDay(rate)} · plafond du panel : {form.dailyLimit.toLocaleString('fr-FR')} par jour</span></p>
  <div className="pn-fields pn-fields--2">
   <div className="pn-field"><span className="pn-label" id="pn-rate-unit">Exprimer la cadence en</span><Select value={unit} onValueChange={v=>changeUnit(v as 'interval'|'rate')}><SelectTrigger className="pn-select" aria-labelledby="pn-rate-unit"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="interval">Secondes entre deux emails</SelectItem><SelectItem value="rate">Emails par seconde</SelectItem></SelectContent></Select></div>
   <label className="pn-field">{unit==='interval'?'Secondes entre deux emails':'Emails par seconde'}<input className="pn-input" type="number" inputMode="decimal" min={unit==='interval'?0.001:1/3600} max={unit==='interval'?3600:1000} step="any" value={rateText} onChange={e=>changeRate(e.target.value)}/></label>
   <label className="pn-field">Limite du fournisseur · emails / seconde<input className="pn-input" type="number" min={1/3600} max={1000} step="any" placeholder="Ex. : 14 pour votre compte SES" value={form.providerMaxRate??""} onChange={e=>setForm({...form,providerMaxRate:e.target.value?Number(e.target.value):null})}/><small className="pn-help">Le quota autorisé dans votre compte. La cadence appliquée ne le dépasse jamais.</small></label>
   <label className="pn-field">Connexions simultanées<input className="pn-input" type="number" min={1} max={50} value={form.maxConnections} onChange={e=>setForm({...form,maxConnections:Number(e.target.value)})}/></label>
   <label className="pn-field pn-span-2">Plafond quotidien du panel<input className="pn-input" type="number" min={1} max={10000000} value={form.dailyLimit} onChange={e=>setForm({...form,dailyLimit:Number(e.target.value)})}/><small className="pn-help">Journée UTC · tests et contrôles compris.</small></label>
  </div>
  {needsV3&&<p className="pn-alert pn-alert--warning">Plus d’un email par seconde demande le relais v3. Installez la mise à jour proposée à l’étape 2 avant d’envoyer.</p>}
  <p className="pn-hint">Le débit réellement accepté est visible dans les résultats. AWS applique aussi son quota sur 24 heures glissantes.</p>
  <div className="pn-actions"><button type="button" className="pn-btn pn-btn--primary" disabled={!!busy||!state.configured} onClick={()=>void act("cadence")}>{busy==='cadence'?'Enregistrement…':'Enregistrer la cadence'}</button>{!state.configured&&<p className="pn-hint">Disponible une fois le compte d’envoi enregistré.</p>}</div>
  {message(4)}
 </Step></li>
 </ol>
 <AlertDialog open={confirmPair} onOpenChange={setConfirmPair}><AlertDialogContent className="pn-dialog"><AlertDialogTitle className="pn-dialog-title">Renouveler la clé du relais ?</AlertDialogTitle><AlertDialogDescription className="pn-muted">L’ancienne clé cessera de fonctionner. Les campagnes seront mises en pause jusqu’à la reconnexion du relais. Un message déjà transmis peut se terminer.</AlertDialogDescription><AlertDialogFooter className="pn-dialog-actions"><AlertDialogCancel className="pn-btn pn-btn--ghost">Conserver la clé</AlertDialogCancel><button type="button" className="pn-btn pn-btn--danger" disabled={!!busy} onClick={()=>void act('pair')}>Renouveler la clé</button></AlertDialogFooter></AlertDialogContent></AlertDialog></div>
}
