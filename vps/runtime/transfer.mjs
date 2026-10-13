import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {sqlite} from './database.mjs';
const tables=['quote_requests','quote_events','analytics_daily','email_recipients','email_suppressions','smtp_settings','campaign_runs','campaign_targets'];
export async function importTransfer(path,keyText){
 if(!/^[\w-]{43}$/.test(keyText))throw new Error('Clé de transfert invalide');const text=readFileSync(path);if(text.length>34*1024*1024)throw new Error('Fichier trop volumineux');const envelope=JSON.parse(text);
 if(envelope.format!=='smartfixx-transfer-v1')throw new Error('Format inconnu');const key=await webcrypto.subtle.importKey('raw',Buffer.from(keyText,'base64url'),'AES-GCM',false,['decrypt']);const decoded=await webcrypto.subtle.decrypt({name:'AES-GCM',iv:Buffer.from(envelope.iv,'base64'),additionalData:Buffer.from('smartfixx-transfer-v1')},key,Buffer.from(envelope.data,'base64'));const payload=JSON.parse(Buffer.from(decoded).toString());
 if(payload.format!=='smartfixx-data-v1'||typeof payload.secret!=='string'||payload.secret.length<32||!payload.tables||Object.keys(payload.tables).sort().join()!==[...tables].sort().join())throw new Error('Sauvegarde invalide');
 const db=sqlite();db.exec('BEGIN IMMEDIATE');try{
  for(const table of tables){if(db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n)throw new Error('La base contient déjà des données. Import refusé pour éviter un écrasement.');const columns=db.prepare(`PRAGMA table_info(${table})`).all().map(c=>c.name);const rows=payload.tables[table];if(!Array.isArray(rows)||rows.length>200000)throw new Error('Table invalide');
   for(const row of rows){const keys=Object.keys(row);if(keys.length!==columns.length||keys.some(k=>!columns.includes(k)))throw new Error('Colonnes incompatibles');if(Object.values(row).some(v=>v!==null&&typeof v!=='string'&&typeof v!=='number'))throw new Error('Valeur invalide');db.prepare(`INSERT INTO ${table} (${keys.map(k=>'"'+k+'"').join(',')}) VALUES (${keys.map(()=>'?').join(',')})`).run(...keys.map(k=>row[k]))}
  }
  db.prepare("INSERT INTO vps_secrets(key,value) VALUES ('RATE_LIMIT_SECRET',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(payload.secret);
  db.exec("UPDATE campaign_runs SET status='paused' WHERE status='running'; UPDATE campaign_targets SET status='queued',lease_token=NULL,lease_expires_at=NULL WHERE status='leased'; UPDATE campaign_targets SET status='unknown',last_error='UNCERTAIN' WHERE status='sending'; UPDATE smtp_settings SET verify_status='untested',verified_revision=-1,verify_claim=NULL,verify_requested_at=NULL,runner_seen_at=NULL,runner_session='',runner_session_until=0,runner_version='',next_send_at=0;");
  const check=db.prepare('PRAGMA foreign_key_check').all();if(check.length)throw new Error('Relations de données invalides');db.exec('COMMIT');
 }catch(e){db.exec('ROLLBACK');throw e}
}
