import type { Metadata } from "next";
import type { ReactNode } from "react";
import CampaignLink from "@/components/campaign-link";
import { PublicShell, PageHero, Section, Container, SectionHead, ButtonLink, PhoneLink, Place } from "@/components/sx";
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
   transform seulement). Ni Glow ni ville (Skyline) en fond : la façade éclaire déjà le ciel, la ville de fond pesait environ 6 Ko
   bruts dans la charge RSC de chaque page (voir plus bas), et le coût de l'ambiance du hero
   (motion-cost) doit rester sous 20 ms/s. Aucune feuille de lot : classes du socle, dont les classes courtes sx-nf-* de globals.css. Cette page racine
   est sérialisée dans la charge RSC de chaque page du site (emplacement notFound du layout) : d'où des classes
   courtes plutôt que de longues listes d'utilitaires répétées 91 fois. */
export const metadata: Metadata = {
  title: { absolute: "Page introuvable | SmartFixx" },
  description: "Cette adresse n’existe pas ou a changé. Retrouvez la création de site internet, la refonte, la page Asnières-sur-Seine ou demandez un devis.",
  /* Pas de champ robots : Next pose déjà <meta name="robots" content="noindex"/> sur toute réponse 404 ; le
     déclarer ici publiait une seconde balise (« noindex, follow »). Les liens de la page restent suivis. */
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
/* Les 91 fenêtres en une seule chaîne HTML statique, calculée une fois : en éléments React, elles pesaient
   environ 5 Ko bruts dans la charge RSC de CHAQUE page (la 404 racine y est sérialisée), contre 3 Ko ici,
   en une seule valeur. Même DOM qu'avant (span.sx-nf-cell, i.sx-win). */
const CELLS_HTML = (() => {
  let html = "";
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const tw = TWINKLE.find(([tr, tc]) => tr === r && tc === c);
    const win = r === SIGNAL.r && c === SIGNAL.c ? '<i class="sx-win sx-win--signal is-lit"></i>'
      : lit(r, c) ? '<i class="sx-win is-on"></i>'
      : tw ? `<i class="sx-win" style="animation-delay:${tw[2]}s;animation-duration:${tw[3]}s"></i>`
      : "";
    html += `<span class="sx-nf-cell">${win}</span>`;
  }
  return html;
})();
function Facade() {
  return (
    <div aria-hidden="true" data-sx-ambient="" className="relative mx-auto w-full max-w-[440px] pt-[18px]">
      {/* Toit mansardé et souches de cheminée : silhouettes pleines, comme la ville du socle. */}
      <span className="absolute left-[8%] right-[8%] top-0 h-[18px] rounded-t-[6px] bg-[var(--sx-facade-near)] [clip-path:polygon(4%_100%,10%_0,90%_0,96%_100%)]" />
      <span className="absolute left-[18%] top-[-10px] h-[16px] w-[18px] bg-[var(--sx-facade-near)]" />
      <span className="absolute right-[22%] top-[-6px] h-[12px] w-[14px] bg-[var(--sx-facade-near)]" />
      <div className="relative grid grid-cols-[repeat(13,minmax(0,1fr))] gap-[clamp(4px,1.1vw,8px)] rounded-[4px] border-t-2 border-[var(--sx-rim)] bg-[var(--sx-facade-near)] p-[clamp(10px,2.6vw,20px)] shadow-[0_30px_80px_-30px_rgba(0,0,0,.8)]" dangerouslySetInnerHTML={{ __html: CELLS_HTML }} />
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
      />
      <Section tone="surface" labelledBy="nf-pages">
        <Container>
          <SectionHead id="nf-pages" eyebrow="Pour reprendre le fil" title="Les pages qui répondent" text={<>Le reste du site, lui, est bien allumé. Choisissez la page la plus proche de votre recherche. Une question{"\u202F"}? Je réponds au <a href={telHref} className="sx-tabular">{SITE_IDENTITY.PHONE_DISPLAY}</a>.</>} />
          <ul className="sx-nf-links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <CampaignLink href={l.href} {...(l.href === "/contact" ? { "data-analytics": "contact" } : {})} className="sx-nf-link">
                  <span aria-hidden="true" className="sx-nf-win" />
                  <span className="sx-nf-link-body">
                    <span className="sx-nf-link-title">{l.title}</span>
                    <span className="sx-nf-link-text">{l.text}</span>
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
