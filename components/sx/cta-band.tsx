import type { ReactNode } from "react";
import { ButtonLink, PhoneLink } from "./actions";
import { Skyline } from "./ambient";
/* Bandeau d'appel de fin de page (serveur). Remplace l'ancien NextStep
   (components/next-step.tsx, supprimé au lot 10).
   Toujours nocturne (portée [data-sx-tone=night]) : en thème clair, la page part de l'aube et finit sur la
   ville de nuit, fenêtres allumées. Graine 5 : une autre ville que celle du hero (graine 0 par défaut). */
export function CtaBand({ title, text, primaryHref = "/contact", primaryLabel = "Parler de mon projet", id = "cta-band-titre", phone = true, skyline = true }: { title: ReactNode; text?: ReactNode; primaryHref?: string; primaryLabel?: string; id?: string; phone?: boolean; skyline?: boolean }) {
  return (
    <section className={skyline ? "sx-cta-band" : "sx-cta-band sx-cta-band--flat"} data-sx-tone="night" aria-labelledby={id}>
      {skyline ? <div className="sx-ambient" aria-hidden="true" data-sx-ambient=""><Skyline seed={5} /></div> : null}
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
