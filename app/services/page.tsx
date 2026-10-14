import { PublicShell } from "@/components/sx/public-shell";
import { ServicesPage } from "@/components/secondary/services-page";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta("Services web : création de site, refonte, SEO | SmartFixx", "Création et refonte de sites, développement sur mesure, automatisation, sécurité web, référencement SEO et prospection emailing : trouvez le service adapté.", "/services");
/* Destination par défaut des emails déjà envoyés (/services?utm_campaign=…) : rendue à chaque requête pour
   que CampaignLink propage utm_campaign dans le HTML serveur. */
export const dynamic = "force-dynamic";
export default function Services() {
  return <PublicShell><ServicesPage /></PublicShell>;
}
