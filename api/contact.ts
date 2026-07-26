/**
 * Réception du formulaire de contact — fonction serverless Vercel.
 *
 * Deux e-mails partent à chaque demande : la notification interne, et l'accusé
 * de réception adressé au prospect.
 *
 * Les gabarits vivaient dans un `api/_emails.ts` importé ici. Vercel compile
 * chaque fonction sans regrouper ses dépendances locales et exclut du
 * déploiement les fichiers préfixés d'un `_` : à l'exécution, l'import échouait
 * en ERR_MODULE_NOT_FOUND et le formulaire renvoyait une erreur. Tout tient donc
 * dans ce fichier — un seul point d'entrée, aucune résolution de module.
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

const SITE = "https://smartfixx.fr";
const LOGO = `${SITE}/email-logo.png`;

const INK = "#04050A";
const CARD = "#0B0D14";
const LINE = "#1E2230";
const TEXT = "#F4F6FB";
const DIM = "#A9B2C4";
const FAINT = "#6E7686";
const MINT = "#4FF0D4";

type Submission = {
  name: string;
  company: string;
  email: string;
  phone: string;
  type: string;
  budget: string;
  message: string;
};

/** Indispensable : ces valeurs viennent d'un formulaire public et finissent dans du HTML. */
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const paragraphs = (value: string) =>
  escapeHtml(value)
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n/g, "<br />"))
    .filter(Boolean);

/** Enveloppe commune : fond, carte centrée, en-tête à la marque, pied de page. */
const layout = ({
  preheader,
  heading,
  intro,
  body,
  footer,
}: {
  preheader: string;
  heading: string;
  intro: string;
  body: string;
  footer: string;
}) => `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${INK};">
  <!-- Aperçu affiché dans la liste des messages, puis masqué. -->
  <div style="display:none;font-size:1px;color:${INK};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${INK};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${CARD};border:1px solid ${LINE};border-radius:16px;overflow:hidden;">

          <tr>
            <td style="padding:32px 32px 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="44" style="padding-right:12px;vertical-align:middle;">
                    <img src="${LOGO}" width="44" height="44" alt="SmartFixx"
                      style="display:block;width:44px;height:44px;border:0;" />
                  </td>
                  <td style="vertical-align:middle;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:19px;font-weight:600;color:${TEXT};letter-spacing:-0.01em;">
                    SmartFixx
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 32px 0 32px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              <h1 style="margin:0;font-size:23px;line-height:1.25;font-weight:600;color:${TEXT};letter-spacing:-0.02em;">${escapeHtml(heading)}</h1>
              <p style="margin:12px 0 0 0;font-size:15px;line-height:1.65;color:${DIM};">${intro}</p>
            </td>
          </tr>

          <tr><td style="padding:24px 32px 0 32px;">${body}</td></tr>

          <tr>
            <td style="padding:28px 32px 32px 32px;">
              <div style="border-top:1px solid ${LINE};padding-top:18px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12.5px;line-height:1.7;color:${FAINT};">
                ${footer}
              </div>
            </td>
          </tr>

        </table>

        <div style="padding-top:18px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11.5px;color:${FAINT};">
          <a href="${SITE}" style="color:${FAINT};text-decoration:none;">smartfixx.fr</a>
        </div>

      </td>
    </tr>
  </table>
</body></html>`;

/** Tableau clé/valeur : une ligne par champ renseigné. */
const detailRows = (rows: Array<[string, string]>) =>
  rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid ${LINE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${FAINT};white-space:nowrap;vertical-align:top;width:110px;">${escapeHtml(label)}</td>
        <td style="padding:9px 0 9px 16px;border-bottom:1px solid ${LINE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14.5px;line-height:1.55;color:${TEXT};">${value}</td>
      </tr>`,
    )
    .join("");

/* ------------------------------------------------------------------ interne */

const internalEmail = (fields: Submission, suspect: boolean) => {
  const mailto = `mailto:${encodeURIComponent(fields.email)}?subject=${encodeURIComponent(
    `Re : votre demande — SmartFixx`,
  )}`;

  const rows = detailRows([
    ["Nom", escapeHtml(fields.name)],
    ["Société", escapeHtml(fields.company)],
    [
      "E-mail",
      `<a href="mailto:${escapeHtml(fields.email)}" style="color:${MINT};text-decoration:none;">${escapeHtml(fields.email)}</a>`,
    ],
    [
      "Téléphone",
      fields.phone
        ? `<a href="tel:${escapeHtml(fields.phone.replace(/\s+/g, ""))}" style="color:${MINT};text-decoration:none;">${escapeHtml(fields.phone)}</a>`
        : "",
    ],
    ["Projet", escapeHtml(fields.type)],
    ["Budget", escapeHtml(fields.budget)],
  ]);

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>

    <div style="margin-top:22px;padding:18px 20px;background:#0F1220;border:1px solid ${LINE};border-radius:12px;">
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${FAINT};margin-bottom:10px;">Message</div>
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:${TEXT};">
        ${paragraphs(fields.message).map((block) => `<p style="margin:0 0 12px 0;">${block}</p>`).join("")}
      </div>
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
      <tr>
        <td style="background:${MINT};border-radius:10px;">
          <a href="${mailto}" style="display:inline-block;padding:13px 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14.5px;font-weight:600;color:${INK};text-decoration:none;">Répondre à ${escapeHtml(fields.name)}</a>
        </td>
      </tr>
    </table>

    ${
      suspect
        ? `<p style="margin:20px 0 0 0;padding:12px 16px;background:#1A1424;border:1px solid #3A2B52;border-radius:10px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#C9B6E8;">
             Formulaire soumis en moins de deux secondes, ou sans horodatage : possible envoi automatisé. La demande vous est transmise quand même — à vous de juger.
           </p>`
        : ""
    }`;

  const subject = `Demande de devis — ${fields.name}${fields.company ? ` · ${fields.company}` : ""}`;

  const text = [
    `Nouvelle demande depuis smartfixx.fr`,
    "",
    `Nom       : ${fields.name}`,
    `Société   : ${fields.company || "—"}`,
    `E-mail    : ${fields.email}`,
    `Téléphone : ${fields.phone || "—"}`,
    `Projet    : ${fields.type || "—"}`,
    `Budget    : ${fields.budget || "—"}`,
    "",
    "Message :",
    fields.message,
    suspect ? "\n⚠ Soumission très rapide ou sans horodatage : possible envoi automatisé." : "",
  ].join("\n");

  return {
    subject,
    text,
    html: layout({
      preheader: `${fields.name} — ${fields.type || "projet"}`,
      heading: "Nouvelle demande",
      intro: `Reçue depuis le formulaire de <a href="${SITE}" style="color:${MINT};text-decoration:none;">smartfixx.fr</a>. Répondre à cet e-mail écrit directement au prospect.`,
      body,
      footer: `Cet e-mail est envoyé automatiquement par le formulaire de contact du site.`,
    }),
  };
};

/* -------------------------------------------------------------- prospect */

const confirmationEmail = (fields: Submission) => {
  const rows = detailRows([
    ["Projet", escapeHtml(fields.type)],
    ["Budget", escapeHtml(fields.budget)],
  ]);

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>

    <div style="margin-top:22px;padding:18px 20px;background:#0F1220;border:1px solid ${LINE};border-radius:12px;">
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${FAINT};margin-bottom:10px;">Votre message</div>
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:${DIM};">
        ${paragraphs(fields.message).map((block) => `<p style="margin:0 0 12px 0;">${block}</p>`).join("")}
      </div>
    </div>

    <p style="margin:24px 0 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:${DIM};">
      Prochaine étape : nous revenons vers vous sous <strong style="color:${TEXT};font-weight:600;">24 heures ouvrées</strong>
      avec nos questions et, si le périmètre est clair, une proposition. Pas de relance commerciale automatique,
      pas d'inscription à une liste de diffusion.
    </p>`;

  return {
    subject: "Votre demande est bien arrivée — SmartFixx",
    text: [
      `Bonjour ${fields.name},`,
      "",
      "Votre demande nous est bien parvenue. Nous revenons vers vous sous 24 heures ouvrées.",
      "",
      "Récapitulatif :",
      `Projet : ${fields.type || "—"}`,
      `Budget : ${fields.budget || "—"}`,
      "",
      "Votre message :",
      fields.message,
      "",
      "À bientôt,",
      "SmartFixx — smartfixx.fr",
      "",
      "Cet e-mail confirme la réception de votre demande. Vous pouvez y répondre directement.",
    ].join("\n"),
    html: layout({
      preheader: "Nous revenons vers vous sous 24 heures ouvrées.",
      heading: `Votre demande est bien arrivée`,
      intro: `Bonjour ${escapeHtml(fields.name)}, merci de votre message — voici ce que nous avons reçu.`,
      body,
      footer: `Cet e-mail confirme la réception de votre demande ; vous pouvez y répondre directement.
        Vos informations servent uniquement à y répondre —
        <a href="${SITE}/politique-de-confidentialite" style="color:${FAINT};">politique de confidentialité</a>.`,
    }),
  };
};

/* ------------------------------------------------- réception HTTP */

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
