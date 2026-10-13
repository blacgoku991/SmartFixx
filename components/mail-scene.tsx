"use client";
import { useRef, useState, type PointerEvent } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";

export function MailScene() {
  const scene = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (paused || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    scene.current?.style.setProperty("--mx", `${(event.clientX - rect.left - rect.width / 2) * .025}px`);
    scene.current?.style.setProperty("--my", `${(event.clientY - rect.top - rect.height / 2) * .025}px`);
  }
  function reset() { scene.current?.style.setProperty("--mx", "0px"); scene.current?.style.setProperty("--my", "0px"); }
  return <div ref={scene} className={`mail-scene ${paused ? "is-paused" : ""}`} onPointerMove={move} onPointerLeave={reset}>
    <div className="scene-grid" aria-hidden="true"/>
    <div className="scene-coordinate">48°54′ N · VOTRE PROCHAINE OPPORTUNITÉ</div>
    <div className="mail-depth" aria-hidden="true">
      <div className="flying-mail mail-main"><img src="/mail-sculpture.webp" width="1254" height="1254" alt="" fetchPriority="high"/></div>
      <div className="flying-mail mail-far"><img src="/mail-sculpture.webp" width="1254" height="1254" alt=""/></div>
      <div className="flying-mail mail-near"><img src="/mail-sculpture.webp" width="1254" height="1254" alt=""/></div>
    </div>
    <div className="scene-caption"><span className="live-dot"/><span>Le bon message.<br/><strong>La bonne personne.</strong></span><ArrowUpRight size={26}/></div>
    <button type="button" className="motion-toggle" aria-pressed={paused} onClick={()=>{reset();setPaused(!paused);}}>{paused ? <Play size={14}/> : <Pause size={14}/>}<span>{paused ? "Activer l’animation" : "Pause animation"}</span></button>
  </div>;
}
