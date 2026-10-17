// Tableau de suivi FICTIF (données de démonstration) : une demande arrive en tête de liste.
import React from "react";
import { C, P, T } from "../lib/theme";
import { ease } from "../lib/anim";
import { BadgeDemo } from "./Texte";

export const PANEL_LARGEUR = 1200;
export const PANEL_HAUTEUR = 740;
export const ZONES_PANEL = { nouvelle: { x: 280, y: 452, l: 880, h: 96 } };

const D = T.panel;

const Statut: React.FC<{ texte: string; couleur: string; fond: string }> = ({ texte, couleur, fond }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 99, background: fond, color: couleur, fontFamily: P.texte, fontWeight: 800, fontSize: 21 }}>
    <span style={{ width: 10, height: 10, borderRadius: 9, background: couleur }} />
    {texte}
  </div>
);

const Ligne: React.FC<{ contact: string; detail: string; besoin: string; statut: React.ReactNode; quand: string; marque?: boolean; fond?: string }> = ({ contact, detail, besoin, statut, quand, marque, fond }) => (
  <div style={{ display: "flex", alignItems: "center", height: 96, padding: "0 26px", borderTop: `1px solid ${C.ligne}`, background: fond, borderLeft: marque ? `5px solid ${C.cta}` : "5px solid transparent" }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: C.surface3, color: C.accent, fontFamily: P.texte, fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 18 }}>
      {contact.replace(/^(M\.|Mme)\s*/, "").charAt(0)}
    </div>
    <div style={{ width: 250 }}>
      <div style={{ fontFamily: P.texte, fontWeight: 800, fontSize: 23, color: C.texte }}>{contact}</div>
      <div style={{ fontFamily: P.texte, fontSize: 18, color: C.texteFaible, marginTop: 4 }}>{detail}</div>
    </div>
    <div style={{ width: 200, fontFamily: P.texte, fontWeight: 700, fontSize: 22, color: C.texte }}>{besoin}</div>
    <div style={{ width: 190 }}>{statut}</div>
    <div style={{ fontFamily: P.texte, fontSize: 19, color: C.texteDoux, whiteSpace: "nowrap" }}>{quand}</div>
  </div>
);

export const PanelDemo: React.FC<{ l: number; arrivee: number; flash?: number }> = ({ l, arrivee, flash = 0 }) => {
  const s = l / PANEL_LARGEUR;
  const a = ease.sortie(Math.min(1, Math.max(0, arrivee)));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: PANEL_LARGEUR, height: PANEL_HAUTEUR, transform: `scale(${s})`, transformOrigin: "0 0", background: C.fond, display: "flex" }}>
      <div style={{ width: 240, background: C.surface, borderRight: `1px solid ${C.ligne}`, padding: "34px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 44 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.accentFort }} />
          <div style={{ fontFamily: P.texte, fontWeight: 800, fontSize: 19, color: C.texte, lineHeight: 1.1 }}>Votre<br />Entreprise</div>
        </div>
        {["Demandes", "Clients", "Réglages"].map((m, i) => (
          <div key={m} style={{ fontFamily: P.texte, fontWeight: i === 0 ? 800 : 600, fontSize: 20, color: i === 0 ? "#fff" : C.texteDoux, background: i === 0 ? C.accentFort : "transparent", borderRadius: 14, padding: "15px 18px", marginBottom: 8 }}>
            {m}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: "30px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: P.texte, fontSize: 19, color: C.texteFaible }}>{D.fil}</div>
          <BadgeDemo taille={20} />
        </div>
        <div style={{ fontFamily: P.titre, fontWeight: 700, fontSize: 66, color: C.texte, marginTop: 22 }}>{D.titre}</div>
        <div
          style={{
            marginTop: 20,
            height: 92,
            borderRadius: 20,
            border: `1.5px solid ${a > 0.05 ? "rgba(255,182,72,0.55)" : C.ligne}`,
            background: C.surface,
            display: "flex",
            alignItems: "center",
            padding: "0 26px",
            gap: 18,
          }}
        >
          <div style={{ width: 16, height: 40, borderRadius: 5, background: a > 0.05 ? C.cta : C.surface3, boxShadow: a > 0.05 ? `0 0 ${24 * a}px rgba(255,182,72,0.8)` : undefined }} />
          <div>
            <div style={{ fontFamily: P.texte, fontWeight: 800, fontSize: 25, color: C.texte }}>{D.aTraiter}</div>
            <div style={{ fontFamily: P.texte, fontSize: 19, color: C.texteDoux, marginTop: 4, opacity: a }}>Nouvelle demande · {D.nouvelle.besoin}</div>
          </div>
        </div>
        <div style={{ marginTop: 26, borderRadius: 20, border: `1px solid ${C.ligne}`, background: C.surface, overflow: "hidden" }}>
          <div style={{ display: "flex", height: 54, alignItems: "center", padding: "0 26px 0 97px", fontFamily: P.texte, fontWeight: 700, fontSize: 18, color: C.texteFaible }}>
            <div style={{ width: 250 }}>{D.colonnes[0]}</div>
            <div style={{ width: 200 }}>{D.colonnes[1]}</div>
            <div style={{ width: 190 }}>{D.colonnes[2]}</div>
          </div>
          <div style={{ height: 96 * a, overflow: "hidden" }}>
            <div style={{ transform: `translateX(${(1 - a) * 160}px)`, opacity: a }}>
              <Ligne
                contact={D.nouvelle.contact}
                detail={D.nouvelle.detail}
                besoin={D.nouvelle.besoin}
                quand={D.nouvelle.quand}
                marque
                fond={`rgba(255,182,72,${0.06 + 0.16 * flash})`}
                statut={<Statut texte={D.nouvelle.statut} couleur={C.ctaClair} fond="rgba(255,182,72,0.14)" />}
              />
            </div>
          </div>
          <Ligne
            contact={D.precedente.contact}
            detail={D.precedente.detail}
            besoin={D.precedente.besoin}
            quand={D.precedente.quand}
            statut={<Statut texte={D.precedente.statut} couleur={C.accent} fond="rgba(142,162,255,0.14)" />}
          />
        </div>
      </div>
    </div>
  );
};
