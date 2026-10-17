// Format de la composition (vertical 9:16 ou paysage 16:9) et zones utiles.
import React, { createContext, useContext } from "react";
import type { Rect } from "./anim";

export type Format = {
  vertical: boolean;
  W: number;
  H: number;
  // Zone où placer l'essentiel (9:16 : ni les 15 % du haut, ni les 25 % du bas, ni la colonne d'icônes à droite).
  sure: Rect;
  // Rectangles des appareils et des titres pour ce format.
  navigateur: Rect;
  telephone: Rect;
  titre: { x: number; y: number; l: number; taille: number; aligne: "left" | "center" };
  sousTitres: { centreX: number; bas: number; largeurMax: number; taille: number };
};

const VERTICAL: Format = {
  vertical: true,
  W: 1080,
  H: 1920,
  sure: { x: 60, y: 288, l: 880, h: 1152 },
  navigateur: { x: 72, y: 604, l: 896, h: 616 },
  telephone: { x: 318, y: 312, l: 444, h: 930 },
  titre: { x: 72, y: 318, l: 900, taille: 118, aligne: "left" },
  sousTitres: { centreX: 505, bas: 1436, largeurMax: 880, taille: 48 },
};

const PAYSAGE: Format = {
  vertical: false,
  W: 1920,
  H: 1080,
  sure: { x: 96, y: 54, l: 1728, h: 972 },
  navigateur: { x: 850, y: 120, l: 960, h: 653 },
  telephone: { x: 1150, y: 70, l: 380, h: 800 },
  titre: { x: 120, y: 280, l: 700, taille: 112, aligne: "left" },
  sousTitres: { centreX: 960, bas: 1028, largeurMax: 1400, taille: 44 },
};

const Ctx = createContext<Format>(VERTICAL);
export const FormatProvider: React.FC<{ vertical: boolean; children: React.ReactNode }> = ({ vertical, children }) => (
  <Ctx.Provider value={vertical ? VERTICAL : PAYSAGE}>{children}</Ctx.Provider>
);
export const useFormat = () => useContext(Ctx);
