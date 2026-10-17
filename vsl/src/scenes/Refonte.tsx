// Acte 3 — « Vous avez déjà un site ? » : la maquette fictive est repensée, les outils sont connectés,
// et une demande (fictive) arrive dans le tableau de suivi pendant qu'une fenêtre ambre s'allume en ville.
// Repères : r0 question, r1 « peut le repenser », r2 « connecter vos outils », r3 « tableau de suivi », fin.
import React from "react";
import { C, P, T } from "../lib/theme";
import { ease, melange, melangeRect, prog, type Rect } from "../lib/anim";
import { useFormat } from "../lib/format";
import { Appareil } from "../composants/Appareil";
import { MaquetteApres, MaquetteAvant, ZONES_APRES, APRES_HAUTEUR } from "../composants/Maquettes";
import { PanelDemo, PANEL_HAUTEUR, PANEL_LARGEUR, ZONES_PANEL } from "../composants/Panel";
import { TitreCinetique } from "../composants/Texte";
import { Transformation } from "../composants/Transformation";

export type ReperesRefonte = { r0: number; r1: number; r2: number; r3: number; fin: number };

const Icone: React.FC<{ type: number; taille: number }> = ({ type, taille }) => {
  const c = C.texte;
  if (type === 0)
    return (
      <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
        <rect x="5" y="3" width="14" height="18" rx="2.5" />
        <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
      </svg>
    );
  if (type === 1)
    return (
      <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinejoin="round">
        <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
        <path d="M3.5 7l8.5 6.5L20.5 7" />
      </svg>
    );
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M9 9.5V20" />
    </svg>
  );
};

export function rectsRefonte(vertical: boolean) {
  return vertical
    ? {
        carte: { x: 70, y: 340, l: 470, h: 340 } as Rect,
        noeuds: [
          { x: 190, y: 900 },
          { x: 500, y: 900 },
          { x: 810, y: 900 },
        ],
        panel: { x: 72, y: 640, l: 880, h: (880 * PANEL_HAUTEUR) / PANEL_LARGEUR } as Rect,
        titreOutils: { x: 572, y: 372, l: 420, taille: 80 },
      }
    : {
        carte: { x: 120, y: 120, l: 640, h: 446 } as Rect,
        noeuds: [
          { x: 1010, y: 340 },
          { x: 1320, y: 340 },
          { x: 1630, y: 340 },
        ],
        panel: { x: 860, y: 150, l: 960, h: (960 * PANEL_HAUTEUR) / PANEL_LARGEUR } as Rect,
        titreOutils: { x: 120, y: 640, l: 700, taille: 104 },
      };
}

export const ActeRefonte: React.FC<{ t: number; b: ReperesRefonte }> = ({ t, b }) => {
  const f = useFormat();
  if (t < b.r0 - 0.2 || t > b.fin + 0.6) return null;
  const R = rectsRefonte(f.vertical);
  const z = f.titre;
  const nav = f.navigateur;

  // Navigateur : entre, se transforme, devient une carte
  const pIn = prog(t, b.r1 - 0.4, 0.6, ease.sortie);
  const pCarte = prog(t, b.r2, 0.7, ease.doux);
  const pSortieCarte = prog(t, b.r3 - 0.05, 0.4, ease.entree);
  const rect = melangeRect(nav, R.carte, pCarte);
  const pTransfo = prog(t, b.r1 + 0.15, 1.35, ease.lineaire);
  const envoi = prog(t, b.r2 + 0.55, 0.5, ease.lineaire);

  // Chemin de la demande : bouton Envoyer → nœuds → tableau
  const barre = rect.l > 800 ? 56 : 46;
  const sCarte = R.carte.l / 1440;
  const depart = { x: R.carte.x + (ZONES_APRES.envoyer.x + ZONES_APRES.envoyer.l / 2) * sCarte, y: R.carte.y + barre + (ZONES_APRES.envoyer.y + ZONES_APRES.envoyer.h / 2) * sCarte };
  const pts = [depart, ...R.noeuds];
  const longueurs = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = longueurs.reduce((a, b2) => a + b2, 0);
  const pTrace = prog(t, b.r2 + 0.75, Math.max(0.6, b.r3 - b.r2 - 1.0), ease.doux);
  const pointSur = (p: number) => {
    let d = p * total;
    for (let i = 0; i < longueurs.length; i++) {
      if (d <= longueurs[i]) {
        const k = d / longueurs[i];
        return { x: melange(pts[i].x, pts[i + 1].x, k), y: melange(pts[i].y, pts[i + 1].y, k) };
      }
      d -= longueurs[i];
    }
    return pts[pts.length - 1];
  };
  const chemin = `M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
  const noeudsOp = prog(t, b.r2 + 0.5, 0.4) * (1 - prog(t, b.r3 + 0.15, 0.35));

  // Tableau de suivi
  const pPanel = prog(t, b.r3 - 0.1, 0.65, ease.sortie);
  const pArrivee = prog(t, b.r3 + 0.45, 0.7, ease.lineaire);
  const flash = Math.max(0, Math.sin(Math.min(1, prog(t, b.r3 + 0.6, 1.2, ease.lineaire)) * Math.PI));
  const sortie = prog(t, b.fin - 0.35, 0.45, ease.entree);
  const dernier = R.noeuds[R.noeuds.length - 1];
  const sPanel = R.panel.l / PANEL_LARGEUR;
  const cibleLigne = { x: R.panel.x + (ZONES_PANEL.nouvelle.x + 120) * sPanel, y: R.panel.y + (ZONES_PANEL.nouvelle.y + 48) * sPanel };
  const pSaut = prog(t, b.r3 + 0.05, 0.45, ease.doux);
  const paquet =
    t < b.r3 + 0.05
      ? pointSur(pTrace)
      : { x: melange(dernier.x, cibleLigne.x, pSaut), y: melange(dernier.y, cibleLigne.y, pSaut) - Math.sin(pSaut * Math.PI) * 80 };
  const paquetOp = prog(t, b.r2 + 0.75, 0.2) * (1 - prog(t, b.r3 + 0.45, 0.2));

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - sortie, transform: `translateY(${-sortie * 60}px)` }}>
      <TitreCinetique t={t} lignes={T.refonte.question} debut={b.r0 + 0.02} fin={b.r1 - 0.5} x={0} y={f.vertical ? 560 : 300} l={f.W} taille={f.vertical ? 230 : 250} aligne="center" souligne={1} pas={0.08} />

      {pIn > 0 && pSortieCarte < 1 && (
        <Appareil
          rect={{ ...rect, y: rect.y + (1 - pIn) * 380 }}
          url={T.accroche.url}
          badge={1}
          inclinaisonX={(1 - pIn) * 30}
          echelle={melange(0.85, 1, pIn) * (1 - 0.15 * pSortieCarte)}
          opacite={pIn * (1 - pSortieCarte)}
        >
          {(l, h) => (
            <Transformation
              p={pTransfo}
              l={l}
              h={h}
              avant={
                <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                  <MaquetteAvant l={l} />
                </div>
              }
              apres={
                <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, width: l, height: (APRES_HAUTEUR * l) / 1440 }}>
                    <MaquetteApres l={l} envoi={envoi} />
                  </div>
                </div>
              }
            />
          )}
        </Appareil>
      )}
      <TitreCinetique t={t} lignes={T.refonte.repense} debut={b.r1 + 0.55} fin={b.r2 - 0.3} x={z.x} y={z.y} l={z.l} taille={z.taille * 1.15} souligne={0} />
      <TitreCinetique
        t={t}
        lignes={T.refonte.outilsTitre}
        debut={b.r2 + 0.35}
        fin={b.r3 - 0.3}
        x={R.titreOutils.x}
        y={R.titreOutils.y}
        l={R.titreOutils.l}
        taille={R.titreOutils.taille}
        souligne={1}
      />

      {/* outils connectés */}
      {noeudsOp > 0 && (
        <svg width={f.W} height={f.H} style={{ position: "absolute", inset: 0, opacity: noeudsOp }}>
          <path d={chemin} stroke="rgba(142,162,255,0.25)" strokeWidth={4} fill="none" strokeDasharray="10 12" />
          <path d={chemin} stroke={C.accent} strokeWidth={5} fill="none" strokeDasharray={`${total} ${total}`} strokeDashoffset={total * (1 - pTrace)} strokeLinecap="round" />
        </svg>
      )}
      {R.noeuds.map((n, i) => {
        const p = prog(t, b.r2 + 0.5 + i * 0.18, 0.5, ease.lineaire) * (1 - prog(t, b.r3 + 0.15, 0.35));
        const atteint = pTrace >= (i === 0 ? 0.35 : i === 1 ? 0.68 : 0.98);
        const r = f.vertical ? 74 : 70;
        if (p <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: n.x - r, top: n.y - r, width: r * 2, opacity: Math.min(1, p * 1.5), transform: `scale(${0.5 + 0.5 * ease.ressort(Math.min(1, p))})` }}>
            <div
              style={{
                width: r * 2,
                height: r * 2,
                borderRadius: 999,
                background: atteint ? C.accentFort : C.surface2,
                border: `3px solid ${atteint ? C.accent : "rgba(142,162,255,0.35)"}`,
                boxShadow: atteint ? `0 0 50px rgba(67,97,255,0.7)` : "0 20px 40px -20px rgba(0,0,0,0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icone type={i} taille={r * 0.9} />
            </div>
            <div style={{ position: "absolute", left: -80, width: r * 2 + 160, top: r * 2 + 14, textAlign: "center", fontFamily: P.texte, fontWeight: 800, fontSize: f.vertical ? 30 : 28, color: C.texte, whiteSpace: "nowrap" }}>
              {T.refonte.outils[i]}
            </div>
          </div>
        );
      })}

      {/* tableau de suivi */}
      {pPanel > 0 && (
        <div
          style={{
            position: "absolute",
            left: R.panel.x,
            top: R.panel.y + (1 - pPanel) * 260,
            width: R.panel.l,
            height: R.panel.h,
            borderRadius: 26,
            overflow: "hidden",
            opacity: Math.min(1, pPanel * 1.4),
            border: "1.5px solid rgba(142,162,255,0.28)",
            boxShadow: `0 60px 120px -40px rgba(0,0,0,0.9), 0 0 ${80 + 60 * flash}px -20px rgba(${flash > 0.05 ? "255,182,72" : "67,97,255"},${0.35 + 0.25 * flash})`,
            transform: `perspective(2400px) rotateX(${(1 - pPanel) * 18}deg)`,
          }}
        >
          <PanelDemo l={R.panel.l} arrivee={pArrivee} flash={flash} />
        </div>
      )}
      <TitreCinetique t={t} lignes={T.refonte.suivi} debut={b.r3 + 0.2} fin={b.fin - 0.4} x={z.x} y={z.y} l={z.l} taille={z.taille} souligne={1} />

      {paquetOp > 0 && (
        <div
          style={{
            position: "absolute",
            left: paquet.x - 16,
            top: paquet.y - 16,
            width: 32,
            height: 32,
            borderRadius: 99,
            background: "#FFFFFF",
            boxShadow: `0 0 24px 8px ${C.accent}, 0 0 60px 20px rgba(67,97,255,0.6)`,
            opacity: paquetOp,
          }}
        />
      )}
    </div>
  );
};

export const instantAmbre = (b: ReperesRefonte) => b.r3 + 0.62;
