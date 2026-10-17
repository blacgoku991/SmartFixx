import { PublicShell } from "@/components/sx/public-shell";
import { DiagnosticPage } from "@/components/secondary/diagnostic-page";
import { formFromParams, type Params } from "@/components/secondary/params";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta("Faire le point sur son site et ses outils | SmartFixx", "Site difficile à parcourir, tâches répétitives, demandes qui se perdent : décrivez votre situation pour préparer un premier échange utile, sans engagement.", "/diagnostic");
/* Cible des liens d'acquisition du panel (/diagnostic?service=…&utm_campaign=…) : dynamique et en 200. */
export default async function Diagnostic({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  return <PublicShell><DiagnosticPage form={formFromParams(p, "conseil")} /></PublicShell>;
}
