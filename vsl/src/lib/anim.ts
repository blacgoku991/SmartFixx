// Outils d'animation : images clés en secondes, courbes, interpolation de rectangles.
import { Easing, interpolate } from "remotion";

export const ease = {
  sortie: Easing.bezier(0.16, 1, 0.3, 1), // départ vif, arrivée douce
  entree: Easing.bezier(0.7, 0, 0.84, 0),
  doux: Easing.bezier(0.45, 0, 0.2, 1),
  ressort: Easing.bezier(0.34, 1.56, 0.64, 1), // léger dépassement
  lineaire: (x: number) => x,
};

// Progression 0 → 1 entre deux instants (secondes), avec courbe.
export function prog(t: number, debut: number, duree: number, courbe: (x: number) => number = ease.sortie): number {
  if (duree <= 0) return t >= debut ? 1 : 0;
  return interpolate(t, [debut, debut + duree], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: courbe });
}

// Images clés : [[t, valeur, courbe?], ...] — la courbe s'applique au tronçon qui arrive à ce point.
export type Cle = [number, number, ((x: number) => number)?];
export function cles(t: number, k: Cle[]): number {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    const [t1, v1, c] = k[i];
    const [t0, v0] = k[i - 1];
    if (t <= t1) {
      if (t1 === t0) return v1;
      const p = (c ?? ease.doux)((t - t0) / (t1 - t0));
      return v0 + (v1 - v0) * p;
    }
  }
  return k[k.length - 1][1];
}

export type Rect = { x: number; y: number; l: number; h: number };
export function melangeRect(a: Rect, b: Rect, p: number): Rect {
  return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, l: a.l + (b.l - a.l) * p, h: a.h + (b.h - a.h) * p };
}
export const melange = (a: number, b: number, p: number) => a + (b - a) * p;

// Pseudo-aléatoire déterministe (même image à chaque rendu).
export function alea(graine: number) {
  let s = graine >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
