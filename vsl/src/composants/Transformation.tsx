// Transition « refonte » : la maquette se retourne par tuiles, de l'ancienne version à la nouvelle.
import React from "react";

export const Transformation: React.FC<{
  p: number; // 0 → 1
  l: number;
  h: number;
  colonnes?: number;
  lignes?: number;
  avant: React.ReactNode;
  apres: React.ReactNode;
}> = ({ p, l, h, colonnes = 7, lignes = 5, avant, apres }) => {
  if (p <= 0) return <>{avant}</>;
  if (p >= 1) return <>{apres}</>;
  const tl = l / colonnes;
  const th = h / lignes;
  const maxDiag = colonnes + lignes - 2;
  const tuiles: React.ReactNode[] = [];
  for (let r = 0; r < lignes; r++) {
    for (let c = 0; c < colonnes; c++) {
      const retard = ((c + r) / maxDiag) * 0.55;
      const local = Math.max(0, Math.min(1, (p - retard) / 0.45));
      const e = local < 0.5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2;
      const angle = e * 180;
      const face = (contenu: React.ReactNode, dos: boolean) => (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", backfaceVisibility: "hidden", transform: dos ? "rotateY(180deg)" : undefined }}>
          <div style={{ position: "absolute", left: -c * tl, top: -r * th, width: l, height: h }}>{contenu}</div>
          {local > 0 && local < 1 && <div style={{ position: "absolute", inset: 0, background: `rgba(142,162,255,${0.35 * Math.sin(local * Math.PI)})` }} />}
        </div>
      );
      tuiles.push(
        <div key={`${r}-${c}`} style={{ position: "absolute", left: c * tl, top: r * th, width: tl + 0.5, height: th + 0.5, perspective: 900 }}>
          <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${angle}deg) scale(${1 - 0.12 * Math.sin(local * Math.PI)})` }}>
            {face(avant, false)}
            {face(apres, true)}
          </div>
        </div>,
      );
    }
  }
  return <div style={{ position: "absolute", inset: 0, background: "#04060D" }}>{tuiles}</div>;
};
