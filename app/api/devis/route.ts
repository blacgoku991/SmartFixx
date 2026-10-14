import { getQuoteDb } from "@/lib/quote-db";
import { quoteSchema, fieldErrors } from "@/lib/quote-validation";
import { serviceLabels } from "@/lib/services";
import { quotePrice } from "@/lib/offers";
import { boundedJson, sameOrigin } from "@/lib/http-security";
import { consumeLimit } from "@/lib/rate-limit";
/* Prise de demande. Ordre conservé : origine, JSON borné (16 Ko), validation, limites, INSERT en batch, puis
   201 {reference}. Le 201 ne part qu'après l'écriture validée en base (BEGIN IMMEDIATE … COMMIT côté VPS) :
   le formulaire n'affiche son succès qu'à cette condition. */
const responseHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options":"nosniff" };
const fail = (error: string, status: number, fields?: Record<string,string>) => Response.json(fields ? { error, fields } : { error }, { status, headers: responseHeaders });
const PHONE = "06 18 74 51 80";
const tooMany = `Plusieurs demandes ont déjà été reçues. Réessayez dans une heure ou appelez-moi au ${PHONE}.`;
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Origine de la demande non autorisée.", 403);
  let payload: unknown;
  try { payload = await boundedJson(request); } catch { return fail("Le format ou la taille de la demande est invalide.", 400); }
  const parsed = quoteSchema.safeParse(payload);
  if (!parsed.success) {
    const fields = fieldErrors(parsed.error);
    /* Champ piège rempli : 400 générique, sans détail (rien n'indique au robot ce qui a été repéré). */
    if ("website" in fields) return fail("La demande n’a pas pu être enregistrée.", 400);
    return fail("Vérifiez les champs signalés.", 400, fields);
  }
  const q = parsed.data;
  if(!(q.email||q.phone)) return fail("Vérifiez les champs signalés.", 400, { email: "Indiquez un email ou un téléphone." });
  try {
    const db = getQuoteDb(); const now = Date.now();
    const ip=request.headers.get("cf-connecting-ip");
    if(ip&&!await consumeLimit(`contact-ip:${ip}`,12,15*60000)) return fail("Trop de demandes. Réessayez dans quinze minutes.",429);
    /* Clé de limite : l'email s'il est fourni, sinon le téléphone normalisé. Jamais de clé vide partagée
       (le schéma exige l'un des deux pour un projet, l'email pour l'emailing). */
    const subject = q.email ? `contact-email:${q.email}` : `contact-phone:${q.phone}`;
    if(!await consumeLimit(subject,5,3600000)) return fail(tooMany,429);
    const recent = q.email
      ? await db.prepare("SELECT count(*) AS total FROM quote_requests WHERE email = ? AND created_at > ?").bind(q.email, now - 3600000).first<{total:number}>()
      : await db.prepare("SELECT count(*) AS total FROM quote_requests WHERE phone = ? AND email = '' AND created_at > ?").bind(q.phone, now - 3600000).first<{total:number}>();
    if ((recent?.total || 0) >= 5) return fail(tooMany, 429);
    const id = crypto.randomUUID(); const reference = `SF-${id.slice(0,8).toUpperCase()}`;
    const additional=[...new Set(q.requestedServices)].filter(s=>s!==q.service);
    const message=additional.length?(q.message?`Autres besoins : ${additional.map(s=>serviceLabels[s]).join(", ")}\n\n${q.message}`:`Autres besoins : ${additional.map(s=>serviceLabels[s]).join(", ")}`):q.message;
    const amount = q.service==="emailing"?quotePrice(q.plan, q.volume, q.source, q.audience):null;
    const activity = q.service==="emailing" ? "" : q.activity;
    await db.batch([
      db.prepare("DELETE FROM request_limits WHERE key IN (SELECT key FROM request_limits WHERE expires_at < ? LIMIT 100)").bind(now),
      db.prepare("DELETE FROM quote_requests WHERE id IN (SELECT id FROM quote_requests WHERE expires_at < ? LIMIT 100)").bind(now),
      db.prepare("INSERT INTO quote_requests (id, reference, created_at, expires_at, name, company, email, phone, message, audience, data_source, volume, plan, quoted_amount_euros, contact_consent, status, service, website_url, city, budget, timeline, campaign, activity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, reference, now, now + 365 * 86400000, q.name, q.company || "", q.email || "", q.phone, message || "", q.audience, q.source, q.volume, q.plan, amount, 1, "new", q.service, q.websiteUrl, q.city, q.budget, q.timeline, q.campaign, activity),
    ]);
    return Response.json({ reference }, { status: 201, headers: responseHeaders });
  } catch (error) {
    console.error("Quote storage failure", error instanceof Error ? error.name : "UnknownError");
    return fail(`L’enregistrement est momentanément indisponible. Réessayez dans un instant ou appelez-moi au ${PHONE} (contact@smartfixx.fr).`, 503);
  }
}
