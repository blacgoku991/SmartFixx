// Miniature fixe (9:16 et 16:9) : titre, captures réelles du site refait, marque et ville allumée.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, CAPTURES, M, P, T } from "../lib/theme";
import { FormatProvider, useFormat } from "../lib/format";
import { Polices } from "../lib/polices";
import { Ciel } from "../composants/Ciel";
import { Appareil, CaptureDefilante } from "../composants/Appareil";
import { TitreCinetique } from "../composants/Texte";
import { Marque } from "../scenes/Final";

const cleDe = (fichier: string) => Object.keys(CAPTURES).find((k) => CAPTURES[k].fichier === fichier) ?? fichier;

const Contenu: React.FC = () => {
  const f = useFormat();
  const t = 30; // tous les éléments à leur état final
  const desktop = CAPTURES[cleDe(M.siteDesktop)];
  const page = CAPTURES[M.pageFormulaireMobileCle];
  if (f.vertical) {
    return (
      <>
        <Ciel t={t} allumage={[[0, 0.3]]} ambre={0} />
        <TitreCinetique t={t} lignes={T.miniature.titre} debut={0} x={72} y={300} l={940} taille={150} souligne={2} />
        <Appareil rect={{ x: 70, y: 820, l: 780, h: 540 }} url="smartfixx.fr" inclinaisonY={-8}>
          {(l) => <CaptureDefilante capture={desktop} l={l} />}
        </Appareil>
        <Appareil rect={{ x: 640, y: 960, l: 330, h: 690 }} morph={1} inclinaisonY={-6}>
          {(l) => <CaptureDefilante capture={page} l={l} defilement={560} />}
        </Appareil>
        <Marque t={t} debut={0} tailleLogo={110} tailleNom={84} colonne={false} style={{ left: 72, top: 1450 }} />
        {/* signature limitée à la zone libre à gauche du téléphone (x < 640), une ligne par partie « · » */}
        <div style={{ position: "absolute", left: 72, top: 1580, width: 540, fontFamily: P.texte, fontWeight: 700, fontSize: 34, lineHeight: 1.3, color: C.texteDoux }}>
          {T.miniature.sous.split(" · ").map((ligne) => (
            <div key={ligne}>{ligne}</div>
          ))}
        </div>
      </>
    );
  }
  return (
    <>
      <Ciel t={t} allumage={[[0, 0.3]]} ambre={0} />
      <TitreCinetique t={t} lignes={T.miniature.titre} debut={0} x={110} y={150} l={800} taille={138} souligne={2} />
      <Marque t={t} debut={0} tailleLogo={100} tailleNom={80} colonne={false} style={{ left: 110, top: 640 }} />
      <div style={{ position: "absolute", left: 110, top: 770, fontFamily: P.texte, fontWeight: 700, fontSize: 32, color: C.texteDoux }}>{T.miniature.sous}</div>
      <Appareil rect={{ x: 900, y: 150, l: 860, h: 593 }} url="smartfixx.fr" inclinaisonY={-10}>
        {(l) => <CaptureDefilante capture={desktop} l={l} />}
      </Appareil>
      <Appareil rect={{ x: 1500, y: 360, l: 320, h: 670 }} morph={1} inclinaisonY={-8}>
        {(l) => <CaptureDefilante capture={page} l={l} defilement={560} />}
      </Appareil>
    </>
  );
};

export const Miniature: React.FC<{ vertical: boolean }> = ({ vertical }) => (
  <FormatProvider vertical={vertical}>
    <Polices>
      <AbsoluteFill style={{ background: C.fond, overflow: "hidden" }}>
        <Contenu />
      </AbsoluteFill>
    </Polices>
  </FormatProvider>
);
