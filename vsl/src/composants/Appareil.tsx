// Cadre d'appareil qui se transforme : navigateur (morph = 0) → téléphone (morph = 1).
import React from "react";
import { Img, staticFile } from "remotion";
import { C, P, type Capture } from "../lib/theme";
import { melange, type Rect } from "../lib/anim";
import { BadgeDemo } from "./Texte";

export const Appareil: React.FC<{
  rect: Rect;
  morph?: number;
  url?: string;
  urlVisible?: number; // nombre de caractères affichés (saisie)
  badge?: number; // opacité de la pastille Démonstration
  chargement?: number; // barre de chargement 0 → 1 (0 ou 1 = masquée)
  inclinaisonX?: number;
  inclinaisonY?: number;
  echelle?: number;
  opacite?: number;
  lueur?: number;
  children: (l: number, h: number) => React.ReactNode;
}> = ({ rect, morph = 0, url = "", urlVisible, badge = 0, chargement = 0, inclinaisonX = 0, inclinaisonY = 0, echelle = 1, opacite = 1, lueur = 1, children }) => {
  const rayon = melange(22, 64, morph);
  const cadre = melange(0, 13, morph);
  const barre = melange(rect.l > 800 ? 56 : 46, 0, morph);
  const l = rect.l - 2 * cadre;
  const h = rect.h - barre - 2 * cadre;
  const chromeOp = Math.max(0, 1 - morph * 2.2);
  const u = urlVisible === undefined ? url : url.slice(0, Math.max(0, Math.floor(urlVisible)));
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.l,
        height: rect.h,
        opacity: opacite,
        transform: `perspective(2400px) rotateX(${inclinaisonX}deg) rotateY(${inclinaisonY}deg) scale(${echelle})`,
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: rayon,
          background: morph > 0.5 ? "#04060D" : C.surface,
          border: `${melange(1.5, 2.5, morph)}px solid rgba(142,162,255,${melange(0.22, 0.35, morph)})`,
          boxShadow: `0 60px 120px -40px rgba(0,0,0,0.85), 0 0 ${120 * lueur}px -20px rgba(67,97,255,${0.35 * lueur})`,
          overflow: "hidden",
        }}
      >
        {barre > 1 && (
          <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: barre, display: "flex", alignItems: "center", gap: 14, padding: "0 18px", opacity: chromeOp, borderBottom: "1px solid rgba(142,162,255,0.14)" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: 99, background: "rgba(142,162,255,0.28)" }} />
              ))}
            </div>
            <div
              style={{
                flex: 1,
                height: barre * 0.6,
                borderRadius: 99,
                background: "rgba(7,11,24,0.7)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 16px",
                fontFamily: P.texte,
                fontWeight: 600,
                fontSize: barre * 0.36,
                color: C.texteDoux,
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              <svg width={barre * 0.3} height={barre * 0.34} viewBox="0 0 12 14">
                <rect x="1" y="6" width="10" height="7.5" rx="1.6" fill={C.texteFaible} />
                <path d="M3.5 6V4.2a2.5 2.5 0 0 1 5 0V6" stroke={C.texteFaible} strokeWidth="1.6" fill="none" />
              </svg>
              <span>{u}</span>
              {urlVisible !== undefined && urlVisible < url.length && <span style={{ width: 2, height: barre * 0.36, background: C.accent }} />}
            </div>
            {badge > 0 && <BadgeDemo taille={barre * 0.34} opacite={badge} />}
          </div>
        )}
        {chargement > 0 && chargement < 1 && (
          <div style={{ position: "absolute", left: 0, top: barre - 3, height: 3, width: `${chargement * 100}%`, background: C.accent, boxShadow: `0 0 12px ${C.accent}` }} />
        )}
        <div
          style={{
            position: "absolute",
            left: cadre,
            top: barre + cadre,
            width: l,
            height: h,
            borderRadius: Math.max(0, rayon - cadre) * Math.min(1, morph * 3),
            overflow: "hidden",
            background: C.fond,
          }}
        >
          {children(l, h)}
        </div>
        {morph > 0.05 && (
          <div
            style={{
              position: "absolute",
              top: cadre + 12,
              left: rect.l / 2 - 56,
              width: 112,
              height: 32,
              borderRadius: 99,
              background: "#000",
              opacity: Math.min(1, (morph - 0.05) * 3),
            }}
          />
        )}
        {/* Téléphone : la barre d'adresse disparaît, la pastille « Démonstration » passe sous l'encoche
            (le bas de l'écran reste libre pour l'envoi et sa confirmation) pour que la maquette fictive
            reste étiquetée pendant tout le passage en mobile. */}
        {badge > 0 && morph > 0.4 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: cadre + 52, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
            <BadgeDemo taille={Math.max(18, Math.min(24, rect.l * 0.056))} opacite={badge * Math.min(1, (morph - 0.4) / 0.2)} />
          </div>
        )}
      </div>
    </div>
  );
};

// Capture d'écran affichée à la largeur du cadre, avec défilement (en pixels CSS de la page).
export const CaptureDefilante: React.FC<{ capture: Capture; l: number; defilement?: number; zoom?: number; origine?: string; opacite?: number; style?: React.CSSProperties }> = ({
  capture,
  l,
  defilement = 0,
  zoom = 1,
  origine = "50% 0%",
  opacite = 1,
  style,
}) => {
  const s = l / capture.largeur;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: opacite, transform: `scale(${zoom})`, transformOrigin: origine, ...style }}>
      <Img
        src={staticFile(capture.fichier)}
        style={{ position: "absolute", left: 0, top: -defilement * s, width: l, height: capture.hauteur * s, display: "block" }}
      />
    </div>
  );
};

// Contact tactile : point lumineux et onde.
export const Toucher: React.FC<{ x: number; y: number; p: number; visible: number }> = ({ x, y, p, visible }) => {
  if (visible <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none", opacity: visible }}>
      <div
        style={{
          position: "absolute",
          left: -26,
          top: -26,
          width: 52,
          height: 52,
          borderRadius: 99,
          background: "rgba(238,242,251,0.55)",
          border: "3px solid rgba(255,255,255,0.9)",
          transform: `scale(${1 - 0.25 * Math.sin(Math.min(1, p) * Math.PI)})`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        }}
      />
      {p > 0 && p < 1 && (
        <div
          style={{
            position: "absolute",
            left: -26 - 50 * p,
            top: -26 - 50 * p,
            width: 52 + 100 * p,
            height: 52 + 100 * p,
            borderRadius: 999,
            border: `3px solid rgba(142,162,255,${1 - p})`,
          }}
        />
      )}
    </div>
  );
};

// Pointeur de souris (navigateur).
export const Pointeur: React.FC<{ x: number; y: number; visible: number; clic?: number }> = ({ x, y, visible, clic = 0 }) => {
  if (visible <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: visible, transform: `scale(${1 - 0.15 * Math.sin(Math.min(1, clic) * Math.PI)})`, transformOrigin: "0 0" }}>
      <svg width="44" height="54" viewBox="0 0 22 27">
        <path d="M2 1.5v20.5l5.2-4.9 3.4 7.6 3.3-1.5-3.4-7.4 7.2-.4z" fill="#FFFFFF" stroke="#0A0F1E" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
