import type { Metadata } from "next";
import "./globals.css";
import {ThemeControl} from "@/components/theme-control";
import {AudienceMeasurement} from "@/components/audience-measurement";
import { JsonLd } from "@/components/json-ld";
import { organization, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL("https://smartfixx-reach.wgg9cdxhs2.chatgpt.site"),
  title: "SmartFixx — Agence web & systèmes digitaux",
  description: "Création et refonte de sites, automatisation, cybersécurité, SEO et prospection emailing. Des solutions digitales pour les entreprises en Île-de-France et en France.",
  icons: {
    icon: "/smartfixx-icon.png",
    shortcut: "/smartfixx-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased"><script dangerouslySetInnerHTML={{__html:"try{var t=localStorage.getItem('smartfixx-theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){}"}}/><JsonLd data={{"@context":"https://schema.org","@graph":[organization,{"@type":"WebSite","@id":`${SITE_URL}/#website`,url:SITE_URL,name:"SmartFixx",inLanguage:"fr-FR",publisher:{"@id":`${SITE_URL}/#organization`}}]}}/>{children}<AudienceMeasurement/><ThemeControl/></body>
    </html>
  );
}
