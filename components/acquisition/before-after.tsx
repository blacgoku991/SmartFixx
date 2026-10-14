"use client";
import { useId, useState, type ChangeEvent, type MouseEvent } from "react";
import { ChevronsLeftRight, Phone, ArrowRight } from "lucide-react";
import { ScenePlayer } from "@/components/sx/scene-player";
/* Comparateur avant/après de la page Refonte (client).
   - Contrôle : <input type=range> NATIF (clavier : flèches, Page préc./suiv., Début/Fin), libellé visible
     « Comparer l'ancienne et la nouvelle version », aria-valuetext « N % de la nouvelle version visible ».
     Il recouvre la maquette (transparent) : un appui ou un glissé n'importe où déplace la séparation ;
     touch-action: pan-y laisse défiler la page verticalement.
   - Rendu : deux calques en translateX contre-translatés (la fenêtre de la nouvelle version avance de
     N - 100 %, son contenu recule d'autant) et une poignée en translateX : transform seulement, jamais
     clip-path animé ni @property (989 ms mesurés contre 37-40 ms).
   - Coup de pouce : une seule fois, de 34 % à 52 % puis retour, 1,4 s, déclenché par ScenePlayer (après
     load + idle, visible à 40 %, jamais en mouvement réduit ni pendant la pause globale). Les images clés
     n'emploient aucune var(). Dès que le visiteur touche au curseur, le coup de pouce est retiré (classe
     is-touched) : l'animation ne masque jamais la valeur choisie. « Rejouer » remet la séparation à 34 %.
   - La maquette est un décor aria-hidden (dans la scène) ; la description et la liste des problèmes sont
     données en texte par la page. Contenu fictif, légende « Démonstration : maquette fictive, pas un client ». */
const START = 34;
export function BeforeAfter({ caption, description }: { caption: string; description: string }) {
  const id = useId();
  const [value, setValue] = useState(START);
  const [touched, setTouched] = useState(false);
  function onChange(e: ChangeEvent<HTMLInputElement>) { setValue(Number(e.currentTarget.value)); setTouched(true); }
  function onClickCapture(e: MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest(".sx-scene-toggle")) { setValue(START); setTouched(false); }
  }
  return (
    <div className={touched ? "aq-ba is-touched" : "aq-ba"} onClickCapture={onClickCapture}>
      <div className="aq-ba-top">
        <label htmlFor={id} className="aq-ba-label">Comparer l’ancienne et la nouvelle version</label>
        <span className="aq-ba-legend" aria-hidden="true"><span>← Après</span><span>Avant →</span></span>
      </div>
      <div className="aq-ba-box">
        <ScenePlayer label={caption} description={description} duration={1400} className="aq-ba-scene">
          <div className="aq-ba-frame">
            <OldSite />
            <div className="aq-ba-clip" style={{ transform: `translateX(${value - 100}%)` }}>
              <div className="aq-ba-inner" style={{ transform: `translateX(${100 - value}%)` }}><NewSite /></div>
            </div>
            <div className="aq-ba-handle" style={{ transform: `translateX(${value}%)` }}>
              <span className="aq-ba-knob"><ChevronsLeftRight /></span>
            </div>
          </div>
        </ScenePlayer>
        <input id={id} className="aq-ba-range" type="range" min={0} max={100} step={1} value={value} onChange={onChange} aria-valuetext={`${value} % de la nouvelle version visible`} />
      </div>
    </div>
  );
}

/* Ancienne version (fictive) : trois problèmes annotés. Le « texte illisible » est figuré par des traits
   (aucun vrai texte sous 12 px). */
function OldSite() {
  return (
    <div className="aq-old">
      <span className="aq-ba-chip aq-ba-chip--old">Avant</span>
      <div className="aq-old-banner"><span className="aq-old-logo">Menuiserie Démo</span></div>
      <div className="aq-old-nav"><i /><i /><i /><i /><i /></div>
      <div className="aq-old-body">
        <p className="aq-old-welcome">Bienvenue sur notre site internet&#8239;!</p>
        <span className="aq-old-mark aq-old-mark--3"><b>3</b>Offre floue</span>
        <div className="aq-old-cols">
          <div className="aq-old-text"><i /><i /><i /><i /><i /><i /><i /></div>
          <div className="aq-old-img" />
        </div>
        <span className="aq-old-mark aq-old-mark--1"><b>1</b>Texte illisible sur mobile</span>
        <div className="aq-old-text aq-old-text--wide"><i /><i /><i /><i /></div>
      </div>
      <div className="aq-old-foot"><span>Tél.</span><i /><span className="aq-old-mark aq-old-mark--2"><b>2</b>Téléphone introuvable</span></div>
    </div>
  );
}

/* Nouvelle version (fictive) : promesse lisible, appel à portée de pouce, services mis en valeur. */
function NewSite() {
  return (
    <div className="aq-new">
      <div className="aq-new-bar">
        <span className="aq-new-brand"><i />Menuiserie Démo</span>
        <span className="aq-new-actions"><span className="aq-new-call"><Phone />Appeler</span><span className="aq-new-quote">Devis</span></span>
      </div>
      <span className="aq-ba-chip aq-ba-chip--new">Après</span>
      <div className="aq-new-main">
      <div className="aq-new-hero">
        <span className="aq-new-eyebrow"><i />Menuisier · Hauts-de-Seine</span>
        <span className="aq-new-title">Cuisines, escaliers et dressings sur mesure</span>
        <span className="aq-new-sub">Conception, fabrication et pose, avec un seul interlocuteur.</span>
        <span className="aq-new-cta">Demander un devis<ArrowRight /></span>
      </div>
      <div className="aq-new-cards">
        <span><i />Cuisines</span>
        <span><i />Escaliers</span>
        <span><i />Dressings</span>
      </div>
      </div>
    </div>
  );
}
