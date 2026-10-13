import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {resolve} from 'node:path';import {randomBytes} from 'node:crypto';
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
 }finally{closeDatabase();rmSync(dir,{recursive:true,force:true})}
});
