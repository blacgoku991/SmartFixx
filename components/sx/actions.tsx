import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowRight, Phone } from "lucide-react";
import CampaignLink from "@/components/campaign-link";
/* lib/contact-links et non lib/site-identity : ce module est aussi chargé par l'en-tête (client). */
import { PHONE_DISPLAY, telHref } from "@/lib/contact-links";
/* Actions (serveur). Le lien passe par CampaignLink : utm_campaign se propage dans le HTML serveur. */
type ButtonLinkProps = {
  variant?: "cta" | "primary" | "ghost";
  href: string;
  icon?: "arrow" | "phone" | "none" | ReactNode;
  size?: "md" | "lg";
  className?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;
export function ButtonLink({ variant = "cta", href, icon = "arrow", size = "md", className, children, ...rest }: ButtonLinkProps) {
  const cls = ["sx-btn", `sx-btn--${variant}`, size === "lg" ? "sx-btn--lg" : "", className].filter(Boolean).join(" ");
  const glyph = icon === "arrow" ? <ArrowRight className="sx-btn-icon" aria-hidden="true" /> : icon === "phone" ? <Phone className="sx-btn-icon" aria-hidden="true" /> : icon === "none" ? null : icon;
  const analytics = href.startsWith("/contact") || href.startsWith("/diagnostic") || href.startsWith("#demande") ? { "data-analytics": "contact" } : {};
  return <CampaignLink href={href} className={cls} {...analytics} {...rest}><span>{children}</span>{glyph}</CampaignLink>;
}
/* Téléphone direct. compact : icône seule (cible de 44 px) avec un nom accessible complet ;
   compact="sm" : icône seule sous 480 px, numéro en toutes lettres au-delà (même nom accessible). */
export function PhoneLink({ compact = false, className, label }: { compact?: boolean | "sm"; className?: string; label?: string }) {
  const cls = ["sx-phone", compact === true ? "sx-phone--compact" : compact === "sm" ? "sx-phone--compact-sm" : "", className].filter(Boolean).join(" ");
  if (compact === "sm") return <a href={telHref} className={cls} data-analytics="contact" aria-label={`Appeler Mohamed au ${PHONE_DISPLAY}`}><span className="sx-phone-icon" aria-hidden="true"><Phone /></span><span className="sx-phone-number">{PHONE_DISPLAY}</span></a>;
  if (compact) return <a href={telHref} className={cls} data-analytics="contact" aria-label={`Appeler Mohamed au ${PHONE_DISPLAY}`}><span className="sx-phone-icon"><Phone aria-hidden="true" /></span></a>;
  return <a href={telHref} className={cls} data-analytics="contact"><span className="sx-phone-icon" aria-hidden="true"><Phone /></span><span className="sx-phone-number">{label ? <>{label} </> : null}{PHONE_DISPLAY}</span></a>;
}
