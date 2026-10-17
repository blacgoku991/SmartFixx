// Lecture du minutage (vsl/audio/minutage.json, généré par audio/outils/minutage.mjs).
// Tous les temps des scènes en dérivent : changer une prise de voix recale l'image.
import minutage from "../../audio/minutage.json";

export const FPS = 30;

export type Carton = { debut_s: number; fin_s: number; lignes: string[] };
export type Segment = { id: string; debut_s: number; fin_s: number; cartons: Carton[]; statut: string };
export type Montage = {
  duree_s: number;
  voix_debut_s: number;
  voix_fin_s: number;
  ecran_final_debut_s?: number;
  provisoire: boolean;
  segments: Segment[];
  sous_titres: (Carton & { index: number })[];
};
export type NomMontage = "principale" | "courte" | "accroche-1" | "accroche-2" | "accroche-3";

export function montage(nom: NomMontage): Montage {
  const m = (minutage as unknown as { montages: Record<string, Montage> }).montages[nom];
  if (!m) throw new Error(`Montage ${nom} absent de minutage.json`);
  return m;
}

export function dureeImages(nom: NomMontage): number {
  return Math.round(montage(nom).duree_s * FPS);
}

// Repères d'un segment : début, fin et début de chaque carton (secondes).
export type Reperes = { debut: number; fin: number; c: number[] };
export function reperes(nom: NomMontage, id: string): Reperes {
  const s = montage(nom).segments.find((x) => x.id === id);
  if (!s) throw new Error(`Segment ${id} absent du montage ${nom}`);
  return { debut: s.debut_s, fin: s.fin_s, c: s.cartons.map((c) => c.debut_s) };
}
