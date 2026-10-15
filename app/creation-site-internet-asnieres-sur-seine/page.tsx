import { PublicShell } from "@/components/sx";
import { locationMeta } from "@/components/location-page";
import { AsnieresPage } from "@/components/local/asnieres-page";
export const metadata = locationMeta("creation-site-internet-asnieres-sur-seine");
export default function Page() { return <PublicShell><AsnieresPage /></PublicShell>; }
