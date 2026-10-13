import test from 'node:test';import assert from 'node:assert/strict';import {spawn,execFileSync} from 'node:child_process';import {mkdtempSync,rmSync} from 'node:fs';import {resolve} from 'node:path';import {tmpdir} from 'node:os';
const build=process.env.SMARTFIXX_TEST_BUILD;if(!build)throw new Error('Set SMARTFIXX_TEST_BUILD to the prepared, built VPS source.');
const data=mkdtempSync(resolve(tmpdir(),'smartfixx-http-')),env={...process.env,SMARTFIXX_DATA_DIR:data,NEXT_TELEMETRY_DISABLED:'1'},base='http://127.0.0.1:3187',origin='https://smartfixx.fr',password='test-local-owner-password-32-characters';
const next=resolve('node_modules/next/dist/bin/next');let output='';
execFileSync(process.execPath,['runtime/cli.mjs','init'],{cwd:build,env});execFileSync(process.execPath,['runtime/cli.mjs','owner'],{cwd:build,env,input:'owner@example.test\n'+password+'\n'});
const standalone=process.env.SMARTFIXX_STANDALONE;const server=spawn(process.execPath,standalone?[resolve(standalone,'server.js')]:[next,'start','-p','3187','-H','127.0.0.1'],{cwd:standalone||build,env:{...env,PORT:'3187',HOSTNAME:'127.0.0.1'},stdio:['ignore','pipe','pipe']});server.stdout.on('data',s=>output+=s);server.stderr.on('data',s=>output+=s);
const call=(path,init={})=>fetch(base+path,{redirect:'manual',...init});const post=(body,cookie='')=>({method:'POST',headers:{'Content-Type':'application/json',origin,cookie},body:JSON.stringify(body)});
test('VPS HTTP server: public pages, private admin, forms, campaign persistence and export',async t=>{try{
 let ready=false;for(let i=0;i<100;i++){try{if((await call('/api/health')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}assert.ok(ready,output);let cookie='';
 await t.test('public chapters render with local canonical URLs, dark/light controls and nonces',async()=>{
  for(const path of ['/','/services','/contact','/diagnostic','/tarifs','/cybersecurite','/prospection-emailing','/conseils','/admin/login']){const r=await call(path);assert.equal(r.status,200,path);const text=await r.text();assert.match(text,/<h1/);assert.match(text,/smartfixx-theme/);const nonce=/nonce-([^']+)/.exec(r.headers.get('content-security-policy'))?.[1];assert.ok(nonce);const scripts=[...text.matchAll(/<script\b([^>]*)>/g)];assert.ok(scripts.length);assert.ok(scripts.every(m=>m[1].includes('nonce="'+nonce+'"')),path+' script missing nonce');if(!path.startsWith('/admin'))assert.ok(!text.includes('chatgpt.site'))}
  assert.match(await(await call('/sitemap.xml')).text(),/https:\/\/smartfixx.fr\/services/);
 });
 await t.test('anonymous requests and forged ChatGPT headers cannot access any admin data',async()=>{
  for(const path of ['/api/admin/requests','/api/admin/smtp','/api/admin/analytics','/api/admin/campaigns','/api/admin/email-campaigns','/api/admin/email-suppressions']){assert.equal((await call(path)).status,403);assert.equal((await call(path,{headers:{'oai-authenticated-user-id':'vps-owner','oai-authenticated-user-email':'owner@example.test'}})).status,403)}
  const r=await call('/admin');assert.equal(r.status,307);assert.match(r.headers.get('location'),/\/admin\/login/);assert.equal((await call('/api/admin/transfer',post({key:'a'.repeat(43)}))).status,403);
 });
 await t.test('login requires correct credentials and origin, and issues only a protected cookie',async()=>{
  const body={email:'owner@example.test',password};const bad=post(body);bad.headers.origin='https://attacker.example';assert.equal((await call('/api/admin/login',bad)).status,403);
  assert.equal((await call('/api/admin/login',post({...body,password:'wrong'}))).status,403);const r=await call('/api/admin/login',post(body));assert.equal(r.status,200,await r.clone().text());const value=r.headers.get('set-cookie');assert.match(value,/HttpOnly/i);assert.match(value,/Secure/i);assert.match(value,/SameSite=strict/i);cookie=value.split(';')[0];assert.equal((await call('/admin',{headers:{cookie}})).status,200);
 });
 await t.test('form persistence and owner-only list survive independent requests',async()=>{
  const q={name:'Test Contact',company:'Example Test',email:'contact@example.test',phone:'0600000000',message:'Nous souhaitons cibler les entreprises de notre région.',audience:'b2b',source:'included',volume:10000,plan:'acceleration',consent:true,website:''};const r=await call('/api/devis',post(q));assert.equal(r.status,201,await r.clone().text());const list=await(await call('/api/admin/requests',{headers:{cookie}})).json();assert.equal(list.total,1);assert.equal(list.requests[0].email,q.email);
 });
 await t.test('campaign drafts persist and exports are encrypted',async()=>{
  const r=await call('/api/admin/campaigns',post({name:'Campagne VPS de test',subject:'Présentation de notre agence',content:{headline:'Votre offre mérite de nouveaux clients',intro:'Nous préparons votre publicité et vos nouveaux projets web.',cta:'Découvrir les services',style:'simple'}},cookie));assert.equal(r.status,201,await r.clone().text());const campaigns=await(await call('/api/admin/campaigns',{headers:{cookie}})).json();assert.ok(JSON.stringify(campaigns).includes('Campagne VPS de test'));
  const key=crypto.getRandomValues(new Uint8Array(32));const encoded=Buffer.from(key).toString('base64url');const exported=await call('/api/admin/transfer',post({key:encoded},cookie));assert.equal(exported.status,200,await exported.clone().text());const file=await exported.json();assert.equal(file.format,'smartfixx-transfer-v1');assert.ok(!JSON.stringify(file).includes('contact@example.test'));
 });
 await t.test('editable block emails persist their HTML and subject without sending',async()=>{
  const content={style:'blocks',headline:'Les solutions pour votre entreprise',intro:'Découvrez nos offres et nos accompagnements.',cta:'Découvrir les services',customHtml:'<p>'+ 'Texte éditable. '.repeat(900) + '</p><a href="{{lien_emailing}}">Emailing</a>'};
  const subject='Et si votre prochain client vous découvrait par email ?';
  const r=await call('/api/admin/campaigns',post({name:'Blocs de services',subject,content},cookie));assert.equal(r.status,201,await r.clone().text());const {id}=await r.json();
  const detail=await(await call('/api/admin/campaigns/'+id,{headers:{cookie}})).json();assert.equal(detail.campaign.subject,subject);assert.equal(JSON.parse(detail.campaign.content_json).customHtml,content.customHtml);assert.equal(detail.campaign.status,'draft');
  for(const path of ['/prospection-emailing','/creation-site-internet','/refonte-site-internet','/automatisation-informatique','/developpement-sur-mesure','/cybersecurite','/referencement-seo'])assert.equal((await call(path)).status,200,path);
 });
 await t.test('logout revokes the server session',async()=>{
  const r=await call('/api/admin/logout',{method:'POST',headers:{cookie,origin}});assert.equal(r.status,303);assert.equal((await call('/api/admin/requests',{headers:{cookie}})).status,403);
 });
 }finally{server.kill('SIGTERM');await new Promise(r=>server.once('exit',r));rmSync(data,{recursive:true,force:true})}});
