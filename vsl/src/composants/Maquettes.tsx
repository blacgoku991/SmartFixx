// Maquettes FICTIVES d'un site d'entreprise (étiquetées « Démonstration » par le cadre qui les montre).
// Avant : site peu lisible, offre floue, contact caché en pied de page (non adapté au mobile).
// Après : la même entreprise fictive, repensée dans l'esprit SmartFixx.
import React from "react";
import { C, P, T } from "../lib/theme";

const A = T.maquetteAvant;
const B = T.maquetteApres;

export const AVANT_LARGEUR = 1440;
export const AVANT_HAUTEUR = 2400;
// Zones utiles pour les annotations (pixels de la maquette).
export const ZONES_AVANT = {
  texte: { x: 80, y: 560, l: 1280, h: 230 },
  offre: { x: 200, y: 200, l: 1040, h: 150 },
  contact: { x: 1060, y: 2338, l: 150, h: 26 },
};

const serif = "Georgia, 'DejaVu Serif', serif";

export const MaquetteAvant: React.FC<{ l: number; defilement?: number; flouOffre?: number; brouillage?: number }> = ({ l, defilement = 0, flouOffre = 0, brouillage = 0 }) => {
  const s = l / AVANT_LARGEUR;
  const para = (n: number) => Array.from({ length: n }, () => A.paragraphe).join(" ");
  const colonne = (titre: string, n: number) => (
    <div style={{ width: 400 }}>
      <div style={{ fontFamily: serif, fontSize: 19, color: "#9C978E", marginBottom: 10 }}>{titre}</div>
      <div style={{ fontFamily: serif, fontSize: 12.5, lineHeight: 1.36, color: "#B7B2A9", textAlign: "justify" }}>{para(n)}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: AVANT_LARGEUR, height: AVANT_HAUTEUR, transform: `translateY(${-defilement * s}px) scale(${s})`, transformOrigin: "0 0", background: "#ECE9E2", filter: brouillage > 0 ? `saturate(${1 - 0.6 * brouillage})` : undefined }}>
      <div style={{ height: 34, background: "#5E5E5E", color: "#BDBDBD", fontFamily: serif, fontSize: 12, display: "flex", alignItems: "center", padding: "0 30px" }}>
        Bienvenue sur le site de {A.marque} — voir rubrique Infos pour les horaires
      </div>
      <div style={{ height: 90, background: "#F3F1EC", display: "flex", alignItems: "center", padding: "0 40px", gap: 16 }}>
        <div style={{ width: 54, height: 54, background: "#B9B5AC", color: "#F3F1EC", fontFamily: serif, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>VE</div>
        <div style={{ fontFamily: serif, fontSize: 30, color: "#8A8680" }}>{A.marque}</div>
        <div style={{ flex: 1 }} />
        {A.menu.map((m) => (
          <div key={m} style={{ fontFamily: serif, fontSize: 13, color: "#A7A39B", marginLeft: 20 }}>
            {m}
          </div>
        ))}
      </div>
      <div style={{ position: "relative", height: 370, background: "linear-gradient(120deg,#8FA3A0,#C8C2B4 60%,#A6A091)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 900, top: -120, width: 520, height: 520, borderRadius: 999, background: "rgba(255,255,255,0.12)" }} />
        <div style={{ position: "absolute", left: -100, top: 160, width: 420, height: 420, borderRadius: 999, background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", left: 30, top: 160, fontSize: 54, color: "rgba(255,255,255,0.5)", fontFamily: serif }}>‹</div>
        <div style={{ position: "absolute", right: 30, top: 160, fontSize: 54, color: "rgba(255,255,255,0.5)", fontFamily: serif }}>›</div>
        <div style={{ position: "absolute", left: 200, top: 100, width: 1040, textAlign: "center", filter: flouOffre > 0 ? `blur(${flouOffre * 7}px)` : undefined }}>
          <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 46, color: "#F7F5F0" }}>{A.titre}</div>
          <div style={{ fontFamily: serif, fontSize: 17, color: "#EFEDE7", marginTop: 16 }}>{A.chapeau}</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, display: "flex", justifyContent: "center", gap: 10 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: 9, background: i === 0 ? "#F7F5F0" : "rgba(255,255,255,0.45)" }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "52px 80px 0" }}>
        {colonne("Qui sommes-nous ?", 2)}
        {colonne("Nos engagements", 2)}
        {colonne("Actualités", 2)}
      </div>
      <div style={{ padding: "50px 80px 0" }}>
        <div style={{ fontFamily: serif, fontSize: 19, color: "#9C978E", marginBottom: 14 }}>Galerie</div>
        <div style={{ display: "flex", gap: 16 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ flex: 1, height: 150, background: i % 2 ? "#D3CEC4" : "#C9C3B8" }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "50px 80px 0" }}>
        {colonne("Historique", 2)}
        {colonne("Partenaires", 2)}
        {colonne("Infos pratiques", 2)}
      </div>
      <div style={{ padding: "50px 80px 0" }}>
        <div style={{ fontFamily: serif, fontSize: 19, color: "#9C978E", marginBottom: 14 }}>Plan d'accès</div>
        <div style={{ height: 300, background: "repeating-linear-gradient(45deg,#D6D1C7 0 24px,#CFC9BE 24px 48px)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, background: "#5E5E5E", display: "flex", alignItems: "flex-end", padding: "0 80px 36px", gap: 26, fontFamily: serif, fontSize: 11, color: "#9A9A9A" }}>
        <span>Mentions</span>
        <span>Plan du site</span>
        <span>Liens</span>
        <span style={{ flex: 1 }} />
        <span>Crédits</span>
        <span>{A.contact}</span>
      </div>
    </div>
  );
};

export const APRES_LARGEUR = 1440;
export const APRES_HAUTEUR = 900;
export const ZONES_APRES = { envoyer: { x: 970, y: 640, l: 340, h: 66 }, formulaire: { x: 930, y: 200, l: 420, h: 540 } };

export const MaquetteApres: React.FC<{ l: number; envoi?: number }> = ({ l, envoi = 0 }) => {
  const s = l / APRES_LARGEUR;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: APRES_LARGEUR, height: APRES_HAUTEUR, transform: `scale(${s})`, transformOrigin: "0 0", background: "radial-gradient(70% 80% at 85% 10%, #1A2A6B 0%, #0B1226 55%, #080D1C 100%)", overflow: "hidden" }}>
      <div style={{ height: 96, display: "flex", alignItems: "center", padding: "0 70px", gap: 18, borderBottom: "1px solid rgba(142,162,255,0.14)" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accentFort }} />
        <div style={{ fontFamily: P.texte, fontWeight: 800, fontSize: 26, color: C.texte }}>{B.marque}</div>
        <div style={{ flex: 1 }} />
        {B.menu.map((m) => (
          <div key={m} style={{ fontFamily: P.texte, fontWeight: 600, fontSize: 21, color: C.texteDoux, marginLeft: 34 }}>
            {m}
          </div>
        ))}
        <div style={{ marginLeft: 40, background: C.accentFort, color: "#fff", fontFamily: P.texte, fontWeight: 800, fontSize: 21, padding: "14px 26px", borderRadius: 12 }}>{B.bouton}</div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 190, width: 780 }}>
        <div style={{ fontFamily: P.texte, fontWeight: 700, fontSize: 24, color: C.accent }}>{B.surtitre}</div>
        <div style={{ fontFamily: P.titre, fontWeight: 700, fontSize: 82, lineHeight: 0.98, color: C.texte, marginTop: 18 }}>
          {B.titre.map((x) => (
            <div key={x}>{x}</div>
          ))}
        </div>
        <div style={{ fontFamily: P.texte, fontSize: 27, lineHeight: 1.45, color: C.texteDoux, marginTop: 28, width: 700 }}>{B.chapeau}</div>
        <div style={{ display: "flex", gap: 14, marginTop: 34 }}>
          {B.services.map((x) => (
            <div key={x} style={{ fontFamily: P.texte, fontWeight: 700, fontSize: 22, color: C.texte, background: C.surface3, padding: "12px 22px", borderRadius: 99 }}>
              {x}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 930, top: 200, width: 420, padding: 40, borderRadius: 28, background: "rgba(14,23,48,0.92)", border: "1.5px solid rgba(142,162,255,0.22)", boxShadow: "0 30px 60px -30px rgba(0,0,0,0.8)" }}>
        <div style={{ fontFamily: P.titre, fontWeight: 700, fontSize: 40, color: C.texte, marginBottom: 22 }}>{B.formulaireTitre}</div>
        {B.champs.map((x) => (
          <div key={x} style={{ fontFamily: P.texte, fontSize: 21, color: C.texte, border: `1.5px solid ${C.ligneForte}`, background: "#070B18", borderRadius: 12, padding: "15px 18px", marginBottom: 16 }}>
            {x}
          </div>
        ))}
        <div
          style={{
            marginTop: 8,
            height: 66,
            borderRadius: 14,
            background: C.accentFort,
            color: "#fff",
            fontFamily: P.texte,
            fontWeight: 800,
            fontSize: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${1 - 0.05 * Math.sin(Math.min(1, envoi) * Math.PI)})`,
            boxShadow: envoi > 0 ? `0 0 ${40 * Math.sin(Math.min(1, envoi) * Math.PI)}px rgba(142,162,255,0.9)` : undefined,
          }}
        >
          {B.envoyer}
        </div>
      </div>
    </div>
  );
};

// Version mobile de la maquette repensée (390 × 844).
export const MaquetteApresMobile: React.FC<{ l: number }> = ({ l }) => {
  const s = l / 390;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 390, height: 844, transform: `scale(${s})`, transformOrigin: "0 0", background: "radial-gradient(90% 50% at 90% 0%, #1A2A6B 0%, #0B1226 60%, #080D1C 100%)" }}>
      <div style={{ height: 96, display: "flex", alignItems: "flex-end", padding: "0 20px 14px", gap: 10, borderBottom: "1px solid rgba(142,162,255,0.14)" }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: C.accentFort }} />
        <div style={{ fontFamily: P.texte, fontWeight: 800, fontSize: 17, color: C.texte }}>{B.marque}</div>
        <div style={{ flex: 1 }} />
        <div style={{ background: C.accentFort, color: "#fff", fontFamily: P.texte, fontWeight: 800, fontSize: 14, padding: "9px 14px", borderRadius: 10 }}>{B.bouton}</div>
      </div>
      <div style={{ padding: "26px 20px 0" }}>
        <div style={{ fontFamily: P.texte, fontWeight: 700, fontSize: 14, color: C.accent }}>{B.surtitre}</div>
        <div style={{ fontFamily: P.titre, fontWeight: 700, fontSize: 40, lineHeight: 0.98, color: C.texte, marginTop: 10 }}>
          {B.titre.map((x) => (
            <div key={x}>{x}</div>
          ))}
        </div>
        <div style={{ fontFamily: P.texte, fontSize: 16, lineHeight: 1.45, color: C.texteDoux, marginTop: 14 }}>{B.chapeau}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          {B.services.map((x) => (
            <div key={x} style={{ fontFamily: P.texte, fontWeight: 700, fontSize: 13, color: C.texte, background: C.surface3, padding: "8px 13px", borderRadius: 99 }}>
              {x}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 22, padding: 18, borderRadius: 18, background: "rgba(14,23,48,0.92)", border: "1.5px solid rgba(142,162,255,0.22)" }}>
          <div style={{ fontFamily: P.titre, fontWeight: 700, fontSize: 24, color: C.texte, marginBottom: 12 }}>{B.formulaireTitre}</div>
          {B.champs.map((x) => (
            <div key={x} style={{ fontFamily: P.texte, fontSize: 14, color: C.texte, border: `1.5px solid ${C.ligneForte}`, background: "#070B18", borderRadius: 10, padding: "10px 12px", marginBottom: 9 }}>
              {x}
            </div>
          ))}
          <div style={{ height: 46, borderRadius: 11, background: C.accentFort, color: "#fff", fontFamily: P.texte, fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{B.envoyer}</div>
        </div>
      </div>
    </div>
  );
};
