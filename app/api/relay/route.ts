import {smtpDiagnosticSchema} from '@/lib/smtp-diagnostics';
import {z} from 'zod';
import {boundedJson,jsonError,privateHeaders} from '@/lib/http-security';
import {relayAuth} from '@/lib/smtp-settings';
import {claim,start,receipt} from '@/lib/campaign-runner';
import {getQuoteDb} from '@/lib/quote-db';
const token=z.string().regex(/^[a-zA-Z0-9_-]{43}$/);
const error=z.enum(['','AUTH','TLS','DNS','CONNECTION','TEMPORARY','REJECTED','INVALID_RECIPIENT','UNCERTAIN','DKIM']);
const schema=z.discriminatedUnion('action',[
 z.object({action:z.literal('claim'),version:z.string().regex(/^[a-zA-Z0-9.-]{1,20}$/).optional(),session:z.string().uuid().optional(),capacity:z.number().int().min(1).max(50).optional()}).strict(),
 z.object({action:z.literal('heartbeat'),session:z.string().uuid()}).strict(),
 z.object({action:z.literal('start'),id:z.string().uuid(),lease:token}).strict(),
 z.object({action:z.literal('receipt'),id:z.string().uuid(),lease:token,result:z.enum(['accepted','retry','failed','unknown']),error,hardBounce:z.boolean(),diagnostic:smtpDiagnosticSchema.optional()}).strict(),
 z.object({action:z.literal('verified'),token,revision:z.number().int(),ok:z.boolean(),error,diagnostic:smtpDiagnosticSchema.optional()}).strict()
]);
export async function POST(request:Request){try{if(!await relayAuth(request))return jsonError('Relais non autorisé.',403);let q;try{q=schema.safeParse(await boundedJson(request,2048))}catch{return jsonError('Format invalide.',400)}if(!q.success)return jsonError('Action invalide.',400);const a=q.data;if(a.action==='heartbeat'){await getQuoteDb().prepare("UPDATE smtp_settings SET runner_seen_at=?,runner_session_until=? WHERE id='primary' AND runner_session=?").bind(Date.now(),Date.now()+30000,a.session).run();return Response.json({ok:true},{headers:privateHeaders})}if(a.action==='claim'&&a.version==='3'&&!a.session)return jsonError('Session v3 requise.',400);if(a.action==='claim')return Response.json(await claim(a.version,a.version==='3'?a.session:undefined,a.capacity),{headers:privateHeaders});if(a.action==='start'){const payload=await start(a.id,a.lease);return payload?Response.json(payload,{headers:privateHeaders}):jsonError('Envoi suspendu, expiré ou déjà pris en charge.',409)}if(a.action==='receipt'){if((a.result==='accepted'&&(a.error!==''||a.hardBounce))||(a.hardBounce&&(a.result!=='failed'||a.error!=='INVALID_RECIPIENT')))return jsonError('Résultat incohérent.',400);return Response.json(await receipt({id:a.id,lease:a.lease,result:a.result,error:a.error,hardBounce:a.hardBounce,...(a.diagnostic?{diagnostic:a.diagnostic}:{})}),{headers:privateHeaders})}await getQuoteDb().prepare("UPDATE smtp_settings SET verify_status=?,verify_error=?,verify_diagnostic=?,verified_revision=?,verified_at=?,verify_requested_at=NULL,verify_claim=NULL,verify_expires_at=NULL WHERE id='primary' AND revision=? AND verify_claim=?").bind(a.ok?'ok':'error',a.ok?'':a.error,JSON.stringify(a.ok?{}:a.diagnostic||{}),a.ok?a.revision:-1,Date.now(),a.revision,a.token).run();return Response.json({ok:true},{headers:privateHeaders});}catch{console.error('SMTP relay operation failed');return jsonError('Relais momentanément indisponible.',503)}}
