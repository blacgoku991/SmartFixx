import {cookies} from 'next/headers';
import {boundedJson,jsonError,privateHeaders} from '@/lib/http-security';
import {currentOwner,passwordMatches,rateLimit,startSession,sessionCookie} from '@/runtime/auth.mjs';
import {SITE_URL} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function POST(request:Request){if(request.headers.get('origin')!==SITE_URL||request.headers.get('sec-fetch-site')==='cross-site')return jsonError('Origine non autorisée.',403);try{
 const ip=request.headers.get('x-smartfixx-client-ip')||'unknown';if(!rateLimit('login-ip:'+ip,12,900000)||!rateLimit('login-global',60,900000))return jsonError('Patientez avant de réessayer.',429);
 const q=await boundedJson(request,2048) as {email?:unknown;password?:unknown};if(typeof q.email!=='string'||typeof q.password!=='string'||q.email.length>254||q.password.length>256)return jsonError('Identifiants invalides.',400);
 const owner=currentOwner();const ok=owner?await passwordMatches(q.password,owner.password_hash):false;
 if(!ok||q.email.trim().toLowerCase()!==owner?.email)return jsonError('Identifiants invalides.',403);
 const s=startSession();(await cookies()).set(sessionCookie,s.token,{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:8*3600});return Response.json({ok:true},{headers:privateHeaders});
 }catch{return jsonError('Connexion indisponible.',503)}}
