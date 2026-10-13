import Link from '@/components/campaign-link';
import {ArrowUpRight} from 'lucide-react';
import {SiteHeader} from '@/components/site-header';
import {Footer} from '@/components/brand';
import {NextStep} from '@/components/next-step';
import {experiences} from '@/lib/service-experience';
import {pageMeta} from '@/lib/seo';
export const metadata=pageMeta('Nos expertises — Sites web, automatisation, sécurité & emailing','Découvrez les prestations SmartFixx : création et refonte de sites, développement, automatisation, cybersécurité, SEO et prospection emailing.','/services');
export default function Services(){return <><SiteHeader/><main id="contenu"><section className="container expertise-directory-hero"><p className="eyebrow">UN PARTENAIRE. DES EXPERTISES CONNECTÉES.</p><h1>Du premier clic<br/><span>au prochain cap.</span></h1><p>Créer votre présence. Faire fonctionner vos outils. Développer vos opportunités. Trouvez l’expertise qui répond à votre besoin.</p></section><section className="container studio-directory">{experiences.map((e,i)=><Link href={e.href} key={e.id} data-analytics="service" data-service={e.id}><div className={`directory-visual visual-${e.id}`}><img src={e.asset} width="1024" height="1024" alt="" loading="lazy"/><span>0{i+1}</span></div><div className="directory-copy"><p className="eyebrow">{e.category}</p><h2>{e.title}</h2><p>{e.description}</p><span className="directory-action">Explorer cette expertise <ArrowUpRight size={20}/></span></div></Link>)}</section><NextStep/></main><Footer/></>}
