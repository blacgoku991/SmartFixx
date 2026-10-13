import { z } from "zod";
import { getAdmin } from "@/lib/admin-auth";
import { getQuoteDb } from "@/lib/quote-db";
import { boundedJson, jsonError, sameOrigin, privateHeaders } from "@/lib/http-security";
import { consumeLimit } from "@/lib/rate-limit";
const schema=z.object({status:z.enum(["new","in_progress","quoted","won","archived"]),notes:z.string().max(4000),revision:z.number().int().nonnegative()}).strict();
type Context={params:Promise<{id:string}>};
const idSchema=z.string().uuid();
export const dynamic="force-dynamic";
export async function GET(_request:Request,context:Context){
 try{
  if(!await getAdmin())return jsonError("Accès administrateur requis.",403);
  const {id}=await context.params;if(!idSchema.safeParse(id).success)return jsonError("Demande introuvable.",404);
  const db=getQuoteDb();const record=await db.prepare("SELECT * FROM quote_requests WHERE id = ? AND expires_at > ?").bind(id,Date.now()).first();
  if(!record)return jsonError("Cette demande est introuvable ou arrivée à échéance.",404);
  const events=await db.prepare("SELECT created_at,from_status,to_status,notes_changed FROM quote_events WHERE request_id = ? ORDER BY created_at DESC LIMIT 30").bind(id).all();
  return Response.json({request:record,events:events.results},{headers:privateHeaders});
 }catch{console.error("Admin detail unavailable");return jsonError("La demande ne peut pas être chargée.",503);}
}
export async function PATCH(request:Request,context:Context){
 if(!sameOrigin(request))return jsonError("Origine non autorisée.",403);
 try{
  const admin=await getAdmin();if(!admin)return jsonError("Accès administrateur requis.",403);
  const {id}=await context.params;if(!idSchema.safeParse(id).success)return jsonError("Demande introuvable.",404);
  let payload:unknown;try{payload=await boundedJson(request,20000);}catch{return jsonError("Format ou taille de demande invalide.",400);}
  const parsed=schema.safeParse(payload);if(!parsed.success)return jsonError("Vérifiez le statut et la longueur de votre note.",400);
  if(!await consumeLimit(`admin:${admin.id}`,120,60000))return jsonError("Trop de modifications. Patientez une minute.",429);
  const db=getQuoteDb();const now=Date.now();const q=parsed.data;
  // Both statements share one D1 transaction. The audit entry is inserted only if the revision still matches.
  const result=await db.batch([
   db.prepare("INSERT INTO quote_events (id,request_id,created_at,actor_id,from_status,to_status,notes_changed) SELECT ?,id,?,?,status,?,CASE WHEN notes <> ? THEN 1 ELSE 0 END FROM quote_requests WHERE id=? AND revision=? AND expires_at>?").bind(crypto.randomUUID(),now,admin.id,q.status,q.notes,id,q.revision,now),
   db.prepare("UPDATE quote_requests SET status=?,notes=?,revision=revision+1,updated_at=? WHERE id=? AND revision=? AND expires_at>? RETURNING revision").bind(q.status,q.notes,now,id,q.revision,now),
  ]);
  if(!result[1].results.length)return jsonError("Cette demande a changé ou n’est plus disponible. Rechargez-la avant de réessayer.",409);
  return Response.json({revision:q.revision+1,updatedAt:now},{headers:privateHeaders});
 }catch{console.error("Admin update unavailable");return jsonError("La modification n’a pas été enregistrée. Votre note est conservée à l’écran.",503);}
}
