import { PublicShell } from "@/components/sx/public-shell";
import { TarifsPage } from "@/components/secondary/emailing-pages";
import { readCampaignConfig } from "@/lib/campaign-config";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta("Formules de prospection emailing sur devis | SmartFixx", "Volumes d’envoi, audience et accompagnement : les formules de campagne emailing et ce qui fait varier le devis. Aucun prix publié, chaque campagne est chiffrée.", "/tarifs");
/* URL conservée (test HTTP, campaignHref, pied de page, guide emailing), en 200 avec un h1, SANS aucun
   montant : la grille de lib/offers.ts reste une estimation interne calculée par le serveur. */
export default async function Tarifs({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PublicShell><TarifsPage config={readCampaignConfig(await searchParams)} /></PublicShell>;
}
