"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, RotateCcw } from "lucide-react";
/* Enveloppe d'une scène (charte R3/R4 + amendement). Le serveur rend l'ÉTAT FINAL lisible ; le lot écrit
   ses animations sous « .sx-scene.is-playing … » (transform/opacity, animation-fill-mode: both).
   La scène ne joue que si html[data-motion=on], sans pause globale, et visible à 40 %. Elle joue une fois
   (durée ≤ 7,2 s) puis reste sur l'état final ; replayOnReturn la rejoue quand on revient dessus.
   Le bouton Pause/Rejouer (≥ 44 px) est HORS de la zone aria-hidden ; la description textuelle est
   accessible. data-state : idle | playing | paused | done. */
export function ScenePlayer({ label, description, duration = 7200, replayOnReturn = false, className, children }: { label: string; description?: string; duration?: number; replayOnReturn?: boolean; className?: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "playing" | "paused" | "done">("idle");
  const timer = useRef<number | undefined>(undefined);
  const remaining = useRef(duration);
  const started = useRef(0);
  const allowed = () => document.documentElement.dataset.motion === "on" && !document.documentElement.hasAttribute("data-motion-paused");
  function play(force = false) {
    const el = root.current; if (!el || (!allowed() && !(force && document.documentElement.dataset.motion === "on"))) return;
    el.classList.remove("is-playing", "is-paused");
    void el.offsetWidth; // redémarre les animations CSS
    el.classList.add("is-playing");
    remaining.current = Math.min(duration, 7200); started.current = performance.now();
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("done"), remaining.current);
    setState("playing");
  }
  function replay() { play(true); }
  function pause() {
    root.current?.classList.add("is-paused");
    window.clearTimeout(timer.current);
    remaining.current -= performance.now() - started.current;
    setState("paused");
  }
  function resume() {
    root.current?.classList.remove("is-paused");
    started.current = performance.now();
    timer.current = window.setTimeout(() => setState("done"), Math.max(0, remaining.current));
    setState("playing");
  }
  useEffect(() => {
    const el = root.current; if (!el) return;
    let played = false; let wasOut = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= 0.4) {
        if (!played || (replayOnReturn && wasOut)) { if (allowed()) { played = true; wasOut = false; play(); } }
      } else if (e.intersectionRatio === 0) wasOut = true;
    }, { threshold: [0, 0.4] });
    // Attendre la décision de MotionGate (load + idle) avant d'observer.
    const html = document.documentElement;
    const start = () => io.observe(el);
    let mo: MutationObserver | undefined;
    if (html.dataset.motion) start(); else { mo = new MutationObserver(() => { if (html.dataset.motion) { mo?.disconnect(); start(); } }); mo.observe(html, { attributes: true, attributeFilter: ["data-motion"] }); }
    // Pause globale : fige la scène en cours ; « Relancer les animations » reprend une scène figée par elle
    // (pas une scène mise en pause par son propre bouton). Pendant la pause globale, le bouton de la scène
    // reste utilisable : c'est un choix explicite de l'utilisateur.
    let pausedByGlobal = false;
    const pmo = new MutationObserver(() => {
      if (html.hasAttribute("data-motion-paused")) {
        if (el.classList.contains("is-playing") && !el.classList.contains("is-paused")) { pausedByGlobal = true; pause(); }
      } else if (pausedByGlobal) {
        pausedByGlobal = false;
        if (el.classList.contains("is-paused")) resume();
      }
    });
    pmo.observe(html, { attributes: true, attributeFilter: ["data-motion-paused"] });
    return () => { io.disconnect(); mo?.disconnect(); pmo.disconnect(); window.clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayOnReturn, duration]);
  const playing = state === "playing";
  return (
    <div ref={root} className={["sx-scene", className].filter(Boolean).join(" ")} data-state={state}>
      <div className="sx-scene-stage" aria-hidden="true">{children}</div>
      <div className="sx-scene-bar">
        <p className="sx-scene-caption">{label}{description ? <span className="sr-only"> {description}</span> : null}</p>
        <button type="button" className="sx-scene-toggle" onClick={() => (playing ? pause() : state === "paused" ? resume() : replay())}>
          {playing ? <Pause aria-hidden="true" /> : <RotateCcw aria-hidden="true" />}
          <span>{playing ? "Pause" : state === "paused" ? "Reprendre" : "Rejouer"}</span>
        </button>
      </div>
    </div>
  );
}
