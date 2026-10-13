import {z} from 'zod';
import {boundedJson,sameOrigin} from '@/lib/http-security';
import {getQuoteDb} from '@/lib/quote-db';
import {consumeLimit} from '@/lib/rate-limit';
import {measuredPaths,analyticsEvents} from '@/lib/analytics-config';
import {serviceLabels} from '@/lib/services';
const schema=z.object({consent:z.literal(true),path:z.string().refine(v=>measuredPaths.includes(v)),event:z.enum(analyticsEvents),service:z.string().refine(v=>v==='none'||Object.hasOwn(serviceLabels,v)).default('none')}).strict();
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex'};
export async function POST(request:Request){
 if(!sameOrigin(request))return new Response(null,{status:403,headers});
 let payload;try{payload=schema.safeParse(await boundedJson(request,1024));}catch{return new Response(null,{status:400,headers});}
 if(!payload.success)return new Response(null,{status:400,headers});
 try{
  // The address is used only for the HMAC-based abuse counter, never analytics dimensions.
  const ip=request.headers.get('cf-connecting-ip');if(!ip)return new Response(null,{status:204,headers});
  if(!await consumeLimit(`analytics:${ip}`,180,3600000))return new Response(null,{status:429,headers});
  const {path,event,service}=payload.data;const now=Date.now(),day=new Date(now).toISOString().slice(0,10),cutoff=new Date(now-90*86400000).toISOString().slice(0,10);
  await getQuoteDb().batch([
   getQuoteDb().prepare('INSERT INTO analytics_daily (id,day,path,event,service,count) VALUES (?,?,?,?,?,1) ON CONFLICT(id) DO UPDATE SET count=count+1').bind(`${day}:${path}:${event}:${service}`,day,path,event,service),
   getQuoteDb().prepare('DELETE FROM analytics_daily WHERE id IN (SELECT id FROM analytics_daily WHERE day < ? LIMIT 200)').bind(cutoff),
   getQuoteDb().prepare('DELETE FROM request_limits WHERE key IN (SELECT key FROM request_limits WHERE expires_at < ? LIMIT 100)').bind(now),
  ]);
  return new Response(null,{status:204,headers});
 }catch{console.error('Analytics storage unavailable');return new Response(null,{status:503,headers});}
}
