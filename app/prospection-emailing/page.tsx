import { PublicShell } from "@/components/sx/public-shell";
import { ProspectionPage, PROSPECTION_DESCRIPTION } from "@/components/secondary/emailing-pages";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta("Prospection emailing B2B : campagnes sur devis | SmartFixx", PROSPECTION_DESCRIPTION, "/prospection-emailing");
export default function ProspectionEmailing() {
  return <PublicShell><ProspectionPage /></PublicShell>;
}
