import type { MetadataRoute } from "next";
/* Manifeste servi sous /manifest.webmanifest (ancienne URL du site Signal, recréée). Couleurs : fond nuit
   --sx-bg (#070B18). Icônes produites sans IA par scripts/og (monogramme S, à valider par le propriétaire). */
export default function manifest():MetadataRoute.Manifest{
  return {
    name:"SmartFixx — création et refonte de sites internet",
    short_name:"SmartFixx",
    description:"Création et refonte de sites internet par Mohamed, depuis Asnières-sur-Seine, pour l’Île-de-France.",
    lang:"fr",
    start_url:"/",
    scope:"/",
    display:"browser",
    background_color:"#070B18",
    theme_color:"#070B18",
    icons:[
      {src:"/icon-192.png",sizes:"192x192",type:"image/png",purpose:"any"},
      {src:"/icon-512.png",sizes:"512x512",type:"image/png",purpose:"any"},
      {src:"/icon-512.png",sizes:"512x512",type:"image/png",purpose:"maskable"},
      {src:"/favicon.svg",sizes:"any",type:"image/svg+xml"},
    ],
  };
}
