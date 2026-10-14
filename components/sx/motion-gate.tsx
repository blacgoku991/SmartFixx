"use client";
import { useEffect, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
/* MotionGate (charte R3 + amendement du propriétaire). Monté une fois par PublicShell.
   - Pose html[data-motion=on|off] après l'événement load suivi d'un requestIdleCallback (2,5 s au plus),
     seulement si : prefers-reduced-motion: no-preference, pas de Save-Data, deviceMemory ≥ 4 et
     hardwareConcurrency ≥ 4 quand ces API existent. Repasse à off si le mode réduit est activé ensuite.
   - Pose html[data-motion-paused] selon le choix mémorisé (localStorage 'smartfixx-motion-paused').
   - Observe chaque [data-sx-ambient] : data-sx-visible quand il est à l'écran (sinon ses animations sont
     suspendues par le CSS), y compris pour les éléments ajoutés après navigation.
   - Pose html[data-sx-scrolling] pendant un défilement : l'ambiance temporelle s'y suspend.
   Aucun script en ligne : ce code est bundlé (nonce assuré sur le VPS). */
const PAUSE_KEY = "smartfixx-motion-paused";
type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
function capable() {
  const n = navigator as Nav;
  if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return false;
  if (n.connection?.saveData) return false;
  if (typeof n.deviceMemory === "number" && n.deviceMemory < 4) return false;
  if (typeof n.hardwareConcurrency === "number" && n.hardwareConcurrency < 4) return false;
  return true;
}
export function MotionGate() {
  useEffect(() => {
    const html = document.documentElement;
    try { if (localStorage.getItem(PAUSE_KEY) === "1") html.setAttribute("data-motion-paused", ""); } catch {}
    let cancelled = false;
    const decide = () => { if (!cancelled) html.dataset.motion = capable() ? "on" : "off"; };
    const idle = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(decide, { timeout: 2500 }); else setTimeout(decide, 1200);
    };
    if (document.readyState === "complete") idle(); else window.addEventListener("load", idle, { once: true });
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => { if (mq.matches) html.dataset.motion = "off"; else decide(); };
    mq.addEventListener("change", onChange);
    // Ambiance hors écran : suspendue.
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) (e.target as HTMLElement).toggleAttribute("data-sx-visible", e.isIntersecting);
    }, { rootMargin: "80px 0px" });
    const seen = new WeakSet<Element>();
    const scan = () => document.querySelectorAll("[data-sx-ambient]").forEach((el) => { if (!seen.has(el)) { seen.add(el); io.observe(el); } });
    scan();
    let pending = 0;
    const mo = new MutationObserver(() => { if (!pending) pending = requestAnimationFrame(() => { pending = 0; scan(); }); });
    mo.observe(document.body, { childList: true, subtree: true });
    // Pendant un défilement, l'ambiance temporelle est suspendue (html[data-sx-scrolling], retiré 200 ms
    // après le dernier événement) : chaque animation qui tourne pendant le défilement coûte un recalcul de
    // style par image (mesuré : +60 ms/s sous CPU × 4 à 1440 px). Les animations liées au défilement
    // (révélations, mots, parallaxe, ville qui s'enfonce) ne sont pas concernées.
    let scrollTimer = 0;
    const onScroll = () => {
      if (!html.hasAttribute("data-sx-scrolling")) html.setAttribute("data-sx-scrolling", "");
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => html.removeAttribute("data-sx-scrolling"), 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelled = true; mq.removeEventListener("change", onChange); io.disconnect(); mo.disconnect(); window.removeEventListener("load", idle); window.removeEventListener("scroll", onScroll); window.clearTimeout(scrollTimer); html.removeAttribute("data-sx-scrolling"); };
  }, []);
  return null;
}
/* Contrôle global « Mettre en pause les animations » / « Relancer les animations » (WCAG 2.2.2) :
   44 px au moins, clavier, choix mémorisé. Visible seulement quand html[data-motion=on].
   - icon : icône seule de 44 × 44 dans l'en-tête, à toutes les largeurs (tôt dans l'ordre du clavier) ;
   - inline : libellé en toutes lettres, dans le menu mobile et le pied de page.
   Sémantique unique : le libellé (visible ou aria-label) dit l'action, sans aria-pressed. */
function subscribePaused(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion-paused"] });
  return () => mo.disconnect();
}
export function MotionToggle({ variant = "inline" }: { variant?: "inline" | "icon" }) {
  const paused = useSyncExternalStore(subscribePaused, () => document.documentElement.hasAttribute("data-motion-paused"), () => false);
  function toggle() {
    const next = !paused;
    document.documentElement.toggleAttribute("data-motion-paused", next);
    try { if (next) localStorage.setItem(PAUSE_KEY, "1"); else localStorage.removeItem(PAUSE_KEY); } catch {}
  }
  const label = paused ? "Relancer les animations" : "Mettre en pause les animations";
  return (
    <button type="button" className={`sx-motion-toggle sx-motion-toggle--${variant}`} onClick={toggle} title={variant === "icon" ? label : undefined}>
      {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
      <span>{label}</span>
    </button>
  );
}
