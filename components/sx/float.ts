/* Occupants flottants du bas de l'écran (consentement, barre d'action mobile). Chacun déclare sa hauteur ;
   --sx-float-h vaut la plus grande, pour scroll-padding-bottom, le pied de page et les éléments fixes.
   Écrite seulement quand la valeur change : une propriété personnalisée posée sur <html> est héritée par
   tous les éléments, et chaque écriture recalcule le style de toute la page (mesuré, tour 3 bis). */
const heights = new Map<string, number>();
let last = "";
export function setFloat(key: string, height: number) {
  if (typeof document === "undefined") return;
  if (height > 0) heights.set(key, Math.ceil(height)); else heights.delete(key);
  const value = `${Math.max(0, ...heights.values())}px`;
  if (value === last) return;
  last = value;
  document.documentElement.style.setProperty("--sx-float-h", value);
}
