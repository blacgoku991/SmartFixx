import { test } from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
const legacyInterest=id=>`${id}.${createHmac('sha256','local-test-secret-not-for-production').update(`smartfixx-email-v1|interest|${id}`).digest('hex')}`;
import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { Miniflare, Log, LogLevel } from 'miniflare';
async function jsFiles(dir){const all=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=join(dir,entry.name);if(entry.isDirectory())all.push(...await jsFiles(p));else if(p.endsWith('.js'))all.push(p);}return all;}
test('Production routes, owner authorization, persistent requests and security controls',async t=>{
 const server=resolve('dist/server');const entry=join(server,'index.js');const paths=await jsFiles(server);
 const mf=new Miniflare({modules:[{type:'ESModule',path:entry},...paths.filter(p=>p!==entry).map(path=>({type:'ESModule',path}))],modulesRoot:server,compatibilityDate:'2026-05-22',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{ADMIN_OWNER_EMAIL:'owner@example.test',RATE_LIMIT_SECRET:'local-test-secret-not-for-production'},assets:{directory:resolve('dist/client'),binding:'ASSETS',routerConfig:{invoke_user_worker_ahead_of_assets:true,has_user_worker:true}},log:new Log(LogLevel.ERROR)});
 const base='https://reach.example.test';
 const owner={'oai-authenticated-user-id':'test-owner-site-id','oai-authenticated-user-email':'owner@example.test'};
 const visitor={'oai-authenticated-user-id':'test-visitor','oai-authenticated-user-email':'visitor@example.test'};
 const call=(path,init={})=>mf.dispatchFetch(base+path,{redirect:'manual',...init});
 const mutation=(body,extra={})=>({method:'POST',headers:{'content-type':'application/json',origin:base,...extra},body:JSON.stringify(body)});
 let quoteId;
 try{
  const db=await mf.getD1Database('DB');
  for(const name of (await readdir('drizzle')).filter(n=>n.endsWith('.sql')).sort()){const sql=await readFile(join('drizzle',name),'utf8');for(const statement of sql.split('--> statement-breakpoint'))if(statement.trim())await db.prepare(statement).run();}
  await t.test('all public chapters, canonical metadata and protected cache headers',async()=>{
   for(const path of ['/','/solutions','/methode','/tarifs','/contact','/garanties','/confidentialite','/mentions-legales','/services','/prospection-emailing','/creation-site-internet','/refonte-site-internet','/developpement-sur-mesure','/automatisation-informatique','/cybersecurite','/referencement-seo','/agence-web-ile-de-france','/agence-web-france','/creation-site-internet-asnieres-sur-seine','/diagnostic','/conseils','/conseils/preparer-refonte-site-internet','/conseils/automatiser-suivi-demandes-clients','/conseils/preparer-campagne-emailing-b2b']){const r=await call(path);const html=await r.text();assert.equal(r.status,200,`${path}: ${html.slice(0,200)}`);assert.match(html,/<h1/);assert.ok(!html.includes('owner@example.test'));assert.equal(r.headers.get('x-content-type-options'),'nosniff');const nonce=/nonce-([a-f0-9]+)/.exec(r.headers.get('content-security-policy'))?.[1];assert.ok(nonce);const scripts=[...html.matchAll(/<script\b([^>]*)>/g)];assert.ok(scripts.length);assert.ok(scripts.every(m=>m[1].includes(`nonce="${nonce}"`)),`nonce missing on ${path}`);}
   const admin=await call('/admin');const html=await admin.text();assert.equal(admin.status,200);assert.match(html,/Se connecter avec ChatGPT/);assert.match(admin.headers.get('cache-control'),/no-store/);assert.match(admin.headers.get('x-robots-tag'),/noindex/);
   const sitemap=await call('/sitemap.xml');assert.equal(sitemap.status,200);assert.match(await sitemap.text(),/\/solutions/);const robots=await call('/robots.txt');assert.equal(robots.status,200);assert.match(await robots.text(),/Disallow: \/admin/);
  });
  await t.test('anonymous and non-owner reads rejected; explicit owner enrollment',async()=>{
   for(const headers of [{},visitor,{'oai-authenticated-user-email':'owner@example.test'}]){const r=await call('/api/admin/requests',{headers});assert.equal(r.status,403);assert.match(r.headers.get('cache-control'),/no-store/);}
   let r=await call('/api/admin/requests',{headers:owner});assert.equal(r.status,200);assert.equal((await r.json()).total,0);
   r=await call('/admin',{headers:owner});assert.equal(r.status,200);assert.match(await r.text(),/Votre activité, en clair/);
   r=await call('/api/admin/requests',{headers:{...owner,'oai-authenticated-user-id':'another-id'}});assert.equal(r.status,403,'owner identity is pinned to stable site user id');
  });
  const quote={name:'Test Contact',company:'Example Test',email:'contact@example.test',phone:'0600000000',message:'Nous souhaitons cibler les entreprises de notre région.',audience:'b2b',source:'included',volume:10000,plan:'acceleration',consent:true,website:''};
  await t.test('public submission validation, origin, body limits and server pricing',async()=>{
   assert.equal((await call('/api/devis',mutation(quote,{origin:'https://untrusted.example'}))).status,403);
   const withoutOrigin=mutation(quote);delete withoutOrigin.headers.origin;assert.equal((await call('/api/devis',withoutOrigin)).status,403);
   assert.equal((await call('/api/devis',mutation({...quote,consent:false}))).status,400);
   assert.equal((await call('/api/devis',mutation({...quote,website:'https://spam.example'}))).status,400);
   assert.equal((await call('/api/devis',mutation({...quote,message:'a'.repeat(17000)}))).status,400);
   const r=await call('/api/devis',mutation({...quote,quoted_amount_euros:1}));assert.equal(r.status,201,await r.clone().text());const result=await r.json();assert.match(result.reference,/^SF-/);
   const list=await(await call('/api/admin/requests',{headers:owner})).json();assert.equal(list.total,1);assert.equal(list.requests[0].quoted_amount_euros,1290);quoteId=list.requests[0].id;
   const detail=await(await call(`/api/admin/requests/${quoteId}`,{headers:owner})).json();assert.equal(detail.request.message,quote.message);assert.equal(detail.request.notes,'');
  });
  await t.test('authorized updates persist, cross-origin requests blocked, stale writes rejected',async()=>{
   const patch=(body,headers=owner)=>({...mutation(body,headers),method:'PATCH'});
   const body={status:'in_progress',notes:'Premier échange prévu demain.',revision:0};
   assert.equal((await call(`/api/admin/requests/${quoteId}`,patch(body,visitor))).status,403);
   assert.equal((await call(`/api/admin/requests/${quoteId}`,patch(body,{...owner,origin:'https://untrusted.example'}))).status,403);
   assert.equal((await call(`/api/admin/requests/${quoteId}`,patch({...body,status:'administrator'}))).status,400);
   const updated=await call(`/api/admin/requests/${quoteId}`,patch(body));assert.equal(updated.status,200,await updated.clone().text());
   assert.equal((await call(`/api/admin/requests/${quoteId}`,patch(body))).status,409);
   const detail=await(await call(`/api/admin/requests/${quoteId}`,{headers:owner})).json();assert.equal(detail.request.status,'in_progress');assert.equal(detail.request.notes,body.notes);assert.equal(detail.request.revision,1);assert.equal(detail.events.length,1);
   const search=await(await call('/api/admin/requests?q=example&status=in_progress',{headers:owner})).json();assert.equal(search.total,1);
   const injection=await(await call('/api/admin/requests?q=%27%20OR%201%3D1--',{headers:owner})).json();assert.equal(injection.total,0);
  });
  await t.test('rate limits are atomic and expired records stay private',async()=>{
   const responses=await Promise.all(Array.from({length:7},()=>call('/api/devis',mutation({...quote,email:'limit@example.test'}))));assert.equal(responses.filter(r=>r.status===201).length,5);assert.equal(responses.filter(r=>r.status===429).length,2);
   await db.prepare('UPDATE quote_requests SET expires_at = 0 WHERE id = ?').bind(quoteId).run();assert.equal((await call(`/api/admin/requests/${quoteId}`,{headers:owner})).status,404);
   const list=await(await call('/api/admin/requests?q=contact@example.test',{headers:owner})).json();assert.equal(list.total,0);
   await db.prepare('DELETE FROM quote_requests WHERE id = ?').bind(quoteId).run();assert.equal((await db.prepare('SELECT count(*) AS n FROM quote_events WHERE request_id = ?').bind(quoteId).first()).n,0);
  });
  await t.test('general projects persist service, campaign and safe URLs without email package pricing',async()=>{
   const project={name:'Test Projet',company:'Atelier Test',email:'projet@example.test',phone:'',message:'Nous souhaitons refaire notre site internet et simplifier les demandes.',service:'refonte',city:'Asnières-sur-Seine',websiteUrl:'https://example.test',budget:'de_1000_3000',timeline:'trois_mois',campaign:'refonte_idf_01',consent:true,website:''};
   assert.equal((await call('/api/devis',mutation({...project,websiteUrl:'javascript:alert(1)'}))).status,400);
   assert.equal((await call('/api/devis',mutation({...project,service:'unknown'}))).status,400);
   const r=await call('/api/devis',mutation(project));assert.equal(r.status,201,await r.clone().text());
   const list=await(await call('/api/admin/requests?service=refonte',{headers:owner})).json();assert.equal(list.total,1);assert.equal(list.requests[0].campaign,project.campaign);assert.equal(list.requests[0].quoted_amount_euros,null);
   const detail=await(await call(`/api/admin/requests/${list.requests[0].id}`,{headers:owner})).json();assert.equal(detail.request.website_url,project.websiteUrl);assert.equal(detail.request.budget,project.budget);
   const site=await(await call('/referencement-seo')).text();assert.match(site,/application\/ld\+json/);assert.match(site,/rel="canonical"/);
  });
  await t.test('short form: email or phone, detailed 400, per-contact limits, activity and normalized site persisted',async()=>{
   // Charge utile EXACTE du formulaire court (components/forms/short-quote-form-client.tsx) : chaînes, jamais null.
   // IP de documentation propre à ce bloc : la limite par IP (12 par quart d'heure) reste celle des autres tests.
   const ip={'cf-connecting-ip':'192.0.2.51'},burstIp={'cf-connecting-ip':'192.0.2.52'};
   const short={service:'creation',name:'Camille Court',activity:'Plombier chauffagiste',email:'',phone:'06 11 22 33 44',websiteUrl:'monsite.fr',message:'',requestedServices:['seo'],consent:true,website:'',campaign:'site'};
   const none=await call('/api/devis',mutation({...short,phone:''},ip));assert.equal(none.status,400);const noneBody=await none.json();assert.equal(typeof noneBody.fields.email,'string');assert.ok(!JSON.stringify(noneBody).includes('Camille'),'400 never echoes submitted values');
   const badPhone=await(await call('/api/devis',mutation({...short,phone:'12'},ip))).json();assert.equal(typeof badPhone.fields.phone,'string');
   assert.equal((await call('/api/devis',mutation({...short,websiteUrl:'javascript:alert(1)'},ip))).status,400);
   assert.equal((await call('/api/devis',mutation({...short,websiteUrl:'data:text/html,x'},ip))).status,400);
   assert.equal((await call('/api/devis',mutation({...short,city:null},ip))).status,400,'null stays refused (documented): the form never sends null');
   const trap=await call('/api/devis',mutation({...short,website:'https://spam.example'},ip));assert.equal(trap.status,400);assert.equal((await trap.json()).fields,undefined);
   const phoneOnly=await call('/api/devis',mutation(short,ip));assert.equal(phoneOnly.status,201,await phoneOnly.clone().text());const ref=(await phoneOnly.json()).reference;assert.match(ref,/^SF-[0-9A-F]{8}$/);
   const found=await(await call(`/api/admin/requests?q=${encodeURIComponent(ref)}`,{headers:owner})).json();assert.equal(found.total,1);const row=found.requests[0];assert.equal(row.phone,'+33611223344');assert.equal(row.activity,short.activity);assert.equal(row.website_url,'https://monsite.fr');assert.equal(row.email,'');assert.equal(row.company,'');
   const detail=await(await call(`/api/admin/requests/${row.id}`,{headers:owner})).json();assert.equal(detail.request.activity,short.activity);assert.equal(detail.request.website_url,'https://monsite.fr');assert.match(detail.request.message,/^Autres besoins : Référencement SEO$/);
   assert.equal((await(await call('/api/admin/requests?q=0611223344',{headers:owner})).json()).total,1,'phone search on normalized digits');
   assert.equal((await(await call('/api/admin/requests?q=chauffagiste',{headers:owner})).json()).total,1,'activity search');
   const emailOnly=await call('/api/devis',mutation({...short,phone:'',email:'Court@Example.TEST',activity:'Restaurant'},ip));assert.equal(emailOnly.status,201,await emailOnly.clone().text());
   const savedEmail=await db.prepare('SELECT email,phone,activity FROM quote_requests WHERE email=?').bind('court@example.test').first();assert.deepEqual({...savedEmail},{email:'court@example.test',phone:'',activity:'Restaurant'});
   const burst=await Promise.all(Array.from({length:7},()=>call('/api/devis',mutation({...short,phone:'+33 6 99 88 77 66'},burstIp))));assert.equal(burst.filter(r=>r.status===201).length,5);assert.equal(burst.filter(r=>r.status===429).length,2);
   const other=await call('/api/devis',mutation({...short,phone:'07 99 88 77 66'},ip));assert.equal(other.status,201,'a different phone has its own counter');
   const legacy=await db.prepare("SELECT activity FROM quote_requests WHERE email='projet@example.test'").first();assert.equal(legacy.activity,'','older requests read activity=\'\'');
  });
  await t.test('consent-gated aggregate measurements and owner-only reporting',async()=>{
   for(const headers of [{},visitor])assert.equal((await call('/api/admin/analytics',{headers})).status,403);
   assert.equal((await call('/api/admin/analytics?days=120',{headers:owner})).status,400);
   const event={consent:true,path:'/creation-site-internet',event:'view',service:'none'};
   const headers={'cf-connecting-ip':'192.0.2.30'};
   assert.equal((await call('/api/analytics',mutation({...event,consent:false},headers))).status,400);
   assert.equal((await call('/api/analytics',mutation({...event,path:'/admin'},headers))).status,400);
   assert.equal((await call('/api/analytics',mutation({...event,path:'/contact?email=person@example.test'},headers))).status,400);
   assert.equal((await call('/api/analytics',mutation({...event,email:'person@example.test'},headers))).status,400);
   assert.equal((await call('/api/analytics',mutation(event,{...headers,origin:'https://untrusted.example'}))).status,403);
   for(let i=0;i<3;i++)assert.equal((await call('/api/analytics',mutation(event,headers))).status,204);
   assert.equal((await call('/api/analytics',mutation({...event,event:'service',service:'creation'},headers))).status,204);
   const r=await call('/api/admin/analytics?days=7',{headers:owner});assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/);const data=await r.json();
   assert.equal(data.pages.find(p=>p.path===event.path).views,3);assert.equal(data.interests.find(p=>p.service==='creation').total,1);assert.equal(data.campaigns.find(c=>c.campaign==='refonte_idf_01').total,1);
   const rows=(await db.prepare('SELECT * FROM analytics_daily').all()).results;assert.equal(rows.length,2);assert.ok(!JSON.stringify(rows).includes('192.0.2.30'));assert.deepEqual(Object.keys(rows[0]).sort(),['count','day','event','id','path','service'].sort());
   await db.prepare("INSERT INTO analytics_daily (id,day,path,event,service,count) VALUES ('expired','2020-01-01','/','view','none',5000)").run();
   const fresh=await(await call('/api/admin/analytics?days=90',{headers:owner})).json();assert.equal(fresh.pages.reduce((s,p)=>s+p.views,0),3);
  });
  await t.test('all service artwork and branding exist; SEO routes are canonical and unique',async()=>{
   for(const file of ['/smartfixx-logo.webp','/smartfixx-icon.png','/studio-web.webp','/studio-automation.webp','/studio-security.webp']){const r=await call(file);assert.equal(r.status,200,file);assert.match(r.headers.get('content-type'),/image/);}
   const titles=new Set();
   for(const path of ['/','/creation-site-internet','/refonte-site-internet','/developpement-sur-mesure','/automatisation-informatique','/cybersecurite','/referencement-seo','/prospection-emailing']){const html=await(await call(path)).text();const title=html.match(/<title>(.*?)<\/title>/)?.[1];assert.ok(title);assert.ok(!titles.has(title));titles.add(title);assert.match(html,/rel="canonical"/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,path);}
   const root=await(await call('/')).text();assert.match(root,/Créer mon site/);assert.match(root,/Gagner du temps/);assert.match(root,/Protéger mes outils/);assert.match(root,/studio-web.webp/);
   assert.equal((await call('/expertise-inconnue')).status,404);
  });
  const emailData={action:'recipient',campaign:'email_test_01',email:'person@example.test',name:'Camille',company:'Atelier & Co',source:'Site professionnel de l’entreprise',trackingConsent:false,consentProof:''};
  const emailPath=id=>`/api/admin/email-campaigns/${id}`;
  const localUrl=url=>{const u=new URL(url);return u.pathname+u.search};
  const findUrl=(html,part)=>{const escaped=part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return html.match(new RegExp(`(?:href|src)="([^"]*${escaped}[^" ]*)"`))?.[1].replaceAll('&amp;','&')};
  const tokenFrom=url=>new URL(url).searchParams.get('token')||new URL(url).pathname.split('/').pop();
  let plainId,plainExport,trackedId,trackedExport;
  await t.test('email campaigns require owner, validate source and consent, and escape recipient HTML',async()=>{
   for(const headers of [{},visitor]){assert.equal((await call('/api/admin/email-campaigns',{headers})).status,403);assert.equal((await call('/api/admin/email-suppressions',{headers})).status,403);assert.equal((await call('/api/admin/email-campaigns',mutation(emailData,headers))).status,403)}
   assert.equal((await call('/api/admin/email-campaigns',mutation(emailData,{...owner,origin:'https://untrusted.example'}))).status,403);
   assert.equal((await call('/api/admin/email-campaigns',mutation({...emailData,source:''},owner))).status,400);
   assert.equal((await call('/api/admin/email-campaigns',mutation({...emailData,trackingConsent:true},owner))).status,400);
   assert.equal((await call('/api/admin/email-campaigns?campaign=bad%20filter',{headers:owner})).status,400);
   const result=await call('/api/admin/email-campaigns',mutation({...emailData,name:'<img src=x onerror=alert(1)>'},owner));assert.equal(result.status,201,await result.clone().text());plainId=(await result.json()).id;
   plainExport=await(await call(emailPath(plainId),{headers:owner})).json();assert.ok(plainExport.html.includes('&lt;img src=x onerror=alert(1)&gt;'));assert.ok(!plainExport.html.includes('<img src=x'));assert.match(plainExport.html,/Atelier &amp; Co/);assert.ok(!plainExport.html.includes('/api/email/open'));assert.ok(!plainExport.html.includes('/api/email/click'));assert.match(plainExport.html,/Stop prospection/);assert.ok(!plainExport.previewHtml.includes(plainId));assert.ok(!plainExport.previewHtml.includes('/api/email/'));assert.ok(plainExport.headers['List-Unsubscribe'].includes('/api/email/unsubscribe?token='));
   assert.equal((await call(emailPath(plainId),{headers:visitor})).status,403);
   const admin=await call('/admin?tab=emails',{headers:owner});assert.equal(admin.status,200);assert.match(await admin.text(),/Un bel email/);
   for(const path of ['/email-logo.png','/email-envelope.png'])assert.equal((await call(path)).status,200);
  });
  await t.test('emails open services; legacy interest links cannot create a request or expose a contact',async()=>{
   const landing=findUrl(plainExport.html,'/services?');assert.ok(landing);assert.equal(new URL(landing).searchParams.get('utm_campaign'),emailData.campaign);assert.ok(!landing.includes(plainId));assert.ok(!plainExport.html.includes('/email/interest/'));assert.match(plainExport.html,/Découvrir les services/);
   const token=legacyInterest(plainId),response=await call('/email/interest/'+token);assert.equal(response.status,307);assert.equal(new URL(response.headers.get('location')).pathname,'/services');assert.equal(new URL(response.headers.get('location')).searchParams.get('utm_campaign'),emailData.campaign);assert.ok(!response.headers.get('location').includes(plainId));
   assert.match(response.headers.get('cache-control'),/no-store/);assert.equal(response.headers.get('referrer-policy'),'no-referrer');
   const action={token,action:'interest',consent:true};
   assert.equal((await call('/api/email/action',mutation({...action,consent:false}))).status,400);
   assert.equal((await call('/api/email/action',mutation(action,{origin:'https://untrusted.example'}))).status,403);
   for(let i=0;i<2;i++)assert.equal((await call('/api/email/action',mutation(action))).status,410);
   const record=await db.prepare('SELECT interested_at,request_id FROM email_recipients WHERE id=?').bind(plainId).first();assert.equal(record.interested_at,null);assert.equal(record.request_id,null);
   assert.equal((await db.prepare('SELECT count(*) AS n FROM quote_requests WHERE id=?').bind(plainId).first()).n,0);
   const html=await(await call(localUrl(landing))).text();assert.match(html,/href="\/creation-site-internet\?utm_campaign=email_test_01"/);assert.ok(!html.includes(emailData.email));
   const form=await(await call('/contact?service=refonte&utm_campaign=email_test_01')).text();assert.match(form,/Votre projet touche aussi/);assert.match(form,/project-email/);assert.match(form,/project-phone/);assert.ok(!form.includes('Oui, je souhaite être recontacté'));
  });
  await t.test('measurement starts after declared sending, excludes HEAD and uses distinct signed purposes',async()=>{
   const r=await call('/api/admin/email-campaigns',mutation({...emailData,email:'tracked@example.test',trackingConsent:true,consentProof:'2026-09-15 : accord explicite, formulaire de test #42'},owner));assert.equal(r.status,201,await r.clone().text());trackedId=(await r.json()).id;
   trackedExport=await(await call(emailPath(trackedId),{headers:owner})).json();const pixel=findUrl(trackedExport.html,'/api/email/open?'),click=findUrl(trackedExport.html,'/api/email/click?');assert.ok(pixel);assert.ok(click);assert.ok(!trackedExport.previewHtml.includes(trackedId));
   assert.equal((await call(localUrl(pixel))).status,200);assert.equal((await db.prepare('SELECT first_open_at FROM email_recipients WHERE id=?').bind(trackedId).first()).first_open_at,null);
   assert.equal((await call('/api/email/action',mutation({token:tokenFrom(pixel),action:'interest',consent:true}))).status,404);
   const mark={...mutation({action:'mark_sent'},owner),method:'PATCH'};assert.equal((await call(emailPath(trackedId),mark)).status,200);
   assert.equal((await call(localUrl(pixel),{method:'HEAD'})).status,200);assert.equal((await db.prepare('SELECT first_open_at FROM email_recipients WHERE id=?').bind(trackedId).first()).first_open_at,null);
   const open=await call(localUrl(pixel));assert.equal(open.headers.get('content-type'),'image/gif');assert.match(open.headers.get('cache-control'),/no-store/);assert.equal(open.headers.get('referrer-policy'),'no-referrer');
   const first=(await db.prepare('SELECT first_open_at FROM email_recipients WHERE id=?').bind(trackedId).first()).first_open_at;assert.ok(first);
   await call(localUrl(pixel));assert.equal((await db.prepare('SELECT first_open_at FROM email_recipients WHERE id=?').bind(trackedId).first()).first_open_at,first);
   await call(localUrl(click),{method:'HEAD'});assert.equal((await db.prepare('SELECT first_click_at FROM email_recipients WHERE id=?').bind(trackedId).first()).first_click_at,null);
   const redirected=await call(localUrl(click)+'&next=https://untrusted.example');assert.equal(redirected.status,302);assert.equal(new URL(redirected.headers.get('location')).origin,'https://smartfixx-reach.wgg9cdxhs2.chatgpt.site');assert.equal(new URL(redirected.headers.get('location')).pathname,'/services');assert.equal(new URL(redirected.headers.get('location')).searchParams.get('utm_campaign'),emailData.campaign);assert.ok(!redirected.headers.get('location').includes(trackedId));
   const row=await db.prepare('SELECT first_click_at,interested_at FROM email_recipients WHERE id=?').bind(trackedId).first();assert.ok(row.first_click_at);assert.equal(row.interested_at,null);
   const report=await(await call('/api/admin/email-campaigns',{headers:owner})).json();assert.equal(report.summary.opened,1);assert.equal(report.summary.clicked,1);assert.equal(report.summary.interested,0);assert.equal(report.summary.sent,1);
  });
  await t.test('withdrawing measurement deletes old signals and disables old exported links',async()=>{
   const prefs=findUrl(trackedExport.html,'/email/preferences/');assert.ok(prefs);assert.equal((await call(localUrl(prefs))).status,200);
   const before=await db.prepare('SELECT first_open_at FROM email_recipients WHERE id=?').bind(trackedId).first();assert.ok(before.first_open_at);
   const r=await call('/api/email/action',mutation({token:tokenFrom(prefs),action:'preferences',consent:true}));assert.equal(r.status,200);
   await call(localUrl(findUrl(trackedExport.html,'/api/email/open?')));await call(localUrl(findUrl(trackedExport.html,'/api/email/click?')));
   const after=await db.prepare('SELECT * FROM email_recipients WHERE id=?').bind(trackedId).first();assert.equal(after.first_open_at,null);assert.equal(after.first_click_at,null);assert.equal(after.tracking_consent,0);assert.ok(after.tracking_revoked_at);
   assert.equal((await db.prepare('SELECT count(*) AS n FROM email_suppressions WHERE email=?').bind(after.email).first()).n,0);
   const fresh=await(await call(emailPath(trackedId),{headers:owner})).json();assert.ok(!fresh.html.includes('/api/email/open'));
   assert.equal((await call('/api/admin/email-campaigns',mutation({...emailData,email:after.email,trackingConsent:true,consentProof:'An old consent cannot override withdrawal'},owner))).status,409);
   const report=await(await call('/api/admin/email-campaigns',{headers:owner})).json();assert.equal(report.summary.opened,0);assert.equal(report.summary.clicked,0);
  });
  await t.test('STOP is explicit and global, blocks preparation/export and supports RFC one-click',async()=>{
   const stop=findUrl(plainExport.html,'/email/stop/');assert.equal((await call(localUrl(stop))).status,200);assert.equal((await db.prepare('SELECT count(*) AS n FROM email_suppressions WHERE email=?').bind(emailData.email).first()).n,0);
   for(let i=0;i<2;i++)assert.equal((await call('/api/email/action',mutation({token:tokenFrom(stop),action:'stop',consent:true}))).status,200);
   assert.equal((await call('/api/admin/email-campaigns',mutation({...emailData,campaign:'another',email:'PERSON@example.test'},owner))).status,409);
   assert.equal((await call(emailPath(plainId),{headers:owner})).status,409);
   assert.equal((await call(emailPath(plainId),{...mutation({action:'mark_sent'},owner),method:'PATCH'})).status,409);
   const oneClick=trackedExport.headers['List-Unsubscribe'].match(/<([^>]+)>/)[1];const path=localUrl(oneClick);
   const get=await call(path);assert.equal(get.status,405);assert.equal((await db.prepare('SELECT count(*) AS n FROM email_suppressions WHERE email=?').bind('tracked@example.test').first()).n,0);
   const init={method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'List-Unsubscribe=One-Click'};
   assert.equal((await call(path,{...init,body:'List-Unsubscribe=Other'})).status,400);
   const wrong='/api/email/unsubscribe?token='+tokenFrom(findUrl(trackedExport.html,'/api/email/open?'));assert.equal((await call(wrong,init)).status,404);
   assert.equal((await call(path,init)).status,200);assert.equal((await call(path,init)).status,200);
   assert.equal((await call('/api/admin/email-campaigns',mutation({action:'suppress',email:'reply-stop@example.test'},owner))).status,200);
   const csv=await call('/api/admin/email-suppressions',{headers:owner});assert.equal(csv.status,200);assert.match(csv.headers.get('content-disposition'),/attachment/);const text=await csv.text();assert.match(text,/tracked@example.test/);assert.match(text,/reply-stop@example.test/);assert.match(text,/person@example.test/);
   const report=await(await call('/api/admin/email-campaigns?campaign=email_test_01',{headers:owner})).json();assert.equal(report.summary.stopped,2);assert.equal(report.suppressionTotal,3);
  });
  await t.test('expired measurement is excluded and expired interest links cannot create requests',async()=>{
   const r=await call('/api/admin/email-campaigns',mutation({...emailData,email:'expired-email@example.test',trackingConsent:true,consentProof:'2026-06-01 documented measurement agreement'},owner));assert.equal(r.status,201);const id=(await r.json()).id;const d=await(await call(emailPath(id),{headers:owner})).json();
   await db.prepare('UPDATE email_recipients SET created_at=?,sent_at=?,first_open_at=?,first_click_at=? WHERE id=?').bind(Date.now()-91*86400000,Date.now()-91*86400000,Date.now()-90*86400000,Date.now()-90*86400000,id).run();
   const report=await(await call('/api/admin/email-campaigns',{headers:owner})).json();assert.equal(report.summary.opened,0);assert.equal(report.summary.clicked,0);assert.equal(report.recipients.find(x=>x.id===id).first_open_at,null);
   const fresh=await(await call(emailPath(id),{headers:owner})).json();assert.ok(!fresh.html.includes('/api/email/open'));
   const click=await call(localUrl(findUrl(d.html,'/api/email/click?')));assert.equal(new URL(click.headers.get('location')).pathname,'/services');const interest=base+'/email/interest/'+legacyInterest(id);await db.prepare('UPDATE email_recipients SET expires_at=0 WHERE id=?').bind(id).run();
   assert.equal((await call('/api/email/action',mutation({token:tokenFrom(interest),action:'interest',consent:true}))).status,404);
   const expired=await call(localUrl(interest));assert.equal(expired.status,307);const destination=new URL(expired.headers.get('location'));assert.equal(destination.pathname,'/services');assert.equal(destination.search,'');assert.ok(!destination.href.includes('expired-email@example.test'));
   const stop=findUrl(d.html,'/email/stop/');assert.equal((await call('/api/email/action',mutation({token:tokenFrom(stop),action:'stop',consent:true}))).status,200,'STOP works while the expired record remains, with email fallback after cleanup');
  });
  let relayKey,smtpRevision,sendRun,sendTargets;
  const smtpConfig={host:'smtp.example.com',port:587,user:'user@example.com',password:'smtp-isolated-test-password',fromName:'SmartFixx',fromEmail:'contact@smartfixx.fr',replyTo:'contact@smartfixx.fr',intervalSeconds:10,dailyLimit:2,dkimSelector:'reach',dkimMode:'provider',dkimPrivateKey:''};
  const relay=body=>call('/api/relay',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+relayKey},body:JSON.stringify(body)});
  const campaignAction=(id,body)=>call(`/api/admin/campaigns/${id}`,mutation(body,owner));
  const draftBody={name:'Publicité ciblée test',subject:'Bonjour {{prenom}}, parlons de {{entreprise}}',content:{headline:'Votre prochaine campagne, préparée avec soin.',intro:'Bonjour {{prenom}}, développons la visibilité de {{entreprise}} avec une campagne emailing adaptée.',cta:'Discuter de ma campagne'}};
  async function createRun(){const r=await call('/api/admin/campaigns',mutation(draftBody,owner));assert.equal(r.status,201,await r.clone().text());return (await r.json()).id}
  async function runDetail(id){return (await call(`/api/admin/campaigns/${id}`,{headers:owner})).json()}
  async function launchRun(id,scheduledAt=null){const d=await runDetail(id);return campaignAction(id,{action:'launch',confirm:true,scheduledAt,updatedAt:d.campaign.updated_at})}
  async function verifySmtp(){assert.equal((await call('/api/admin/smtp',mutation({action:'verify'},owner))).status,200);const claimed=await(await relay({action:'claim'})).json();assert.equal(claimed.type,'verify');assert.equal((await relay({action:'verified',token:claimed.token,revision:claimed.revision,ok:true,error:''})).status,200);return claimed}
  async function unblockQuota(){await db.prepare("UPDATE smtp_settings SET next_send_at=0,day_reserved=0 WHERE id='primary'").run()}
  await t.test('SMTP settings are owner-only, reject unsafe input, encrypt secrets and never return them',async()=>{
   for(const headers of [{},visitor]){assert.equal((await call('/api/admin/smtp',{headers})).status,403);assert.equal((await call('/api/admin/campaigns',{headers})).status,403);assert.equal((await call('/api/admin/smtp',mutation({action:'save',revision:0,config:smtpConfig},headers))).status,403)}
   assert.equal((await call('/api/admin/smtp',mutation({action:'save',revision:0,config:smtpConfig},{...owner,origin:'https://untrusted.example'}))).status,403);
   assert.equal((await call('/api/admin/smtp',mutation({action:'save',revision:0,config:{...smtpConfig,host:'127.0.0.1'}},owner))).status,400);
   assert.equal((await call('/api/admin/smtp',mutation({action:'save',revision:0,config:{...smtpConfig,port:25}},owner))).status,400);
   const saved=await call('/api/admin/smtp',mutation({action:'save',revision:0,config:smtpConfig},owner));assert.equal(saved.status,200,await saved.clone().text());const text=await saved.text();assert.ok(!text.includes(smtpConfig.password));const data=JSON.parse(text);smtpRevision=data.revision;assert.equal(data.config.passwordSaved,true);assert.equal(data.config.password,undefined);
   const stored=await db.prepare("SELECT * FROM smtp_settings WHERE id='primary'").first();assert.match(stored.cipher,/^v1\./);assert.ok(!stored.cipher.includes(smtpConfig.password));assert.ok(!stored.cipher.includes(smtpConfig.host));
   assert.equal((await call('/api/admin/smtp',mutation({action:'save',revision:0,config:smtpConfig},owner))).status,409);
   const page=await call('/admin?tab=campaigns',{headers:owner});assert.equal(page.status,200);assert.match(await page.text(),/Nouvelle campagne/);
  });
  await t.test('relay pairing is scoped, verification is explicit and forged callbacks are ignored',async()=>{
   assert.equal((await call('/api/relay',mutation({action:'claim'}))).status,403);
   const pair=await(await call('/api/admin/smtp',mutation({action:'pair'},owner))).json();relayKey=pair.token;assert.equal(relayKey.length,43);assert.ok(!JSON.stringify(await(await call('/api/admin/smtp',{headers:owner})).json()).includes(relayKey));
   const idle=await(await relay({action:'claim'})).json();assert.equal(idle.type,'idle');assert.equal(idle.reason,'verify_required');
   await relay({action:'verified',token:'a'.repeat(43),revision:smtpRevision,ok:true,error:''});assert.equal((await db.prepare("SELECT verify_status FROM smtp_settings WHERE id='primary'").first()).verify_status,'untested');
   const verified=await verifySmtp();assert.equal(verified.config.password,smtpConfig.password);const state=await(await call('/api/admin/smtp',{headers:owner})).json();assert.equal(state.verifyStatus,'ok');assert.equal(state.runnerConnected,true);assert.equal(state.config.password,undefined);
   const oldKey=relayKey;relayKey='b'.repeat(43);assert.equal((await relay({action:'claim'})).status,403);relayKey=oldKey;
  });
  await t.test('campaign imports deduplicate, suppress globally and require documented measurement consent',async()=>{
   sendRun=await createRun();const row={email:'smtp-a@example.test',name:'Camille',company:'Atelier SMTP',source:'Contacts de test isolés',trackingConsent:true,consentProof:'2026-09-15 : consentement documenté de test'};
   assert.equal((await campaignAction(sendRun,{action:'import',rows:[{...row,consentProof:''}]})).status,400);
   const result=await campaignAction(sendRun,{action:'import',rows:[row,{...row,email:'SMTP-A@example.test'},{...row,email:'smtp-b@example.test'},{...row,email:'smtp-c@example.test'},{...row,email:'person@example.test'}]});assert.equal(result.status,200,await result.clone().text());const imported=await result.json();assert.equal(imported.added,3);assert.equal(imported.skipped,2);
   const d=await runDetail(sendRun);assert.equal(d.counts.total,3);assert.equal(d.campaign.recipient_count,3);sendTargets=d.targets;
   assert.equal((await call(`/api/admin/campaigns/${sendRun}`,{headers:visitor})).status,403);
   assert.equal((await campaignAction(sendRun,{action:'launch',confirm:false,scheduledAt:null,updatedAt:d.campaign.updated_at})).status,400);
   assert.equal((await launchRun(sendRun)).status,200);
   assert.equal((await campaignAction(sendRun,{action:'import',rows:[row]})).status,409);
   assert.equal((await campaignAction(sendRun,{action:'update',updatedAt:d.campaign.updated_at,...draftBody})).status,409);
  });
  await t.test('campaign requests count actual submitted projects and exclude visits, tests and expired requests',async()=>{
   const before=await runDetail(sendRun),code=before.campaign.code;assert.equal(before.counts.requests,0);
   await call('/services?utm_campaign='+code);assert.equal((await runDetail(sendRun)).counts.requests,0);
   const project={name:'Camille Projet',company:'Atelier Formulaire',email:'campaign-project@example.test',phone:'0600000000',service:'refonte',requestedServices:['automatisation','emailing','automatisation','refonte'],campaign:code,message:'Nous souhaitons refaire notre site et mieux gérer les demandes entrantes.',consent:true};
   const noContact=await call('/api/devis',mutation({...project,email:'',phone:''}));assert.equal(noContact.status,400);assert.equal(typeof (await noContact.json()).fields.email,'string');
   assert.equal((await call('/api/devis',mutation({...project,requestedServices:['unknown']}))).status,400);
   assert.equal((await call('/api/devis',mutation({...project,consent:false}))).status,400);
   assert.equal((await runDetail(sendRun)).counts.requests,0);
   assert.equal((await call('/api/devis',mutation(project))).status,201);
   const saved=await db.prepare('SELECT * FROM quote_requests WHERE email=?').bind(project.email).first();assert.equal(saved.phone,'+33600000000');assert.equal(saved.service,'refonte');assert.match(saved.message,/Autres besoins :/);assert.match(saved.message,/Automatisation/);assert.match(saved.message,/emailing/i);assert.ok(saved.message.endsWith(project.message));
   assert.equal((await runDetail(sendRun)).counts.requests,1);
   const list=await(await call('/api/admin/campaigns',{headers:owner})).json();assert.equal(list.campaigns.find(c=>c.id===sendRun).requests,1);
   await db.prepare('UPDATE quote_requests SET expires_at=0 WHERE id=?').bind(saved.id).run();assert.equal((await runDetail(sendRun)).counts.requests,0);
   await db.prepare('UPDATE quote_requests SET expires_at=? WHERE id=?').bind(Date.now()+86400000,saved.id).run();
  });
  await t.test('atomic queue respects cadence and quota; accepted SMTP messages retain tracking and unsubscribe links',async()=>{
   const attempts=await Promise.all(Array.from({length:8},()=>relay({action:'claim'}).then(r=>r.json())));const jobs=attempts.filter(x=>x.type==='job');assert.equal(jobs.length,1);const job=jobs[0];
   const start=await relay({action:'start',id:job.id,lease:job.lease});assert.equal(start.status,200,await start.clone().text());const payload=await start.json();assert.equal(payload.message.to,sendTargets.find(t=>t.id===job.id).email);assert.match(payload.message.html,/développons|développons/i);assert.match(payload.message.html,/\/api\/email\/open\?token=/);assert.match(payload.message.html,/\/api\/email\/click\?token=/);assert.match(payload.message.headers['List-Unsubscribe'],/\/api\/email\/unsubscribe/);assert.match(payload.message.subject,/Bonjour Camille/);assert.ok(!payload.message.subject.includes('{{'));
   assert.equal((await relay({action:'start',id:job.id,lease:job.lease})).status,409);
   assert.equal((await db.prepare('SELECT sent_at FROM email_recipients WHERE id=?').bind(job.id).first()).sent_at,null);
   const receipt={action:'receipt',id:job.id,lease:job.lease,result:'accepted',error:'',hardBounce:false};for(let i=0;i<2;i++)assert.equal((await relay(receipt)).status,200);
   const target=await db.prepare('SELECT * FROM campaign_targets WHERE id=?').bind(job.id).first();assert.equal(target.status,'accepted');assert.equal(target.attempts,1);assert.ok(target.message_id.includes(job.id));assert.ok((await db.prepare('SELECT sent_at FROM email_recipients WHERE id=?').bind(job.id).first()).sent_at);
   const pixel=findUrl(payload.message.html,'/api/email/open?');await call(localUrl(pixel));assert.ok((await db.prepare('SELECT first_open_at FROM email_recipients WHERE id=?').bind(job.id).first()).first_open_at);
   const exported=await(await call(emailPath(job.id),{headers:owner})).json();assert.equal(exported.managedCampaign,true);assert.match(exported.html,/développons/i);assert.equal((await call(emailPath(job.id),{...mutation({action:'mark_sent'},owner),method:'PATCH'})).status,409);
   await db.prepare("UPDATE smtp_settings SET next_send_at=0 WHERE id='primary'").run();const second=await(await relay({action:'claim'})).json();assert.equal(second.type,'job');await relay({action:'start',id:second.id,lease:second.lease});assert.equal((await relay({action:'receipt',id:second.id,lease:second.lease,result:'failed',error:'INVALID_RECIPIENT',hardBounce:true})).status,200);
   assert.ok(await db.prepare('SELECT email FROM email_suppressions WHERE email=?').bind(sendTargets.find(t=>t.id===second.id).email).first());
   await db.prepare("UPDATE smtp_settings SET next_send_at=0 WHERE id='primary'").run();const limited=await(await relay({action:'claim'})).json();assert.equal(limited.type,'idle');assert.equal(limited.reason,'daily_limit');
  });
  await t.test('pause and rescheduling are rechecked before SMTP; uncertain outcomes are never retried',async()=>{
   await unblockQuota();const job=await(await relay({action:'claim'})).json();assert.equal(job.type,'job');assert.equal((await campaignAction(sendRun,{action:'pause'})).status,200);assert.equal((await relay({action:'start',id:job.id,lease:job.lease})).status,409);
   assert.equal((await db.prepare('SELECT status FROM campaign_targets WHERE id=?').bind(job.id).first()).status,'queued','pause immediately releases only unstarted reservations');
   await db.prepare('UPDATE campaign_targets SET lease_expires_at=0 WHERE id=?').bind(job.id).run();assert.equal((await(await relay({action:'claim'})).json()).type,'idle');
   assert.equal((await launchRun(sendRun,Date.now()+86400000)).status,200);assert.equal((await(await relay({action:'claim'})).json()).type,'idle');
   await db.prepare('UPDATE campaign_runs SET scheduled_at=0 WHERE id=?').bind(sendRun).run();await unblockQuota();const next=await(await relay({action:'claim'})).json();assert.equal(next.id,job.id);assert.equal((await relay({action:'start',id:next.id,lease:next.lease})).status,200);
   await relay({action:'receipt',id:next.id,lease:next.lease,result:'unknown',error:'UNCERTAIN',hardBounce:false});const d=await runDetail(sendRun);assert.equal(d.campaign.status,'paused');assert.equal(d.counts.unknown,1);assert.equal((await(await relay({action:'claim'})).json()).type,'idle');
   await campaignAction(sendRun,{action:'retry_failed'});assert.equal((await db.prepare('SELECT status FROM campaign_targets WHERE id=?').bind(job.id).first()).status,'unknown');
   assert.equal((await campaignAction(sendRun,{action:'close_unknown'})).status,200);assert.equal((await db.prepare('SELECT status FROM campaign_targets WHERE id=?').bind(job.id).first()).status,'closed');
  });
  await t.test('STOP after reservation blocks start; delayed accepted receipt can resolve an uncertain transmission',async()=>{
   const id=await createRun(),row={email:'late-stop@example.test',name:'Test',company:'Test',source:'Test uniquement',trackingConsent:false,consentProof:''};await campaignAction(id,{action:'import',rows:[row,{...row,email:'late-receipt@example.test'}]});await unblockQuota();assert.equal((await launchRun(id)).status,200);const job=await(await relay({action:'claim'})).json();const target=await db.prepare('SELECT email FROM campaign_targets WHERE id=?').bind(job.id).first();
   await call('/api/admin/email-campaigns',mutation({action:'suppress',email:target.email},owner));assert.equal((await relay({action:'start',id:job.id,lease:job.lease})).status,409);assert.equal((await db.prepare('SELECT status FROM campaign_targets WHERE id=?').bind(job.id).first()).status,'excluded');
   await unblockQuota();const next=await(await relay({action:'claim'})).json();assert.equal(next.type,'job');assert.equal((await relay({action:'start',id:next.id,lease:next.lease})).status,200);await db.prepare('UPDATE campaign_targets SET lease_expires_at=0 WHERE id=?').bind(next.id).run();await relay({action:'claim'});assert.equal((await db.prepare('SELECT status FROM campaign_targets WHERE id=?').bind(next.id).first()).status,'unknown');
   await relay({action:'receipt',id:next.id,lease:next.lease,result:'accepted',error:'',hardBounce:false});assert.equal((await db.prepare('SELECT status FROM campaign_targets WHERE id=?').bind(next.id).first()).status,'accepted');
  });
  await t.test('test emails require a live verified relay, omit measurement and remain outside campaign totals',async()=>{
   const id=await createRun();await unblockQuota();assert.equal((await campaignAction(id,{action:'test',email:'owner-test@example.test',confirm:true})).status,200);assert.equal((await campaignAction(id,{action:'test',email:'owner-test@example.test',confirm:true})).status,409);const job=await(await relay({action:'claim'})).json();assert.equal(job.type,'job');const payload=await(await relay({action:'start',id:job.id,lease:job.lease})).json();assert.match(payload.message.subject,/^\[TEST\]/);assert.ok(!payload.message.html.includes('/api/email/open'));assert.ok(!payload.message.html.includes('/email/interest/'));assert.deepEqual(payload.message.headers,{});
   await relay({action:'receipt',id:job.id,lease:job.lease,result:'accepted',error:'',hardBounce:false});const report=await runDetail(id);assert.equal(report.counts.total,0);assert.equal(report.targets[0].is_test,1);
   const csv=await call(`/api/admin/campaigns/${id}/report`,{headers:owner});assert.equal(csv.status,200);assert.match(csv.headers.get('content-disposition'),/attachment/);const text=await csv.text();assert.match(text,/owner-test@example.test/);assert.ok(!text.includes(job.lease));assert.ok(!text.includes(smtpConfig.password));assert.equal((await call(`/api/admin/campaigns/${id}/report`,{headers:visitor})).status,403);
  });
  await t.test('relay v2 diagnostics persist in the owner journal and report; legacy receipts remain accepted',async()=>{
   const id=await createRun();await unblockQuota();
   assert.equal((await campaignAction(id,{action:'test',email:'diagnostic-test@example.test',confirm:true})).status,200);
   const job=await(await relay({action:'claim',version:'2'})).json();assert.equal(job.type,'job');
   assert.equal((await relay({action:'start',id:job.id,lease:job.lease})).status,200);
   const diagnostic={responseCode:550,enhancedStatus:'5.7.1',command:'MAIL FROM',reason:'SENDER_NOT_ALLOWED'};
   const report={action:'receipt',id:job.id,lease:job.lease,result:'failed',error:'REJECTED',hardBounce:false,diagnostic};
   assert.equal((await relay({...report,diagnostic:{...diagnostic,response:'secret SMTP response'}})).status,400);
   assert.equal((await relay(report)).status,200);assert.equal((await relay(report)).status,200);
   const state=await(await call('/api/admin/smtp',{headers:owner})).json();assert.equal(state.runnerVersion,'2');
   const d=await runDetail(id);const a=d.activity.find(t=>t.id===job.id);assert.equal(a.status,'failed');assert.ok(a.updated_at>=a.started_at);assert.deepEqual(JSON.parse(a.smtp_diagnostic),diagnostic);
   assert.ok(!JSON.stringify(d).includes(job.lease));assert.ok(!JSON.stringify(d).includes(smtpConfig.password));
   assert.equal((await call(`/api/admin/campaigns/${id}`,{headers:visitor})).status,403);
   const csv=await(await call(`/api/admin/campaigns/${id}/report`,{headers:owner})).text();assert.match(csv,/550/);assert.match(csv,/MAIL FROM/);assert.match(csv,/autorisée/);
   await unblockQuota();assert.equal((await campaignAction(id,{action:'test',email:'diagnostic-test@example.test',confirm:true})).status,200);
   const next=await(await relay({action:'claim'})).json();assert.equal(next.id,job.id);assert.equal((await relay({action:'start',id:next.id,lease:next.lease})).status,200);
   assert.equal((await relay({action:'receipt',id:next.id,lease:next.lease,result:'accepted',error:'',hardBounce:false})).status,200);
   assert.deepEqual(JSON.parse((await runDetail(id)).activity[0].smtp_diagnostic),{});
  });
  await t.test('SMTP changes preserve blank secrets only for unchanged accounts and invalidate previous verification',async()=>{
   const state=await(await call('/api/admin/smtp',{headers:owner})).json();const change={...smtpConfig,password:'',host:'another.example.com'};assert.equal((await call('/api/admin/smtp',mutation({action:'save',revision:state.revision,config:change},owner))).status,400);
   assert.equal((await call('/api/admin/smtp',mutation({action:'save',revision:state.revision,config:{...smtpConfig,password:'',dailyLimit:10}},owner))).status,200);const after=await(await call('/api/admin/smtp',{headers:owner})).json();assert.equal(after.verifyStatus,'untested');assert.equal(after.config.passwordSaved,true);const checked=await verifySmtp();assert.equal(checked.config.password,smtpConfig.password);
   const old=relayKey;const pair=await(await call('/api/admin/smtp',mutation({action:'pair'},owner))).json();assert.notEqual(pair.token,old);assert.equal((await relay({action:'claim'})).status,403);relayKey=pair.token;
  });
  await t.test('v3 reserves batches within quota, excludes another relay and rechecks pause before every SMTP start',async()=>{
   const state=await(await call('/api/admin/smtp',{headers:owner})).json();
   assert.equal((await call('/api/admin/smtp',mutation({action:'cadence',revision:state.revision,ratePerSecond:14,providerMaxRate:14,maxConnections:20,dailyLimit:9},owner))).status,200);
   const after=await(await call('/api/admin/smtp',{headers:owner})).json();assert.equal(after.verifyStatus,'ok');assert.equal(after.config.ratePerSecond,14);assert.equal(after.config.password,undefined);
   const id=await createRun();await campaignAction(id,{action:'import',rows:Array.from({length:20},(_,i)=>({email:`parallel-${i}@example.test`,source:'Test isolé v3',trackingConsent:false}))});await unblockQuota();
   assert.equal((await launchRun(id)).status,409,'v2 cannot launch a multi-email-per-second campaign');
   const session=crypto.randomUUID();const v3=capacity=>relay({action:'claim',version:'3',session,capacity}).then(r=>r.json());
   await v3(20);assert.equal((await launchRun(id)).status,200);const batch=await v3(20);assert.equal(batch.type,'jobs');assert.equal(batch.jobs.length,9);assert.equal(new Set(batch.jobs.map(j=>j.id)).size,9);assert.equal(batch.ratePerSecond,14);
   assert.equal((await v3(20)).reason,'daily_limit');
   assert.equal((await(await relay({action:'claim',version:'3',session:crypto.randomUUID(),capacity:20})).json()).reason,'another_relay');
   const first=batch.jobs[0];assert.equal((await relay({action:'start',...first})).status,200);
   await campaignAction(id,{action:'pause'});assert.equal((await relay({action:'start',...batch.jobs[1]})).status,409);
   await relay({action:'receipt',...first,result:'accepted',error:'',hardBounce:false});
   const d=await runDetail(id);assert.equal(d.counts.accepted,1);assert.equal(d.counts.queued,19);assert.equal(d.campaign.status,'paused');
   await campaignAction(id,{action:'cancel'});await campaignAction(id,{action:'resume_pending'});const resumed=await runDetail(id);assert.equal(resumed.counts.accepted,1);assert.equal(resumed.counts.queued,19);assert.equal(resumed.campaign.status,'paused');
   assert.equal((await db.prepare('SELECT status FROM campaign_targets WHERE id=?').bind(first.id).first()).status,'accepted');
   await campaignAction(id,{action:'cancel'});await db.prepare("UPDATE smtp_settings SET runner_session_until=0 WHERE id='primary'").run();
  });
  await t.test('periodic controls are durable and unique, use the same template, and do not inflate prospect results',async()=>{
   const state=await(await call('/api/admin/smtp',{headers:owner})).json();await call('/api/admin/smtp',mutation({action:'cadence',revision:state.revision,ratePerSecond:14,providerMaxRate:14,maxConnections:20,dailyLimit:100000},owner));await unblockQuota();
   const id=await createRun();let d=await runDetail(id);assert.equal((await campaignAction(id,{action:'controls',updatedAt:d.campaign.updated_at,email:'control@example.test',every:2})).status,200);
   d=await runDetail(id);assert.equal((await campaignAction(id,{action:'update',updatedAt:d.campaign.updated_at,...draftBody,content:{...draftBody.content,style:'simple'}})).status,200);
   await campaignAction(id,{action:'import',rows:Array.from({length:6},(_,i)=>({email:`milestone-${i}@example.test`,source:'Test isolé contrôles',trackingConsent:false}))});
   const session=crypto.randomUUID(),v3=()=>relay({action:'claim',version:'3',session,capacity:20}).then(r=>r.json());await v3();await launchRun(id);
   const batch=await v3();assert.equal(batch.jobs.length,6);
   for(const j of batch.jobs){const payload=await(await relay({action:'start',...j})).json();assert.ok(!payload.message.html.includes('email-envelope.png'));assert.match(payload.message.html,/Découvrir les services SmartFixx/);assert.match(payload.message.html,/Stop prospection/);await relay({action:'receipt',...j,result:'accepted',error:'',hardBounce:false})}
   await unblockQuota();await v3();await v3();
   assert.equal((await db.prepare('SELECT control_accepted FROM campaign_runs WHERE id=?').bind(id).first()).control_accepted,6);await relay({action:'receipt',...batch.jobs[0],result:'accepted',error:'',hardBounce:false});assert.equal((await db.prepare('SELECT control_accepted FROM campaign_runs WHERE id=?').bind(id).first()).control_accepted,6);
   const controls=await db.prepare('SELECT * FROM campaign_targets WHERE run_id=? AND control_milestone>0 ORDER BY control_milestone').bind(id).all();assert.equal(controls.results.length,3);assert.deepEqual(controls.results.map(r=>r.control_milestone),[2,4,6]);
   assert.equal((await runDetail(id)).counts.total,6);assert.equal((await runDetail(id)).counts.controlsTotal,3);const onlyControls=await(await call(`/api/admin/campaigns/${id}?status=controls`,{headers:owner})).json();assert.equal(onlyControls.total,3);assert.ok(onlyControls.targets.every(t=>t.control_milestone>0));
   for(const control of controls.results){assert.equal(control.email,'control@example.test');if(control.status==='leased'){const payload=await(await relay({action:'start',id:control.id,lease:control.lease_token})).json();assert.ok(!payload.message.subject.includes('[TEST]'));assert.ok(!payload.message.html.includes('/api/email/open'));assert.ok(!payload.message.html.includes('milestone-'));await relay({action:'receipt',id:control.id,lease:control.lease_token,result:'accepted',error:'',hardBounce:false})}}
   const report=await runDetail(id);assert.equal(report.counts.accepted,6);assert.equal(report.counts.controlsAccepted,3);
   await v3();assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM campaign_targets WHERE run_id=? AND control_milestone>0').bind(id).first()).n,3);
  });
  await t.test('light and dark controls are available on public and owner pages with the existing nonce policy',async()=>{
   for(const path of ['/services','/contact','/confidentialite','/admin?tab=campaigns']){const r=await call(path,{headers:owner}),html=await r.text();assert.equal(r.status,200);assert.match(html,/Apparence du site/);assert.match(html,/smartfixx-theme/);assert.match(html,/Activer le mode sombre/);const nonce=/nonce-([a-f0-9]+)/.exec(r.headers.get('content-security-policy'))?.[1];assert.ok([...html.matchAll(/<script\b([^>]*)>/g)].every(m=>m[1].includes(`nonce="${nonce}"`)));}
  });
  await t.test('VPS export is owner-only, encrypted and refuses active transmissions',async()=>{
   const raw=crypto.getRandomValues(new Uint8Array(32)),key=Buffer.from(raw).toString('base64url');
   assert.equal((await call('/api/admin/transfer',mutation({key}))).status,403);
   assert.equal((await call('/api/admin/transfer',mutation({key},{...owner,origin:'https://evil.example'}))).status,403);
   await db.prepare("UPDATE campaign_runs SET status='paused' WHERE status='running'").run();await db.prepare("UPDATE campaign_targets SET status='unknown' WHERE status IN ('leased','sending')").run();
   const r=await call('/api/admin/transfer',mutation({key},owner));assert.equal(r.status,200,await r.clone().text());const exported=await r.json();assert.equal(exported.format,'smartfixx-transfer-v1');assert.ok(!JSON.stringify(exported).includes('local-test-secret-not-for-production'));
   const k=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:Buffer.from(exported.iv,'base64'),additionalData:Buffer.from('smartfixx-transfer-v1')},k,Buffer.from(exported.data,'base64'));const payload=JSON.parse(Buffer.from(bytes).toString());assert.equal(payload.secret,'local-test-secret-not-for-production');assert.ok(payload.tables.email_suppressions.length);assert.ok(!('admin_identities' in payload.tables));
   await db.prepare("UPDATE campaign_runs SET status='running' WHERE id=(SELECT id FROM campaign_runs LIMIT 1)").run();assert.equal((await call('/api/admin/transfer',mutation({key},owner))).status,409);
  });
 }finally{await mf.dispose();}
});
