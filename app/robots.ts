import type { MetadataRoute } from "next";
import {SITE_URL} from "@/lib/seo";
/* /email/ : un robot qui suivrait /email/interest fausserait les statistiques des campagnes. Les routes
   ChatGPT ne servent qu'à la variante Sites. Le X-Robots-Tag de proxy.ts (admin, API) reste en place. */
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:"*",allow:"/",disallow:["/email/","/admin","/api/","/signin-with-chatgpt","/signout-with-chatgpt"]},sitemap:`${SITE_URL}/sitemap.xml`};}
