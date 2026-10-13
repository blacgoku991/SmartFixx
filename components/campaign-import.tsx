'use client';
import {useEffect,useMemo,useRef,useState,type FormEvent} from 'react';
import {ArrowLeft,ArrowRight,Check,FileUp,Plus,TriangleAlert} from 'lucide-react';
import {Checkbox} from './ui/checkbox';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from './ui/select';
import {prepareCampaignContacts} from '@/lib/campaign-contacts';
import {campaignApi} from './campaign-api';
const origins={clients:'Mon fichier clients',professionnels:'Mes contacts professionnels',public:'Pages contact publiques des entreprises',test:'Mon adresse personnelle — test'};
export function CampaignImport({run,total=0,onImported,onNext,onBack,onBusy}:{run:{id:string;status:string};total?:number;onImported:()=>void;onNext?:()=>void;onBack?:()=>void;onBusy?:(busy:boolean)=>void}){
 const[text,setText]=useState(''),[origin,setOrigin]=useState(''),[customSource,setCustomSource]=useState(''),[filename,setFilename]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[skipInvalid,setSkipInvalid]=useState(false),[busy,setBusy]=useState(false),[progress,setProgress]=useState<{done:number;total:number}|null>(null);
 const source=origin==='custom'?customSource:origins[origin as keyof typeof origins]||'';
 const file=useRef<HTMLInputElement>(null),stop=useRef(false),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;stop.current=true}},[]);
 const preview=useMemo(()=>{try{return {data:prepareCampaignContacts(text,source||'Origine à préciser'),needsSource:prepareCampaignContacts(text,'').invalid.some(r=>r.message==='Précisez l’origine des adresses'),error:''}}catch(e){return {data:null,needsSource:false,error:e instanceof Error?e.message:'Liste illisible.'}}},[text,source]);
 const data=preview.data,missingSource=preview.needsSource&&source.trim().length<3;
 function changeText(value:string){setText(value);setSkipInvalid(false);setError('');setNotice('');setProgress(null)}
 async function importContacts(e:FormEvent){
  e.preventDefault();setError('');setNotice('');setBusy(true);onBusy?.(true);stop.current=false;let added=0,skipped=0;
  try{
   const parsed=prepareCampaignContacts(text,source);
   if(parsed.invalid.some(r=>r.message==='Précisez l’origine des adresses'))throw new Error('Choisissez l’origine de votre liste avant de l’ajouter.');
   if(parsed.invalid.length&&!skipInvalid)throw new Error('Corrigez les lignes signalées ou choisissez de les ignorer.');
   if(!parsed.rows.length)throw new Error('Ajoutez au moins une adresse email valide.');
   skipped=parsed.duplicates;setProgress({done:0,total:parsed.rows.length});
   for(let i=0;i<parsed.rows.length&&!stop.current;i+=50){const result=await campaignApi<{added:number;skipped:number}>(`/api/admin/campaigns/${run.id}`,{action:'import',rows:parsed.rows.slice(i,i+50)});added+=result.added;skipped+=result.skipped;if(mounted.current)setProgress({done:Math.min(i+50,parsed.rows.length),total:parsed.rows.length})}
   if(mounted.current){setNotice(`${added.toLocaleString('fr-FR')} contact(s) ajouté(s).${skipped?` ${skipped} doublon(s), exclusion(s) ou contact(s) hors limite ignoré(s).`:''}${parsed.invalid.length?` ${parsed.invalid.length} ligne(s) invalide(s) écartée(s).`:''}${stop.current?' Import arrêté. Les contacts déjà ajoutés sont conservés.':''}`);if(!stop.current){setText('');setFilename('');setProgress(null)}onImported()}
  }catch(e){if(mounted.current){setError((e instanceof Error?e.message:'Import impossible.')+(added?` ${added} contact(s) déjà ajouté(s). Relancer ignorera les doublons.`:''));onImported()}}
  finally{if(mounted.current){setBusy(false);onBusy?.(false)}}
 }
 return <section className="camp-panel camp-contacts"><div className="camp-panel-heading"><div><span className="camp-overline">ÉTAPE 2 SUR 3</span><h2>À qui voulez-vous écrire ?</h2><p>Collez des adresses ou choisissez un fichier TXT ou CSV.</p></div><span className="camp-count">{total.toLocaleString('fr-FR')} contact(s) ajouté(s)</span></div>
 {run.status!=='draft'?<p className="camp-hint">La liste est conservée depuis le premier lancement. Retrouvez chaque contact dans les résultats.</p>:<form onSubmit={importContacts}>
 <div className="camp-upload-row"><label htmlFor={'contacts-'+run.id}>Une adresse par ligne</label><button type="button" className="camp-button secondary" disabled={busy} onClick={()=>file.current?.click()}><FileUp size={17}/> Importer un fichier</button><input ref={file} hidden type="file" accept=".txt,.csv,text/plain,text/csv" disabled={busy} onChange={async e=>{const f=e.target.files?.[0];if(!f)return;e.target.value='';if(f.size>25*1024*1024){setError('Le fichier dépasse 25 Mo.');return}try{const value=await f.text();if(mounted.current){changeText(value);setFilename(f.name)}}catch{setError('Impossible de lire ce fichier.')}}}/></div>
 {filename&&<p className="camp-hint">Fichier : {filename}</p>}
 <textarea className="camp-email-list" id={'contacts-'+run.id} value={text} disabled={busy} onChange={e=>{changeText(e.target.value);setFilename('')}} rows={7} maxLength={25*1024*1024} placeholder={'contact@entreprise.fr\nbonjour@autre-entreprise.fr'} spellCheck={false} autoCapitalize="none" autoCorrect="off"/>
 {text.trim()&&data&&<div className="camp-import-summary" aria-live="polite"><span><Check size={16}/>{data.rows.length.toLocaleString('fr-FR')} valides</span>{data.duplicates>0&&<span>{data.duplicates} doublons retirés</span>}{data.invalid.length>0&&<span className="invalid">{data.invalid.length} à corriger</span>}</div>}
 {preview.needsSource&&<div className="camp-origin"><label className="camp-field">Ces adresses viennent de…<Select value={origin} onValueChange={setOrigin} disabled={busy}><SelectTrigger><SelectValue placeholder="Choisir l’origine de la liste"/></SelectTrigger><SelectContent><SelectItem value="clients">Mon fichier clients</SelectItem><SelectItem value="professionnels">Mes contacts professionnels</SelectItem><SelectItem value="public">Sites internet des entreprises</SelectItem><SelectItem value="test">Mon adresse personnelle pour un test</SelectItem><SelectItem value="custom">Une autre source</SelectItem></SelectContent></Select><small>Une réponse pour toute la liste, reprise dans le pied de l’email.</small></label>{origin==='custom'&&<label className="camp-field">Précisez la source<input value={customSource} onChange={e=>setCustomSource(e.target.value)} minLength={3} maxLength={400} disabled={busy} placeholder="Ex. : contacts rencontrés au salon professionnel"/></label>}</div>}
 {data&&data.invalid.length>0&&<div className="camp-import-errors"><strong><TriangleAlert size={17}/> Lignes à vérifier</strong><ul>{data.invalid.slice(0,5).map((r,i)=><li key={i}>Ligne {r.line} : {r.email.slice(0,80)||'adresse vide'} — {r.message}</li>)}</ul>{data.invalid.length>5&&<p>Et {data.invalid.length-5} autre(s) ligne(s).</p>}<label className="camp-check"><Checkbox checked={skipInvalid} disabled={busy} onCheckedChange={v=>setSkipInvalid(v===true)}/><span>Ignorer ces lignes et ajouter les adresses valides.</span></label></div>}
 <details className="camp-disclosure"><summary>CSV, personnalisation et suivi des ouvertures</summary><p>Maximum 50 000 contacts par campagne. Les doublons et les désinscriptions sont ignorés. Avec un CSV, les colonnes <code>prenom</code> et <code>entreprise</code> sont facultatives.</p><p>La mesure des ouvertures et clics reste désactivée sans accord documenté : utilisez les colonnes <code>consentement_mesure</code> et <code>preuve_consentement</code> si vous disposez de cet accord.</p><a download href="/downloads/SmartFixx-contacts-exemple.csv">Télécharger un exemple CSV</a></details>
 {progress&&<div className="camp-import-progress" role="status"><progress max={progress.total} value={progress.done}/><span>{progress.done.toLocaleString('fr-FR')} / {progress.total.toLocaleString('fr-FR')} traités</span></div>}
 {text.trim()&&<div className="camp-import-action"><button className="camp-button primary" disabled={busy||!data?.rows.length||missingSource||!!preview.error||(!!data.invalid.length&&!skipInvalid)}><Plus size={17}/>{busy?'Ajout en cours…':`Ajouter ${data?.rows.length.toLocaleString('fr-FR')||'les'} contacts`}</button>{busy&&<button type="button" className="camp-button ghost" onClick={()=>{stop.current=true}}>Arrêter</button>}{missingSource&&<p>Choisissez l’origine de la liste juste au-dessus.</p>}</div>}
 </form>}
 {(error||preview.error)&&<p className="camp-feedback error" role="alert">{error||preview.error}</p>}{notice&&<p className="camp-feedback success" role="status">{notice}</p>}
 <div className="camp-step-footer"><button className="camp-button ghost" disabled={busy} onClick={onBack}><ArrowLeft size={16}/> Message</button><button className="camp-button primary" disabled={busy||!total} onClick={onNext}>Continuer vers l’envoi <ArrowRight size={17}/></button></div>
 {!total&&!text.trim()&&<p className="camp-hint">Pour tester uniquement sur votre adresse, passez directement à l’étape « Envoyer ».</p>}
 </section>
}
