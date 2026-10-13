import type { Metadata, Viewport } from "next";
import "./globals.css";
import {ThemeControl} from "@/components/theme-control";
import {AudienceMeasurement} from "@/components/audience-measurement";
import { JsonLd } from "@/components/json-ld";
import { organization, SITE_URL, OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SmartFixx — création et refonte de sites internet",
  description: "Création et refonte de sites internet pour les entreprises d’Asnières-sur-Seine, des Hauts-de-Seine et d’Île-de-France, par Mohamed : un seul interlocuteur.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  /* Hérité par les pages qui ne passent pas encore par pageMeta : chaque page publique a une og:image. */
  openGraph: { siteName: "SmartFixx", locale: "fr_FR", type: "website", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
};

export const viewport: Viewport = {
  themeColor: "#070B18",
};

/* Chaînes protégées par vps/prepare.py strict (liste dans docs/DESIGN_SYSTEM.md) : signature du layout
   non async, retour unique, une seule balise de script en ligne sans attribut avant son contenu.
   Le script pose le thème et l'état du consentement avant le premier rendu (data-consent). */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased"><script dangerouslySetInnerHTML={{__html:"try{var t=localStorage.getItem('smartfixx-theme');document.documentElement.dataset.theme=t==='light'?'light':'dark';var c=JSON.parse(localStorage.getItem('smartfixx-statistics-preference-v1')||'null');document.documentElement.dataset.consent=c&&Date.now()-c.at<15552000000&&(c.value==='yes'||c.value==='no')?'set':'pending'}catch(e){document.documentElement.dataset.consent='pending'}"}}/><JsonLd data={{"@context":"https://schema.org","@graph":[organization,{"@type":"WebSite","@id":`${SITE_URL}/#website`,url:SITE_URL,name:"SmartFixx",inLanguage:"fr-FR",publisher:{"@id":`${SITE_URL}/#organization`}}]}}/>{children}<AudienceMeasurement/><ThemeControl/></body>
    </html>
  );
}
