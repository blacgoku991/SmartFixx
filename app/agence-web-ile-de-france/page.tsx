import { PublicShell } from "@/components/sx";
import { locationMeta } from "@/components/location-page";
import { IleDeFrancePage } from "@/components/local/ile-de-france-page";
export const metadata = locationMeta("agence-web-ile-de-france");
export default function Page() { return <PublicShell><IleDeFrancePage /></PublicShell>; }
