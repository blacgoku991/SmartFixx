import { PublicShell } from "@/components/sx/public-shell";
import { SolutionsPage } from "@/components/secondary/emailing-pages";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta("Fichier client ou nouvelle audience pour l’emailing | SmartFixx", "Prospecter avec votre propre fichier de contacts ou étudier une nouvelle audience : les deux approches, leurs conditions et les points à vérifier avant l’envoi.", "/solutions");
export default function Solutions() {
  return <PublicShell><SolutionsPage /></PublicShell>;
}
