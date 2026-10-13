import {z} from 'zod';
import {boundedJson,sameOrigin,jsonError} from '@/lib/http-security';
import {getQuoteDb} from '@/lib/quote-db';
import {resolveEmailToken,emailPrivateHeaders,suppressEmail} from '@/lib/email-campaign';
import {emailDestination} from '@/lib/email-destination';
const schema=z.object({token:z.string().max(110),action:z.enum(['interest','stop','preferences']),consent:z.literal(true)}).strict();
export async function POST(request:Request){
 if(!sameOrigin(request))return jsonError('Origine non autorisée.',403);
 try{
  let q;try{q=schema.safeParse(await boundedJson(request,1024))}catch{return jsonError('Format invalide.',400)}
  if(!q.success)return jsonError('Vérifiez votre demande.',400);
  const{token,action}=q.data,r=await resolveEmailToken(token,action,action!=='interest');
  if(!r)return jsonError('Ce lien est invalide ou arrivé à échéance.',404);
  if(action==='interest')return Response.json({error:'Découvrez nos services puis envoyez votre projet depuis le formulaire du site.',url:emailDestination(r.campaign)},{status:410,headers:emailPrivateHeaders});
  if(action==='stop'){await suppressEmail(r.email,'recipient_stop');return Response.json({ok:true},{headers:emailPrivateHeaders})}
  await getQuoteDb().prepare('UPDATE email_recipients SET tracking_consent=0,tracking_revoked_at=COALESCE(tracking_revoked_at,?),first_open_at=NULL,first_click_at=NULL WHERE email=?').bind(Date.now(),r.email).run();
  return Response.json({ok:true},{headers:emailPrivateHeaders});
 }catch{console.error('Email action unavailable');return jsonError('L’action n’a pas abouti. Réessayez ou écrivez à contact@smartfixx.fr.',503)}
}
