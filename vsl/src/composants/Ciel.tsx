// Fond signature : ciel de nuit et ville dont les fenêtres s'allument une à une.
// La fenêtre ambre (« la demande qui s'allume ») s'allume à l'instant `ambre`.
import React, { useMemo } from "react";
import { interpolate } from "remotion";
import { C } from "../lib/theme";
import { alea, ease, prog } from "../lib/anim";
import { useFormat } from "../lib/format";

type Fenetre = { x: number; y: number; l: number; h: number; r: number };
type Immeuble = { x: number; l: number; h: number; toit: number; antenne: boolean; fenetres: Fenetre[] };

function genererVille(W: number, H: number, vertical: boolean, graine: number, proche: boolean) {
  const rnd = alea(graine);
  const marge = 260;
  const echelle = vertical ? 1 : 0.9;
  const hMin = (proche ? (vertical ? 0.1 : 0.12) : vertical ? 0.2 : 0.24) * H;
  const hMax = (proche ? (vertical ? 0.25 : 0.3) : vertical ? 0.36 : 0.44) * H;
  const res: Immeuble[] = [];
  let x = -marge;
  while (x < W + marge) {
    const l = (proche ? 90 + rnd() * 120 : 60 + rnd() * 90) * echelle;
    const h = hMin + Math.pow(rnd(), 1.4) * (hMax - hMin);
    const toit = rnd() < 0.35 ? 8 + rnd() * 26 : 0;
    const fenetres: Fenetre[] = [];
    const fl = proche ? 12 : 7;
    const fh = proche ? 16 : 9;
    const pasX = proche ? 26 : 16;
    const pasY = proche ? 34 : 21;
    const cols = Math.max(1, Math.floor((l - 22) / pasX));
    const decal = (l - cols * pasX) / 2 + (pasX - fl) / 2;
    for (let yy = 26; yy < h - 30; yy += pasY) {
      for (let c = 0; c < cols; c++) {
        if (rnd() < 0.12) continue;
        fenetres.push({ x: decal + c * pasX, y: yy, l: fl, h: fh, r: rnd() });
      }
    }
    res.push({ x, l, h, toit, antenne: rnd() < 0.25, fenetres });
    x += l + (proche ? 2 + rnd() * 10 : rnd() * 6);
  }
  return res;
}

export type CielProps = {
  t: number;
  // part des fenêtres allumées (0 → 1) en fonction du temps : [[t, part], ...]
  allumage?: [number, number][];
  ambre?: number | null; // instant où la fenêtre ambre s'allume
  decalageX?: number; // panoramique horizontal (px)
  descente?: number; // 0 = ville en place ; > 0 la ville descend (px)
  opacite?: number;
};

export const Ciel: React.FC<CielProps> = ({ t, allumage = [[0, 0.03]], ambre = null, decalageX = 0, descente = 0, opacite = 1 }) => {
  const { W, H, vertical } = useFormat();
  const loin = useMemo(() => genererVille(W, H, vertical, 7, false), [W, H, vertical]);
  const pres = useMemo(() => genererVille(W, H, vertical, 19, true), [W, H, vertical]);
  const etoiles = useMemo(() => {
    const r = alea(3);
    return Array.from({ length: 70 }, () => ({ x: r() * W, y: r() * H * 0.55, s: 0.8 + r() * 1.8, p: r() * 6.28, v: 0.6 + r() * 1.6 }));
  }, [W, H]);

  // fenêtre ambre : immeuble proche le plus central, fenêtre du tiers haut
  const cible = useMemo(() => {
    let best = pres[0];
    let d = Infinity;
    for (const b of pres) {
      const cx = b.x + b.l / 2;
      const dd = Math.abs(cx - W * (vertical ? 0.62 : 0.86)) - b.h * 0.3;
      if (dd < d && b.fenetres.length > 6) {
        d = dd;
        best = b;
      }
    }
    const f = [...best.fenetres].sort((a, b) => a.y - b.y || a.x - b.x)[Math.min(best.fenetres.length - 1, Math.floor(best.fenetres.length * 0.3))];
    return { b: best, f };
  }, [pres, W, vertical]);

  const ts = allumage.map((a) => a[0]);
  const part = ts.length > 1 ? interpolate(t, ts, allumage.map((a) => a[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : allumage[0][1];
  const allume = (r: number) => Math.max(0, Math.min(1, (part - r) * 30));

  const pAmbre = ambre === null ? 0 : prog(t, ambre, 0.35, ease.sortie);
  const anneau = ambre === null ? 0 : prog(t, ambre, 1.4, ease.lineaire);

  const sol = H + descente;
  const dessin = (ims: Immeuble[], proche: boolean, decal: number) =>
    ims.map((b, i) => {
      const x0 = b.x + decal;
      if (x0 > W + 40 || x0 + b.l < -40) return null;
      const y0 = sol - b.h;
      return (
        <g key={i}>
          {b.toit > 0 && <rect x={x0 + b.l * 0.2} y={y0 - b.toit} width={b.l * 0.6} height={b.toit + 2} fill={proche ? C.facadeProche : C.facadeLoin} />}
          {b.antenne && <rect x={x0 + b.l * 0.5} y={y0 - b.toit - 40} width={3} height={42} fill={proche ? C.facadeProche : C.facadeLoin} />}
          <rect x={x0} y={y0} width={b.l} height={b.h + 400} fill={proche ? C.facadeProche : C.facadeLoin} />
          <rect x={x0} y={y0} width={b.l} height={2} fill="rgba(142,162,255,0.22)" />
          {b.fenetres.map((f, j) => {
            const estCible = proche && b === cible.b && f === cible.f;
            if (estCible) return null;
            const a = allume(f.r);
            return (
              <rect
                key={j}
                x={x0 + f.x}
                y={y0 + f.y}
                width={f.l}
                height={f.h}
                rx={1.5}
                fill={a > 0 ? C.fenetreTiede : C.fenetreEteinte}
                opacity={a > 0 ? (proche ? 0.25 + 0.75 * a : 0.15 + 0.5 * a) : 1}
              />
            );
          })}
        </g>
      );
    });

  const bx = cible.b.x + decalageX + cible.f.x;
  const by = sol - cible.b.h + cible.f.y;
  const fw = cible.f.l;
  const fh = cible.f.h;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, opacity: opacite }}>
      <defs>
        <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.cielHaut} />
          <stop offset="0.58" stopColor={C.cielMilieu} />
          <stop offset="0.82" stopColor="#2A2156" />
          <stop offset="1" stopColor={C.cielBas} />
        </linearGradient>
        <radialGradient id="halo" cx="0.8" cy="0.12" r="0.6">
          <stop offset="0" stopColor="rgba(67,97,255,0.30)" />
          <stop offset="1" stopColor="rgba(67,97,255,0)" />
        </radialGradient>
        <radialGradient id="sodium" cx="0.5" cy="1" r="0.7">
          <stop offset="0" stopColor="rgba(255,182,72,0.16)" />
          <stop offset="1" stopColor="rgba(255,182,72,0)" />
        </radialGradient>
        <radialGradient id="lueur">
          <stop offset="0" stopColor="rgba(255,182,72,0.85)" />
          <stop offset="0.35" stopColor="rgba(255,182,72,0.25)" />
          <stop offset="1" stopColor="rgba(255,182,72,0)" />
        </radialGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0" />
        </filter>
      </defs>
      <rect width={W} height={H} fill="url(#ciel)" />
      <rect width={W} height={H} fill="url(#halo)" />
      <rect y={H * 0.45} width={W} height={H * 0.55} fill="url(#sodium)" />
      {etoiles.map((e, i) => (
        <circle key={i} cx={e.x} cy={e.y} r={e.s} fill="#C9D3FF" opacity={0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * e.v + e.p))} />
      ))}
      <g>{dessin(loin, false, decalageX * 0.45)}</g>
      <g>{dessin(pres, true, decalageX)}</g>
      {/* fenêtre ambre */}
      <rect x={bx} y={by} width={fw} height={fh} rx={1.5} fill={C.fenetreEteinte} />
      {pAmbre > 0 && (
        <g>
          <circle cx={bx + fw / 2} cy={by + fh / 2} r={150 * pAmbre} fill="url(#lueur)" opacity={0.9} />
          <rect x={bx - 1} y={by - 1} width={fw + 2} height={fh + 2} rx={2} fill={C.fenetreAllumee} opacity={pAmbre} />
          {anneau < 1 && (
            <circle cx={bx + fw / 2} cy={by + fh / 2} r={20 + 200 * anneau} fill="none" stroke={C.fenetreAllumee} strokeWidth={3 * (1 - anneau)} opacity={1 - anneau} />
          )}
        </g>
      )}
      <rect width={W} height={H} filter="url(#grain)" opacity={0.06} />
    </svg>
  );
};
