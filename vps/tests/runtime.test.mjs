import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync,readdirSync,copyFileSync} from 'node:fs';import {tmpdir} from 'node:os';import {resolve} from 'node:path';import {randomBytes} from 'node:crypto';import {execFileSync} from 'node:child_process';
const dir=mkdtempSync(resolve(tmpdir(),'smartfixx-vps-'));process.env.SMARTFIXX_DATA_DIR=dir;process.env.SMARTFIXX_MIGRATIONS_DIR=resolve('drizzle');
const {sqlite,database,closeDatabase}=await import('../runtime/database.mjs');const auth=await import('../runtime/auth.mjs');const {importTransfer}=await import('../runtime/transfer.mjs');
test('VPS runtime: durable SQLite, owner sessions and authenticated migration',async t=>{
 try{
 await t.test('migrations are repeatable and batches roll back atomically with correct change counts',async()=>{
  const r=await database.batch([database.prepare("INSERT INTO analytics_daily(id,day,path,event,service,count) VALUES ('t','2026-09-15','/','visit','none',1)"),database.prepare("UPDATE analytics_daily SET count=count+1 WHERE id='t'")]);assert.equal(r[0].meta.changes,1);assert.equal(r[1].meta.changes,1);
  await assert.rejects(database.batch([database.prepare("UPDATE analytics_daily SET count=999 WHERE id='t'"),database.prepare('INSERT INTO missing VALUES (1)')]));assert.equal((await database.prepare("SELECT count FROM analytics_daily WHERE id='t'").first()).count,2);
  closeDatabase();assert.equal((await database.prepare("SELECT count FROM analytics_daily WHERE id='t'").first()).count,2);sqlite().exec('DELETE FROM analytics_daily');
 });
 await t.test('password verification, session expiry and rotation do not accept spoofed identity',async()=>{
  await auth.setOwner('owner@example.test','test-password-with-32-characters');const owner=auth.currentOwner();assert.ok(!owner.password_hash.includes('test-password'));assert.ok(await auth.passwordMatches('test-password-with-32-characters',owner.password_hash));assert.ok(!await auth.passwordMatches('wrong-password',owner.password_hash));
  const session=auth.startSession();assert.equal(auth.sessionOwner(session.token).email,'owner@example.test');assert.equal(auth.sessionOwner('forged-token'),null);assert.ok(!sqlite().prepare('SELECT token_hash FROM vps_sessions').get().token_hash.includes(session.token));
  await auth.setOwner('owner@example.test','a-different-long-test-password');assert.equal(auth.sessionOwner(session.token),null);const s=auth.startSession();sqlite().exec('UPDATE vps_sessions SET expires_at=0');assert.equal(auth.sessionOwner(s.token),null);
 });
 await t.test('encrypted transfer rejects a wrong key, imports only expected tables and never overwrites data',async()=>{
  const tables=['quote_requests','quote_events','analytics_daily','email_recipients','email_suppressions','smtp_settings','campaign_runs','campaign_targets'];const rows=Object.fromEntries(tables.map(table=>[table,sqlite().prepare(`SELECT * FROM ${table}`).all()]));rows.email_suppressions=[{email:'stopped@example.test',created_at:Date.now(),reason:'unsubscribe'}];
  const bytes=randomBytes(32),key=await crypto.subtle.importKey('raw',bytes,'AES-GCM',false,['encrypt']),iv=randomBytes(12);const payload={format:'smartfixx-data-v1',tables:rows,secret:'a-test-only-secret-with-more-than-32-characters'};const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:Buffer.from('smartfixx-transfer-v1')},key,Buffer.from(JSON.stringify(payload)));const file=resolve(dir,'transfer.smartfixx');writeFileSync(file,JSON.stringify({format:'smartfixx-transfer-v1',iv:iv.toString('base64'),data:Buffer.from(encrypted).toString('base64')}));
  await assert.rejects(importTransfer(file,randomBytes(32).toString('base64url')));assert.equal(sqlite().prepare('SELECT count(*) AS n FROM email_suppressions').get().n,0);
  await importTransfer(file,bytes.toString('base64url'));assert.equal(sqlite().prepare('SELECT email FROM email_suppressions').get().email,'stopped@example.test');assert.equal(sqlite().prepare("SELECT value FROM vps_secrets WHERE key='RATE_LIMIT_SECRET'").get().value,payload.secret);await assert.rejects(importTransfer(file,bytes.toString('base64url')),/déjà des données/);
 });
 await t.test('0011 keeps quote_events on a 0010 database and fills activity with an empty string',async()=>{
  // Base réelle arrêtée à 0010 (runner VPS, processus séparé), avec une demande et son historique, puis
  // redémarrage avec 0011 : aucune reconstruction de table, quote_events conservé, activity=''.
  const data=mkdtempSync(resolve(tmpdir(),'smartfixx-0011-')),mig=mkdtempSync(resolve(tmpdir(),'smartfixx-mig-'));
  try{
   const all=readdirSync('drizzle').filter(n=>/^\d{4}_[a-z_]+\.sql$/.test(n)).sort();const m11=all.find(n=>n.startsWith('0011_'));assert.ok(m11,'migration 0011 present with a runner-compatible name');
   for(const n of all.filter(n=>n<'0011'))copyFileSync(resolve('drizzle',n),resolve(mig,n));
   const runner=new URL('../runtime/database.mjs',import.meta.url).href;
   const run=code=>execFileSync(process.execPath,['--input-type=module','-e',`import {sqlite,closeDatabase} from ${JSON.stringify(runner)};const db=sqlite();${code};closeDatabase();`],{env:{...process.env,SMARTFIXX_DATA_DIR:data,SMARTFIXX_MIGRATIONS_DIR:mig},encoding:'utf8'});
   run(`if(db.prepare("SELECT count(*) AS n FROM pragma_table_info('quote_requests') WHERE name='activity'").get().n)throw new Error('activity already there');db.prepare("INSERT INTO quote_requests (id,reference,created_at,expires_at,name,company,email,phone,message,audience,data_source,volume,plan,quoted_amount_euros,contact_consent,status) VALUES ('11111111-1111-4111-8111-111111111111','SF-11111111',1,9999999999999,'Ancienne','Atelier','old@example.test','','Ancienne demande avant 0011.','b2b','client',0,'projet',NULL,1,'in_progress')").run();db.prepare("INSERT INTO quote_events (id,request_id,created_at,actor_id,from_status,to_status,notes_changed) VALUES ('e1','11111111-1111-4111-8111-111111111111',2,'owner','new','in_progress',1)").run()`);
   copyFileSync(resolve('drizzle',m11),resolve(mig,m11));
   const out=JSON.parse(run(`process.stdout.write(JSON.stringify({events:db.prepare('SELECT count(*) AS n FROM quote_events').get().n,row:db.prepare("SELECT activity,status,name FROM quote_requests WHERE id='11111111-1111-4111-8111-111111111111'").get(),applied:db.prepare('SELECT name FROM vps_migrations ORDER BY name DESC LIMIT 1').get().name,fk:db.prepare('PRAGMA foreign_key_check').all().length}))`));
   assert.equal(out.events,1);assert.deepEqual({...out.row},{activity:'',status:'in_progress',name:'Ancienne'});assert.equal(out.applied,m11);assert.equal(out.fk,0);
  }finally{rmSync(data,{recursive:true,force:true});rmSync(mig,{recursive:true,force:true})}
 });
 await t.test('encrypted import accepts a pre-0011 export (quote_requests without activity) and refuses any other column difference',async()=>{
  const tables=['quote_requests','quote_events','analytics_daily','email_recipients','email_suppressions','smtp_settings','campaign_runs','campaign_targets'];
  const encrypt=async(rows)=>{const bytes=randomBytes(32),key=await crypto.subtle.importKey('raw',bytes,'AES-GCM',false,['encrypt']),iv=randomBytes(12);const payload={format:'smartfixx-data-v1',tables:rows,secret:'a-test-only-secret-with-more-than-32-characters'};const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:Buffer.from('smartfixx-transfer-v1')},key,Buffer.from(JSON.stringify(payload)));const file=resolve(dir,'transfer-'+bytes.toString('hex').slice(0,8)+'.smartfixx');writeFileSync(file,JSON.stringify({format:'smartfixx-transfer-v1',iv:iv.toString('base64'),data:Buffer.from(encrypted).toString('base64')}));return {file,key:bytes.toString('base64url')}};
  for(const table of tables)sqlite().exec(`DELETE FROM ${table}`);
  const base={id:'22222222-2222-4222-8222-222222222222',reference:'SF-22222222',created_at:1,expires_at:9999999999999,name:'Import',company:'Atelier',email:'import@example.test',phone:'',message:'Demande exportée avant 0011.',audience:'b2b',data_source:'client',volume:0,plan:'projet',quoted_amount_euros:null,contact_consent:1,status:'new',notes:'',revision:0,updated_at:null,service:'refonte',website_url:'',city:'',budget:'a_definir',timeline:'flexible',campaign:'site'};
  const empty=Object.fromEntries(tables.map(t=>[t,[]]));
  const extra=await encrypt({...empty,quote_requests:[{...base,unknown_column:'x'}]});await assert.rejects(importTransfer(extra.file,extra.key),/Colonnes incompatibles/);
  const old=await encrypt({...empty,quote_requests:[base]});await importTransfer(old.file,old.key);assert.equal(sqlite().prepare("SELECT activity FROM quote_requests WHERE id=?").get(base.id).activity,'');
 });
 }finally{closeDatabase();rmSync(dir,{recursive:true,force:true})}
});
