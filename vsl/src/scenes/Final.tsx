// Acte 4 — écran final : logo, smartfixx.fr et l'appel à l'action (seul usage de l'ambre avec la ville).
// Repères : e0 début de l'écran final, e1 « et demandez votre devis ».
import React from "react";
import { Img, staticFile } from "remotion";
import { C, M, P, T } from "../lib/theme";
import { ease, prog } from "../lib/anim";
import { useFormat } from "../lib/format";

export type ReperesFinal = { e0: number; e1: number };

const Fleche: React.FC<{ taille: number }> = ({ taille }) => (
  <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke={C.surCta} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const BoutonCta: React.FC<{ t: number; debut: number; taille: number; style?: React.CSSProperties }> = ({ t, debut, taille, style }) => {
  const p = prog(t, debut, 0.6, ease.lineaire);
  if (p <= 0) return null;
  const pouls = t > debut + 0.8 ? 0.5 + 0.5 * Math.sin((t - debut - 0.8) * 3.2) : 0;
  const balayage = prog(t, debut + 0.45, 0.8, ease.doux);
  return (
    <div
      style={{
        position: "absolute",
        display: "inline-flex",
        alignItems: "center",
        gap: taille * 0.4,
        padding: `${taille * 0.56}px ${taille * 0.95}px`,
        borderRadius: taille * 0.42,
        background: C.cta,
        color: C.surCta,
        fontFamily: P.texte,
        fontWeight: 800,
        fontSize: taille,
        whiteSpace: "nowrap",
        overflow: "hidden",
        opacity: Math.min(1, p * 2),
        transform: `scale(${0.7 + 0.3 * ease.ressort(p)})`,
        boxShadow: `0 0 ${50 + 40 * pouls}px rgba(255,182,72,${0.35 + 0.25 * pouls}), 0 24px 50px -20px rgba(0,0,0,0.8)`,
        ...style,
      }}
    >
      {T.final.cta}
      <Fleche taille={taille * 1.05} />
      {balayage > 0 && balayage < 1 && (
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${-30 + balayage * 140}%`, width: "22%", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))", transform: "skewX(-20deg)" }} />
      )}
    </div>
  );
};

export const Marque: React.FC<{ t: number; debut: number; tailleLogo: number; tailleNom: number; style?: React.CSSProperties; colonne?: boolean }> = ({ t, debut, tailleLogo, tailleNom, style, colonne = true }) => {
  const pl = prog(t, debut, 0.9, ease.sortie);
  const pn = prog(t, debut + 0.2, 0.7, ease.sortie);
  const anneau = prog(t, debut + 0.05, 1.3, ease.sortie);
  return (
    <div style={{ position: "absolute", display: "flex", flexDirection: colonne ? "column" : "row", alignItems: "center", gap: colonne ? tailleLogo * 0.12 : tailleLogo * 0.22, ...style }}>
      <div style={{ position: "relative", width: tailleLogo, height: tailleLogo }}>
        <div
          style={{
            position: "absolute",
            inset: -tailleLogo * 0.35,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(67,97,255,0.45) 0%, rgba(67,97,255,0) 65%)",
            opacity: pl,
            transform: `scale(${0.6 + 0.4 * anneau})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: -tailleLogo * 0.12,
            borderRadius: 999,
            border: `3px solid rgba(142,162,255,${0.5 * (1 - anneau)})`,
            transform: `scale(${0.8 + 0.6 * anneau})`,
          }}
        />
        <Img src={staticFile(M.logo)} style={{ position: "absolute", inset: 0, width: tailleLogo, height: tailleLogo, opacity: pl, transform: `scale(${0.6 + 0.4 * ease.ressort(pl)}) rotate(${(1 - pl) * -40}deg)` }} />
      </div>
      <div style={{ overflow: "hidden", height: tailleNom * 1.05 }}>
        <div style={{ fontFamily: P.titre, fontWeight: 700, fontSize: tailleNom, lineHeight: 1.05, color: C.texte, transform: `translateY(${(1 - pn) * 100}%)`, letterSpacing: "-0.01em" }}>SmartFixx</div>
      </div>
    </div>
  );
};

const Url: React.FC<{ t: number; debut: number; taille: number; style?: React.CSSProperties }> = ({ t, debut, taille, style }) => {
  const p = prog(t, debut, 0.7, ease.sortie);
  const trait = prog(t, debut + 0.35, 0.6, ease.sortie);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", ...style }}>
      <div style={{ overflow: "hidden", height: taille * 1.08 }}>
        <div style={{ fontFamily: P.titre, fontWeight: 700, fontSize: taille, lineHeight: 1.08, color: C.texte, transform: `translateY(${(1 - p) * 100}%)` }}>{T.final.url}</div>
      </div>
      <div style={{ height: Math.max(6, taille * 0.07), width: `${trait * 100}%`, background: C.accentFort, borderRadius: 4, marginTop: taille * 0.04 }} />
    </div>
  );
};

const Signature: React.FC<{ t: number; debut: number; taille: number; style?: React.CSSProperties }> = ({ t, debut, taille, style }) => {
  const p = prog(t, debut, 0.7, ease.sortie);
  return (
    <div style={{ position: "absolute", fontFamily: P.texte, fontWeight: 600, fontSize: taille, lineHeight: 1.35, color: C.texteDoux, opacity: p, transform: `translateY(${(1 - p) * 24}px)`, ...style }}>
      <div style={{ color: C.texte }}>{T.final.signature}</div>
      <div>{T.final.lieu}</div>
    </div>
  );
};

export const ActeFinal: React.FC<{ t: number; b: ReperesFinal }> = ({ t, b }) => {
  const f = useFormat();
  if (t < b.e0 - 0.3) return null;
  if (f.vertical) {
    return (
      <>
        <Marque t={t} debut={b.e0} tailleLogo={190} tailleNom={128} style={{ left: 0, width: f.W, top: 318 }} />
        <Signature t={t} debut={b.e0 + 0.45} taille={36} style={{ left: 0, width: f.W, top: 690, textAlign: "center" }} />
        <div style={{ position: "absolute", left: 0, width: f.W, top: 852, display: "flex", justifyContent: "center" }}>
          <Url t={t} debut={b.e0 + 0.7} taille={120} style={{ position: "relative" }} />
        </div>
        <div style={{ position: "absolute", left: 0, width: f.W, top: 1050, display: "flex", justifyContent: "center" }}>
          <BoutonCta t={t} debut={b.e1} taille={52} style={{ position: "relative" }} />
        </div>
      </>
    );
  }
  const sep = prog(t, b.e0 + 0.3, 0.8, ease.sortie);
  return (
    <>
      <Marque t={t} debut={b.e0} tailleLogo={190} tailleNom={136} style={{ left: 120, width: 780, top: 150 }} />
      <Signature t={t} debut={b.e0 + 0.45} taille={34} style={{ left: 120, width: 780, top: 560, textAlign: "center" }} />
      <div style={{ position: "absolute", left: 958, top: 540 - 260 * sep, width: 3, height: 520 * sep, background: "linear-gradient(180deg, rgba(142,162,255,0), rgba(142,162,255,0.6), rgba(142,162,255,0))" }} />
      <div style={{ position: "absolute", left: 1020, width: 800, top: 300, display: "flex", justifyContent: "center" }}>
        <Url t={t} debut={b.e0 + 0.7} taille={136} style={{ position: "relative" }} />
      </div>
      <div style={{ position: "absolute", left: 1020, width: 800, top: 520, display: "flex", justifyContent: "center" }}>
        <BoutonCta t={t} debut={b.e1} taille={50} style={{ position: "relative" }} />
      </div>
    </>
  );
};
