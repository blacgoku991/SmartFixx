import type { Config } from "tailwindcss";

/**
 * Direction artistique « Signal ».
 *
 * Une nuit indigo plutôt qu'un noir : #070B18 porte une dominante bleue, ce qui
 * réchauffe les blancs posés dessus et évite l'effet « terminal » d'un #000.
 * Une seule source de lumière, le bleu électrique, qui traverse la page comme un
 * signal — trait qui file, halo derrière le verre, soulignement qui se dessine.
 * Et un ambre rare, réservé aux chiffres : c'est lui qui distingue le site du
 * menthe-violet que presque toutes les agences emploient.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Fonds, du plus profond au plus relevé. */
        ink: {
          950: "#070B18",
          900: "#0A0F21",
          850: "#0D1429",
          800: "#111A33",
          700: "#182341",
          600: "#223055",
        },
        /* Bleu électrique — la couleur du signal, celle des actions. */
        signal: {
          DEFAULT: "#5B8CFF",
          400: "#7DA5FF",
          600: "#3D6FF0",
          900: "#1B3A8F",
        },
        /* Cyan — le signal en mouvement : traits, impulsions, survols. */
        pulse: {
          DEFAULT: "#22D3EE",
          400: "#5BE3F7",
        },
        /* Ambre — réservé aux chiffres et aux rares points d'emphase. */
        ember: {
          DEFAULT: "#FFB86B",
          400: "#FFCE9B",
        },
        /* Textes. Les ratios sont calculés sur #070B18. */
        fog: {
          DEFAULT: "#E8EEFF", // 15,8:1
          dim: "#A3B0D0", // 8,4:1
          faint: "#7987AB", // 4,9:1 — plancher pour du petit texte
        },

        /*
         * Alias de migration. Les composants écrits pour l'ancienne charte
         * emploient encore `mint`, `violet` et `coral` dans leurs classes. Les
         * faire pointer sur la nouvelle palette bascule tout le site d'un seul
         * geste, sans toucher aux vingt-huit composants. À retirer une fois les
         * classes renommées en `pulse`, `signal` et `ember`.
         */
        mint: {
          DEFAULT: "#22D3EE",
          400: "#5BE3F7",
          600: "#0EA5C4",
        },
        violet: {
          DEFAULT: "#5B8CFF",
          400: "#7DA5FF",
          600: "#3D6FF0",
        },
        coral: "#FFB86B",
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        tightest2: "-0.055em",
      },
      screens: {
        xs: "460px",
      },
      /* Paliers d'alpha plus fins que l'échelle par défaut : l'interface repose
         sur des filets très ténus. */
      opacity: {
        2: "0.02",
        3: "0.03",
        4: "0.04",
        6: "0.06",
        7: "0.07",
        8: "0.08",
        12: "0.12",
        15: "0.15",
        18: "0.18",
        22: "0.22",
        35: "0.35",
        45: "0.45",
        55: "0.55",
        65: "0.65",
        85: "0.85",
        96: "0.96",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        /* Le signal : un trait qui traverse, en transform seul. */
        sweep: {
          "0%": { transform: "translateX(-110%)" },
          "100%": { transform: "translateX(110%)" },
        },
        /* Dérive très lente des halos de fond. Jamais de filter animé. */
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(4%,-3%,0) scale(1.08)" },
          "66%": { transform: "translate3d(-3%,4%,0) scale(0.95)" },
        },
      },
      animation: {
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.6s cubic-bezier(0.2,0.7,0.3,1) infinite",
        sweep: "sweep 5.5s cubic-bezier(0.4,0,0.2,1) infinite",
        drift: "drift 26s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
