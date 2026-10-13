import { SITE_IDENTITY, mailHref, telHref } from "@/lib/site-identity";
/* Cartouche d'auteur (remplace la photo) : identité légale et contact, lus dans lib/site-identity.ts.
   Siège social et lieu de travail sont séparés ; l'adresse du domicile n'est jamais publiée. */
export function Cartouche({ variant = "band", className }: { variant?: "band" | "footer" | "compact"; className?: string }) {
  const I = SITE_IDENTITY;
  const rows: [string, React.ReactNode][] = [
    ["Éditeur", I.LEGAL],
    ["SIREN", <span className="sx-tabular" key="s">{I.SIREN}</span>],
    ["Siège social", I.SIEGE.label],
    ["Interlocuteur", I.NAME],
    ["Je travaille depuis", <span className="sx-nowrap" key="w">{I.WORK_BASE}</span>],
    ["Téléphone", <a href={telHref} className="sx-tabular" key="t">{I.PHONE_DISPLAY}</a>],
    ["Email", <a href={mailHref} key="e">{I.EMAIL}</a>],
  ];
  const body = (
    <address className={["sx-cartouche", variant === "band" ? "" : `sx-cartouche--${variant}`, className].filter(Boolean).join(" ")} aria-label="Identité et contact">
      <dl>{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    </address>
  );
  return variant === "band" ? <div className="sx-cartouche--band"><div className="sx-container">{body}</div></div> : body;
}
