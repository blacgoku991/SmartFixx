import type { Metadata } from "next";
import type { ReactNode } from "react";
import CampaignLink from "@/components/campaign-link";
import { PublicShell, PageHero, Section, Container, SectionHead, ButtonLink, PhoneLink, Skyline, Place } from "@/components/sx";
import { SITE_IDENTITY, telHref } from "@/lib/site-identity";

/* Page 404 (lot 7). Chapeau d'une ligne : le H1 (deux lignes courtes) doit rester le plus grand bloc de texte,
   donc le candidat LCP (layout-check). Rendue côté serveur dans PublicShell : l'en-tête, les liens utiles et le pied sont dans
   le HTML initial, avec le statut 404 et noindex. Aucune redirection : une ancienne URL qui a un vrai
   équivalent est redirigée par lib/legacy-redirects.ts, les autres arrivent ici.
   Moment signature : « la fenêtre restée éteinte ». Une façade nocturne dont les fenêtres allumées dessinent
   404 (fenêtres allumées, opacité .78) ; une seule fenêtre ambre pleine et cerclée, en bas (la demande), s'allume avec le halo du geste signature quand le CTA est survolé ou
   pris au clavier (règle du socle [data-sx-hero]:has(.sx-btn--cta…) .sx-win--signal). Quelques fenêtres
   s'allument et s'éteignent (sx-twinkle du socle : opacité seule, data-motion=on, délais négatifs, cycles
   ≥ 20 s, suspendues hors écran et en pause). Les cartes de liens « s'allument » au survol (opacité et
   transform seulement). Pas de Glow : la façade éclaire déjà le ciel, et le coût de l'ambiance du hero
   (motion-cost) doit rester sous 20 ms/s. Aucune feuille de lot : utilitaires Tailwind (app/ est scanné) et classes du socle. */
export const metadata: Metadata = {
  title: { absolute: "Page introuvable | SmartFixx" },
  description: "Cette adresse n’existe pas ou a changé. Retrouvez la création de site internet, la refonte, la page Asnières-sur-Seine ou demandez un devis.",
  robots: { index: false, follow: true },
};

/* Façade : 13 colonnes × 7 étages. Les chiffres « 404 » (3 × 5 fenêtres chacun) occupent les colonnes 1-3,
   5-7 et 9-11 des étages 1 à 5. */
const COLS = 13;
const ROWS = 7;
const DIGIT_4 = ["101", "101", "111", "001", "001"];
const DIGIT_0 = ["111", "101", "101", "101", "111"];
const DIGITS = [DIGIT_4, DIGIT_0, DIGIT_4];
const SIGNAL = { r: 6, c: 6 };
/* Fenêtres d'ambiance hors chiffres : [étage, colonne, délai négatif (s), durée (s)]. */
/* Trois seulement, cycles ≥ 28 s : coût mesuré par motion-cost (chaque itération réveille le fil principal). */
const TWINKLE: [number, number, number, number][] = [[0, 9, -11.8, 29], [3, 4, -7.1, 34], [6, 11, -19.6, 31]];
function lit(r: number, c: number) {
  if (r < 1 || r > 5) return false;
  const d = Math.floor((c - 1) / 4); const x = (c - 1) % 4;
  return c >= 1 && c <= 11 && x < 3 && DIGITS[d]?.[r - 1]?.[x] === "1";
}
function Facade() {
  const cells = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const tw = TWINKLE.find(([tr, tc]) => tr === r && tc === c);
    const signal = r === SIGNAL.r && c === SIGNAL.c;
    cells.push(
      <span key={`${r}-${c}`} className="relative block aspect-[3/4] rounded-[2px] bg-[var(--sx-window-off)]">
        {signal ? <i className="sx-win sx-win--signal is-lit inset-0 h-auto w-auto rounded-[2px] opacity-100 shadow-[0_0_0_2px_rgba(255,214,160,.9),0_0_26px_8px_rgba(255,182,72,.7)]" />
          : lit(r, c) ? <i className="sx-win is-on inset-0 h-auto w-auto rounded-[2px] opacity-[.78] shadow-[0_0_10px_1px_rgba(255,182,72,.35)]" />
          : tw ? <i className="sx-win inset-0 h-auto w-auto rounded-[2px]" style={{ animationDelay: `${tw[2]}s`, animationDuration: `${tw[3]}s` }} />
          : null}
      </span>,
    );
  }
  return (
    <div aria-hidden="true" data-sx-ambient="" className="relative mx-auto w-full max-w-[440px] pt-[18px]">
      {/* Toit mansardé et souches de cheminée : silhouettes pleines, comme la ville du socle. */}
      <span className="absolute left-[8%] right-[8%] top-0 h-[18px] rounded-t-[6px] bg-[var(--sx-facade-near)] [clip-path:polygon(4%_100%,10%_0,90%_0,96%_100%)]" />
      <span className="absolute left-[18%] top-[-10px] h-[16px] w-[18px] bg-[var(--sx-facade-near)]" />
      <span className="absolute right-[22%] top-[-6px] h-[12px] w-[14px] bg-[var(--sx-facade-near)]" />
      <div className="relative grid grid-cols-[repeat(13,minmax(0,1fr))] gap-[clamp(4px,1.1vw,8px)] rounded-[4px] border-t-2 border-[var(--sx-rim)] bg-[var(--sx-facade-near)] p-[clamp(10px,2.6vw,20px)] shadow-[0_30px_80px_-30px_rgba(0,0,0,.8)]">
        {cells}
      </div>
    </div>
  );
}

const LINKS: { href: string; title: ReactNode; text: string }[] = [
  { href: "/creation-site-internet", title: "Création de site internet", text: "Un site professionnel, clair et pensé d’abord pour le mobile." },
  { href: "/refonte-site-internet", title: "Refonte de site internet", text: "Moderniser un site existant sans perdre ce qui fonctionne déjà." },
  { href: "/creation-site-internet-asnieres-sur-seine", title: <>Création de site à <Place>Asnières-sur-Seine</Place></>, text: "Je travaille depuis Asnières-sur-Seine, dans les Hauts-de-Seine." },
  { href: "/agence-web-ile-de-france", title: "Île-de-France\u202F: communes et modalités", text: "Paris, Hauts-de-Seine et communes voisines\u202F: rendez-vous et suivi." },
  { href: "/services", title: "Toutes les prestations", text: "Développement sur mesure, automatisation, sécurité web, SEO et emailing." },
  { href: "/contact", title: "Demander un devis", text: "Présentez votre projet en quelques lignes\u202F: je vous réponds moi-même." },
];

export default function NotFound() {
  return (
    <PublicShell>
      <PageHero
        tone="night"
        eyebrow="Erreur 404"
        title="Cette page est introuvable"
        lead="L’adresse demandée n’existe pas ou a changé."
        actions={<><ButtonLink href="/contact" size="lg">Demandez votre devis</ButtonLink><PhoneLink compact="sm" /></>}
        aside={<Facade />}
        backdrop={<Skyline seed={8} />}
      />
      <Section tone="surface" labelledBy="nf-pages">
        <Container>
          <SectionHead id="nf-pages" eyebrow="Pour reprendre le fil" title="Les pages qui répondent" text={<>Le reste du site, lui, est bien allumé. Choisissez la page la plus proche de votre recherche. Une question{"\u202F"}? Je réponds au <a href={telHref} className="sx-tabular">{SITE_IDENTITY.PHONE_DISPLAY}</a>.</>} />
          <ul className="mt-[var(--sx-space-6)] grid list-none gap-[var(--sx-space-4)] p-0 sm:grid-cols-2 lg:grid-cols-3">
            {LINKS.map((l) => (
              <li key={l.href} className="min-w-0">
                <CampaignLink href={l.href} {...(l.href === "/contact" ? { "data-analytics": "contact" } : {})} className="group relative flex h-full min-h-[44px] gap-[var(--sx-space-4)] rounded-[var(--sx-radius-lg)] border border-[var(--sx-line)] bg-[var(--sx-bg)] p-[var(--sx-space-5)] text-[var(--sx-text)] no-underline transition-transform duration-200 hover:-translate-y-[3px] focus-visible:-translate-y-[3px] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0">
                  <span aria-hidden="true" className="relative mt-[.2em] block h-[22px] w-[16px] shrink-0 rounded-[2px] bg-[var(--sx-window-off)] outline outline-1 outline-[var(--sx-line-strong)]">
                    <span className="absolute inset-0 rounded-[2px] bg-[var(--sx-window-on)] opacity-0 shadow-[0_0_14px_3px_rgba(255,182,72,.45)] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-[family-name:var(--sx-font-display)] text-[length:var(--sx-step-1)] font-bold leading-tight tracking-[var(--sx-tracking-title)] underline decoration-[var(--sx-accent)] decoration-1 underline-offset-4 group-hover:decoration-2">{l.title}</span>
                    <span className="mt-[var(--sx-space-2)] block text-[var(--sx-text-muted)]">{l.text}</span>
                  </span>
                </CampaignLink>
              </li>
            ))}
          </ul>
          <p className="mt-[var(--sx-space-6)]"><CampaignLink href="/" className="text-[var(--sx-accent)] underline underline-offset-4">Revenir à l’accueil de SmartFixx</CampaignLink></p>
        </Container>
      </Section>
    </PublicShell>
  );
}
