import { PublicShell } from "@/components/sx";
import { locationMeta } from "@/components/location-page";
import { FrancePage } from "@/components/local/france-page";
export const metadata = locationMeta("agence-web-france");
export default function Page() { return <PublicShell><FrancePage /></PublicShell>; }
