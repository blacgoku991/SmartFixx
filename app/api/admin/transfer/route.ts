import {env} from 'cloudflare:workers';
import {getAdmin} from '@/lib/admin-auth';
import {getQuoteDb} from '@/lib/quote-db';
import {boundedJson,jsonError,privateHeaders,sameOrigin} from '@/lib/http-security';
import {consumeLimit} from '@/lib/rate-limit';
import {transferTables,encryptTransfer} from '@/lib/vps-transfer';
export const dynamic='force-dynamic';
export async function POST(request:Request){if(!sameOrigin(request))return jsonError('Origine non autorisée.',403);try{const admin=await getAdmin();if(!admin)return jsonError('Accès administrateur requis.',403);if(!await consumeLimit('transfer:'+admin.id,3,3600000))return jsonError('Patientez avant un nouvel export.',429);const body=await boundedJson(request,1024) as {key?:unknown};if(typeof body.key!=='string'||!/^[\w-]{43}$/.test(body.key))return jsonError('Clé de transfert invalide.',400);
 const db=getQuoteDb();const results=await db.batch([db.prepare("SELECT (SELECT COUNT(*) FROM campaign_runs WHERE status='running')+(SELECT COUNT(*) FROM campaign_targets WHERE status IN ('leased','sending')) AS busy"),...transferTables.map(table=>db.prepare(`SELECT * FROM ${table}`))]);
 if(Number((results[0].results[0] as {busy:number})?.busy))return jsonError('Mettez les campagnes en pause, arrêtez le relais et attendez la fin des transmissions avant le transfert.',409);
 const tables=Object.fromEntries(transferTables.map((table,i)=>[table,results[i+1].results]));const secret=(env as unknown as {RATE_LIMIT_SECRET?:string}).RATE_LIMIT_SECRET;if(!secret)throw new Error('Secret missing');
 const data=await encryptTransfer({format:'smartfixx-data-v1',createdAt:new Date().toISOString(),tables,secret},body.key);return Response.json(data,{headers:{...privateHeaders,'Content-Disposition':'attachment; filename="SmartFixx-donnees.smartfixx"'}});
 }catch{return jsonError('Export indisponible ou supérieur à 24 Mo. Aucun fichier partiel n’a été créé.',503)}}
