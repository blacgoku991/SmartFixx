/**
 * Gabarits des e-mails transactionnels : la notification interne et l'accusé de
 * réception envoyé au prospect.
 *
 * Le préfixe `_` exclut ce fichier de la détection des fonctions Vercel : c'est
 * un module partagé, pas un point d'entrée HTTP.
 *
 * Contraintes des messageries, qui expliquent le style du code :
 *   - mise en page en `<table>`, jamais flex ni grid — Outlook les ignore
 *   - styles en attribut `style`, pas en feuille : Gmail retire une partie des
 *     `<style>`, notamment sur mobile
 *   - couleurs de fond posées explicitement sur chaque cellule, sinon un client
 *     en thème sombre inverse le texte et le rend illisible
 *   - image servie en URL absolue : les data-URI sont bloquées
 *   - toujours une version texte, faute de quoi le message part en indésirable
 */

const SITE = "https://smartfixx.fr";
const LOGO = `${SITE}/email-logo.png`;

const INK = "#04050A";
const CARD = "#0B0D14";
const LINE = "#1E2230";
const TEXT = "#F4F6FB";
const DIM = "#A9B2C4";
const FAINT = "#6E7686";
const MINT = "#4FF0D4";

export type Submission = {
  name: string;
  company: string;
  email: string;
  phone: string;
  type: string;
  budget: string;
  message: string;
};

/** Indispensable : ces valeurs viennent d'un formulaire public et finissent dans du HTML. */
export const escapeHtml = (value: string) =>
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

export const internalEmail = (fields: Submission, suspect: boolean) => {
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

export const confirmationEmail = (fields: Submission) => {
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
