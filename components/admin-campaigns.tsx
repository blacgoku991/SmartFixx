'use client';
/* Panel (lot 6) : Campagnes. Présentation seule ; INVARIANTS conservés à l'identique :
   - appels et corps : liste et SMTP en GET, create {name, subject, content}, update/controls avec updatedAt,
     import par lots de 50 (campaign-import), test {email, confirm}, launch {confirm, scheduledAt, updatedAt},
     pause, cancel, retry_failed, close_unknown, resume_pending ;
   - séquences anti-course listSequence et detailSequence, sondage de 5 s (liste, SMTP, détail) monté
     seulement quand l'onglet est ouvert ;
   - AlertDialog de lancement avec la case « J'ai vérifié… » obligatoire, confirmations d'annulation, de
     reprise et de clôture, garde des modifications non enregistrées du message.
   Ajouts : le nom est demandé AVANT la création du brouillon ; une erreur de chargement n'affiche jamais
   l'état « première campagne » ; « Gérer les désinscriptions » est toujours visible. */
import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowLeft,ArrowRight,Check,ChevronRight,Plus,Search,Send,Settings2,ShieldCheck,Terminal,X} from 'lucide-react';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from './ui/sheet';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from './ui/dialog';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel} from './ui/alert-dialog';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from './ui/select';
import {Checkbox} from './ui/checkbox';
import {StateEmpty,StateError,StateLoading} from './sx/states';
import {AdminSmtpSettings} from './admin-smtp-settings';
import {CampaignTerminal} from './campaign-terminal';
import {CampaignImport} from './campaign-import';
import {CampaignMessageEditor} from './campaign-message-editor';
import {CampaignLaunch} from './campaign-launch';
import {CampaignResults} from './campaign-results';
import {campaignApi,humanDate,type SenderState} from './campaign-api';
import {runChip} from './admin-panel/chips';
import {fmt} from './admin-panel/format';
import {sendingRate,defaultContent,statusLabels} from '@/lib/campaign-sending-config';
import {emailSubject} from '@/lib/email-template';
import type {CampaignRunView,CampaignDetail} from './campaign-types';
type View='list'|'prepare'|'results';
type Step='message'|'contacts'|'send';
const steps:{id:Step;label:string;number:string}[]=[{id:'message',label:'Message',number:'1'},{id:'contacts',label:'Contacts',number:'2'},{id:'send',label:'Envoi',number:'3'}];
const defaultName=()=>'Campagne du '+new Date().toLocaleDateString('fr-FR')+' à '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
export function AdminCampaigns({onFollowup,onInbox}:{onFollowup:()=>void;onInbox:()=>void}){
 const[runs,setRuns]=useState<CampaignRunView[]>([]),[sender,setSender]=useState<SenderState|null>(null),[selected,setSelected]=useState(''),[detail,setDetail]=useState<CampaignDetail|null>(null),[view,setView]=useState<View>('list'),[step,setStep]=useState<Step>('message'),[search,setSearch]=useState(''),[listFilter,setListFilter]=useState('all'),[page,setPage]=useState(1),[filter,setFilter]=useState('all'),[settingsOpen,setSettingsOpen]=useState(false),[journalOpen,setJournalOpen]=useState(false),[busy,setBusy]=useState(''),[importing,setImporting]=useState(false),[loading,setLoading]=useState(true),[loadedOnce,setLoadedOnce]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[syncError,setSyncError]=useState(''),[syncedAt,setSyncedAt]=useState<number|null>(null),[confirm,setConfirm]=useState(''),[agreed,setAgreed]=useState(false),[schedule,setSchedule]=useState(''),[dirty,setDirty]=useState(false),[editorReset,setEditorReset]=useState(0),[pendingNavigation,setPendingNavigation]=useState<(()=>void)|null>(null),[naming,setNaming]=useState(false),[draftName,setDraftName]=useState('');
 const selectedRef=useRef(selected),detailSequence=useRef(0),listSequence=useRef(0);selectedRef.current=selected;
 const blocked=!!busy||importing;
 const refresh=useCallback(async()=>{const seq=++listSequence.current;try{const[list,s]=await Promise.all([campaignApi<{campaigns:CampaignRunView[]}>('/api/admin/campaigns'),campaignApi<SenderState>('/api/admin/smtp')]);if(seq===listSequence.current){setRuns(list.campaigns);setSender(s);setSyncError('');setLoadedOnce(true)}}catch(e){if(seq===listSequence.current)setSyncError(e instanceof Error?e.message:'Actualisation indisponible.')}finally{if(seq===listSequence.current)setLoading(false)}},[]);
 const loadDetail=useCallback(async()=>{if(!selected)return null;const seq=++detailSequence.current;try{const d=await campaignApi<CampaignDetail>(`/api/admin/campaigns/${selected}?page=${page}${filter==='all'?'':`&status=${filter}`}`);if(seq===detailSequence.current&&selectedRef.current===selected){setDetail(d);setSyncedAt(Date.now());setSyncError('')}return d}catch(e){if(seq===detailSequence.current)setSyncError(e instanceof Error?e.message:'Campagne indisponible.');return null}},[selected,page,filter]);
 useEffect(()=>{void refresh();const timer=setInterval(()=>void refresh(),5000);return()=>{listSequence.current++;clearInterval(timer)}},[refresh]);
 useEffect(()=>{void loadDetail();const timer=setInterval(()=>void loadDetail(),5000);return()=>{detailSequence.current++;clearInterval(timer)}},[loadDetail]);
 function navigate(action:()=>void){if(blocked)return;if(dirty){setPendingNavigation(()=>action);return}action()}
 function choose(run:CampaignRunView){navigate(()=>{setSelected(run.id);selectedRef.current=run.id;setDetail(null);setPage(1);setFilter('all');setStep('message');setView(run.status==='draft'?'prepare':'results');setNotice('');setError('');setSchedule('');setSyncedAt(null)})}
 function startCreate(){if(blocked)return;setError('');setDraftName(defaultName());setNaming(true)}
 async function create(name:string){if(blocked)return;setBusy('create');setError('');try{const r=await campaignApi<{id:string}>('/api/admin/campaigns',{name,subject:emailSubject,content:defaultContent});setNaming(false);setSelected(r.id);selectedRef.current=r.id;setDetail(null);setPage(1);setFilter('all');setStep('message');setView('prepare');setNotice('');setSchedule('');setDirty(false);await refresh()}catch(e){setError(e instanceof Error?e.message:'Création impossible.')}finally{setBusy('')}}
 async function perform(action:string,extra:Record<string,unknown>={}):Promise<CampaignDetail|null>{if(!selected||blocked)return null;setBusy(action);setError('');setNotice('');try{await campaignApi(`/api/admin/campaigns/${selected}`,{action,...extra});const fresh=await loadDetail();await refresh();setNotice(({pause:'Campagne mise en pause.',cancel:'Les envois restants sont annulés.',retry_failed:'Les échecs éligibles sont remis en attente. Reprenez la campagne après avoir corrigé leur cause.',close_unknown:'Résultats clôturés sans nouvel envoi.',resume_pending:'Les adresses éligibles non envoyées sont en attente. Vous pouvez reprendre l’envoi.'} as Record<string,string>)[action]||'');return fresh}catch(e){setError(e instanceof Error?e.message:'L’opération n’a pas abouti.');return null}finally{setBusy('')}}
 function changeStep(next:Step){if(blocked)return;if(dirty&&next!=='message'){setError('Enregistrez votre message avec le bouton « Enregistrer et continuer ».');return}setError('');setStep(next)}
 function action(name:string){if(name==='pause'){void perform(name);return}setAgreed(false);setConfirm(name)}
 const current=detail?.campaign.id===selected?detail:null,run=current?.campaign;
 const ready=!!sender?.configured&&sender.verifyStatus==='ok'&&sender.runnerConnected&&(!sender.config||sendingRate(sender.config)<=1||sender.runnerVersion==='3');
 const visible=runs.filter(r=>(listFilter==='all'||r.status===listFilter)&&(!search||r.name.toLocaleLowerCase('fr-FR').includes(search.toLocaleLowerCase('fr-FR'))));
 const stepIndex=steps.findIndex(s=>s.id===step);
 const nameValid=draftName.trim().length>=3&&draftName.trim().length<=100;
 function submitName(e:FormEvent){e.preventDefault();if(nameValid)void create(draftName.trim())}
 const retryList=()=>{setLoading(true);void refresh()};

 return <div className="pn-screen pn-camp">
 <header className="pn-head">
  <div className="pn-head-text"><p className="pn-eyebrow">Envois depuis votre compte SMTP</p><h1 className="pn-title">Campagnes</h1><p className="pn-lead">{view==='list'?'Vos messages, vos contacts et les demandes qu’ils génèrent.':'Un message clair. Les bons contacts. Un envoi maîtrisé.'}</p></div>
  <div className="pn-head-actions">
   <button type="button" className="pn-btn pn-btn--ghost" onClick={onFollowup}><ShieldCheck size={18} aria-hidden="true"/>Gérer les désinscriptions</button>
   <button type="button" className="pn-btn pn-btn--ghost" onClick={()=>setSettingsOpen(true)}><Settings2 size={18} aria-hidden="true"/>Réglages d’envoi<span className={`pn-state ${ready?'pn-state--ok':'pn-state--todo'}`}><i aria-hidden="true"/>{ready?'Prêt':'À vérifier'}</span></button>
   {view==='list'&&<button type="button" className="pn-btn pn-btn--primary" disabled={blocked} onClick={startCreate}><Plus size={18} aria-hidden="true"/>Nouvelle campagne</button>}
  </div>
 </header>
 {(error&&!naming&&!confirm)&&<p className="pn-alert pn-alert--error" role="alert">{error}</p>}
 {syncError&&loadedOnce&&<p className="pn-alert pn-alert--warning" role="status">Actualisation interrompue : {syncError} Les dernières données reçues restent affichées.</p>}
 {notice&&<p className="pn-alert pn-alert--success" role="status">{notice}</p>}

 {view==='list'?<>
  <h2 className="pn-sr">Vos campagnes</h2>
  {!loadedOnce?(loading?<StateLoading rows={3} rowHeight={64} label="Chargement des campagnes…"/>:<StateError message={`Les campagnes n’ont pas pu être chargées ; elles restent enregistrées. ${syncError}`} onRetry={retryList}/>)
  :runs.length===0?<div className="pn-empty-state"><span className="pn-empty-mark" aria-hidden="true"><Send size={26}/></span><StateEmpty title="Votre première campagne commence ici." text="Un modèle prêt à l’emploi, une liste d’emails et trois étapes pour envoyer." action={<button type="button" className="pn-btn pn-btn--primary" disabled={blocked} onClick={startCreate}>Créer ma campagne <ArrowRight size={18} aria-hidden="true"/></button>}/></div>
  :<section className="pn-card pn-card--flush" aria-label="Vos campagnes">
   <div className="pn-toolbar">
    <label className="pn-search"><Search size={18} aria-hidden="true"/><input aria-label="Rechercher une campagne" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une campagne"/></label>
    <Select value={listFilter} onValueChange={setListFilter}><SelectTrigger className="pn-select" aria-label="État des campagnes"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tous les états</SelectItem>{['draft','running','paused','completed','cancelled'].map(s=><SelectItem value={s} key={s}>{statusLabels[s]}</SelectItem>)}</SelectContent></Select>
   </div>
   <div className="pn-runs-head" aria-hidden="true"><span>Campagne</span><span>État</span><span>Contacts</span><span>Demandes</span></div>
   <ul className="pn-runs">{visible.map(r=><li key={r.id}><button type="button" className="pn-run" disabled={blocked} onClick={()=>choose(r)}>
    <span className="pn-run-name"><strong>{r.name}</strong><small>Créée le {humanDate(r.created_at)}</small></span>
    <span className="pn-run-state"><span className={runChip(r.status)}>{statusLabels[r.status]}</span></span>
    <span className="pn-run-num"><small>Contacts</small>{fmt(r.total||0)}</span>
    <span className="pn-run-num pn-run-leads"><small>Demandes</small>{fmt(r.requests||0)}</span>
    <ChevronRight size={18} aria-hidden="true" className="pn-run-go"/>
   </button></li>)}</ul>
   {!visible.length&&<p className="pn-empty">Aucune campagne ne correspond à cette recherche.</p>}
  </section>}
 </>:<>
  <div className="pn-workbar">
   <button type="button" className="pn-btn pn-btn--quiet" disabled={blocked} onClick={()=>navigate(()=>{setView('list');setSelected('');setDetail(null);setDirty(false)})}><ArrowLeft size={18} aria-hidden="true"/>Mes campagnes</button>
   <div className="pn-segment" role="group" aria-label="Affichage de la campagne"><button type="button" aria-pressed={view==='prepare'} disabled={blocked} onClick={()=>navigate(()=>setView('prepare'))}>Préparer</button><button type="button" aria-pressed={view==='results'} disabled={blocked} onClick={()=>navigate(()=>setView('results'))}>Résultats</button></div>
   <button type="button" className="pn-btn pn-btn--ghost" onClick={()=>setJournalOpen(true)}><Terminal size={18} aria-hidden="true"/>Journal</button>
  </div>
  {run&&current?<>
   <div className="pn-run-title"><h2 className="pn-h2">{run.name}</h2><span className={runChip(run.status)}>{statusLabels[run.status]}</span></div>
   <div hidden={view!=='prepare'}>
    <nav className="pn-stepper" aria-label="Préparer la campagne"><ol>{steps.map((s,i)=>{const done=i<stepIndex||(s.id==='contacts'&&current.counts.total>0&&step!=='contacts');return <li key={s.id}><button type="button" disabled={blocked} className={step===s.id?'is-current':done?'is-done':undefined} aria-current={step===s.id?'step':undefined} onClick={()=>changeStep(s.id)}><span className="pn-step-num" aria-hidden="true">{done?<Check size={16}/>:s.number}</span><span className="pn-step-label"><small>Étape {s.number}</small>{s.label}</span></button></li>})}</ol></nav>
    <div hidden={step!=='message'}><CampaignMessageEditor key={run.id+":"+editorReset} run={run} busy={blocked} onDirty={setDirty} onSave={async fields=>(await perform('update',fields))?.campaign||null} onNext={()=>{setDirty(false);setStep('contacts')}}/></div>
    <div hidden={step!=='contacts'}><CampaignImport key={run.id} run={run} total={current.counts.total||0} onBusy={setImporting} onImported={()=>{void loadDetail();void refresh()}} onNext={()=>changeStep('send')} onBack={()=>changeStep('message')}/></div>
    <div hidden={step!=='send'}><CampaignLaunch key={run.id} detail={current} sender={sender} busy={blocked} schedule={schedule} onSchedule={setSchedule} onSettings={()=>setSettingsOpen(true)} onJournal={()=>setJournalOpen(true)} onControls={async(email,every)=>!!await perform("controls",{email,every,updatedAt:run.updated_at})} onTest={async email=>!!await perform('test',{email,confirm:true})} onLaunch={()=>{setAgreed(false);setConfirm('launch')}} onBack={()=>changeStep('contacts')}/></div>
   </div>
   <div hidden={view!=='results'}><CampaignResults detail={current} sender={sender} busy={blocked} page={page} filter={filter} onPage={setPage} onFilter={v=>{setFilter(v);setPage(1)}} onInbox={onInbox} onFollowup={onFollowup} onJournal={()=>setJournalOpen(true)} onPrepare={()=>{setView('prepare');setStep('send')}} onAction={action}/></div>
  </>:syncError?<StateError message={`Cette campagne n’a pas pu être chargée. ${syncError}`} onRetry={()=>void loadDetail()}/>:<StateLoading rows={4} rowHeight={56} label="Chargement de la campagne…"/>}
 </>}

 <Dialog open={naming} onOpenChange={open=>{if(!open&&!blocked){setNaming(false);setError('')}}}>
  <DialogContent className="pn-dialog" showCloseButton={false}>
   <form onSubmit={submitName} className="pn-dialog-form">
    <DialogTitle className="pn-dialog-title">Nouvelle campagne</DialogTitle>
    <DialogDescription className="pn-muted">Donnez-lui un nom que vous reconnaîtrez dans la liste. Il reste modifiable dans l’étape Message et n’apparaît pas dans l’email.</DialogDescription>
    <label className="pn-field">Nom de la campagne<input className="pn-input" autoFocus required minLength={3} maxLength={100} value={draftName} onChange={e=>setDraftName(e.target.value)} aria-invalid={!nameValid} onFocus={e=>e.currentTarget.select()}/><small className={nameValid?'pn-help':'pn-help pn-help--error'}>{nameValid?'Un brouillon sera créé avec le modèle SmartFixx. Rien n’est envoyé.':'Entre 3 et 100 caractères.'}</small></label>
    {error&&naming&&<p className="pn-alert pn-alert--error" role="alert">{error}</p>}
    <div className="pn-dialog-actions"><button type="button" className="pn-btn pn-btn--ghost" disabled={blocked} onClick={()=>{setNaming(false);setError('')}}>Annuler</button><button type="submit" className="pn-btn pn-btn--primary" disabled={blocked||!nameValid}>{busy==='create'?'Création…':'Créer le brouillon'}<ArrowRight size={18} aria-hidden="true"/></button></div>
   </form>
  </DialogContent>
 </Dialog>

 <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}><SheetContent className="pn-sheet pn-sheet--wide" showCloseButton={false} onOpenAutoFocus={e=>{e.preventDefault();document.getElementById('pn-settings-title')?.focus()}}>
  <div className="pn-sheet-head"><div><SheetTitle id="pn-settings-title" tabIndex={-1} className="pn-sheet-title">Réglages d’envoi</SheetTitle><SheetDescription className="pn-muted">Quatre étapes, dans l’ordre : compte SMTP, relais, vérifications, cadence.</SheetDescription></div><button type="button" className="pn-close" onClick={()=>setSettingsOpen(false)}><X size={18} aria-hidden="true"/><span>Fermer</span></button></div>
  <div className="pn-sheet-body">{sender?<AdminSmtpSettings state={sender} onRefresh={()=>void refresh()}/>:syncError?<StateError message={syncError} onRetry={retryList}/>:<StateLoading rows={4} rowHeight={72} label="Chargement des réglages…"/>}</div>
 </SheetContent></Sheet>
 <Sheet open={journalOpen} onOpenChange={setJournalOpen}><SheetContent className="pn-sheet pn-sheet--journal" showCloseButton={false}>
  <div className="pn-sheet-head"><div><SheetTitle className="pn-sheet-title">Journal des envois</SheetTitle><SheetDescription className="pn-muted">États réels et diagnostics de la campagne sélectionnée.</SheetDescription></div><button type="button" className="pn-close" onClick={()=>setJournalOpen(false)}><X size={18} aria-hidden="true"/><span>Fermer</span></button></div>
  <div className="pn-sheet-body"><CampaignTerminal sender={sender} activity={current?.activity||[]} campaignName={run?.name} syncedAt={syncedAt} error={syncError} onRefresh={()=>{void refresh();void loadDetail()}} onSettings={()=>{setJournalOpen(false);setSettingsOpen(true)}}/></div>
 </SheetContent></Sheet>
 <AlertDialog open={!!confirm} onOpenChange={open=>{if(!open&&!blocked)setConfirm('')}}><AlertDialogContent className="pn-dialog">
  <AlertDialogTitle className="pn-dialog-title">{({launch:schedule?'Programmer cette campagne ?':'Envoyer cette campagne ?',cancel:'Annuler les envois restants ?',retry_failed:'Remettre les échecs en attente ?',close_unknown:'Clôturer sans renvoyer ?',resume_pending:'Préparer la reprise des non-envoyés ?'} as Record<string,string>)[confirm]}</AlertDialogTitle>
  <AlertDialogDescription className="pn-muted">{confirm==='launch'?`${current?.counts.queued||0} contacts${current?.counts.controlsQueued?' et '+current.counts.controlsQueued+' contrôle(s) en attente':''} recevront le message « ${run?.subject||''} ».${schedule?' Départ prévu : '+new Date(schedule).toLocaleString('fr-FR')+'.':''}`:confirm==='cancel'?'Un message déjà transmis peut se terminer. Les contacts encore en attente ne seront pas envoyés.':confirm==='resume_pending'?'Seuls les échecs et les envois annulés éligibles seront remis en attente. Les succès, désinscriptions et résultats incertains sont conservés.':confirm==='retry_failed'?'Corrigez d’abord le motif du refus. Les adresses exclues et les résultats incertains resteront bloqués.':'Ces envois seront clôturés sans nouvelle transmission.'}</AlertDialogDescription>
  {confirm==='launch'&&<label className="pn-check"><Checkbox className="pn-checkbox" checked={agreed} onCheckedChange={v=>setAgreed(v===true)}/><span>J’ai vérifié le message et les contacts professionnels. Je confirme cet envoi.</span></label>}
  {error&&<p className="pn-alert pn-alert--error" role="alert">{error}</p>}
  <AlertDialogFooter className="pn-dialog-actions"><AlertDialogCancel className="pn-btn pn-btn--ghost" disabled={blocked}>Retour</AlertDialogCancel><button type="button" className={`pn-btn ${confirm==='cancel'?'pn-btn--danger':'pn-btn--primary'}`} disabled={blocked||(confirm==='launch'&&!agreed)} onClick={async()=>{const name=confirm;const fresh=await perform(name,name==='launch'?{confirm:true,scheduledAt:schedule?new Date(schedule).getTime():null,updatedAt:run?.updated_at}:{});if(fresh){setConfirm('');setView('results');setDirty(false)}}}>{blocked?'En cours…':confirm==='launch'?(schedule?'Programmer':'Confirmer l’envoi'):'Confirmer'}</button></AlertDialogFooter>
 </AlertDialogContent></AlertDialog>
 <AlertDialog open={!!pendingNavigation} onOpenChange={open=>{if(!open)setPendingNavigation(null)}}><AlertDialogContent className="pn-dialog">
  <AlertDialogTitle className="pn-dialog-title">Votre message contient des modifications.</AlertDialogTitle>
  <AlertDialogDescription className="pn-muted">Vous pouvez revenir l’enregistrer ou quitter sans conserver ces modifications.</AlertDialogDescription>
  <AlertDialogFooter className="pn-dialog-actions"><AlertDialogCancel className="pn-btn pn-btn--primary">Revenir au message</AlertDialogCancel><button type="button" className="pn-btn pn-btn--ghost" onClick={()=>{const next=pendingNavigation;setPendingNavigation(null);setDirty(false);setEditorReset(v=>v+1);next?.()}}>Quitter sans enregistrer</button></AlertDialogFooter>
 </AlertDialogContent></AlertDialog>
 </div>
}
