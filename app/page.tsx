import { PublicShell } from "@/components/sx/public-shell";
import { HomePage } from "@/components/home/home-page";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta(
  "Création et refonte de site internet en Île-de-France | SmartFixx",
  "Je crée et refonds les sites des entreprises d’Asnières-sur-Seine, des Hauts-de-Seine et d’Île-de-France : site clair, lisible sur mobile, devis simple.",
  "/",
);
export default function Home() {
  return (
    <PublicShell>
      <HomePage />
    </PublicShell>
  );
}
