import type {NextConfig} from 'next';
import {nextRedirects} from './lib/legacy-redirects';
import {serviceSlugs,guideSlugs} from './lib/measured-paths';
/* Variante VPS (production smartfixx.fr). Redirections : lib/legacy-redirects.ts (308 ciblées, appliquées par
   Next avant proxy.ts, requête conservée ; jamais dans Nginx ni dans le proxy).
   404 rendue côté serveur (constat du lot 7, Next 16.2) : un notFound() levé par une PAGE (app/[slug],
   app/conseils/[slug]) renvoie bien 404 + noindex, mais un HTML vide (<html id="__next_error__">) que le
   client remplit ensuite ; seule la route introuvable elle-même (_not-found) rend app/not-found.tsx dans le
   HTML initial (en-tête, liens). Une URL à un segment (/page-inexistante, ancienne page de ville non
   redirigée…) ou un guide inconnu est donc réécrit, APRÈS les routes statiques et AVANT les routes
   dynamiques (afterFiles), vers un chemin privé sans route (dossier « _ » : jamais routable). Les slugs
   servis viennent de lib/measured-paths.ts (égalité vérifiée par tests/measured-paths.test.mjs) ; notFound()
   reste dans les pages en filet de sécurité.
   Cache long UNIQUEMENT sur des noms versionnés : polices *.v1.woff2 et variantes de public/media. Les
   fichiers non versionnés (/studio-*.webp, /email-*.png, icônes) gardent le cache par défaut. */
const IMMUTABLE=[{key:'Cache-Control',value:'public, max-age=31536000, immutable'}];
const notServed=(slugs:readonly string[])=>`(?!(?:${slugs.join('|')})$)[^/]+`;
const config:NextConfig={output:'standalone',poweredByHeader:false,images:{unoptimized:true},experimental:{cpus:2},serverExternalPackages:['node:sqlite'],
  async redirects(){return nextRedirects()},
  async rewrites(){return {beforeFiles:[],afterFiles:[
    {source:`/:slug(${notServed(serviceSlugs)})`,destination:'/_introuvable/:slug'},
    {source:`/conseils/:slug(${notServed(guideSlugs)})`,destination:'/_introuvable/conseils/:slug'},
  ],fallback:[]}},
  async headers(){return [{source:'/fonts/:file(.+\\.v1\\.woff2)',headers:IMMUTABLE},{source:'/media/:path*',headers:IMMUTABLE}]},
};
export default config;
