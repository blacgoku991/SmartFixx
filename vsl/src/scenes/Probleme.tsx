// Acte 1 — accroche et problèmes, sur une maquette fictive étiquetée « Démonstration ».
// Repères (secondes, issus du minutage) :
//   q  : « comprend-il tout de suite pourquoi vous choisir ? »
//   p1 : « Un texte difficile à lire, »   p2 : « une offre floue, »
//   p3 : « un bouton de contact introuvable sur mobile… »   p4 : « Chaque détail peut freiner… »
//   fin : début de l'acte suivant
import React from "react";
import { C, T } from "../lib/theme";
import { cles, ease, melange, melangeRect, prog, type Rect } from "../lib/anim";
import { useFormat } from "../lib/format";
import { Appareil, Toucher } from "../composants/Appareil";
import { MaquetteAvant, ZONES_AVANT } from "../composants/Maquettes";
import { Puce, TitreCinetique } from "../composants/Texte";

export type ReperesProbleme = { q: number; p1: number; p2: number; p3: number; p4: number; fin: number };

// Téléphone « petit » (titres au-dessus) selon le format.
export function rectTelephone(vertical: boolean, grand = false): Rect {
  if (vertical) return grand ? { x: 318, y: 312, l: 444, h: 930 } : { x: 372, y: 560, l: 336, h: 690 };
  return grand ? { x: 1040, y: 56, l: 392, h: 820 } : { x: 1062, y: 84, l: 360, h: 772 };
}

// Coins de visée autour d'une zone (coordonnées du contenu).
const Visee: React.FC<{ r: Rect; p: number; couleur?: string }> = ({ r, p, couleur = C.accent }) => {
  if (p <= 0) return null;
  const e = 18 * (1 - p) + 6;
  const c = 28;
  const coin = (x: number, y: number, sx: number, sy: number, k: number) => (
    <div key={k} style={{ position: "absolute", left: x - (sx < 0 ? c : 0), top: y - (sy < 0 ? c : 0), width: c, height: c, borderLeft: sx > 0 ? `4px solid ${couleur}` : undefined, borderRight: sx < 0 ? `4px solid ${couleur}` : undefined, borderTop: sy > 0 ? `4px solid ${couleur}` : undefined, borderBottom: sy < 0 ? `4px solid ${couleur}` : undefined, borderRadius: 4 }} />
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, p * 2) }}>
      {coin(r.x - e, r.y - e, 1, 1, 0)}
      {coin(r.x + r.l + e, r.y - e, -1, 1, 1)}
      {coin(r.x - e, r.y + r.h + e, 1, -1, 2)}
      {coin(r.x + r.l + e, r.y + r.h + e, -1, -1, 3)}
    </div>
  );
};

// Pastille numérotée posée sur la maquette (relie la puce au défaut montré).
const Marqueur: React.FC<{ n: number; x: number; y: number; taille: number; p: number }> = ({ n, x, y, taille, p }) => {
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - taille / 2,
        top: y - taille / 2,
        width: taille,
        height: taille,
        borderRadius: 99,
        background: C.danger,
        color: C.fond,
        fontFamily: "Inter",
        fontWeight: 800,
        fontSize: taille * 0.62,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 0 ${taille * 0.18}px rgba(255,150,150,0.3)`,
        transform: `scale(${ease.ressort(Math.min(1, p))})`,
      }}
    >
      {n}
    </div>
  );
};

export const ActeProbleme: React.FC<{ t: number; b: ReperesProbleme; entree?: number }> = ({ t, b, entree = 0.12 }) => {
  const f = useFormat();
  if (t > b.fin + 0.6) return null;
  const nav = f.navigateur;
  const tel = rectTelephone(f.vertical);

  // Entrée du navigateur
  const pIn = prog(t, entree, 0.95, ease.sortie);
  const morph = prog(t, b.p3, 0.8, ease.doux);
  const rect = melangeRect(nav, tel, morph);
  const chargement = cles(t, [[entree + 1.05, 0], [entree + 1.7, 1, ease.doux]]);
  const contenuOp = prog(t, entree + 1.35, 0.4);

  // Zoom du contenu (focalisation sur l'offre, puis sur le texte, puis l'offre floue)
  const zoom = cles(t, [
    [b.q - 0.1, 1],
    [b.q + 0.8, 1.42, ease.sortie],
    [b.p1 - 0.05, 1.52, ease.lineaire],
    [b.p1 + 0.5, 1.75, ease.sortie],
    [b.p2 - 0.1, 1.75],
    [b.p2 + 0.45, 1.42, ease.sortie],
    [b.p3, 1.42],
    [b.p3 + 0.6, 1, ease.doux],
  ]);
  const surTexte = cles(t, [[b.p1 - 0.05, 0], [b.p1 + 0.5, 1, ease.sortie], [b.p2 - 0.1, 1], [b.p2 + 0.45, 0, ease.sortie]]);
  const flou = prog(t, b.p2 + 0.15, 0.6, ease.doux) * (1 - prog(t, b.p3 + 0.2, 0.4));

  const sombre = prog(t, b.p4 + 0.1, 0.6);
  const recul = prog(t, b.p4, Math.max(0.5, b.fin - b.p4), ease.lineaire);
  const flottement = Math.sin(t * 1.25) * 6;
  const sortie = prog(t, b.fin - 0.3, 0.5, ease.entree);

  return (
    <>
      <Appareil
        rect={{ ...rect, y: rect.y + flottement }}
        morph={morph}
        url={T.accroche.url}
        urlVisible={cles(t, [[entree + 0.45, 0], [entree + 1.2, T.accroche.url.length, ease.lineaire]])}
        badge={prog(t, entree + 1.2, 0.4)}
        chargement={chargement}
        inclinaisonX={(1 - pIn) * 24 + sombre * 6}
        inclinaisonY={melange(0, f.vertical ? 0 : -8, pIn) * (1 - morph) + recul * 14 + Math.sin(t * 0.7) * 1.5}
        echelle={melange(0.9, 1, pIn) * (1 - 0.12 * recul) * (1 - 0.08 * sortie)}
        opacite={pIn * (1 - sortie)}
      >
        {(l, h) => {
          // largeur de page simulée : 1440 dans le navigateur, 980 dans le téléphone (site non adapté)
          const largeurPage = melange(1440, 980, morph);
          const s = l / largeurPage;
          const ox2 = melange((ZONES_AVANT.offre.x + ZONES_AVANT.offre.l / 2) * s, (ZONES_AVANT.texte.x + 340) * s, surTexte);
          const oy2 = melange((ZONES_AVANT.offre.y + ZONES_AVANT.offre.h / 2) * s, (ZONES_AVANT.texte.y + 110) * s, surTexte);
          const defil = cles(t, [[b.p3 + 0.7, 0], [b.p4 - 0.3, 520, ease.doux]]);
          // recherche du contact (téléphone) : anneau qui cherche, coupé à droite
          const chercher = prog(t, b.p3 + 0.7, 0.3) * (1 - prog(t, b.p4, 0.3));
          const cx = l * (0.55 + 0.35 * Math.sin((t - b.p3) * 2.4));
          const cy = h * (0.42 + 0.22 * Math.cos((t - b.p3) * 1.7));
          return (
            <div style={{ position: "absolute", inset: 0, opacity: contenuOp, filter: sombre > 0 ? `brightness(${1 - 0.45 * sombre}) saturate(${1 - 0.5 * sombre})` : undefined }}>
              <div style={{ position: "absolute", inset: 0, background: "#5E5E5E" }} />
              <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: `${ox2}px ${oy2}px` }}>
                <div style={{ position: "absolute", left: 0, top: 0, width: largeurPage * s, height: 2400 * s, overflow: "hidden" }}>
                  <MaquetteAvant l={1440 * s} defilement={defil} flouOffre={flou} />
                </div>
                <div style={{ position: "absolute", inset: 0, transform: `translateY(${-defil * s}px)` }}>
                  <Visee r={{ x: ZONES_AVANT.offre.x * s, y: ZONES_AVANT.offre.y * s, l: ZONES_AVANT.offre.l * s, h: ZONES_AVANT.offre.h * s }} p={prog(t, b.q + 0.2, 0.5) * (1 - prog(t, b.p1 - 0.1, 0.3))} />
                  <Visee r={{ x: ZONES_AVANT.texte.x * s, y: ZONES_AVANT.texte.y * s, l: ZONES_AVANT.texte.l * s * 0.3, h: ZONES_AVANT.texte.h * s }} p={prog(t, b.p1 + 0.35, 0.4) * (1 - prog(t, b.p2 - 0.1, 0.3))} couleur={C.danger} />
                  <Visee r={{ x: ZONES_AVANT.offre.x * s, y: ZONES_AVANT.offre.y * s, l: ZONES_AVANT.offre.l * s, h: ZONES_AVANT.offre.h * s }} p={prog(t, b.p2 + 0.3, 0.4) * (1 - prog(t, b.p3, 0.3))} couleur={C.danger} />
                  <Marqueur n={1} x={ZONES_AVANT.texte.x * s} y={ZONES_AVANT.texte.y * s} taille={34 / zoom} p={prog(t, b.p1 + 0.3, 0.4, ease.lineaire) * (1 - prog(t, b.p3, 0.3))} />
                  <Marqueur n={2} x={ZONES_AVANT.offre.x * s} y={ZONES_AVANT.offre.y * s} taille={34 / zoom} p={prog(t, b.p2 + 0.35, 0.4, ease.lineaire) * (1 - prog(t, b.p3, 0.3))} />
                </div>
              </div>
              {chercher > 0 && (
                <>
                  <div style={{ position: "absolute", left: cx - 56, top: cy - 56, width: 112, height: 112, borderRadius: 99, border: `4px dashed ${C.danger}`, opacity: chercher, transform: `rotate(${(t - b.p3) * 90}deg)` }} />
                  <div style={{ position: "absolute", left: cx - 30, top: cy - 36, width: 60, textAlign: "center", fontFamily: "Inter", fontWeight: 800, fontSize: 52, color: C.danger, opacity: chercher, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>?</div>
                  <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 40, background: "linear-gradient(90deg, rgba(255,150,150,0), rgba(255,150,150,0.35))", opacity: chercher }} />
                </>
              )}
              <Toucher x={l * 0.5} y={h * (0.7 - 0.25 * prog(t, b.p3 + 0.9, 1.2, ease.doux))} p={prog(t, b.p3 + 0.8, 0.5)} visible={prog(t, b.p3 + 0.7, 0.2) * (1 - prog(t, b.p4 - 0.4, 0.3))} />
            </div>
          );
        }}
      </Appareil>
      <TitresProbleme t={t} b={b} entree={entree} />
    </>
  );
};

const TitresProbleme: React.FC<{ t: number; b: ReperesProbleme; entree: number }> = ({ t, b, entree }) => {
  const f = useFormat();
  const z = f.titre;
  const tailleSur = f.vertical ? 92 : 82;
  const puceTaille = f.vertical ? 40 : 40;
  const sortiePuces = prog(t, b.p4 - 0.05, 0.35, ease.entree);
  const ecart = f.vertical ? 84 : 92;
  const yPuces = f.vertical ? z.y + 6 : z.y + 40;
  return (
    <>
      <TitreCinetique t={t} lignes={[T.accroche.surtitre.split(" ").slice(0, 2).join(" "), T.accroche.surtitre.split(" ").slice(2).join(" ")]} debut={entree + 0.25} fin={b.q - 0.4} x={z.x} y={z.y} l={z.l} taille={tailleSur} />
      <TitreCinetique t={t} lignes={T.accroche.titre} debut={b.q} fin={b.p1 - 0.35} x={z.x} y={z.y} l={z.l} taille={z.taille} souligne={1} />
      {T.problemes.etiquettes.map((e, i) => {
        const d = [b.p1 + 0.1, b.p2 + 0.15, b.p3 + 0.25][i];
        const p = prog(t, d, 0.45, ease.lineaire) * (1 - sortiePuces);
        return <Puce key={e} texte={e} numero={i + 1} p={p} taille={puceTaille} style={{ left: z.x, top: yPuces + i * ecart }} />;
      })}
      <TitreCinetique t={t} lignes={T.problemes.conclusion} debut={b.p4 + 0.1} fin={b.fin - 0.45} x={z.x} y={z.y} l={z.l} taille={z.taille} souligne={1} />
    </>
  );
};
