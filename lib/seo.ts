import type { Metadata } from "next";
import { SITE_IDENTITY, type Area } from "./site-identity";
export const SITE_URL="https://smartfixx-reach.wgg9cdxhs2.chatgpt.site";
export const OG_IMAGE={url:`${SITE_URL}/og-image.png`,width:1200,height:630,alt:"SmartFixx — création et refonte de sites internet, par Mohamed"};
type PageMetaOptions={type?:"website"|"article";noindex?:boolean;publishedTime?:string;modifiedTime?:string};
/* Signature gelée au lot 0 : pageMeta(title, description, path, opts?). Le titre est complet (« … | SmartFixx »). */
export function pageMeta(title:string,description:string,path:string,opts:PageMetaOptions={}):Metadata{
  const type=opts.type??"website";
  const openGraph:Metadata["openGraph"]=type==="article"
    ?{title,description,url:SITE_URL+path,siteName:"SmartFixx",locale:"fr_FR",type:"article",images:[OG_IMAGE],publishedTime:opts.publishedTime,modifiedTime:opts.modifiedTime}
    :{title,description,url:SITE_URL+path,siteName:"SmartFixx",locale:"fr_FR",type:"website",images:[OG_IMAGE]};
  return {title:{absolute:title},description,alternates:{canonical:path},openGraph,twitter:{card:"summary_large_image",title,description,images:[OG_IMAGE.url]},...(opts.noindex?{robots:{index:false,follow:true}}:{})};
}
const ORG_ID=`${SITE_URL}/#organization`;
export const organization={"@type":"Organization","@id":ORG_ID,name:SITE_IDENTITY.BRAND,legalName:SITE_IDENTITY.LEGAL_NAME,url:SITE_URL,logo:`${SITE_URL}/smartfixx-logo.webp`,email:SITE_IDENTITY.EMAIL,telephone:SITE_IDENTITY.PHONE_SCHEMA,
  address:{"@type":"PostalAddress",streetAddress:SITE_IDENTITY.SIEGE.street,postalCode:SITE_IDENTITY.SIEGE.postalCode,addressLocality:SITE_IDENTITY.SIEGE.city,addressCountry:SITE_IDENTITY.SIEGE.country},
  iso6523Code:`0002:${SITE_IDENTITY.SIREN_DIGITS}`,founder:{"@type":"Person",name:SITE_IDENTITY.NAME},areaServed:SITE_IDENTITY.AREAS,
  ...(SITE_IDENTITY.confirmedLegalIds?{vatID:SITE_IDENTITY.VAT,foundingDate:SITE_IDENTITY.REGISTERED_ON}:{})};
/* Ajoute « Accueil » en tête : items = la suite du fil, sans l'accueil. */
export function breadcrumb(items:{name:string;path:string}[]){return {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{name:"Accueil",path:"/"},...items].map((i,index)=>({"@type":"ListItem",position:index+1,name:i.name,item:SITE_URL+i.path}))};}
export function serviceJsonLd({name,description,path,areaServed}:{name:string;description:string;path:string;areaServed?:Area[]}){
  return {"@context":"https://schema.org","@type":"Service",name,description,url:SITE_URL+path,serviceType:name,provider:{"@id":ORG_ID},areaServed:areaServed??SITE_IDENTITY.AREAS};
}
export function articleJsonLd({headline,description,path,datePublished,dateModified}:{headline:string;description:string;path:string;datePublished:string;dateModified?:string}){
  const author=SITE_IDENTITY.personAuthorAccepted?{"@type":"Person",name:SITE_IDENTITY.NAME,worksFor:{"@id":ORG_ID}}:{"@id":ORG_ID};
  return {"@context":"https://schema.org","@type":"Article",headline,description,url:SITE_URL+path,mainEntityOfPage:SITE_URL+path,image:OG_IMAGE.url,datePublished,dateModified:dateModified??datePublished,inLanguage:"fr-FR",author,publisher:{"@id":ORG_ID}};
}
