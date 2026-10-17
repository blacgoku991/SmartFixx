// Liste des exports : composition Remotion → fichier livré, montage audio et sous-titres associés.
export const VIDEOS = [
  { id: "principale-9x16", montage: "principale" },
  { id: "principale-16x9", montage: "principale" },
  { id: "courte-15s-9x16", montage: "courte" },
  { id: "accroche-1-9x16", montage: "accroche-1" },
  { id: "accroche-2-9x16", montage: "accroche-2" },
  { id: "accroche-3-9x16", montage: "accroche-3" },
  // Variantes Reels (Meta) : même montage, premier plan réduit, bas des sous-titres à 1 237 px (35 % du bas libres)
  { id: "principale-reels-9x16", montage: "principale", reels: true },
  { id: "courte-15s-reels-9x16", montage: "courte", reels: true },
  { id: "accroche-1-reels-9x16", montage: "accroche-1", reels: true },
  { id: "accroche-2-reels-9x16", montage: "accroche-2", reels: true },
  { id: "accroche-3-reels-9x16", montage: "accroche-3", reels: true },
];
export const MINIATURES = ["miniature-9x16", "miniature-16x9"];
export const fichierVideo = (id) => `smartfixx-vsl-${id}.mp4`;
export const fichierSrt = (id) => `smartfixx-vsl-${id}.srt`;
export const fichierMiniature = (id) => `smartfixx-vsl-${id}.jpg`;
