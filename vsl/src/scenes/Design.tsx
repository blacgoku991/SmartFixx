// Acte 2 — le nouveau design (captures réelles des pages SmartFixx refaites) :
// navigateur → téléphone → page création → formulaire rempli (données de démonstration) → envoi.
// Repères : d0 « SmartFixx crée votre site », d1 « lecture confortable sur mobile », d2 « services »,
// f0 « Et un formulaire simple », fin = début de l'acte suivant.
import React from "react";
import { C, CAPTURES, M, P, T } from "../lib/theme";
import { cles, ease, melange, melangeRect, prog, type Rect } from "../lib/anim";
import { useFormat } from "../lib/format";
import { Appareil, CaptureDefilante, Toucher } from "../composants/Appareil";
import { BadgeDemo, Puce, TitreCinetique } from "../composants/Texte";
import { rectTelephone } from "./Probleme";

export type ReperesDesign = { d0: number; d1: number; d2: number; f0: number; fin: number };

const capture = (cle: string) => {
  const c = CAPTURES[cle];
  if (!c) throw new Error(`Capture ${cle} absente de public/captures/captures.json`);
  return c;
};
const cleDe = (fichier: string) => Object.keys(CAPTURES).find((k) => CAPTURES[k].fichier === fichier) ?? fichier;

// Saisie animée dans la vraie page « création » (coordonnées relevées par outils/captures.cjs).
export function etatFormulaire(t: number, debut: number, fin: number) {
  const cap = capture(M.pageFormulaireMobileCle);
  const ch = cap.champs!;
  const D = Math.max(1.2, fin - debut);
  const at = (x: number) => debut + x * D;
  const s = T.formulaire.saisie;
  const tape = (texte: string, a: number, b: number) => texte.slice(0, Math.round(texte.length * prog(t, at(a), (b - a) * D, ease.lineaire)));
  const yHaut = (ch.nom?.y ?? 1130) - 96;
  const yBas = Math.max(yHaut, (ch.envoyer?.y ?? 2078) - 400);
  return {
    cap,
    ch,
    defilement: cles(t, [[at(0), 560], [at(0.14), yHaut, ease.doux], [at(0.7), yHaut], [at(0.82), yBas, ease.doux]]),
    nom: tape(s.nom, 0.16, 0.32),
    activite: tape(s.activite, 0.35, 0.48),
    email: tape(s.email, 0.51, 0.68),
    curseur: t < at(0.33) ? "nom" : t < at(0.5) ? "activite" : t < at(0.7) ? "email" : "",
    toucher: prog(t, at(0.86), 0.35, ease.lineaire),
    toucherVisible: prog(t, at(0.8), 0.1) * (1 - prog(t, at(0.98), 0.15)),
    confirmation: prog(t, at(0.9), 0.4, ease.sortie),
    badge: prog(t, at(0.05), 0.3),
  };
}

export const ContenuFormulaire: React.FC<{ t: number; l: number; h: number; debut: number; fin: number; zoom: number }> = ({ t, l, h, debut, fin, zoom }) => {
  const e = etatFormulaire(t, debut, fin);
  const s = l / e.cap.largeur;
  const champ = (cle: string, valeur: string) => {
    const r = e.ch[cle];
    if (!r) return null;
    return (
      <div
        style={{
          position: "absolute",
          left: (r.x + 14) * s,
          top: (r.y - e.defilement) * s,
          height: r.h * s,
          display: "flex",
          alignItems: "center",
          fontFamily: P.site,
          fontSize: 16 * s,
          color: C.texte,
          whiteSpace: "nowrap",
        }}
      >
        {valeur}
        {e.curseur === cle && Math.floor(t * 3) % 2 === 0 && <span style={{ display: "inline-block", width: 2 * s, height: 20 * s, background: C.accent, marginLeft: 2 }} />}
      </div>
    );
  };
  const env = e.ch.envoyer;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: `${l / 2}px 0px` }}>
        <CaptureDefilante capture={e.cap} l={l} defilement={e.defilement} />
        {champ("nom", e.nom)}
        {champ("activite", e.activite)}
        {champ("email", e.email)}
        {env && <Toucher x={(env.x + env.l * 0.6) * s} y={(env.y + env.h / 2 - e.defilement) * s} p={e.toucher} visible={e.toucherVisible} />}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 58, display: "flex", justifyContent: "center", opacity: e.badge }}>
        <BadgeDemo taille={Math.max(16, l * 0.045)} />
      </div>
      <Confirmation p={e.confirmation} l={l} h={h} />
    </>
  );
};

// Confirmation « Demande envoyée » affichée en bas de l'écran du téléphone.
export const Confirmation: React.FC<{ p: number; l: number; h: number }> = ({ p, l, h }) => {
  if (p <= 0) return null;
  return (
        <div
          style={{
            position: "absolute",
            left: l * 0.07,
            right: l * 0.07,
            bottom: h * 0.06,
            padding: `${l * 0.04}px ${l * 0.05}px`,
            borderRadius: l * 0.05,
            background: "rgba(14,23,48,0.97)",
            border: `2px solid ${C.succes}`,
            boxShadow: "0 24px 50px -16px rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            gap: l * 0.035,
            opacity: Math.min(1, p * 1.5),
            transform: `translateY(${(1 - p) * 60}px)`,
          }}
        >
          <div style={{ width: l * 0.1, height: l * 0.1, borderRadius: 99, background: C.succes, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={l * 0.055} height={l * 0.055} viewBox="0 0 20 20">
              <path d="M4 10.5l4 4 8-9" stroke={C.fond} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontFamily: P.texte, fontWeight: 800, fontSize: l * 0.058, color: C.texte, lineHeight: 1.15 }}>{T.formulaire.confirmation}</div>
        </div>
  );
};

export const ActeDesign: React.FC<{ t: number; b: ReperesDesign }> = ({ t, b }) => {
  const f = useFormat();
  if (t < b.d0 - 0.8 || t > b.fin + 0.5) return null;
  const nav = f.navigateur;
  const petit = rectTelephone(f.vertical);
  const grand = rectTelephone(f.vertical, true);
  const m1 = prog(t, b.d1, 0.85, ease.doux);
  const m2 = prog(t, b.f0 - 0.15, 0.55, ease.doux);
  let rect: Rect = melangeRect(nav, petit, m1);
  rect = melangeRect(rect, grand, m2);
  const sortie = prog(t, b.fin - 0.12, 0.38, ease.entree);
  const flottement = Math.sin(t * 1.3) * 4;
  const desktop = capture(cleDe(M.siteDesktop));
  const mobile = capture(cleDe(M.siteMobile));
  const page = capture(M.pageFormulaireMobileCle);
  const glisse = prog(t, b.d2, 0.55, ease.doux);
  const zoomForm = melange(1, f.vertical ? 1.2 : 1.25, prog(t, b.f0, 0.5, ease.doux));
  const z = f.titre;

  return (
    <>
      <Appareil
        rect={{ ...rect, y: rect.y + flottement * (1 - m2) - sortie * 120 }}
        morph={m1}
        url="smartfixx.fr"
        inclinaisonY={melange(f.vertical ? -4 : -10, 0, m1) + Math.sin(t * 0.6) * 1.5 * (1 - m2)}
        inclinaisonX={sortie * -20}
        echelle={1 - 0.35 * sortie}
        opacite={1 - sortie}
        lueur={1.2}
      >
        {(l, h) => (
          <>
            <CaptureDefilante capture={desktop} l={l} zoom={1 + 0.06 * prog(t, b.d0, b.d1 - b.d0 + 0.5, ease.lineaire)} origine="25% 30%" opacite={1 - prog(t, b.d1 + 0.15, 0.45)} />
            {m1 > 0 && (
              <div style={{ position: "absolute", inset: 0, opacity: prog(t, b.d1 + 0.2, 0.45), transform: `translateX(${-glisse * 35}%)` }}>
                <CaptureDefilante capture={mobile} l={l} />
              </div>
            )}
            {glisse > 0 && t < b.f0 + 0.1 && (
              <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - glisse) * 100}%)`, boxShadow: "-20px 0 40px rgba(0,0,0,0.5)" }}>
                <CaptureDefilante capture={page} l={l} defilement={cles(t, [[b.d2 + 0.5, 0], [b.f0, 560, ease.doux]])} />
              </div>
            )}
            {t >= b.f0 + 0.1 && <ContenuFormulaire t={t} l={l} h={h} debut={b.f0 + 0.1} fin={b.fin - 0.3} zoom={zoomForm} />}
          </>
        )}
      </Appareil>

      {T.design.titres.map((lignes, i) => {
        const d = [b.d0 + 0.1, b.d1 + 0.05, b.d2 + 0.05][i];
        const fi = [b.d1 - 0.3, b.d2 - 0.3, b.f0 - 0.35][i];
        return <TitreCinetique key={i} t={t} lignes={lignes} debut={d} fin={fi} x={z.x} y={z.y} l={z.l} taille={z.taille} souligne={1} />;
      })}
      {!f.vertical && <TitreCinetique t={t} lignes={T.formulaire.titre} debut={b.f0 + 0.05} fin={b.fin - 0.35} x={z.x} y={z.y} l={z.l} taille={z.taille} souligne={1} />}

      {T.design.services.map((sv, i) => {
        const p = prog(t, b.d2 + 0.3 + i * 0.16, 0.45, ease.lineaire) * (1 - prog(t, b.f0 - 0.2, 0.3));
        const taille = f.vertical ? 30 : 30;
        const pos: React.CSSProperties = f.vertical
          ? i % 2 === 0
            ? { left: 70, top: 660 + i * 120 }
            : { right: f.W - 900, top: 660 + i * 120, transformOrigin: "right center" }
          : { right: f.W - 1010, top: 520 + i * 92, transformOrigin: "right center" };
        return <Puce key={sv} texte={sv} p={p} couleur={C.accent} taille={taille} style={pos} />;
      })}
    </>
  );
};
