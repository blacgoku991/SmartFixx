import { PublicShell } from "@/components/sx";
import { GuideIndex } from "@/components/editorial/guide-index";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta(
  "Conseils site internet, automatisation et emailing | SmartFixx",
  "Guides pratiques pour préparer la refonte d’un site, automatiser le suivi des demandes clients et lancer une première campagne d’emailing B2B.",
  "/conseils",
);
export default function Conseils() { return <PublicShell><GuideIndex /></PublicShell>; }
