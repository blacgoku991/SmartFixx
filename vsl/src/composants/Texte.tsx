// Typographie cinétique, sous-titres incrustés, étiquettes.
import React from "react";
import { C, P, T } from "../lib/theme";
import { ease, prog } from "../lib/anim";
import { useFormat } from "../lib/format";
import { montage, type NomMontage } from "../lib/temps";

// Titre en SFX Display : chaque mot monte derrière un masque, avec un léger décalage.
export const TitreCinetique: React.FC<{
  t: number;
  lignes: string[];
  debut: number;
  fin?: number; // sortie (les mots repartent vers le haut)
  x: number;
  y: number;
  l?: number;
  taille: number;
  aligne?: "left" | "center" | "right";
  couleur?: string;
  accent?: number; // index de ligne colorée en bleu
  souligne?: number; // index de ligne soulignée (trait bleu qui se dessine)
  etroit?: boolean;
  pas?: number; // décalage entre mots (s)
}> = ({ t, lignes, debut, fin, x, y, l, taille, aligne = "left", couleur = C.texte, accent, souligne, etroit, pas = 0.055 }) => {
  if (t < debut - 0.01) return null;
  if (fin !== undefined && t > fin + 0.45) return null;
  let k = 0;
  const hLigne = taille * 0.98;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: l, textAlign: aligne }}>
      {lignes.map((ligne, i) => {
        const mots = ligne.split(" ");
        const pSouligne = souligne === i ? prog(t, debut + 0.35 + i * 0.1, 0.55, ease.sortie) : 0;
        return (
          <div key={i} style={{ height: hLigne, whiteSpace: "nowrap" }}>
            <span style={{ position: "relative", display: "inline-block" }}>
            {mots.map((m, j) => {
              const d = debut + k++ * pas;
              const pin = prog(t, d, 0.62, ease.sortie);
              const pout = fin !== undefined ? prog(t, fin + j * 0.03 + i * 0.04, 0.38, ease.entree) : 0;
              const dy = (1 - pin) * 105 - pout * 105;
              return (
                <span
                  key={j}
                  style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", height: taille * 1.24, marginBottom: hLigne - taille * 1.24, paddingRight: taille * 0.04, marginRight: taille * 0.2 }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      transform: `translateY(${dy}%) rotate(${(1 - pin) * 4}deg)`,
                      transformOrigin: "left bottom",
                      fontFamily: etroit ? P.titreEtroit : P.titre,
                      fontWeight: 700,
                      fontSize: taille,
                      lineHeight: `${hLigne * 1.08}px`,
                      paddingBottom: taille * 0.16,
                      letterSpacing: "-0.01em",
                      color: accent === i ? C.accent : couleur,
                    }}
                  >
                    {m}
                  </span>
                </span>
              );
            })}
            {souligne === i && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: taille * 1.03,
                  height: Math.max(6, taille * 0.075),
                  width: `calc(${pSouligne * 100}% - ${taille * 0.24}px)`,
                  background: C.accentFort,
                  borderRadius: 4,
                  opacity: fin !== undefined ? 1 - prog(t, fin, 0.3) : 1,
                }}
              />
            )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Sous-titres incrustés : cartons de minutage.json, fond sombre opaque, zone sûre du format.
export const SousTitres: React.FC<{ t: number; nom: NomMontage; masque?: (t: number) => boolean }> = ({ t, nom, masque }) => {
  const f = useFormat();
  const cartons = montage(nom).sous_titres;
  const c = cartons.find((x) => t >= x.debut_s && t < x.fin_s);
  if (!c || (masque && masque(t))) return null;
  const pin = prog(t, c.debut_s, 0.22, ease.sortie);
  const derniere = c === cartons[cartons.length - 1];
  const pout = derniere ? prog(t, c.fin_s - 0.2, 0.2, ease.entree) : 0;
  const plusLongue = Math.max(...c.lignes.map((l) => l.length));
  const taille = plusLongue > 29 ? f.sousTitres.taille * 0.92 : f.sousTitres.taille;
  return (
    <div
      style={{
        position: "absolute",
        left: f.sousTitres.centreX - f.sousTitres.largeurMax / 2,
        width: f.sousTitres.largeurMax,
        bottom: f.H - f.sousTitres.bas,
        display: "flex",
        justifyContent: "center",
        opacity: Math.min(1, pin * 1.6) * (1 - pout),
        transform: `translateY(${(1 - pin) * 14}px) scale(${0.97 + 0.03 * pin})`,
      }}
    >
      <div
        style={{
          background: "rgba(7,11,24,0.86)",
          border: "1.5px solid rgba(142,162,255,0.28)",
          borderRadius: 22,
          padding: `${taille * 0.32}px ${taille * 0.6}px`,
          boxShadow: "0 18px 40px -18px rgba(0,0,0,0.8)",
          textAlign: "center",
        }}
      >
        {c.lignes.map((l, i) => (
          <div key={i} style={{ fontFamily: P.texte, fontWeight: 800, fontSize: taille, lineHeight: 1.22, color: "#FFFFFF", whiteSpace: "nowrap", letterSpacing: "-0.005em" }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

// Pastille « Démonstration » (toute donnée fictive à l'écran la porte).
export const BadgeDemo: React.FC<{ taille?: number; style?: React.CSSProperties; opacite?: number }> = ({ taille = 22, style, opacite = 1 }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: taille * 0.4,
      padding: `${taille * 0.28}px ${taille * 0.7}px`,
      borderRadius: 999,
      border: `${Math.max(1.5, taille * 0.08)}px solid ${C.texte}`,
      background: "rgba(7,11,24,0.82)",
      color: C.texte,
      fontFamily: P.texte,
      fontWeight: 700,
      fontSize: taille,
      lineHeight: 1.1,
      opacity: opacite,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {T.demonstration}
  </div>
);

// Puce d'annotation (problème numéroté ou service).
export const Puce: React.FC<{
  texte: string;
  numero?: number;
  p: number; // apparition 0 → 1
  couleur?: string;
  taille?: number;
  style?: React.CSSProperties;
}> = ({ texte, numero, p, couleur = C.danger, taille = 34, style }) => {
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        display: "inline-flex",
        alignItems: "center",
        gap: taille * 0.45,
        padding: `${taille * 0.36}px ${taille * 0.7}px ${taille * 0.36}px ${taille * 0.4}px`,
        borderRadius: 999,
        background: "rgba(14,23,48,0.94)",
        border: `2px solid ${couleur}`,
        boxShadow: `0 18px 40px -16px rgba(0,0,0,0.75), 0 0 0 6px rgba(7,11,24,0.35)`,
        color: C.texte,
        fontFamily: P.texte,
        fontWeight: 800,
        fontSize: taille,
        whiteSpace: "nowrap",
        opacity: Math.min(1, p * 1.5),
        transform: `scale(${0.6 + 0.4 * ease.ressort(Math.min(1, p))})`,
        transformOrigin: "left center",
        ...style,
      }}
    >
      {numero !== undefined && (
        <span
          style={{
            width: taille * 1.25,
            height: taille * 1.25,
            borderRadius: 999,
            background: couleur,
            color: C.fond,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: taille * 0.75,
            fontWeight: 800,
          }}
        >
          {numero}
        </span>
      )}
      {texte}
    </div>
  );
};
