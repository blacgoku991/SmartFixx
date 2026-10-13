'use client';
import {useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';
import {Switch} from './ui/switch';
/* Bascule clair/sombre. Rendue par le layout racine (tests : « Apparence du site », « Activer le mode
   sombre », clé 'smartfixx-theme', valeurs light/dark, synchronisation entre onglets par 'storage').
   Placée en fixed dans l'emplacement réservé de l'en-tête public (.sx-theme-slot) ou de la barre du
   panel (html.sx-admin) ; flottante ailleurs. R9 : transitions coupées le temps d'une image ; fondu
   par startViewTransition seulement si html[data-motion=on] et sans pause. */
function apply(value:'dark'|'light'){const html=document.documentElement;html.classList.add('sx-theme-switching');html.dataset.theme=value;requestAnimationFrame(()=>requestAnimationFrame(()=>html.classList.remove('sx-theme-switching')))}
export function ThemeControl(){const[theme,setTheme]=useState<'dark'|'light'>('dark');useEffect(()=>{const read=()=>setTheme(document.documentElement.dataset.theme==='light'?'light':'dark');read();const sync=(e:StorageEvent)=>{if(e.key==='smartfixx-theme'&&(e.newValue==='dark'||e.newValue==='light')){apply(e.newValue);read()}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[]);function change(dark:boolean){const value=dark?'dark':'light';const html=document.documentElement;const doc=document as Document&{startViewTransition?:(cb:()=>void)=>unknown};if(doc.startViewTransition&&html.dataset.motion==='on'&&!html.hasAttribute('data-motion-paused'))doc.startViewTransition(()=>apply(value));else apply(value);setTheme(value);try{localStorage.setItem('smartfixx-theme',value)}catch{}}return <div className="theme-control" role="group" aria-label="Apparence du site"><Sun size={16} aria-hidden="true"/><span>Clair</span><Switch checked={theme==='dark'} onCheckedChange={change} aria-label="Activer le mode sombre"/><Moon size={16} aria-hidden="true"/><span>Sombre</span></div>}
