/* Panel (lot 6) : formats d'affichage. Aucun calcul métier : la cadence réelle reste sendingRate(). */
export const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

const trim = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: n < 10 ? 1 : 0 }).format(n);

/* Cadence lisible : « 1 email toutes les 30 s », « 1 email toutes les 2 min », « 3 emails par seconde ».
   Jamais un flottant brut (0.03333333333333333). */
export function cadenceLabel(rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0) return "cadence à régler";
  if (rate >= 1) {
    const r = Math.round(rate * 10) / 10;
    return r === 1 ? "1 email par seconde" : `${trim(r)} emails par seconde`;
  }
  const seconds = 1 / rate;
  if (seconds < 90) return `1 email toutes les ${trim(Math.round(seconds * 10) / 10)} s`;
  if (seconds < 5400) return `1 email toutes les ${trim(Math.round(seconds / 6) / 10)} min`;
  return `1 email toutes les ${trim(Math.round(seconds / 360) / 10)} h`;
}

/* Une ligne : « 1 email toutes les 30 s · 2 880 par jour au plus à cette cadence ». */
export function cadencePerDay(rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0) return "";
  return `${fmt(Math.floor(rate * 86400))} par jour au plus à cette cadence`;
}

export const plural = (n: number, one: string, many: string) => (n > 1 ? many : one);
