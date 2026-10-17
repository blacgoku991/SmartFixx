import type { MetadataRoute } from "next";
import {services} from "@/lib/services";
import {locations} from "@/lib/locations";
import {guides} from "@/lib/guides";
import {SITE_URL} from "@/lib/seo";
/* Date de mise en ligne de la refonte : FIXÉE AU DÉPLOIEMENT (décision du propriétaire n° 20). Elle sert de
   lastModified réel aux pages refaites ; un guide garde sa propre date de mise à jour si lib/guides.ts en
   fournit une (dateModified, modifiedTime, puis datePublished, publishedTime). Ces dates vivent dans
   lib/guides.ts et nulle part ailleurs : l'Article JSON-LD de app/conseils/[slug] les lit aussi, et
   vps/tests/http-seo.test.mjs exige la même date des deux côtés dès que lib/guides.ts les déclare. Pas de changeFrequency ni de
   priority : Google les ignore. Uniquement des URL canoniques en 200 : aucune URL redirigée
   (lib/legacy-redirects.ts), aucune page noindex. Toute nouvelle route publique entre ici ET dans
   lib/measured-paths.ts (mesure d'audience). */
const REFONTE_DATE="2026-10-14";
const STATIC=["/","/services","/prospection-emailing","/solutions","/methode","/tarifs","/garanties","/contact","/diagnostic","/conseils","/confidentialite","/mentions-legales"];
const isoDate=(v:unknown)=>typeof v==="string"&&/^\d{4}-\d{2}-\d{2}/.test(v)?v:undefined;
function guideDate(g:object):string{
  const r=g as Record<string,unknown>;
  return isoDate(r.dateModified)??isoDate(r.modifiedTime)??isoDate(r.datePublished)??isoDate(r.publishedTime)??REFONTE_DATE;
}
/* Forme de l'accueil alignée sur la canonique émise par Next (metadataBase + « / ») : sans barre finale. */
const url=(path:string)=>path==="/"?SITE_URL:`${SITE_URL}${path}`;
export default function sitemap():MetadataRoute.Sitemap{
  return [
    ...[...STATIC,...services.map(s=>`/${s.slug}`),...locations.map(l=>`/${l.slug}`)].map(path=>({url:url(path),lastModified:REFONTE_DATE})),
    ...guides.map(g=>({url:url(`/conseils/${g.slug}`),lastModified:guideDate(g)})),
  ];
}
