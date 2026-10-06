import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";
import { Magnetic } from "../ui/Magnetic";
import { Marquee } from "../ui/Marquee";
import { scrollToSection } from "@/hooks/useSmoothScroll";

const EASE = [0.22, 1, 0.36, 1] as const;

const CAPABILITIES = [
  "Sites vitrines & e-commerce",
  "Refonte complète",
  "Automatisation métier",
  "Interconnexion logicielle",
  "Applications web sur-mesure",
  "Intégrations API",
  "Tableaux de bord temps réel",
  "Migration de données",
];

export function Hero({ ready }: { ready: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  // Progress across the hero itself — a document-wide progress would barely move
  // over a page this long.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // Content drifts up faster than the page so the 3D core is uncovered on scroll.
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-[100svh] flex-col overflow-hidden pt-[68px]"
    >
      {/*
        Décor du hero, en trois couches. Les halos dérivent en `transform` seul —
        le flou est posé une fois, jamais animé — et aucune de ces couches ne
        contient de texte : rien ici ne retarde le plus grand rendu.
      */}
      <div className="pointer-events-none absolute inset-0 -z-[5]">
        <div className="sf-aurora right-[4%] top-[40%] h-[620px] w-[620px] -translate-y-1/2 bg-[radial-gradient(circle,rgba(91,140,255,0.22),transparent_64%)]" />
        <div
          className="sf-aurora -right-32 top-8 h-[480px] w-[480px] bg-[radial-gradient(circle,rgba(34,211,238,0.16),transparent_66%)]"
          style={{ animationDelay: "-9s" }}
        />
        <div
          className="sf-aurora -left-28 bottom-0 h-[420px] w-[420px] bg-[radial-gradient(circle,rgba(255,184,107,0.07),transparent_68%)]"
          style={{ animationDelay: "-17s" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      <div className="grid-lines pointer-events-none absolute inset-0 -z-[4] mask-fade-b opacity-[0.45]" />

      {/* Voile qui garde le titre lisible où que dérive le noyau 3D. */}
      <div className="pointer-events-none absolute inset-0 -z-[3] bg-[linear-gradient(180deg,rgba(7,11,24,0.52)_0%,rgba(7,11,24,0.7)_45%,rgba(7,11,24,0.88)_100%)] lg:bg-[linear-gradient(100deg,rgba(7,11,24,0.94)_0%,rgba(7,11,24,0.74)_30%,rgba(7,11,24,0.14)_52%,transparent_66%)]" />

      {/* Le signal : un trait de lumière qui traverse le haut du hero. */}
      <div className="sf-sweep pointer-events-none absolute inset-x-0 top-[68px] -z-[2] h-px bg-white/[0.06]" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-x relative flex flex-1 flex-col justify-center py-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-6"
        >
          <span className="eyebrow">
            <Sparkles className="h-3 w-3 text-mint" />
            Agence web · Asnières-sur-Seine (92)
          </span>
        </motion.div>

        {/*
          Le slogan porte l'impact, la ligne d'appui porte les mots-clés.

          Ce bloc est l'élément LCP, donc il est rendu en permanence et sans
          animation. Il était auparavant conditionné à `ready`, c'est-à-dire à la
          fin du préchargeur : le HTML pré-rendu peignait bien le titre, puis
          React l'effaçait à l'hydratation et ne le remettait qu'une fois
          l'introduction jouée. Le plus grand rendu était donc repoussé de
          plusieurs secondes — et c'est exactement la mesure sur laquelle Google
          classe. On fait entrer le décor, jamais le titre.
        */}
        <h1 className="headline max-w-[16ch] text-[clamp(2.6rem,7.8vw,5.6rem)] leading-[0.95]">
          On conçoit,
          <br />
          on refond,
          <br />
          <span className="grad-text">on automatise.</span>
          <span className="mt-4 block max-w-[32ch] font-display text-[clamp(1rem,2vw,1.3rem)] font-medium leading-snug tracking-normal text-fog">
            Agence web à Asnières-sur-Seine : création de site web, refonte et automatisation —
            partout en Île-de-France.
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.85, ease: EASE }}
          className="mt-6 max-w-xl text-[15px] leading-relaxed text-fog-dim sm:text-[16.5px]"
        >
          <strong className="font-normal text-fog">SmartFixx</strong> crée des sites web sur-mesure,
          reprend les projets qui patinent et automatise tout ce qui se répète dans votre
          informatique — logiciels métiers, ERP, CRM, tableurs, e-mails, API.{" "}
          <span className="text-fog">
            Si une tâche revient chaque semaine, elle peut disparaître.
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 1, ease: EASE }}
          className="mt-8 flex flex-wrap items-center gap-3.5"
        >
          <Magnetic strength={0.25}>
            <a
              href="#contact"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("#contact");
              }}
              className="btn-primary group"
              data-cursor-label="Go"
            >
              Lancer mon projet
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Magnetic>

          <Magnetic strength={0.18}>
            <a
              href="#automatisation"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("#automatisation");
              }}
              className="btn-ghost"
            >
              Voir l&apos;automatisation
            </a>
          </Magnetic>
        </motion.div>

        {/* Quick proof row */}
        <motion.dl
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-9 grid grid-cols-3 gap-x-4 border-t border-white/[0.07] pt-7 sm:flex sm:flex-wrap sm:gap-x-10"
        >
          {[
            { value: "48 h", label: "Première maquette" },
            { value: "100 %", label: "Sur-mesure, zéro template" },
            /* « ≤ 1,5 s — temps de chargement visé » figurait ici. Un chiffre
               qu'un prospect vérifie en trente secondes avec PageSpeed, et que
               le site ne tenait pas. Remplacé par un engagement tenable, déjà
               annoncé dans `site.responseTime` et dans les e-mails. */
            { value: "24 h", label: "Réponse à votre demande" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <dt className="font-display text-lg font-semibold text-white sm:text-xl">
                {item.value}
              </dt>
              <dd className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-fog-faint sm:text-[10.5px] sm:tracking-[0.16em]">
                {item.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* Scroll hint */}
      <motion.button
        type="button"
        onClick={() => scrollToSection("#services")}
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-[92px] right-8 z-10 hidden flex-col items-center gap-2 text-fog-faint transition-colors hover:text-mint md:flex"
        aria-label="Défiler vers les services"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.28em]">Défiler</span>
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-4 w-4" />
        </motion.span>
      </motion.button>

      {/* Capability ticker closing the fold */}
      <div className="relative border-y border-white/[0.06] bg-ink-950/45 py-3.5 backdrop-blur-md">
        <Marquee duration={46}>
          {CAPABILITIES.map((item) => (
            <span
              key={item}
              className="flex items-center gap-3 whitespace-nowrap px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-fog-dim"
            >
              <span className="h-1 w-1 rounded-full bg-mint/70" />
              {item}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
