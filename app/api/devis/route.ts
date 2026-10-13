import { getQuoteDb } from "@/lib/quote-db";
import { quoteSchema } from "@/lib/quote-validation";
import { serviceLabels } from "@/lib/services";
import { quotePrice } from "@/lib/offers";
import { boundedJson, sameOrigin } from "@/lib/http-security";
import { consumeLimit } from "@/lib/rate-limit";
const responseHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options":"nosniff" };
const fail = (error: string, status: number) => Response.json({ error }, { status, headers: responseHeaders });
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Origine de la demande non autorisée.", 403);
  let payload: unknown;
  try { payload = await boundedJson(request); } catch { return fail("Le format ou la taille de la demande est invalide.", 400); }
  const parsed = quoteSchema.safeParse(payload);
  if (!parsed.success) return fail("Vérifiez les champs obligatoires, l’adresse email et votre accord de contact.", 400);
  const q = parsed.data;
  try {
    const db = getQuoteDb(); const now = Date.now();
    const ip=request.headers.get("cf-connecting-ip");
    if(ip&&!await consumeLimit(`contact-ip:${ip}`,12,15*60000)) return fail("Trop de demandes. Réessayez dans quinze minutes.",429);
    if(!await consumeLimit(`contact-email:${q.email}`,5,3600000)) return fail("Plusieurs demandes ont déjà été reçues. Réessayez dans une heure.",429);
    const recent = await db.prepare("SELECT count(*) AS total FROM quote_requests WHERE email = ? AND created_at > ?").bind(q.email, now - 3600000).first<{total:number}>();
    if ((recent?.total || 0) >= 5) return fail("Plusieurs demandes ont déjà été reçues. Réessayez dans une heure ou contactez-nous par email.", 429);
    const id = crypto.randomUUID(); const reference = `SF-${id.slice(0,8).toUpperCase()}`;
    const additional=[...new Set(q.requestedServices)].filter(s=>s!==q.service);
    const message=additional.length?`Autres besoins : ${additional.map(s=>serviceLabels[s]).join(", ")}\n\n${q.message}`:q.message;
    const amount = q.service==="emailing"?quotePrice(q.plan, q.volume, q.source, q.audience):null;
    await db.batch([
      db.prepare("DELETE FROM request_limits WHERE key IN (SELECT key FROM request_limits WHERE expires_at < ? LIMIT 100)").bind(now),
      db.prepare("DELETE FROM quote_requests WHERE id IN (SELECT id FROM quote_requests WHERE expires_at < ? LIMIT 100)").bind(now),
      db.prepare("INSERT INTO quote_requests (id, reference, created_at, expires_at, name, company, email, phone, message, audience, data_source, volume, plan, quoted_amount_euros, contact_consent, status, service, website_url, city, budget, timeline, campaign) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, reference, now, now + 365 * 86400000, q.name, q.company, q.email, q.phone, message, q.audience, q.source, q.volume, q.plan, amount, 1, "new", q.service, q.websiteUrl, q.city, q.budget, q.timeline, q.campaign),
    ]);
    return Response.json({ reference }, { status: 201, headers: responseHeaders });
  } catch (error) {
    console.error("Quote storage failure", error instanceof Error ? error.name : "UnknownError");
    return fail("L’enregistrement est momentanément indisponible. Réessayez ou écrivez à contact@smartfixx.fr.", 503);
  }
}
