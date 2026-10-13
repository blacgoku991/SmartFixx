"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ButtonLink, PhoneLink } from "./actions";
import { setFloat } from "./float";
/* Barre d'action mobile collante (< 768 px) : « Parler de mon projet » + Appeler.
   Visible seulement quand le consentement est tranché (html[data-consent=set], panneau fermé) ET que
   [data-sx-hero] est sorti de l'écran (sans hero : après 600 px de défilement). Masquée sur /contact,
   /diagnostic, /admin, /email et dès qu'un .project-form est visible. Hauteur 64 px + zone de sécurité,
   publiée dans --sx-float-h. */
const EXCLUDED = /^\/(contact|diagnostic|admin|email)(\/|$)/;
export function MobileCtaBar() {
  const path = usePathname() || "/";
  const [visible, setVisible] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const excluded = EXCLUDED.test(path);
  useEffect(() => {
    if (excluded) return;
    const html = document.documentElement;
    const mq = window.matchMedia("(max-width: 767.98px)");
    let heroOut = false; let formIn = false;
    const hero = document.querySelector("[data-sx-hero]");
    const update = () => {
      const consent = html.dataset.consent === "set" && !html.hasAttribute("data-consent-open");
      const past = hero ? heroOut : window.scrollY > 600;
      setVisible(mq.matches && consent && past && !formIn);
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) heroOut = !e.isIntersecting;
        else formIn = e.isIntersecting;
      }
      update();
    });
    if (hero) io.observe(hero);
    document.querySelectorAll(".project-form").forEach((f) => io.observe(f));
    const mo = new MutationObserver(update);
    mo.observe(html, { attributes: true, attributeFilter: ["data-consent", "data-consent-open"] });
    const onScroll = () => { if (!hero) update(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", update);
    return () => { io.disconnect(); mo.disconnect(); window.removeEventListener("scroll", onScroll); mq.removeEventListener("change", update); };
  }, [excluded, path]);
  useEffect(() => {
    setFloat("mobile-bar", visible && bar.current ? bar.current.getBoundingClientRect().height : 0);
    return () => setFloat("mobile-bar", 0);
  }, [visible]);
  if (excluded) return null;
  return (
    <div ref={bar} className="sx-mobile-bar" hidden={!visible}>
      <ButtonLink variant="cta" href="/contact">Parler de mon projet</ButtonLink>
      <PhoneLink compact />
    </div>
  );
}
