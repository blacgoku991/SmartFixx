import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {smtpTransport,makeMessage,classifyFailure,diagnosticFromFailure} from './transport.mjs';
import {Journal} from './journal.mjs';
import {Pacer,TransportPool} from './scheduler.mjs';
const configuredUrl=process.env.SMARTFIXX_SITE_URL||'',token=process.env.SMARTFIXX_RELAY_TOKEN||'';
let site;try{site=new URL(configuredUrl);if(site.protocol!=='https:'||site.username||site.password||site.search||site.hash||site.pathname!=='/')throw new Error('URL')}catch{console.error('Renseignez SMARTFIXX_SITE_URL avec l’adresse HTTPS du site, sans chemin.');process.exit(1)}
if(!/^[a-zA-Z0-9_-]{43}$/.test(token)){console.error('Renseignez la clé de liaison générée dans Campagnes > Réglages d’envoi.');process.exit(1)}
const endpoint=new URL('/api/relay',site),journal=new Journal(resolve(process.env.SMARTFIXX_DATA_DIR||'./data')),session=randomUUID();
const active=new Map(),pacer=new Pacer(),smtpPacer=new Pacer(),pool=new TransportPool(c=>smtpTransport(c,true));
let stopping=false,parallelism=20,rate=1,lastIdleReason='',lastHeartbeat=0;
process.on('SIGTERM',()=>{stopping=true});process.on('SIGINT',()=>{stopping=true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function api(body){const response=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000),redirect:'error'});if(!response.ok)throw Object.assign(new Error('Panel indisponible'),{status:response.status});return response.json()}
async function flush(){const records=journal.pending().filter(r=>!active.has(r.id));for(let i=0;i<records.length;i+=10){await Promise.all(records.slice(i,i+10).map(async record=>{await api({action:'receipt',...record});journal.remove(record.id)}))}}
async function send(job,jobRate){
 const marker={id:job.id,lease:job.lease,result:'unknown',error:'UNCERTAIN',hardBounce:false};
 try{
  await pacer.take(jobRate);if(stopping)return;
  // Persist before the start request: its response may be lost after authorization.
  journal.save(marker);
  let payload;try{payload=await api({action:'start',id:job.id,lease:job.lease})}catch(e){if(e.status===409){journal.remove(job.id);return}throw e}
  let result;
  try{const transport=await pool.get(payload.config);const effective=Math.min(payload.config.ratePerSecond||1/payload.config.intervalSeconds,payload.config.providerMaxRate||1000);await smtpPacer.take(effective);const info=await transport.sendMail(makeMessage(payload.message,payload.config));result=info.accepted?.length===1?{result:'accepted',error:'',hardBounce:false}:{result:'failed',error:'REJECTED',hardBounce:false}}
  catch(e){result={...classifyFailure(e),diagnostic:diagnosticFromFailure(e)}}
  journal.save({...marker,...result});
  console.log('SmartFixx : '+job.id+' · '+result.result+(result.diagnostic?.responseCode?' · SMTP '+result.diagnostic.responseCode:''));
 }catch{console.error('SmartFixx : opération interrompue ; résultat conservé pour synchronisation.');}
}
console.log('SmartFixx : relais v3 démarré. Connexions SMTP réutilisées, cadence pilotée depuis le panel.');
while(!stopping){try{
 await flush();
 const free=parallelism-active.size;
 if(free<=0){if(Date.now()-lastHeartbeat>5000){await api({action:'heartbeat',session});lastHeartbeat=Date.now()}await Promise.race([...active.values(),wait(100)]);continue}
 const job=await api({action:'claim',version:'3',session,capacity:Math.min(50,free)});
 if(job.type==='idle'){if(job.reason!==lastIdleReason){lastIdleReason=job.reason;console.log('SmartFixx : attente · '+job.reason)}await wait(Math.max(25,Math.min(5000,(job.waitSeconds||1)*1000)));continue}
 lastIdleReason='';
 if(job.type==='verify'){let transport,ok=false,safeError='',diagnostic={};try{transport=await smtpTransport(job.config);await transport.verify();ok=true}catch(e){safeError=classifyFailure(e).error;diagnostic=diagnosticFromFailure(e)}finally{transport?.close()}await api({action:'verified',token:job.token,revision:job.revision,ok,error:safeError,diagnostic});console.log(ok?'SmartFixx : connexion SMTP validée.':'SmartFixx : test SMTP non validé ('+safeError+').');continue}
 if(job.type!=='jobs'||!Array.isArray(job.jobs))throw new Error('Mettez le site à jour avant le relais.');
 rate=job.ratePerSecond;parallelism=Math.max(1,Math.min(50,job.maxConnections||20));
 for(const item of job.jobs){if(active.has(item.id))continue;const task=send(item,rate).finally(()=>active.delete(item.id));active.set(item.id,task)}
 }catch(e){console.error(e.status===403?'SmartFixx : liaison refusée. Vérifiez la clé dans .env.':'SmartFixx : panel indisponible ; résultats conservés, nouvelle connexion dans 5 secondes.');await wait(5000)}}
// Already authorized transmissions finish; unstarted leases return to the queue.
await Promise.allSettled(active.values());await pool.close();try{await flush()}catch{console.error('SmartFixx : résultats conservés pour la prochaine connexion.')}
console.log('SmartFixx : relais arrêté proprement.');
