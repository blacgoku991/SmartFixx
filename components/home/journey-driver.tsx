"use client";
import { useEffect } from "react";
/* Repli du récit « Le parcours d'une demande » (client, aucun rendu). À partir de 1024 px, la scène
   collante superpose 4 vignettes ; là où les timelines de défilement nommées (timeline-scope) manquent, ou
   quand le mouvement est coupé (data-motion=off, pause globale), ce composant pose data-step=1…4 sur le récit
   selon le chapitre qui occupe le milieu de l'écran. Le CSS en déduit la vignette visible (opacité, transition
   de 300 ms seulement sous data-motion=on). Sous 1024 px et en mode réduit, rien n'est superposé : les
   vignettes sont statiques sous chaque chapitre et data-step n'a aucun effet. */
export function JourneyDriver({ target }: { target: string }) {
  useEffect(() => {
    const root = document.getElementById(target);
    if (!root) return;
    const chapters = Array.from(root.querySelectorAll<HTMLElement>("[data-hm-step]"));
    if (!chapters.length) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const step = (e.target as HTMLElement).dataset.hmStep;
        if (step && root.dataset.step !== step) root.dataset.step = step;
      }
    }, { rootMargin: "-50% 0px -50% 0px" });
    chapters.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [target]);
  return null;
}
