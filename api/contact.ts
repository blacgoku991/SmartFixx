/**
 * Réception du formulaire de contact — fonction serverless Vercel.
 *
 * Avant, l'envoi ouvrait le logiciel de messagerie du visiteur via un lien
 * `mailto:` : la majorité des demandes n'arrivait jamais, et sur mobile ou sur
 * un webmail le clic ne faisait rien du tout. Ici la demande part côté serveur,
 * donc elle arrive ou elle échoue franchement — sans faux positif.
 *
 * Variables d'environnement (Vercel > Settings > Environment Variables) :
 *   RESEND_API_KEY  obligatoire — clé API Resend (re_…)
 *   CONTACT_TO      optionnel — destinataire, défaut contact@smartfixx.fr
 *   CONTACT_FROM    optionnel — expéditeur, doit être sur un domaine vérifié
 *                   chez Resend, défaut « SmartFixx <contact@smartfixx.fr> »
 *
 * Sans `RESEND_API_KEY`, la fonction répond 503 et le formulaire propose le
 * lien e-mail direct : jamais de demande avalée en silence.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

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

const clean = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/** Volontairement permissif : refuser un e-mail valide coûte plus qu'accepter une faute. */
const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const body: Record<string, unknown> =
    typeof req.body === "string" ? safeParse(req.body) : (req.body ?? {});

  /* Pot de miel : un champ invisible pour l'humain, qu'un robot remplit.
     Il ne bloque volontairement rien. Le premier essai écartait la demande, et
     le remplissage automatique de Chrome suffisait à qualifier un vrai prospect
     de robot : le site confirmait l'envoi, aucun e-mail ne partait, et personne
     ne pouvait le savoir. Pour une activité qui reçoit quelques demandes par
     semaine, perdre un client coûte incomparablement plus cher que supprimer un
     courrier indésirable. La demande part donc toujours ; seul l'objet signale
     le doute, et le tri reste humain. */
  const suspect = Boolean(clean(body.ref_interne));

  const fields = {} as Record<Field, string>;
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

  console.log("Demande reçue, transmission en cours.", { from: fields.email, to: TO, suspect });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY absente : demande reçue mais non transmise.", {
      from: fields.email,
    });
    return res.status(503).json({ error: "Service d'envoi indisponible." });
  }

  const lines = [
    `Nom       : ${fields.name}`,
    `Société   : ${fields.company || "—"}`,
    `E-mail    : ${fields.email}`,
    `Téléphone : ${fields.phone || "—"}`,
    `Projet    : ${fields.type || "—"}`,
    `Budget    : ${fields.budget || "—"}`,
    "",
    "Message :",
    fields.message,
  ];

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        /* Répondre à l'e-mail transfère directement au prospect. */
        reply_to: fields.email,
        subject: `${suspect ? "[Robot probable] " : ""}Nouvelle demande — ${
          fields.type || "projet"
        } — ${fields.name}`,
        text: lines.join("\n"),
      }),
    });

    if (!response.ok) {
      /* Le détail va au journal Vercel, pas au visiteur : une erreur d'API ne
         doit rien révéler de la configuration. */
      console.error("Resend a refusé l'envoi", response.status, await response.text());
      return res.status(502).json({ error: "L'envoi a échoué." });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Envoi impossible", error);
    return res.status(502).json({ error: "L'envoi a échoué." });
  }
}

const safeParse = (raw: string): Record<string, unknown> => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};
