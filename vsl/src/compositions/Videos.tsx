// Montages : chaque vidéo relie les scènes aux repères de vsl/audio/minutage.json.
import React from "react";
import { AbsoluteFill, Audio, getRemotionEnvironment, staticFile, useCurrentFrame } from "remotion";
import { C } from "../lib/theme";
import { ease, prog } from "../lib/anim";
import { FormatProvider, useFormat } from "../lib/format";
import { Polices } from "../lib/polices";
import { FPS, montage, reperes, type NomMontage } from "../lib/temps";
import { Ciel } from "../composants/Ciel";
import { SousTitres } from "../composants/Texte";
import { ActeProbleme } from "../scenes/Probleme";
import { ActeDesign } from "../scenes/Design";
import { ActeRefonte, instantAmbre } from "../scenes/Refonte";
import { ActeFinal } from "../scenes/Final";
import { ActeA2, ActeA3, ActeCourte } from "../scenes/Courtes";

// Mixage de référence, entendu seulement dans le studio (le rendu final pose l'audio avec ffmpeg).
const AudioStudio: React.FC<{ nom: NomMontage }> = ({ nom }) =>
  getRemotionEnvironment().isStudio ? <Audio src={staticFile(`audio/smartfixx-vsl-${nom}-mix.wav`)} /> : null;

// Variante « Reels » (9:16) : Meta recommande de laisser libres les 35 % du bas (légende et bouton de
// l'annonce). Le ciel et la ville restent plein cadre ; titres, appareils et sous-titres sont réduits
// autour d'un point placé sous les 15 % du haut, ce qui remonte le bas des sous-titres à 1 237 px.
export const REELS = { echelle: 0.825, origineX: 540, origineY: 300 };

const Cadre: React.FC<{ vertical: boolean; nom: NomMontage; reels?: boolean; fond: (t: number) => React.ReactNode; children: (t: number) => React.ReactNode }> = ({ vertical, nom, reels = false, fond, children }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const premierPlan = (
    <>
      {children(t)}
      <SousTitres t={t} nom={nom} />
    </>
  );
  return (
    <FormatProvider vertical={vertical}>
      <Polices>
        <AbsoluteFill style={{ background: C.fond, overflow: "hidden" }}>
          {fond(t)}
          {reels ? (
            <div style={{ position: "absolute", inset: 0, transform: `scale(${REELS.echelle})`, transformOrigin: `${REELS.origineX}px ${REELS.origineY}px` }}>{premierPlan}</div>
          ) : (
            premierPlan
          )}
          <AudioStudio nom={nom} />
        </AbsoluteFill>
      </Polices>
    </FormatProvider>
  );
};

// Balayage lumineux entre deux actes : la ligne descend, l'acte suivant apparaît au-dessus.
const Balayage: React.FC<{ t: number; debut: number; duree?: number; avant: React.ReactNode; apres: React.ReactNode }> = ({ t, debut, duree = 0.6, avant, apres }) => {
  const { W, H } = useFormat();
  const p = prog(t, debut, duree, ease.doux);
  const y = p * (H + 160) - 80;
  if (p <= 0) return <>{avant}</>;
  if (p >= 1) return <>{apres}</>;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${Math.max(0, y)}px 0 0 0)` }}>{avant}</div>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${Math.max(0, H - y)}px 0)` }}>{apres}</div>
      <div style={{ position: "absolute", left: 0, width: W, top: y - 140, height: 140, background: "linear-gradient(180deg, rgba(142,162,255,0), rgba(142,162,255,0.22))" }} />
      <div style={{ position: "absolute", left: 0, width: W, top: y - 2, height: 4, background: "#FFFFFF", boxShadow: `0 0 30px 8px ${C.accent}, 0 0 80px 20px rgba(67,97,255,0.55)` }} />
    </>
  );
};

// ——— VSL principale (9:16 ou 16:9) : première image déjà composée (pas d'ouverture au noir) ———
export const Principale: React.FC<{ vertical: boolean; reels?: boolean }> = ({ vertical, reels }) => {
  const nom: NomMontage = "principale";
  const m = montage(nom);
  const [P1, P2, P3, P4, P5, P6, P7] = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"].map((id) => reperes(nom, id));
  const bP = { q: P1.c[1], p1: P2.c[0], p2: P2.c[0] + 0.58 * (P2.c[1] - P2.c[0]), p3: P2.c[1], p4: P2.c[2], fin: P3.c[0] };
  const bD = { d0: P3.c[0], d1: P3.c[1], d2: P3.c[2], f0: P4.c[0], fin: P5.c[0] };
  const bR = { r0: P5.c[0], r1: P6.c[0], r2: P6.c[1], r3: P6.c[2], fin: P7.c[0] };
  const bF = { e0: P7.c[0], e1: P7.c[1] };
  return (
    <Cadre
      vertical={vertical}
      nom={nom}
      reels={reels}
      fond={(t) => (
        <Ciel
          t={t}
          allumage={[
            [0, 0.015],
            [bR.r0, 0.05],
            [bR.r3, 0.09],
            [bF.e0 + 0.5, 0.2],
            [m.duree_s, 0.3],
          ]}
          ambre={instantAmbre(bR)}
          decalageX={-t * 7}
          descente={(1 - prog(t, 0, 2.2, ease.sortie)) * 140 - prog(t, bF.e0 - 0.3, 1.4, ease.doux) * 50}
        />
      )}
    >
      {(t) => (
        <>
          {/* entrée avancée : à la première image, le navigateur, la maquette et le surtitre sont déjà en place */}
          <Balayage t={t} debut={bD.d0 - 0.32} avant={<ActeProbleme t={t} b={bP} entree={-1.75} />} apres={<ActeDesign t={t} b={bD} />} />
          <ActeRefonte t={t} b={bR} />
          <ActeFinal t={t} b={bF} />
        </>
      )}
    </Cadre>
  );
};

// ——— Version courte 15 s (9:16) : première image déjà composée (usage publicitaire) ———
export const Courte: React.FC<{ reels?: boolean }> = ({ reels }) => {
  const nom: NomMontage = "courte";
  const m = montage(nom);
  const [A1, C2, P7] = ["A1", "C2", "P7"].map((id) => reperes(nom, id));
  const bC = { h0: A1.c[0], c0: C2.c[0], c1: C2.c[1], fin: P7.c[0] };
  const bF = { e0: P7.c[0], e1: P7.c[1] };
  return (
    <Cadre
      vertical
      nom={nom}
      reels={reels}
      fond={(t) => <Ciel t={t} allumage={[[0, 0.02], [bC.c1, 0.07], [bF.e0 + 0.4, 0.2], [m.duree_s, 0.3]]} ambre={bF.e0 - 0.15} decalageX={-t * 8} descente={(1 - prog(t, 0, 1.6, ease.sortie)) * 120 - prog(t, bF.e0 - 0.3, 1.2, ease.doux) * 50} />}
    >
      {(t) => (
        <>
          <ActeCourte t={t} b={bC} />
          <ActeFinal t={t} b={bF} />
        </>
      )}
    </Cadre>
  );
};

// ——— Accroches alternatives (9:16, 3 à 4 s) ———
export const Accroche: React.FC<{ numero: 1 | 2 | 3; reels?: boolean }> = ({ numero, reels }) => {
  const nom = `accroche-${numero}` as NomMontage;
  const m = montage(nom);
  const s = m.segments[0];
  return (
    <Cadre vertical nom={nom} reels={reels} fond={(t) => <Ciel t={t} allumage={[[0, 0.03], [m.duree_s, 0.06]]} decalageX={-t * 9} descente={(1 - prog(t, 0, 1.2, ease.sortie)) * 90} />}>
      {(t) => (
        <>
          {numero === 1 && <ActeCourte t={t} b={{ h0: s.cartons[0].debut_s, c0: 99, c1: 99, fin: 99 }} accrocheSeule />}
          {numero === 2 && <ActeA2 t={t} debut={s.cartons[0].debut_s} fin={m.duree_s} />}
          {numero === 3 && <ActeA3 t={t} debut={s.cartons[0].debut_s} fin={m.duree_s} />}
        </>
      )}
    </Cadre>
  );
};
