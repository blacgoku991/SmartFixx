import { PublicShell } from "@/components/sx/public-shell";
import { GarantiesPage } from "@/components/secondary/emailing-pages";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta("Engagements de prospection emailing : désinscription | SmartFixx", "Mes engagements pour une campagne d’emailing : messages validés avant envoi, désinscription respectée sur tous les envois, cadence maîtrisée et bilan partagé.", "/garanties");
/* Gabarit propre (plus de LegalLayout). Seuls les engagements vérifiables sont publiés ; « remplacement
   sous 30 jours », « avoirs » et « optimisation sans frais » sont retirés jusqu'à confirmation écrite du
   propriétaire (décision n° 9). */
export default function Garanties() {
  return <PublicShell><GarantiesPage /></PublicShell>;
}
