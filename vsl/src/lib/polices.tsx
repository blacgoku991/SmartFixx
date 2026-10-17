// Chargement des polices avant la première image (SFX Display pour les titres, Inter pour le texte).
import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

const FACES: [string, string, string][] = [
  ["SFX Display", "sfx-display-92.v1.woff2", "700"],
  ["SFX Display Etroit", "sfx-display-82.v1.woff2", "700"],
  ["Inter", "inter-latin-400-normal.woff2", "400"],
  ["Inter", "inter-latin-600-normal.woff2", "600"],
  ["Inter", "inter-latin-700-normal.woff2", "700"],
  ["Inter", "inter-latin-800-normal.woff2", "800"],
];

let chargement: Promise<void> | null = null;
function charger() {
  if (!chargement) {
    chargement = Promise.all(
      FACES.map(async ([famille, fichier, graisse]) => {
        const f = new FontFace(famille, `url(${staticFile("polices/" + fichier)}) format("woff2")`, { weight: graisse });
        await f.load();
        document.fonts.add(f);
      }),
    ).then(() => undefined);
  }
  return chargement;
}

export const Polices: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [poignee] = useState(() => delayRender("Chargement des polices"));
  const [pret, setPret] = useState(false);
  useEffect(() => {
    charger().then(() => {
      setPret(true);
      continueRender(poignee);
    });
  }, [poignee]);
  return pret ? <>{children}</> : null;
};
