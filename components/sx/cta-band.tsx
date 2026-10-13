import type { ReactNode } from "react";
import { ButtonLink, PhoneLink } from "./actions";
import { Skyline } from "./ambient";
/* Bandeau d'appel de fin de page (serveur). Remplace NextStep (alias conservé dans components/next-step.tsx). */
export function CtaBand({ title, text, primaryHref = "/contact", primaryLabel = "Parler de mon projet", id = "cta-band-titre", phone = true, skyline = true }: { title: ReactNode; text?: ReactNode; primaryHref?: string; primaryLabel?: string; id?: string; phone?: boolean; skyline?: boolean }) {
  return (
    <section className={skyline ? "sx-cta-band" : "sx-cta-band sx-cta-band--flat"} aria-labelledby={id}>
      {skyline ? <div className="sx-ambient" aria-hidden="true" data-sx-ambient=""><Skyline seed={3} /></div> : null}
      <div className="sx-container sx-cta-band-inner">
        <div>
          <h2 id={id}>{title}</h2>
          {text ? <p>{text}</p> : null}
        </div>
        <div className="sx-cta-band-actions">
          <ButtonLink variant="cta" href={primaryHref} size="lg">{primaryLabel}</ButtonLink>
          {phone ? <PhoneLink /> : null}
        </div>
      </div>
    </section>
  );
}
