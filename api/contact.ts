/**
 * Réception du formulaire de contact — fonction serverless Vercel.
 *
 * Deux e-mails partent à chaque demande : la notification interne, et l'accusé
 * de réception adressé au prospect. Les gabarits sont dans `_emails.ts`.
 *
 * Variables d'environnement (Vercel > Settings > Environment Variables) :
 *   RESEND_API_KEY  obligatoire — clé API Resend (re_…)
 *   CONTACT_TO      optionnel — destinataire, défaut contact@smartfixx.fr
 *   CONTACT_FROM    optionnel — expéditeur, doit être sur un domaine vérifié
 *                   chez Resend, défaut « SmartFixx <contact@smartfixx.fr> »
 *
 * Aucune demande n'est jamais écartée : sans `RESEND_API_KEY` la fonction
 * répond 503 et le formulaire affiche l'adresse e-mail directe. Une réponse 200
 * signifie que Resend a accepté la notification.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { confirmationEmail, internalEmail, type Submission } from "./_emails";

const TO = process.env.CONTACT_TO || "contact@smartfixx.fr";
const FROM = process.env.CONTACT_FROM || "SmartFixx <contact@smartfixx.fr>";

/** Longueurs maximales : au-delà, c'est un robot, pas un prospect. */
const LIMITS = {
  name: 120,
  company: 160,
  email: 200,
  phone: 40,
  type: 80,
  budget: 80,
  message: 5000,
} as const;

type Field = keyof typeof LIMITS;

/** En dessous, aucun humain n'a eu le temps de remplir le formulaire. */
const MIN_FILL_MS = 2000;

const clean = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/** Volontairement permissif : refuser un e-mail valide coûte plus qu'accepter une faute. */
const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

const send = async (
  apiKey: string,
  payload: {
    to: string;
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
  },
) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
    }),
  });

  if (!response.ok) throw new Error(`Resend ${response.status} — ${await response.text()}`);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const body: Record<string, unknown> =
    typeof req.body === "string" ? safeParse(req.body) : (req.body ?? {});

  const fields = {} as Submission;
  for (const key of Object.keys(LIMITS) as Field[]) fields[key] = clean(body[key]);

  const tooLong = (Object.keys(LIMITS) as Field[]).filter(
    (key) => fields[key].length > LIMITS[key],
  );
  if (tooLong.length) {
    return res.status(400).json({ error: "Un des champs dépasse la longueur autorisée." });
  }

  if (!fields.name || !fields.email || !fields.message) {
    return res.status(400).json({ error: "Nom, e-mail et message sont nécessaires." });
  }
  if (!looksLikeEmail(fields.email)) {
    return res.status(400).json({ error: "Cette adresse e-mail semble incorrecte." });
  }

  /* Signal anti-robot : le temps passé sur le formulaire. Il remplace un champ
     caché « pot de miel », que le remplissage automatique de Chrome déclenchait
     sur de vraies demandes. Il ne bloque rien — il annote la notification et
     supprime l'accusé de réception, pour ne pas transformer le formulaire en
     relais d'envoi vers une adresse arbitraire. */
  const startedAt = Number(clean(body.ts));
  const elapsed = Number.isFinite(startedAt) && startedAt > 0 ? Date.now() - startedAt : NaN;
  const suspect = !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS;

  console.log("Demande reçue, transmission en cours.", {
    from: fields.email,
    to: TO,
    elapsed: Number.isFinite(elapsed) ? elapsed : null,
    suspect,
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY absente : demande reçue mais non transmise.", {
      from: fields.email,
    });
    return res.status(503).json({ error: "Service d'envoi indisponible." });
  }

  const notice = internalEmail(fields, suspect);

  try {
    await send(apiKey, {
      to: TO,
      subject: notice.subject,
      html: notice.html,
      text: notice.text,
      /* Répondre à la notification écrit directement au prospect. */
      replyTo: fields.email,
    });
  } catch (error) {
    /* Le détail va au journal Vercel : une erreur d'API ne doit rien révéler de
       la configuration au visiteur. */
    console.error("Notification interne non transmise", error);
    return res.status(502).json({ error: "L'envoi a échoué." });
  }

  /* L'accusé de réception ne conditionne pas la réponse : la demande est déjà
     arrivée à destination, un échec ici ne doit pas faire croire le contraire au
     visiteur ni le pousser à renvoyer sa demande. */
  if (!suspect) {
    const receipt = confirmationEmail(fields);
    try {
      await send(apiKey, {
        to: fields.email,
        subject: receipt.subject,
        html: receipt.html,
        text: receipt.text,
        replyTo: TO,
      });
    } catch (error) {
      console.error("Accusé de réception non transmis", error);
    }
  }

  return res.status(200).json({ ok: true });
}

const safeParse = (raw: string): Record<string, unknown> => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};
