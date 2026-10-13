import { getAdmin } from "@/lib/admin-auth";
import { getQuoteDb } from "@/lib/quote-db";
import { jsonError, privateHeaders } from "@/lib/http-security";
import { serviceLabels } from "@/lib/services";
import { statuses } from "@/lib/admin-policy";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 try{
  if(!await getAdmin())return jsonError("Accès administrateur requis.",403);
  const params=new URL(request.url).searchParams;
  const q=(params.get("q")||"").trim().slice(0,100);
  const status=params.get("status")||"all";
  if(status!=="all"&&!statuses.includes(status as typeof statuses[number]))return jsonError("Filtre invalide.",400);
  const service=params.get("service")||"all";
  if(service!=="all"&&!Object.prototype.hasOwnProperty.call(serviceLabels,service))return jsonError("Service invalide.",400);
  const page=Math.max(1,Math.min(10000,Number(params.get("page"))||1));
  if(!Number.isInteger(page))return jsonError("Page invalide.",400);
  const now=Date.now();const args:(string|number)[]=[now];let where="expires_at > ?";
  if(status!=="all"){where+=" AND status = ?";args.push(status);}
  if(service!=="all"){where+=" AND service = ?";args.push(service);}
  if(q){where+=" AND (instr(lower(name),lower(?))>0 OR instr(lower(company),lower(?))>0 OR instr(lower(email),lower(?))>0 OR instr(lower(reference),lower(?))>0)";args.push(q,q,q,q);}
  const db=getQuoteDb();
  const results=await db.batch([
   db.prepare(`SELECT id,reference,created_at,name,company,email,audience,data_source,volume,plan,quoted_amount_euros,status,service,city,budget,campaign FROM quote_requests WHERE ${where} ORDER BY created_at DESC,id DESC LIMIT 20 OFFSET ?`).bind(...args,(page-1)*20),
   db.prepare(`SELECT count(*) AS total FROM quote_requests WHERE ${where}`).bind(...args),
   db.prepare("SELECT status,count(*) AS total FROM quote_requests WHERE expires_at > ? GROUP BY status").bind(now),
  ]);
  return Response.json({requests:results[0].results,total:(results[1].results[0] as {total:number}).total,counts:results[2].results,page,pageSize:20},{headers:privateHeaders});
 }catch{console.error("Admin list unavailable");return jsonError("Les demandes sont momentanément indisponibles.",503);}
}
