import theme from "../donnees/theme.json";
import textes from "../donnees/textes.json";
import medias from "../donnees/medias.json";
import captures from "../../public/captures/captures.json";

export const C = theme.couleurs;
export const P = {
  titre: `'${theme.polices.titre}', 'Inter', sans-serif`,
  titreEtroit: `'${theme.polices.titreEtroit}', 'Inter', sans-serif`,
  texte: `'${theme.polices.texte}', 'DejaVu Sans', sans-serif`,
  // police des captures du site (system-ui rendu par Chromium sous Linux)
  site: "system-ui, 'DejaVu Sans', sans-serif",
};
export const T = textes;
export const M = medias;
export type ChampCapture = { x: number; y: number; l: number; h: number } | null;
export type Capture = { fichier: string; largeur: number; hauteur: number; dpr: number; champs?: Record<string, ChampCapture> };
export const CAPTURES = (captures as unknown as { captures: Record<string, Capture> }).captures;
