import { PublicShell } from "@/components/sx/public-shell";
import { MethodePage } from "@/components/secondary/emailing-pages";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta("Méthode de prospection emailing en 4 étapes | SmartFixx", "Cadrage, préparation des données et des messages, lancement puis bilan : le déroulement d’une campagne de prospection emailing, étape par étape, sans surprise.", "/methode");
export default function Methode() {
  return <PublicShell><MethodePage /></PublicShell>;
}
