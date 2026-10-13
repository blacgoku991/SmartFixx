import {getAdmin} from '@/lib/admin-auth';
import {getQuoteDb} from '@/lib/quote-db';
import {jsonError,privateHeaders} from '@/lib/http-security';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 if(!await getAdmin())return jsonError('Accès administrateur requis.',403);
 const days=Number(new URL(request.url).searchParams.get('days')||30);if(![7,30,90].includes(days))return jsonError('Période invalide.',400);
 const now=Date.now(),today=new Date(now).toISOString().slice(0,10),start=new Date(`${today}T00:00:00Z`).getTime()-(days-1)*86400000,startDay=new Date(start).toISOString().slice(0,10),db=getQuoteDb();
 const r=await db.batch([
 db.prepare('SELECT day,event,SUM(count) AS total FROM analytics_daily WHERE day >= ? AND day <= ? GROUP BY day,event ORDER BY day').bind(startDay,today),
 db.prepare("SELECT path,SUM(CASE WHEN event='view' THEN count ELSE 0 END) AS views,SUM(CASE WHEN event='contact' THEN count ELSE 0 END) AS contacts FROM analytics_daily WHERE day >= ? AND day <= ? GROUP BY path ORDER BY views DESC LIMIT 30").bind(startDay,today),
 db.prepare("SELECT service,SUM(count) AS total FROM analytics_daily WHERE day >= ? AND day <= ? AND event='service' GROUP BY service ORDER BY total DESC").bind(startDay,today),
 db.prepare("SELECT service,status,count(*) AS total FROM quote_requests WHERE created_at >= ? AND created_at <= ? AND expires_at > ? GROUP BY service,status").bind(start,now,now),
 db.prepare("SELECT strftime('%Y-%m-%d',created_at/1000,'unixepoch') AS day,count(*) AS total FROM quote_requests WHERE created_at >= ? AND created_at <= ? AND expires_at > ? GROUP BY day ORDER BY day").bind(start,now,now),
 db.prepare('SELECT campaign,count(*) AS total,SUM(CASE WHEN status = \'won\' THEN 1 ELSE 0 END) AS won FROM quote_requests WHERE created_at >= ? AND created_at <= ? AND expires_at > ? GROUP BY campaign ORDER BY total DESC LIMIT 30').bind(start,now,now),
 db.prepare("SELECT count(*) AS total FROM quote_requests WHERE status='new' AND created_at < ? AND expires_at > ?").bind(now-48*3600000,now),
 db.prepare("SELECT AVG((e.first_action-q.created_at)/3600000.0) AS hours,count(*) AS total FROM quote_requests q JOIN (SELECT request_id,MIN(created_at) AS first_action FROM quote_events GROUP BY request_id) e ON e.request_id=q.id WHERE q.created_at >= ? AND q.created_at <= ? AND q.expires_at > ?").bind(start,now,now),
 ]);
 return Response.json({days,startDay,today,generatedAt:now,activity:r[0].results,pages:r[1].results,interests:r[2].results,projects:r[3].results,dailyProjects:r[4].results,campaigns:r[5].results,awaiting48h:r[6].results[0],firstAction:r[7].results[0]},{headers:privateHeaders});
 }catch{console.error('Admin analytics unavailable');return jsonError('Les statistiques sont momentanément indisponibles.',503);}}
