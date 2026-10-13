'use client';
import Link from '@/components/campaign-link';
import {ArrowUpRight,Check} from 'lucide-react';
import {useState} from 'react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from './ui/tabs';
import {experiences} from '@/lib/service-experience';
import {ServiceScene} from './service-scene';
import type {ServiceId} from '@/lib/services';
export function ServiceExplorer(){const[selected,setSelected]=useState<ServiceId>('creation');return <section id="votre-objectif" className="studio-explorer section"><div className="container"><div className="studio-section-head"><div><p className="eyebrow">VOTRE OBJECTIF, NOTRE POINT DE DÉPART</p><h2>Qu’aimeriez-vous<br/><span>faire avancer ?</span></h2></div><p>Choisissez votre besoin.<br/>Découvrez ce que nous pouvons construire ensemble.</p></div><Tabs value={selected} onValueChange={v=>setSelected(v as ServiceId)} className="experience-tabs"><TabsList className="experience-choices" aria-label="Votre besoin digital">{experiences.map((e,i)=><TabsTrigger key={e.id} value={e.id} data-analytics="service" data-service={e.id}><span>0{i+1}</span>{e.label}<ArrowUpRight size={17}/></TabsTrigger>)}</TabsList>{experiences.map(e=><TabsContent key={e.id} value={e.id} className="experience-panel"><ServiceScene service={e.id}/><div className="experience-copy"><p className="eyebrow">{e.category}</p><h3>{e.title}</h3><p>{e.description}</p><ul>{e.benefits.map(b=><li key={b}><Check size={16}/>{b}</li>)}</ul><Link href={e.href} className="button button-primary" data-analytics="service" data-service={e.id}>Découvrir cette expertise <ArrowUpRight size={18}/></Link></div></TabsContent>)}</Tabs></div></section>}
