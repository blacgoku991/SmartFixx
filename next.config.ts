import type { NextConfig } from "next";
import { nextRedirects } from "./lib/legacy-redirects";

/* Variante Sites (vinext). Même liste de redirections que la variante VPS (lib/legacy-redirects.ts) ;
   vinext lit redirects() de cette configuration (vinext/dist/config/next-config.js). */
const nextConfig: NextConfig = {
  async redirects() {
    return nextRedirects();
  },
};

export default nextConfig;
