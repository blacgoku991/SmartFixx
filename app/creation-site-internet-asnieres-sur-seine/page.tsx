import { LocationPage } from "@/components/location-page";
import { locations } from "@/lib/locations";
import { pageMeta } from "@/lib/seo";
const location=locations.find(l=>l.slug==="creation-site-internet-asnieres-sur-seine")!;
export const metadata=pageMeta(`${location.title} — SmartFixx`,location.intro.slice(0,160),`/${location.slug}`);
export default function Page(){return <LocationPage location={location}/>;}
