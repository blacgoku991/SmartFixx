import { PublicShell } from "@/components/sx/public-shell";
import { ProspectionPage } from "@/components/secondary/emailing-pages";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta("Prospection emailing B2B : campagnes sur devis | SmartFixx", "Prospection par email avec votre fichier de contacts : messages validés avant envoi, cadence maîtrisée, désinscription respectée et suivi des réponses.", "/prospection-emailing");
export default function ProspectionEmailing() {
  return <PublicShell><ProspectionPage /></PublicShell>;
}
