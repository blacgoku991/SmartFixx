/* Occupants flottants du bas de l'écran (consentement, barre d'action mobile). Chacun déclare sa hauteur ;
   --sx-float-h vaut la plus grande, pour scroll-padding-bottom, le pied de page et les éléments fixes. */
const heights = new Map<string, number>();
export function setFloat(key: string, height: number) {
  if (typeof document === "undefined") return;
  if (height > 0) heights.set(key, Math.ceil(height)); else heights.delete(key);
  const max = Math.max(0, ...heights.values());
  document.documentElement.style.setProperty("--sx-float-h", `${max}px`);
}
