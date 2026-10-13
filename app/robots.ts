import type { MetadataRoute } from "next";
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:"*",allow:"/",disallow:["/email/","/admin","/api/","/signin-with-chatgpt","/signout-with-chatgpt"]},sitemap:"https://smartfixx-reach.wgg9cdxhs2.chatgpt.site/sitemap.xml"};}
