import { ServicePage } from "@/components/service-page";
import { services } from "@/lib/services";
/* CONTRAT figé au lot 0 : AcquisitionPage({service}) pour /creation-site-internet et
   /refonte-site-internet (implémentation : lot 2). BOUCHON temporaire : rend l'ancienne ServicePage.
   Les métadonnées sont produites par app/[slug]/page.tsx (gelé). */
export function AcquisitionPage({ service }: { service: "creation" | "refonte" }) {
  const s = services.find((x) => x.id === service);
  if (!s) return null;
  return <ServicePage service={s} />;
}
