import {randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {sqlite,dataDir} from './database.mjs';
import {setOwner,currentOwner} from './auth.mjs';
const action=process.argv[2],db=sqlite();
if(action==='init'){
 db.prepare("INSERT INTO vps_secrets(key,value) VALUES ('RATE_LIMIT_SECRET',?) ON CONFLICT(key) DO NOTHING").run(randomBytes(48).toString('base64url'));
 console.log('Base de données prête.');
}else if(action==='owner'){
 let input='';for await(const chunk of process.stdin){input+=chunk;if(input.length>2048)throw new Error('Entrée trop longue')}
 const [email,password]=input.split('\n');await setOwner(email,password);console.log('Compte propriétaire enregistré ; anciennes sessions fermées.');
}else if(action==='owner-status'){
 process.exit(currentOwner()?0:1);
}else if(action==='backup'){
 const folder=resolve(dataDir,'backups');mkdirSync(folder,{recursive:true,mode:0o700});const file=resolve(folder,'smartfixx-'+new Date().toISOString().replaceAll(':','-')+'.sqlite');db.prepare('VACUUM INTO ?').run(file);console.log(file);
}else if(action==='import'){
 const {importTransfer}=await import('./transfer.mjs');let key='';for await(const chunk of process.stdin){key+=chunk;if(key.length>100)throw new Error('Clé invalide')}
 await importTransfer(process.argv[3],key.trim());console.log('Données importées. Campagnes en pause ; test SMTP à refaire.');
}else if(action==='pair-relay'){
 const {digest}=await import('./auth.mjs');const {createHash}=await import('node:crypto');let token='';for await(const c of process.stdin)token+=c;token=token.trim();if(!/^[\w-]{43}$/.test(token))throw new Error('Clé de relais invalide');
 db.prepare("INSERT INTO smtp_settings(id,updated_at) VALUES ('primary',?) ON CONFLICT(id) DO NOTHING").run(Date.now());db.prepare("UPDATE smtp_settings SET runner_hash=?,runner_seen_at=NULL,runner_session='',runner_session_until=0 WHERE id='primary'").run(createHash('sha256').update(token).digest('base64url'));console.log('Relais associé.');
}else throw new Error('Action inconnue');
