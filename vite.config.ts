import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    target: "es2020",
    rollupOptions: {
      // Le découpage manuel ne vaut que pour le bundle client : au build SSR ces
      // paquets sont externes, et Rollup refuse de les placer dans un chunk.
      output: isSsrBuild
        ? {}
        : {
            /*
              `three` et `@react-three/*` ne sont volontairement plus listés ici.
              Un `manualChunks` nommé les rattache au graphe de l'entrée, et Vite
              émet alors un `<link rel="modulepreload">` dans index.html : près
              d'un mégaoctet était téléchargé sur chaque page, y compris là où la
              scène ne s'affiche jamais, saturant la bande passante avant le
              premier rendu. Laissés à Rollup, ils sortent en chunks séparés,
              chargés seulement quand `HeroScene` est réellement monté.

              `framer-motion` reste déclaré : il est importé statiquement par
              presque tous les composants, il fait donc partie du chemin critique
              de toute façon, et un chunk stable se met mieux en cache.
            */
            manualChunks: {
              motion: ["framer-motion"],
            },
          },
    },
  },
}));
