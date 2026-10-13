'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {X} from 'lucide-react';
import {measuredPaths} from '@/lib/analytics-config';
import {serviceLabels} from '@/lib/services';
import {setFloat} from '@/components/sx/float';
/* Consentement à la mesure d'audience. Inchangés : clé 'smartfixx-statistics-preference-v1' (180 jours),
   événement 'smartfixx-privacy' pour rouvrir, routes exclues (/admin, /email/), logique d'envoi (view,
   service, contact, form_start sur '.project-form,.contact-form-card form').
   Ajouts : html[data-consent=pending|set] (le script du layout le pose avant le premier rendu),
   html[data-consent-open] quand le panneau est rouvert, hauteur publiée dans --sx-float-h, et l'écouteur
   'smartfixx-lead' (detail {reference, service}) : un seul envoi « lead » par référence (sessionStorage
   'sfx-lead-<référence>'), seulement si consentement = yes et chemin mesuré. */
const key='smartfixx-statistics-preference-v1';
type Choice='yes'|'no'|null;
export function AudienceMeasurement(){const path=usePathname();const[choice,setChoice]=useState<Choice>(null),[ready,setReady]=useState(false),[open,setOpen]=useState(false);const lastView=useRef('');const box=useRef<HTMLElement>(null);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&Date.now()-saved.at<180*86400000&&(saved.value==='yes'||saved.value==='no')){setChoice(saved.value);document.documentElement.dataset.consent='set';}else{setOpen(true);document.documentElement.dataset.consent='pending';}}catch{setOpen(true)}setReady(true);const show=()=>{setOpen(true);document.documentElement.setAttribute('data-consent-open','');};window.addEventListener('smartfixx-privacy',show);return()=>window.removeEventListener('smartfixx-privacy',show);},[]);
 function choose(value:'yes'|'no'){setChoice(value);setOpen(false);const html=document.documentElement;html.dataset.consent='set';html.removeAttribute('data-consent-open');try{localStorage.setItem(key,JSON.stringify({value,at:Date.now()}));}catch{/* Preference remains active for this page. */}}
 function close(){setOpen(false);document.documentElement.removeAttribute('data-consent-open');}
 useEffect(()=>{if(!ready||choice!=='yes'||!measuredPaths.includes(path))return;const send=(event:string,service='none')=>{void fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consent:true,path,event,service}),keepalive:true}).catch(()=>{});};if(lastView.current!==path){send('view');lastView.current=path;}let formStarted=false;const click=(ev:MouseEvent)=>{const target=ev.target instanceof Element?ev.target.closest<HTMLElement>('[data-analytics],a[href]'):null;if(!target)return;const kind=target.dataset.analytics;const href=target.getAttribute('href');if(kind==='service')send('service',target.dataset.service||'none');else if(kind==='contact'||href?.startsWith('/contact')||href?.startsWith('/diagnostic'))send('contact',target.dataset.service||'none');};const focus=(ev:FocusEvent)=>{if(!formStarted&&ev.target instanceof Element&&ev.target.closest('.project-form,.contact-form-card form')){formStarted=true;send('form_start');}};
  const lead=(ev:Event)=>{const detail=(ev as CustomEvent<{reference?:string;service?:string}>).detail||{};const reference=typeof detail.reference==='string'?detail.reference:'';if(!/^SF-[0-9A-F]{8}$/.test(reference))return;const flag=`sfx-lead-${reference}`;try{if(sessionStorage.getItem(flag))return;sessionStorage.setItem(flag,'1');}catch{/* sans sessionStorage : un envoi par chargement de page */}const service=detail.service&&Object.hasOwn(serviceLabels,detail.service)?detail.service:'none';send('lead',service);};
  document.addEventListener('click',click);document.addEventListener('focusin',focus);window.addEventListener('smartfixx-lead',lead);return()=>{document.removeEventListener('click',click);document.removeEventListener('focusin',focus);window.removeEventListener('smartfixx-lead',lead);};},[path,choice,ready]);
 const hidden=!ready||!open||(path.startsWith('/admin')||path.startsWith('/email/'));
 useEffect(()=>{if(hidden||!box.current){setFloat('consent',0);return;}const el=box.current;const ro=new ResizeObserver(()=>setFloat('consent',window.matchMedia('(max-width: 767.98px)').matches?el.getBoundingClientRect().height:0));ro.observe(el);return()=>{ro.disconnect();setFloat('consent',0);};},[hidden]);
 if(hidden)return null;
 return <aside ref={box} className="sx-consent" data-sx-consent="" aria-labelledby="sx-consent-titre"><h2 className="sx-consent-title" id="sx-consent-titre">M’aider à améliorer le site ?{choice&&<button type="button" className="sx-consent-close" onClick={close} aria-label="Fermer les préférences"><X aria-hidden="true"/></button>}</h2><p className="sx-consent-text">Avec votre accord, je compte les pages consultées et les clics utiles, sans identifiant de visiteur ni contenu de formulaire. <Link href="/confidentialite">En savoir plus</Link></p><button type="button" className="sx-consent-btn" onClick={()=>choose('no')}>Refuser</button><button type="button" className="sx-consent-btn sx-consent-btn--yes" onClick={()=>choose('yes')}>Accepter</button></aside>;
}
export function PrivacyPreferences(){return <button type="button" className="privacy-settings" onClick={()=>window.dispatchEvent(new Event('smartfixx-privacy'))}>Gérer la mesure d’audience</button>}
