'use client';
import {useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';
/* Bascule clair/sombre. Rendue par le layout racine (tests : « Apparence du site », « Activer le mode
   sombre », clé 'smartfixx-theme', valeurs light/dark, synchronisation entre onglets par 'storage').
   Placée en fixed dans l'emplacement réservé de l'en-tête public (.sx-theme-slot) ou de la barre du
   panel (html.sx-admin) ; flottante ailleurs. R9 : transitions coupées le temps d'une image ; fondu
   par startViewTransition seulement si html[data-motion=on] et sans pause. Rendue juste après le lien
   d'évitement (2e arrêt du clavier) ; repère « region » nommé, car elle est hors de l'en-tête dans le DOM.
   Budget JS : interrupteur natif (button role=switch) au lieu du Switch shadcn, qui chargeait radix-ui
   et tailwind-merge sur toutes les pages (≈ 11 Ko gzip). data-slot et data-state gardent les sélecteurs
   CSS de l'ancien Switch (fin de globals.css). Espace et Entrée basculent nativement (bouton). */
function apply(value:'dark'|'light'){const html=document.documentElement;html.classList.add('sx-theme-switching');html.dataset.theme=value;requestAnimationFrame(()=>requestAnimationFrame(()=>html.classList.remove('sx-theme-switching')))}
export function ThemeControl(){const[theme,setTheme]=useState<'dark'|'light'>('dark');useEffect(()=>{const read=()=>setTheme(document.documentElement.dataset.theme==='light'?'light':'dark');read();const sync=(e:StorageEvent)=>{if(e.key==='smartfixx-theme'&&(e.newValue==='dark'||e.newValue==='light')){apply(e.newValue);read()}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[]);function change(dark:boolean){const value=dark?'dark':'light';const html=document.documentElement;const doc=document as Document&{startViewTransition?:(cb:()=>void)=>unknown};if(doc.startViewTransition&&html.dataset.motion==='on'&&!html.hasAttribute('data-motion-paused'))doc.startViewTransition(()=>apply(value));else apply(value);setTheme(value);try{localStorage.setItem('smartfixx-theme',value)}catch{}}const dark=theme==='dark';const state=dark?'checked':'unchecked';return <div className="theme-control" role="region" aria-label="Apparence du site"><Sun size={16} aria-hidden="true"/><span>Clair</span><button type="button" role="switch" aria-checked={dark} aria-label="Activer le mode sombre" data-slot="switch" data-state={state} onClick={()=>change(!dark)}><span data-slot="switch-thumb" data-state={state}/></button><Moon size={16} aria-hidden="true"/><span>Sombre</span></div>}
