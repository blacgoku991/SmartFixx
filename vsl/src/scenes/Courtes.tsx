// Scènes de la version courte et des accroches alternatives (maquettes fictives « Démonstration »).
import React from "react";
import { T } from "../lib/theme";
import { cles, ease, melangeRect, prog } from "../lib/anim";
import { useFormat } from "../lib/format";
import { Appareil, Pointeur, Toucher } from "../composants/Appareil";
import { MaquetteApres, MaquetteApresMobile, MaquetteAvant, ZONES_APRES } from "../composants/Maquettes";
import { TitreCinetique } from "../composants/Texte";
import { Transformation } from "../composants/Transformation";
import { Confirmation } from "./Design";
import { rectTelephone } from "./Probleme";

// Bouton « Envoyer » de la maquette mobile (pixels de la maquette 390 × 844).
export const ENVOYER_MOBILE = { x: 38, y: 588, l: 314, h: 46 };

const Avant: React.FC<{ l: number; flou?: number; largeurPage?: number }> = ({ l, flou = 0, largeurPage = 1440 }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#5E5E5E" }}>
    <MaquetteAvant l={(l * 1440) / largeurPage} flouOffre={flou} />
  </div>
);
const Apres: React.FC<{ l: number; envoi?: number }> = ({ l, envoi = 0 }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <MaquetteApres l={l} envoi={envoi} />
  </div>
);

// Version courte : accroche (contact introuvable) → transformation → téléphone, envoi.
// Repères : h0 accroche, c0 « SmartFixx crée ou modernise », c1 « clair sur mobile… », fin.
export const ActeCourte: React.FC<{ t: number; b: { h0: number; c0: number; c1: number; fin: number }; accrocheSeule?: boolean }> = ({ t, b, accrocheSeule }) => {
  const f = useFormat();
  if (t > b.fin + 0.6) return null;
  const z = f.titre;
  const pIn = prog(t, -0.3, 0.7, ease.sortie);
  const morph = accrocheSeule ? 0 : prog(t, b.c1, 0.75, ease.doux);
  const rect = melangeRect(f.navigateur, rectTelephone(f.vertical), morph);
  const pTransfo = accrocheSeule ? 0 : prog(t, b.c0 + 0.1, 1.2, ease.lineaire);
  const tTap = b.c1 + 0.55 * (b.fin - b.c1);
  const sortie = accrocheSeule ? 0 : prog(t, b.fin - 0.15, 0.4, ease.entree);
  return (
    <>
      <Appareil
        rect={{ ...rect, y: rect.y - sortie * 100 }}
        morph={morph}
        url={T.accroche.url}
        badge={1}
        inclinaisonX={(1 - pIn) * 22}
        echelle={(0.92 + 0.08 * pIn) * (1 - 0.3 * sortie)}
        opacite={pIn * (1 - sortie)}
      >
        {(l, h) => {
          // pointeur qui cherche le contact sur l'ancienne version
          const px = l * cles(t, [[0.4, 0.82], [1.2, 0.55], [1.9, 0.9], [2.6, 0.3], [3.4, 0.7]]);
          const py = h * cles(t, [[0.4, 0.12], [1.2, 0.08], [1.9, 0.62], [2.6, 0.85], [3.4, 0.4]]);
          const tapX = (ENVOYER_MOBILE.x + ENVOYER_MOBILE.l / 2) * (l / 390);
          const tapY = (ENVOYER_MOBILE.y + ENVOYER_MOBILE.h / 2) * (l / 390);
          return (
            <>
              <div style={{ position: "absolute", inset: 0, opacity: 1 - prog(t, b.c1 + 0.15, 0.45) }}>
                <Transformation p={pTransfo} l={l} h={h} avant={<Avant l={l} />} apres={<Apres l={l} />} />
              </div>
              {morph > 0 && (
                <div style={{ position: "absolute", inset: 0, opacity: prog(t, b.c1 + 0.15, 0.45) }}>
                  <MaquetteApresMobile l={l} />
                  <Toucher x={tapX} y={tapY} p={prog(t, tTap, 0.35, ease.lineaire)} visible={prog(t, tTap - 0.35, 0.15) * (1 - prog(t, tTap + 0.7, 0.2))} />
                  <Confirmation p={prog(t, tTap + 0.2, 0.4, ease.sortie)} l={l} h={h} />
                </div>
              )}
              <Pointeur x={px} y={py} visible={prog(t, 0.45, 0.2) * (1 - prog(t, b.c0, 0.2))} />
            </>
          );
        }}
      </Appareil>
      <TitreCinetique t={t} lignes={T.courte.titre} debut={Math.max(-0.3, b.h0 - 0.45)} fin={accrocheSeule ? undefined : b.c0 - 0.3} x={z.x} y={z.y} l={z.l} taille={z.taille} souligne={1} />
      {!accrocheSeule && (
        <>
          <TitreCinetique t={t} lignes={T.courte.transformation} debut={b.c0 + 0.05} fin={b.c1 - 0.3} x={z.x} y={z.y} l={z.l} taille={z.taille} souligne={1} />
          <TitreCinetique t={t} lignes={T.courte.mobile} debut={b.c1 + 0.05} fin={b.fin - 0.35} x={z.x} y={z.y} l={z.l} taille={z.taille} souligne={1} />
        </>
      )}
    </>
  );
};

// Accroche 2 : sur mobile, l'offre se lit-elle d'un coup d'œil ?
export const ActeA2: React.FC<{ t: number; debut: number; fin: number }> = ({ t, debut, fin }) => {
  const f = useFormat();
  const z = f.titre;
  const pIn = prog(t, -0.3, 0.6, ease.sortie);
  const pFlip = prog(t, debut + 0.6 * (fin - debut), 0.9, ease.lineaire);
  const flou = 0.55 + 0.45 * Math.sin(t * 5) ** 2;
  return (
    <>
      <Appareil rect={rectTelephone(f.vertical)} morph={1} badge={1} inclinaisonY={(1 - pIn) * -30} echelle={0.9 + 0.1 * pIn} opacite={pIn}>
        {(l, h) => (
          <>
            <Transformation p={pFlip} l={l} h={h} colonnes={4} lignes={8} avant={<Avant l={l} flou={flou} largeurPage={980} />} apres={<MaquetteApresMobile l={l} />} />
          </>
        )}
      </Appareil>
      <TitreCinetique t={t} lignes={T.accroches.A2.titre} debut={Math.max(-0.3, debut - 0.45)} x={z.x} y={z.y} l={z.l} taille={z.taille} souligne={1} />
    </>
  );
};

// Accroche 3 : un site clair, et l'on sait où écrire.
export const ActeA3: React.FC<{ t: number; debut: number; fin: number }> = ({ t, debut, fin }) => {
  const f = useFormat();
  const z = f.titre;
  const pIn = prog(t, -0.3, 0.6, ease.sortie);
  const pFlip = prog(t, debut + 0.15, 1.0, ease.lineaire);
  const tClic = debut + 0.72 * (fin - debut);
  return (
    <>
      <Appareil rect={f.navigateur} url={T.accroche.url} badge={1} inclinaisonX={(1 - pIn) * 22} echelle={0.92 + 0.08 * pIn} opacite={pIn}>
        {(l, h) => {
          const s = l / 1440;
          const ex = (ZONES_APRES.envoyer.x + ZONES_APRES.envoyer.l * 0.6) * s;
          const ey = (ZONES_APRES.envoyer.y + ZONES_APRES.envoyer.h * 0.5) * s;
          const p = prog(t, tClic - 0.9, 0.85, ease.doux);
          return (
            <>
              <Transformation p={pFlip} l={l} h={h} avant={<Avant l={l} />} apres={<Apres l={l} envoi={prog(t, tClic, 0.5, ease.lineaire)} />} />
              <Pointeur x={l * 0.62 + (ex - l * 0.62) * p} y={h * 0.95 + (ey - h * 0.95) * p} visible={prog(t, tClic - 1.0, 0.2)} clic={prog(t, tClic, 0.3, ease.lineaire)} />
            </>
          );
        }}
      </Appareil>
      <TitreCinetique t={t} lignes={[T.accroches.A3.titre[0]]} debut={Math.max(-0.3, debut - 0.45)} x={z.x} y={z.y} l={z.l} taille={z.taille * 0.9} />
      <TitreCinetique t={t} lignes={[T.accroches.A3.titre[1]]} debut={debut + 0.45 * (fin - debut)} x={z.x} y={z.y + z.taille * 0.9} l={z.l} taille={z.taille * 0.9} souligne={0} />
    </>
  );
};
