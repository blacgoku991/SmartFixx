'use client';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {Pause,Play} from 'lucide-react';
import {getExperience} from '@/lib/service-experience';
import type {ServiceId} from '@/lib/services';
export function ServiceScene({service='creation',priority=false,compact=false}:{service?:ServiceId;priority?:boolean;compact?:boolean}){
 const e=getExperience(service),ref=useRef<HTMLDivElement>(null);const[paused,setPaused]=useState(false),[visible,setVisible]=useState(true);
 useEffect(()=>{const node=ref.current;if(!node)return;const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));observer.observe(node);return()=>observer.disconnect();},[]);
 function reset(){ref.current?.style.setProperty('--rx','0deg');ref.current?.style.setProperty('--ry','0deg');}
 function move(event:PointerEvent<HTMLDivElement>){if(paused||event.pointerType!=='mouse'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=event.currentTarget.getBoundingClientRect();ref.current?.style.setProperty('--rx',`${-(event.clientY-r.top-r.height/2)/r.height*10}deg`);ref.current?.style.setProperty('--ry',`${(event.clientX-r.left-r.width/2)/r.width*16}deg`);}
 return <div ref={ref} className={`studio-scene scene-${service} ${compact?'scene-compact':''} ${paused||!visible?'scene-paused':''}`} onPointerMove={move} onPointerLeave={reset}><div className="scene-orbit orbit-one" aria-hidden="true"/><div className="scene-orbit orbit-two" aria-hidden="true"/><div className="studio-scene-label"><span>SMARTFIXX STUDIO</span><span>{e.category}</span></div><div className="studio-depth" key={service}><img className="studio-object" src={e.asset} alt="" width="1024" height="1024" loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'}/></div><div className="studio-scene-note"><span className="scene-note-number">0{experiencesIndex(service)+1}</span><span>{e.verb}</span></div><button className="studio-motion" type="button" aria-pressed={paused} onClick={()=>{reset();setPaused(v=>!v)}} aria-label={paused?'Activer l’animation':'Mettre l’animation en pause'}>{paused?<Play size={15}/>:<Pause size={15}/>}<span>{paused?'Animer':'Pause'}</span></button></div>;
}
function experiencesIndex(id:ServiceId){return ['creation','refonte','developpement','automatisation','cybersecurite','seo','emailing'].indexOf(id)}
