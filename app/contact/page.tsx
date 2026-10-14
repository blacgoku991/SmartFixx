import { PublicShell } from "@/components/sx/public-shell";
import { ContactPage } from "@/components/secondary/contact-page";
import { formFromParams, isEmailingRequest, type Params } from "@/components/secondary/params";
import { readCampaignConfig } from "@/lib/campaign-config";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta("Devis création ou refonte de site internet | SmartFixx", "Décrivez votre projet de création ou de refonte de site, d’automatisation ou de prospection : votre demande est enregistrée et je reviens vers vous.", "/contact");
/* Destination des CTA du site, des pages de prestation (?service=…), du panel et des emails : reste
   dynamique (lecture de ?service, ?utm_campaign, ?plan, ?volume côté serveur) et en 200. */
export default async function Contact({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  return (
    <PublicShell>
      {isEmailingRequest(p) ? <ContactPage mode="emailing" config={readCampaignConfig(p)} /> : <ContactPage mode="project" form={formFromParams(p)} />}
    </PublicShell>
  );
}
