import test from 'node:test';import assert from 'node:assert/strict';import {spawn,execFileSync} from 'node:child_process';import {mkdtempSync,rmSync,readFileSync} from 'node:fs';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {tmpdir} from 'node:os';
/* SEO technique de la variante VPS (lot 7) : redirections 308 de lib/legacy-redirects.ts, 404, og:image,
   robots, sitemap, JSON-LD, icônes et cache. Même amorçage que http.test.mjs, sur son propre port (3188) ;
   scripts/qa/test-vps-strict.sh sérialise les deux fichiers par flock /tmp/smartfixx-http.lock. */
const build=process.env.SMARTFIXX_TEST_BUILD;if(!build)throw new Error('Set SMARTFIXX_TEST_BUILD to the prepared, built VPS source.');
const data=mkdtempSync(resolve(tmpdir(),'smartfixx-http-seo-')),env={...process.env,SMARTFIXX_DATA_DIR:data,NEXT_TELEMETRY_DISABLED:'1'},base='http://127.0.0.1:3188',site='https://smartfixx.fr',password='test-local-owner-password-32-characters';
const next=resolve('node_modules/next/dist/bin/next');let output='';
execFileSync(process.execPath,['runtime/cli.mjs','init'],{cwd:build,env});execFileSync(process.execPath,['runtime/cli.mjs','owner'],{cwd:build,env,input:'owner@example.test\n'+password+'\n'});
const standalone=process.env.SMARTFIXX_STANDALONE;const server=spawn(process.execPath,standalone?[resolve(standalone,'server.js')]:[next,'start','-p','3188','-H','127.0.0.1'],{cwd:standalone||build,env:{...env,PORT:'3188',HOSTNAME:'127.0.0.1'},stdio:['ignore','pipe','pipe']});server.stdout.on('data',s=>output+=s);server.stderr.on('data',s=>output+=s);
const call=(path,init={})=>fetch(base+path,{redirect:'manual',...init});
/* Liste importée telle quelle depuis la source préparée (lib/legacy-redirects.ts, copiée par prepare.py ;
   Node ≥ 22.18 supprime les types, comme tests/legacy-redirects.test.mjs) : aucune entrée n'échappe au test,
   quelle que soit l'écriture de sa destination. */
const {legacyRedirects:legacy,nextRedirects}=await import(pathToFileURL(resolve(build,'lib/legacy-redirects.ts')).href);
/* Dates des guides : lib/guides.ts les porte (lot 9) et l'Article JSON-LD comme le sitemap les reprennent.
   Tant que la source préparée ne les déclare pas, la cohérence reste un « todo » visible au lieu d'un échec. */
const guidesDated=/\bdateModified\s*:/.test(readFileSync(resolve(build,'lib/guides.ts'),'utf8'));
const ldOf=html=>[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
const types=node=>{const out=[];const walk=n=>{if(Array.isArray(n))return n.forEach(walk);if(n&&typeof n==='object'){if(n['@type'])out.push(...[].concat(n['@type']));Object.values(n).forEach(walk)}};walk(node);return out};
const meta=(html,attr,name)=>new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`).exec(html)?.[1]??new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${name}"`).exec(html)?.[1];
const pngSize=buf=>({width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)});
test('VPS SEO: legacy redirects, 404, sharing image, robots, sitemap, structured data, icons and cache',async t=>{try{
 let ready=false;for(let i=0;i<100;i++){try{if((await call('/api/health')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}assert.ok(ready,output);
 await t.test('each legacy URL answers a targeted 308 that keeps the query and lands on a 200 page',async()=>{
  assert.ok(legacy.length>=19,`entrées lues : ${legacy.length}`);assert.equal(nextRedirects().length,legacy.length,'nextRedirects() ne reprend pas toute la liste');
  for(const {source,destination} of legacy){
   const r=await call(source);assert.equal(r.status,308,source);const loc=r.headers.get('location');assert.equal(loc,destination,source);assert.notEqual(loc,'/',source);
   const q=await call(source+'?utm_campaign=x');assert.equal(q.status,308);assert.equal(q.headers.get('location'),destination+'?utm_campaign=x',source);
   assert.equal((await call(destination)).status,200,destination);
  }
  /* Sources insensibles à la casse (comparaison de Next) : l'ancienne URL écrite autrement redirige aussi. */
  for(const {source,destination} of legacy.slice(0,3)){const up=source.replace(/(^|[/-])([a-z])/g,(m,a,b)=>a+b.toUpperCase());const r=await call(up);assert.equal(r.status,308,up);assert.equal(r.headers.get('location'),destination,up)}
 });
 /* HTML initial complet (pas l'enveloppe vide <html id="__next_error__"> d'un notFound() levé par une page) :
    voir les réécritures afterFiles de vps/overlay/next.config.ts. */
 await t.test('unknown URLs answer a real 404 page with header, useful links and noindex',async()=>{
  for(const path of ['/creation-site-internet-inconnu','/expertise-inconnue','/page-inexistante','/conseils/guide-inconnu','/a/b/c']){
   const r=await call(path);assert.equal(r.status,404,path);const html=await r.text();assert.doesNotMatch(html,/__next_error__/,path);
   assert.match(html,/<header/);assert.match(html,/<title>Page introuvable \| SmartFixx<\/title>/);assert.match(html,/<meta name="robots" content="[^"]*noindex/);
   assert.equal((html.match(/<h1[\s>]/g)||[]).length,1,path);assert.match(html,/Cette page est[\s\u00A0]introuvable/);
   for(const href of ['/creation-site-internet','/refonte-site-internet','/creation-site-internet-asnieres-sur-seine','/agence-web-ile-de-france','/contact'])assert.ok(html.includes(`href="${href}"`),`${path} : lien ${href}`);
   assert.ok(!html.includes('chatgpt.site'));const nonce=/nonce-([^']+)/.exec(r.headers.get('content-security-policy'))?.[1];assert.ok(nonce);assert.ok([...html.matchAll(/<script\b([^>]*)>/g)].every(m=>m[1].includes('nonce="'+nonce+'"')),path+' script sans nonce');
  }
 });
 /* Limite assumée (constat du lot 7) : une variante en majuscules d'un slug SERVI échappe à la réécriture
    afterFiles (Next compare sans tenir compte de la casse, la page exclue l'est aussi en majuscules) et tombe
    sur notFound() de la page : 404 + noindex, mais enveloppe vide remplie par le client. Aucun lien publié
    n'emploie ces variantes ; le test garde l'essentiel pour le référencement : jamais de 200 en double. */
 await t.test('uppercase variants of served slugs never answer a duplicate 200',async()=>{
  for(const path of ['/Creation-Site-Internet','/CREATION-SITE-INTERNET-ASNIERES-SUR-SEINE','/conseils/Preparer-Refonte-Site-Internet']){
   const r=await call(path);assert.equal(r.status,404,path);assert.match(await r.text(),/<meta name="robots" content="[^"]*noindex/,path);
  }
 });
 await t.test('public pages declare an absolute og:image and a large Twitter card',async()=>{
  for(const path of ['/','/creation-site-internet','/refonte-site-internet','/creation-site-internet-asnieres-sur-seine','/conseils/preparer-refonte-site-internet']){
   const html=await(await call(path)).text();assert.equal(meta(html,'property','og:image'),site+'/og-image.png',path);assert.equal(meta(html,'name','twitter:card'),'summary_large_image',path);
  }
 });
 await t.test('robots and sitemap point at smartfixx.fr, list only canonical 200 pages and match the canonical home',async()=>{
  const robots=await call('/robots.txt');assert.equal(robots.status,200);const rt=await robots.text();assert.match(rt,/Sitemap: https:\/\/smartfixx\.fr\/sitemap\.xml/);for(const d of ['/email/','/admin','/api/'])assert.ok(rt.includes('Disallow: '+d),d);
  const sm=await call('/sitemap.xml');assert.equal(sm.status,200);const xml=await sm.text();const locs=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  assert.equal(locs.length,24);assert.ok(locs.every(l=>l===site||l.startsWith(site+'/')));assert.ok(!/changefreq|priority/.test(xml));assert.equal((xml.match(/<lastmod>/g)||[]).length,24);
  for(const {source} of legacy)assert.ok(!locs.includes(site+source),source);
  const home=await(await call('/')).text();const canonical=/<link rel="canonical" href="([^"]+)"/.exec(home)?.[1];assert.ok(locs.includes(canonical),`canonique de l'accueil ${canonical} absente du sitemap`);
  for(const loc of locs.slice(0,24)){const path=loc.slice(site.length)||'/';const r=await call(path);assert.equal(r.status,200,path)}
 });
 await t.test('each guide has the same date in the sitemap and in its Article JSON-LD',{todo:guidesDated?false:'dates des guides à déclarer dans lib/guides.ts (lot 9)'},async()=>{
  const xml=await(await call('/sitemap.xml')).text();const entries=[...xml.matchAll(/<url>\s*<loc>([^<]+\/conseils\/[^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)];assert.ok(entries.length>=3,'guides absents du sitemap');
  for(const [,loc,lastmod] of entries){const ld=ldOf(await(await call(loc.slice(site.length))).text()).flatMap(n=>n['@graph']||[n]);const article=ld.find(n=>n['@type']==='Article');assert.ok(article,loc);
   assert.equal(lastmod.slice(0,10),String(article.dateModified).slice(0,10),loc);}
 });
 await t.test('structured data: Organization with phone and 4 areas, no forbidden types, no chatgpt.site',async()=>{
  const home=ldOf(await(await call('/')).text());const org=home.flatMap(n=>n['@graph']||[n]).find(n=>n['@type']==='Organization');assert.ok(org,'Organization');
  assert.equal(org['@id'],site+'/#organization');assert.equal(org.telephone,'+33 6 18 74 51 80');assert.equal(org.areaServed.length,4);assert.deepEqual(org.areaServed.map(a=>a['@type']),['City','AdministrativeArea','AdministrativeArea','Country']);assert.equal(org.iso6523Code,'0002:943047290');
  for(const path of ['/','/creation-site-internet','/creation-site-internet-asnieres-sur-seine','/agence-web-ile-de-france','/conseils/preparer-refonte-site-internet','/page-inexistante']){
   const html=await(await call(path)).text();const ld=ldOf(html);assert.ok(ld.length>=1,path);const s=JSON.stringify(ld);assert.ok(!s.includes('chatgpt.site'),path);const ty=types(ld);
   for(const bad of ['LocalBusiness','ProfessionalService','FAQPage'])assert.ok(!ty.includes(bad),`${path} : ${bad}`);
  }
 });
 await t.test('sharing image, icons and manifest are served',async()=>{
  const og=await call('/og-image.png');assert.equal(og.status,200);assert.equal(og.headers.get('content-type'),'image/png');assert.deepEqual(pngSize(Buffer.from(await og.arrayBuffer())),{width:1200,height:630});
  for(const [path,size] of [['/apple-touch-icon.png',180],['/icon-192.png',192],['/icon-512.png',512]]){const r=await call(path);assert.equal(r.status,200,path);assert.deepEqual(pngSize(Buffer.from(await r.arrayBuffer())),{width:size,height:size},path)}
  const ico=await call('/favicon.ico');assert.equal(ico.status,200);const b=Buffer.from(await ico.arrayBuffer());assert.equal(b.readUInt16LE(2),1);assert.ok(b.readUInt16LE(4)>=1);
  assert.equal((await call('/favicon.svg')).status,200);
  const mf=await call('/manifest.webmanifest');assert.equal(mf.status,200);const m=await mf.json();assert.equal(m.background_color,'#070B18');assert.ok(m.icons.some(i=>i.src==='/icon-512.png'));
 });
 await t.test('versioned fonts are immutable, unversioned images keep the default cache',async()=>{
  const font=await call('/fonts/sfx-display-82.v1.woff2');assert.equal(font.status,200);assert.match(font.headers.get('cache-control')||'',/max-age=31536000.*immutable/);
  const img=await call('/studio-web.webp');assert.equal(img.status,200);const cc=img.headers.get('cache-control')||'';assert.ok(!/immutable/.test(cc),cc);assert.match(cc,/max-age=0/);
 });
 }finally{server.kill('SIGTERM');await new Promise(r=>server.once('exit',r));rmSync(data,{recursive:true,force:true})}});
