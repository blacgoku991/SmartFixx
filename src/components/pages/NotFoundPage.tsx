import { ArrowUpRight } from "lucide-react";
import { Reveal } from "../ui/Reveal";
import { Magnetic } from "../ui/Magnetic";

/**
 * Page servie sur une URL inexistante.
 *
 * Sans elle, l'hébergeur renvoyait sa propre page d'erreur : un écran nu, sans
 * navigation ni identité, d'où un visiteur ne peut que repartir. Un lien mort
 * arrive pourtant régulièrement — ancienne adresse partagée, faute de frappe,
 * lien tronqué dans un e-mail.
 *
 * Le pré-rendu l'écrit dans `dist/404.html`, que Vercel sert automatiquement
 * avec un vrai code 404. Elle n'entre ni dans le sitemap ni dans le maillage
 * interne : elle n'a pas vocation à être explorée, seulement à rattraper.
 */
export function NotFoundPage() {
  return (
    <article className="pt-[68px]">
      <div className="container-x flex min-h-[70vh] flex-col justify-center py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mint">Erreur 404</p>

            <h1 className="headline mt-5 text-[clamp(2rem,5vw,3rem)] leading-[1.05]">
              Cette page n&apos;existe pas <span className="grad-text">ou plus</span>.
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-[15.5px] leading-[1.75] text-fog-dim">
              L&apos;adresse est peut-être incomplète, ou la page a changé de nom. Le reste du site
              fonctionne : voici par où reprendre.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
              <Magnetic strength={0.22}>
                <a href="/" className="btn-primary group">
                  Retour à l&apos;accueil
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Magnetic>
              <a href="/#contact" className="btn-ghost">
                Nous écrire
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <nav className="mt-14 border-t border-white/[0.07] pt-9">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-fog-faint">
                Les pages les plus consultées
              </p>
              <ul className="mt-5 flex flex-wrap justify-center gap-x-7 gap-y-3 text-[14.5px]">
                {[
                  { label: "Création de site internet", href: "/creation-site-internet-asnieres-sur-seine" },
                  { label: "Refonte de site", href: "/refonte-site-internet" },
                  { label: "Automatisation", href: "/automatisation-informatique" },
                  { label: "Zones d'intervention", href: "/zones-desservies" },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-fog-dim transition-colors hover:text-mint">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
