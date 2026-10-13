import type { MetadataRoute } from "next";
import {services} from "@/lib/services";
import {locations} from "@/lib/locations";
import {guides} from "@/lib/guides";
import {SITE_URL} from "@/lib/seo";
export default function sitemap():MetadataRoute.Sitemap{return ["/","/services","/prospection-emailing","/solutions","/methode","/tarifs","/garanties","/contact","/diagnostic","/conseils","/confidentialite","/mentions-legales",...services.map(s=>`/${s.slug}`),...locations.map(l=>`/${l.slug}`),...guides.map(g=>`/conseils/${g.slug}`)].map(path=>({url:`${SITE_URL}${path}`,changeFrequency:"monthly",priority:path==="/"?1:.7}));}
