'use client';
/* Panel (lot 6) : Désinscriptions & emails. La liste STOP passe en premier (compte, ajout manuel, export
   CSV en un clic) ; l'export manuel d'un email personnalisé est replié en niveau secondaire (« Un bel
   email… », texte testé, reste dans le HTML initial). Appels inchangés : GET /api/admin/email-campaigns
   (page, campaign), POST {action:'recipient',…} et {action:'suppress', email}, GET et PATCH
   {action:'mark_sent'} sur /api/admin/email-campaigns/[id], CSV /api/admin/email-suppressions. Aperçu en
   iframe sandbox="" referrerPolicy="no-referrer". Actualisation toutes les 60 s, seulement onglet ouvert. */
import {useCallback,useEffect,useState,type FormEvent} from 'react';
import {ArrowDownToLine,ArrowUpRight,Check,Copy,Eye,Mail,MousePointer2,RefreshCw,Send,ShieldCheck,UserCheck,UserMinus,X} from 'lucide-react';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from './ui/sheet';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from './ui/select';
import {StateError,StateLoading} from './sx/states';
import {panelApi,errorText} from './admin-panel/api';
import {fmt} from './admin-panel/format';
type Recipient={id:string;campaign:string;email:string;company:string;name:string;sent_at:number|null;tracking_consent:number;tracking_revoked_at:number|null;first_open_at:number|null;first_click_at:number|null;interested_at:number|null;unsubscribed_at:number|null;suppressed?:number;source?:string;consent_proof?:string};
type Report={recipients:Recipient[];total:number;page:number;summary:{prepared:number;sent:number;opened:number;clicked:number;interested:number;stopped:number};campaigns:{campaign:string;prepared:number}[];suppressions:{email:string;created_at:number;reason:string}[];suppressionTotal:number};
type Detail={managedCampaign?:boolean;recipient:Recipient;subject:string;html:string;text:string;previewHtml:string;headers:Record<string,string>};
const date=(v:number|null)=>v?new Date(v).toLocaleString('fr-FR',{timeZone:'Europe/Paris',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'—';
function download(content:string,name:string,type='text/html'){const url=URL.createObjectURL(new Blob([content],{type:`${type};charset=utf-8`})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
/* Même contrat que l'ancien json() : GET sans corps, POST ou PATCH JSON ; message français en cas d'échec. */
const json=<T=Record<string,unknown>,>(url:string,body?:unknown,method:'POST'|'PATCH'='POST')=>panelApi<T>(url,body,method);
export function AdminEmailCampaigns({onInbox,onCampaigns}:{onInbox:()=>void;onCampaigns?:()=>void}){
 const[report,setReport]=useState<Report|null>(null),[campaign,setCampaign]=useState('all'),[page,setPage]=useState(1),[refresh,setRefresh]=useState(0),[selected,setSelected]=useState<string|null>(null),[detail,setDetail]=useState<Detail|null>(null),[detailError,setDetailError]=useState(''),[detailLoading,setDetailLoading]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[formError,setFormError]=useState(''),[stopEmail,setStopEmail]=useState(''),[stopBusy,setStopBusy]=useState(false),[stopNotice,setStopNotice]=useState(''),[stopError,setStopError]=useState(''),[copyNotice,setCopyNotice]=useState('');
 const[form,setForm]=useState({campaign:'publicite_b2b_01',email:'',name:'',company:'',source:'',trackingConsent:false,consentProof:''});
 /* Chargement dérivé de la clé de requête (aucun setState synchrone dans l'effet). */
 const key=`${page}|${campaign}|${refresh}`;
 const[loaded,setLoaded]=useState<{key:string;error:string}|null>(null);
 const loading=loaded?.key!==key,error=loaded?.key===key?loaded.error:'';
 useEffect(()=>{const abort=new AbortController(),current=key;panelApi<Report>(`/api/admin/email-campaigns?page=${page}${campaign==='all'?'':`&campaign=${encodeURIComponent(campaign)}`}`,undefined,'POST',abort.signal).then(j=>{if(!abort.signal.aborted){setReport(j);setLoaded({key:current,error:''})}}).catch(e=>{if(!abort.signal.aborted)setLoaded({key:current,error:errorText(e,'Chargement impossible.')})});return()=>abort.abort()},[key,page,campaign]);
 useEffect(()=>{const timer=setInterval(()=>setRefresh(v=>v+1),60000);return()=>clearInterval(timer)},[]);
 const loadDetail=useCallback(async(id:string)=>{setDetailLoading(true);setDetail(null);setDetailError('');setCopyNotice('');try{setDetail(await json<Detail>(`/api/admin/email-campaigns/${id}`))}catch(e){setDetailError(e instanceof Error?e.message:'Email indisponible.')}finally{setDetailLoading(false)}},[]);
 useEffect(()=>{if(selected)void loadDetail(selected)},[selected,loadDetail]);
 async function prepare(e:FormEvent){e.preventDefault();setBusy(true);setFormError('');setNotice('');try{const r=await json<{id:string}>('/api/admin/email-campaigns',{action:'recipient',...form});setCampaign('all');setPage(1);setRefresh(v=>v+1);setSelected(r.id);setForm({...form,email:'',name:'',company:'',source:'',trackingConsent:false,consentProof:''});setNotice('Email personnalisé préparé. Exportez-le pour ce destinataire uniquement.')}catch(e){setFormError(e instanceof Error?e.message:'Préparation impossible.')}finally{setBusy(false)}}
 async function suppress(e:FormEvent){e.preventDefault();setStopBusy(true);setStopError('');setStopNotice('');try{await json('/api/admin/email-campaigns',{action:'suppress',email:stopEmail});setStopEmail('');setStopNotice('Adresse exclue. Pensez à reporter le STOP dans votre outil d’envoi.');setRefresh(v=>v+1)}catch(e){setStopError(e instanceof Error?e.message:'Exclusion impossible.')}finally{setStopBusy(false)}}
 async function copy(text:string){try{await navigator.clipboard.writeText(text);setCopyNotice('Copié dans le presse-papiers.')}catch{setCopyNotice('Copie indisponible : sélectionnez le texte ou téléchargez le fichier.')}}
 async function exportFresh(kind:'html'|'text'){if(!selected)return;setBusy(true);setDetailError('');try{const d=await json<Detail>(`/api/admin/email-campaigns/${selected}`);setDetail(d);download(d[kind],`SmartFixx-${d.recipient.campaign}-${selected.slice(0,8)}.${kind==='html'?'html':'txt'}`,kind==='html'?'text/html':'text/plain')}catch(e){setDetailError(e instanceof Error?e.message:'Export indisponible.');setDetail(null)}finally{setBusy(false)}}
 async function markSent(){if(!selected)return;setBusy(true);setDetailError('');try{await json(`/api/admin/email-campaigns/${selected}`,{action:'mark_sent'},'PATCH');await loadDetail(selected);setRefresh(v=>v+1)}catch(e){setDetailError(e instanceof Error?e.message:'Enregistrement impossible.')}finally{setBusy(false)}}
 const metrics=[{label:'Désinscriptions',key:'stopped',icon:UserMinus,note:'Adresses exclues de cette sélection'},{label:'Emails préparés',key:'prepared',icon:Mail,note:'Fichiers individuels · 12 mois'},{label:'Envois enregistrés',key:'sent',icon:Send,note:'Déclarations ou acceptations SMTP'},{label:'Ouvertures détectées',key:'opened',icon:Eye,note:'Adresses distinctes · avec accord · 90 j'},{label:'Clics détectés',key:'clicked',icon:MousePointer2,note:'Adresses distinctes · avec accord · 90 j'},{label:'Anciens intérêts',key:'interested',icon:UserCheck,note:'Confirmations du parcours précédent'}] as const;
 const first=loading&&!report;
 return <div className="pn-screen" aria-busy={first||undefined}>
 <header className="pn-head"><div className="pn-head-text"><p className="pn-eyebrow">Obligations d’envoi</p><h1 className="pn-title">Désinscriptions & emails</h1><p className="pn-lead">Chaque STOP est respecté, puis vos emails préparés et leurs suites.</p></div><div className="pn-controls"><button type="button" className="pn-btn pn-btn--ghost" disabled={loading} onClick={()=>setRefresh(v=>v+1)}><RefreshCw size={18} aria-hidden="true" className={loading?'pn-spin':undefined}/><span>Actualiser</span></button></div></header>
 {error&&<StateError message={report?`${error} Les dernières données reçues restent affichées.`:error} onRetry={()=>setRefresh(v=>v+1)}/>}

 <section id="stop" className="pn-card pn-stop" aria-labelledby="pn-stop-title">
  <div className="pn-stop-main">
   <p className="pn-kicker">La liste d’exclusion</p>
   <h2 id="pn-stop-title" className="pn-h2"><ShieldCheck size={22} aria-hidden="true"/>Chaque STOP est respecté.</h2>
   <p className="pn-stop-count"><strong>{report?fmt(report.suppressionTotal):'–'}</strong><span>{report&&report.suppressionTotal>1?'adresses exclues':'adresse exclue'}</span></p>
   <a href="/api/admin/email-suppressions" download className="pn-btn pn-btn--primary"><ArrowDownToLine size={18} aria-hidden="true"/>Exporter toutes les exclusions CSV</a>
   <p className="pn-muted">Les liens de désinscription ajoutent automatiquement l’adresse ici et bloquent les prochaines préparations et exportations. Ajoutez aussi les demandes STOP reçues par réponse.</p>
   <form onSubmit={suppress} className="pn-form"><label className="pn-label" htmlFor="manual-stop">Email à exclure</label><div className="pn-inline-form"><input className="pn-input" id="manual-stop" type="email" required maxLength={254} placeholder="adresse@entreprise.fr" value={stopEmail} onChange={e=>setStopEmail(e.target.value)}/><button type="submit" className="pn-btn pn-btn--ghost" disabled={stopBusy}>{stopBusy?'Enregistrement…':'Ajouter au STOP'}</button></div></form>
   {stopError&&<p className="pn-alert pn-alert--error" role="alert">{stopError}</p>}{stopNotice&&<p className="pn-alert pn-alert--success" role="status">{stopNotice}</p>}
   <p className="pn-hint">Reportez ces exclusions dans votre outil d’envoi avant chaque campagne. Un fichier déjà téléchargé ou un envoi déjà programmé ne peut pas être rappelé par le site.</p>
  </div>
  <div className="pn-stop-list">
   <h3 className="pn-h3">Dernières exclusions</h3>
   {first?<StateLoading rows={3} rowHeight={40} label="Chargement des exclusions…"/>:<ul tabIndex={0} aria-label="Dernières adresses exclues">{report?.suppressions.map(s=><li key={s.email}><span>{s.email}</span><small>{date(s.created_at)}</small></li>)}</ul>}
   {report&&!report.suppressions.length&&<p className="pn-empty">Aucune exclusion enregistrée.</p>}
   {(report?.suppressionTotal||0)>100&&<p className="pn-hint">Les 100 dernières. Le CSV contient toutes les exclusions.</p>}
  </div>
 </section>

 <section aria-labelledby="pn-email-kpi">
  <div className="pn-section-head"><h2 id="pn-email-kpi" className="pn-h2">Suivi des emails</h2>{onCampaigns&&<button type="button" className="pn-btn pn-btn--quiet" onClick={onCampaigns}>Envois SMTP : onglet Campagnes <ArrowUpRight size={16} aria-hidden="true"/></button>}</div>
  <div className="pn-metrics pn-metrics--6">{metrics.map(m=><article key={m.key} className="pn-metric"><div className="pn-metric-top"><span>{m.label}</span><m.icon size={18} aria-hidden={true}/></div><strong className="pn-metric-value">{report?(report.summary[m.key]||0).toLocaleString('fr-FR'):<span className="pn-skel" aria-hidden="true"/>}</strong><small>{m.note}</small></article>)}</div>
 </section>

 <section className="pn-card pn-card--flush" aria-labelledby="pn-recipients-title">
  <div className="pn-toolbar"><h2 id="pn-recipients-title" className="pn-h2">Vos emails personnalisés</h2><Select value={campaign} onValueChange={v=>{setCampaign(v);setPage(1)}}><SelectTrigger className="pn-select" aria-label="Filtrer la campagne"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Toutes les campagnes</SelectItem>{report?.campaigns.map(c=><SelectItem key={c.campaign} value={c.campaign}>{c.campaign}</SelectItem>)}</SelectContent></Select></div>
  {report?.recipients.length?<ul className="pn-recipients">{report.recipients.map(r=><li key={r.id} className="pn-recipient">
   <div className="pn-recipient-who"><strong>{r.company}</strong><span>{r.email}</span><small>{r.campaign}</small></div>
   <div className="pn-recipient-cell"><small>Envoi enregistré</small>{date(r.sent_at)}</div>
   <div className="pn-recipient-cell"><small>Ouverture / clic</small>{r.tracking_consent&&!r.tracking_revoked_at?<><span>Ouverture : {date(r.first_open_at)}</span><span>Clic : {date(r.first_click_at)}</span></>:<span className="pn-dim">Mesure désactivée</span>}</div>
   <div className="pn-recipient-cell"><small>Suite donnée</small>{r.suppressed?<span className="sx-chip pn-chip pn-chip--danger">STOP enregistré</span>:r.interested_at?<button type="button" className="pn-btn pn-btn--quiet" onClick={onInbox}>Ancienne confirmation <ArrowUpRight size={14} aria-hidden="true"/></button>:<span className="pn-dim">En attente</span>}</div>
   <div className="pn-recipient-action"><button type="button" className="pn-btn pn-btn--ghost" disabled={!!r.suppressed} onClick={()=>setSelected(r.id)} aria-label={`Ouvrir l’email pour ${r.company}`}>Ouvrir <ArrowUpRight size={16} aria-hidden="true"/></button></div>
  </li>)}</ul>:<p className="pn-empty">{error&&!report?'Rapport indisponible.':first?'Chargement…':'Votre premier email personnalisé apparaîtra ici.'}</p>}
  <div className="pn-pagination"><span>{report?`${report.total} email(s) · Page ${page} / ${Math.max(1,Math.ceil(report.total/30))}`:'—'}</span><div><button type="button" className="pn-btn pn-btn--ghost" disabled={page===1||loading} onClick={()=>setPage(v=>v-1)}>Précédent</button><button type="button" className="pn-btn pn-btn--ghost" disabled={!report||page*30>=report.total||loading} onClick={()=>setPage(v=>v+1)}>Suivant</button></div></div>
 </section>

 <details className="pn-disclosure pn-disclosure--card" open={!!notice||!!formError}>
  <summary><span><strong>Export manuel</strong><small>Préparer un email pour un seul destinataire et l’envoyer depuis votre propre outil</small></span></summary>
  <div className="pn-disclosure-body pn-grid-2">
   <section className="pn-subcard" aria-labelledby="pn-builder-email">
    <p className="pn-kicker">01 · Personnaliser</p>
    <h2 id="pn-builder-email" className="pn-h2">Un bel email, pour une vraie conversation.</h2>
    <p className="pn-muted">Une version HTML et texte, des liens uniques et votre identité SmartFixx.</p>
    <form onSubmit={prepare} className="pn-form"><div className="pn-fields pn-fields--2"><label className="pn-field">Campagne<input className="pn-input" required pattern="[a-zA-Z0-9_-]{1,80}" maxLength={80} value={form.campaign} onChange={e=>setForm({...form,campaign:e.target.value})}/></label><label className="pn-field">Email professionnel<input className="pn-input" required type="email" autoComplete="off" maxLength={254} placeholder="contact@entreprise.fr" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label className="pn-field">Prénom <span className="pn-help">facultatif</span><input className="pn-input" maxLength={100} placeholder="Camille" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label className="pn-field">Entreprise<input className="pn-input" required minLength={2} maxLength={150} placeholder="Nom de l’entreprise" value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/></label></div><label className="pn-field">Origine de l’adresse <span className="pn-help">Visible dans le pied de l’email</span><input className="pn-input" required minLength={3} maxLength={400} placeholder="Ex. : page contact publique du site de votre entreprise" value={form.source} onChange={e=>setForm({...form,source:e.target.value})}/></label><label className="pn-check"><input type="checkbox" className="pn-native-check" checked={form.trackingConsent} onChange={e=>setForm({...form,trackingConsent:e.target.checked})}/><span><strong>Activer la mesure des ouvertures et des clics</strong><small>Uniquement avec l’accord préalable du destinataire à cette mesure.</small></span></label>{form.trackingConsent&&<label className="pn-field">Référence du consentement<textarea className="pn-input pn-textarea" required minLength={15} maxLength={500} rows={2} placeholder="Date, mode de recueil et référence de la preuve conservée…" value={form.consentProof} onChange={e=>setForm({...form,consentProof:e.target.value})}/></label>}<p className="pn-hint">Pour une entreprise, présentez une offre pertinente pour l’activité professionnelle du contact. La visite du site, les demandes et le STOP fonctionnent aussi sans pixel.</p>{formError&&<p className="pn-alert pn-alert--error" role="alert">{formError}</p>}{notice&&<p className="pn-alert pn-alert--success" role="status">{notice}</p>}<button type="submit" className="pn-btn pn-btn--primary" disabled={busy}>{busy?'Préparation…':'Créer mon email personnalisé'}<ArrowUpRight size={18} aria-hidden="true"/></button></form>
   </section>
   <section className="pn-subcard" aria-labelledby="pn-howto">
    <p className="pn-kicker">02 · Envoyer depuis votre outil</p>
    <h2 id="pn-howto" className="pn-h2">Prêt à intégrer, facile à suivre.</h2>
    <ol className="pn-ol"><li><strong>Créez une version par destinataire.</strong> Le HTML exporté contient ses liens personnels. Ne le réutilisez pas pour d’autres adresses.</li><li><strong>Importez le HTML dans votre outil.</strong> Vérifiez l’aperçu et les exclusions avant l’envoi. Conservez les liens du fichier.</li><li><strong>Déclarez l’envoi effectué.</strong> La mesure autorisée commence après cette déclaration. Pour envoyer depuis le panel, utilisez l’onglet « Campagnes ».</li><li><strong>Reprenez la conversation.</strong> Le bouton ouvre les services du site. Le visiteur choisit son besoin et envoie un formulaire avec ses coordonnées s’il souhaite une proposition.</li></ol>
    <button type="button" onClick={onInbox} className="pn-btn pn-btn--ghost">Ouvrir les demandes <ArrowUpRight size={18} aria-hidden="true"/></button>
    <p className="pn-hint"><Eye size={16} aria-hidden="true"/> Une ouverture est le chargement d’une image, pas une preuve de lecture. Apple Mail, les caches et les robots peuvent fausser les ouvertures et les clics. Les réponses reçues dans votre messagerie ne sont pas importées.</p>
   </section>
  </div>
 </details>

 <p className="pn-hint">Les événements d’ouverture et de clic ne sont conservés que 90 jours après la préparation ; contacts et intérêts restent consultables 12 mois. Aucun volume de démonstration. <a className="pn-link" href="https://www.cnil.fr/fr/faq-recommandation-pixels-courriers-electroniques" target="_blank" rel="noreferrer">Comprendre la mesure des emails · CNIL <ArrowUpRight size={14} aria-hidden="true"/></a></p>

 <Sheet open={!!selected} onOpenChange={open=>{if(!open&&!busy)setSelected(null)}}><SheetContent className="pn-sheet pn-sheet--wide" showCloseButton={false}>
  <div className="pn-sheet-head"><div><SheetTitle className="pn-sheet-title">{detail?`Votre email pour ${detail.recipient.company}`:'Votre email personnalisé'}</SheetTitle><SheetDescription className="pn-muted">Aperçu sans mesure. Téléchargez le HTML pour ce destinataire uniquement.</SheetDescription></div><button type="button" className="pn-close" disabled={busy} onClick={()=>setSelected(null)}><X size={18} aria-hidden="true"/><span>Fermer</span></button></div>
  <div className="pn-sheet-body">
  {detailLoading?<StateLoading rows={4} rowHeight={48} label="Chargement de l’email…"/>:detail&&<>
   <dl className="pn-summary"><div><dt>À</dt><dd>{detail.recipient.email}</dd></div><div><dt>Campagne</dt><dd>{detail.recipient.campaign}</dd></div><div><dt>Mesure</dt><dd>{detail.recipient.tracking_consent&&!detail.recipient.tracking_revoked_at?'Autorisée et documentée':'Sans mesure d’ouverture ni de clic'}</dd></div></dl>
   <label className="pn-field">Objet<span className="pn-copy-row"><input className="pn-input" readOnly value={detail.subject}/><button type="button" className="pn-btn pn-btn--ghost" onClick={()=>copy(detail.subject)}><Copy size={18} aria-hidden="true"/>Copier l’objet</button></span></label>
   <div className="pn-actions"><button type="button" className="pn-btn pn-btn--primary" disabled={busy} onClick={()=>exportFresh('html')}><ArrowDownToLine size={18} aria-hidden="true"/>Télécharger le HTML</button><button type="button" className="pn-btn pn-btn--ghost" disabled={busy} onClick={()=>exportFresh('text')}>Version texte</button></div>
   <div className="pn-device pn-device--desktop"><iframe title="Aperçu du modèle SmartFixx sans suivi" srcDoc={detail.previewHtml} sandbox="" referrerPolicy="no-referrer"/></div>
   <details className="pn-disclosure"><summary>Code HTML et intégration dans votre outil d’envoi</summary><div className="pn-disclosure-body"><p>Importez le fichier dans un éditeur acceptant le HTML. Pour les envois groupés, votre prestataire doit signer ces en-têtes avec DKIM et gérer SPF, DMARC, les rebonds et les plaintes. Désactivez son suivi automatique si vous ne disposez pas du consentement correspondant.</p><label className="pn-field">HTML de ce destinataire<textarea className="pn-input pn-textarea pn-input--mono" readOnly value={detail.html} rows={5}/></label><label className="pn-field">En-têtes de désinscription<textarea className="pn-input pn-textarea pn-input--mono" readOnly value={Object.entries(detail.headers).map(([k,v])=>`${k}: ${v}`).join('\n')} rows={4}/></label><button type="button" className="pn-btn pn-btn--ghost" onClick={()=>copy(Object.entries(detail.headers).map(([k,v])=>`${k}: ${v}`).join('\n'))}><Copy size={18} aria-hidden="true"/>Copier les en-têtes</button><p>Le bouton du pied de page ouvre une confirmation. L’en-tête permet la désinscription en un clic depuis les messageries compatibles. Les liens personnels expirent après 12 mois ; une demande STOP reste possible par email.</p></div></details>
   <div className="pn-subcard"><strong>{detail.recipient.sent_at?'Envoi déclaré le '+date(detail.recipient.sent_at):'Vous avez effectué l’envoi ?'}</strong><p className="pn-muted">{detail.recipient.sent_at?'Cette indication a été enregistrée manuellement. Elle ne prouve pas la réception.':'Après l’envoi depuis votre messagerie, déclarez-le ici. Les chargements du pixel antérieurs ne sont pas comptés.'}</p><button type="button" className="pn-btn pn-btn--primary" disabled={busy||!!detail.recipient.sent_at||!!detail.managedCampaign} onClick={markSent}><Check size={18} aria-hidden="true"/>{detail.managedCampaign?'Piloté dans Campagnes':detail.recipient.sent_at?'Envoi déclaré':'Déclarer l’envoi effectué'}</button></div>
   {copyNotice&&<p className="pn-alert pn-alert--success" role="status">{copyNotice}</p>}
  </>}
  {detailError&&<StateError message={detailError} onRetry={()=>{if(selected)void loadDetail(selected)}}/>}
  </div>
 </SheetContent></Sheet>
 </div>
}
