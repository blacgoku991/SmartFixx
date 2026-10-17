"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import Link from "@/components/campaign-link";
import { Brand } from "@/components/brand-mark";
import { ButtonLink, PhoneLink } from "@/components/sx/actions";
import { MotionToggle } from "@/components/sx/motion-gate";
/* En-tête public (le lien d'évitement et le ThemeControl sont rendus avant lui par le layout racine). Mobile (60 px) : marque « par Mohamed », téléphone compact, pause des animations,
   menu, emplacement réservé au ThemeControl (rendu par le layout, positionné en fixed dans
   .sx-theme-slot). Navigation courte de 1180 à 1519 px (Création de site, Refonte, Prestations ▾, puis
   Asnières & Île-de-France dès 1420 px ; les liens .sx-nav-wide masqués restent dans le menu), complète
   à partir de 1520 px, menu en dessous de 1520 px ; téléphone en toutes lettres de 768 à 1179 px, en
   icône ailleurs ; CTA « Parler de mon projet » à partir de 1024 px (paliers mesurés : globals.css,
   « En-tête »).
   Le menu mobile est un panneau natif (attribut popover), sans Radix ; repli JS (.is-open) si le
   navigateur ne connaît pas popover. Le sous-menu est un <details>. */
const prestations: [string, string][] = [
  ["Développement sur mesure", "/developpement-sur-mesure"],
  ["Automatisation", "/automatisation-informatique"],
  ["Sécurité web", "/cybersecurite"],
  ["Référencement SEO", "/referencement-seo"],
  ["Prospection emailing", "/prospection-emailing"],
  ["Toutes les prestations", "/services"],
];
const main: [string, string][] = [
  ["Création de site", "/creation-site-internet"],
  ["Refonte", "/refonte-site-internet"],
];
const after: [string, string][] = [
  ["Asnières & Île-de-France", "/creation-site-internet-asnieres-sur-seine"],
  ["Conseils", "/conseils"],
];
export function SiteHeader() {
  const path = usePathname();
  const menu = useRef<HTMLDivElement>(null);
  const sub = useRef<HTMLDetailsElement>(null);
  const current = (href: string) => (path === href ? "page" as const : undefined);
  useEffect(() => {
    const m = menu.current as (HTMLDivElement & { hidePopover?: () => void }) | null;
    try { m?.hidePopover?.(); } catch {}
    m?.classList.remove("is-open");
    if (sub.current) sub.current.open = false;
  }, [path]);
  useEffect(() => {
    const close = (e: Event) => {
      const d = sub.current;
      if (!d?.open) return;
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !d.contains(e.target as Node)) { d.open = false; if (e instanceof KeyboardEvent) d.querySelector("summary")?.focus(); }
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    /* Menu ouvert (popover, sous 1520 px) : une tabulation après la dernière entrée sortait du panneau, qui
       restait ouvert et cachait l'élément focalisé (WCAG 2.4.11). Le panneau se ferme dès que le focus part
       ailleurs que dans le menu ou sur son bouton (qui le referme lui-même). */
    const m = menu.current as (HTMLDivElement & { hidePopover?: () => void }) | null;
    const leave = (e: FocusEvent) => {
      const to = e.relatedTarget as Node | null;
      if (!m || !to || m.contains(to) || (to as Element).closest?.(".sx-menu-button")) return;
      /* Après le déplacement du focus : le panneau ne le contient plus, sa fermeture ne le ramène pas au bouton. */
      setTimeout(() => {
        try { if (m.matches(":popover-open")) m.hidePopover?.(); } catch {}
        if (m.classList.contains("is-open")) { m.classList.remove("is-open"); document.querySelector(".sx-menu-button")?.setAttribute("aria-expanded", "false"); }
      }, 0);
    };
    m?.addEventListener("focusout", leave);
    return () => { document.removeEventListener("click", close); document.removeEventListener("keydown", close); m?.removeEventListener("focusout", leave); };
  }, []);
  function toggleFallback(e: React.MouseEvent<HTMLButtonElement>) {
    if ("popover" in HTMLElement.prototype) return;
    const m = menu.current; if (!m) return;
    const open = m.classList.toggle("is-open");
    e.currentTarget.setAttribute("aria-expanded", String(open));
  }
  return (
    <header className="sx-header">
      <div className="sx-container sx-container--wide sx-header-inner">
        <Brand />
        <nav className="sx-nav" aria-label="Navigation principale">
          <ul>
            {main.map(([label, href]) => <li key={href}><Link href={href} aria-current={current(href)}>{label}</Link></li>)}
            <li>
              <details className="sx-subnav" ref={sub}>
                <summary>Prestations <ChevronDown aria-hidden="true" /></summary>
                <ul>{prestations.map(([label, href]) => <li key={href}><Link href={href} aria-current={current(href)}>{label}</Link></li>)}</ul>
              </details>
            </li>
            {after.map(([label, href], i) => <li key={href} className={i === 0 ? "sx-nav-wide sx-nav-local" : "sx-nav-wide"}><Link href={href} aria-current={current(href)}>{label}</Link></li>)}
          </ul>
        </nav>
        <div className="sx-header-actions">
          <PhoneLink compact className="sx-header-phone-compact" />
          <PhoneLink className="sx-header-phone" />
          <ButtonLink variant="cta" href="/contact" className="sx-header-cta">Parler de mon projet</ButtonLink>
          <MotionToggle variant="icon" />
          <button type="button" className="sx-menu-button" popoverTarget="sx-menu" aria-controls="sx-menu" aria-label="Ouvrir le menu" onClick={toggleFallback}><Menu aria-hidden="true" /></button>
          <span className="sx-theme-slot" aria-hidden="true" />
        </div>
      </div>
      <div id="sx-menu" className="sx-menu" popover="auto" ref={menu}>
        <nav aria-label="Navigation mobile">
          <ul>
            <li><Link href="/" aria-current={current("/")}>Accueil</Link></li>
            {main.map(([label, href]) => <li key={href}><Link href={href} aria-current={current(href)}>{label}</Link></li>)}
            {after.map(([label, href]) => <li key={href}><Link href={href} aria-current={current(href)}>{label}</Link></li>)}
            <li><Link href="/agence-web-ile-de-france" aria-current={current("/agence-web-ile-de-france")}>Île-de-France</Link></li>
          </ul>
          <p className="sx-menu-group">Prestations</p>
          <ul>{prestations.map(([label, href]) => <li key={href}><Link href={href} aria-current={current(href)}>{label}</Link></li>)}</ul>
        </nav>
        <div className="sx-menu-foot">
          <ButtonLink variant="cta" href="/contact">Parler de mon projet</ButtonLink>
          <PhoneLink />
          <MotionToggle />
        </div>
      </div>
    </header>
  );
}
