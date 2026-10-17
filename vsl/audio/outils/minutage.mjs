// Construit audio/minutage.json (source du montage) et les sous-titres captions/*.srt
// à partir de script/segments.json et des durées mesurées des voix (voix/voix.json).
//
// Contrôles bloquants : cartons <= 2 lignes de 32 caractères, cartons fidèles au texte dit,
// formulations interdites absentes, durées des montages dans les bornes du brief,
// écran final tenu au moins 3 s. Usage : node vsl/audio/outils/minutage.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AUDIO, VSL, dureeWav, silences, lireJson, arrondi } from "./commun.mjs";

const { segments, montages } = lireJson(join(VSL, "script/segments.json"));
const voix = lireJson(join(AUDIO, "voix/voix.json")).segments;
const erreurs = [];

// --- Contrôles de texte -------------------------------------------------------------
const INTERDITS = [
  [/\bnous\b/i, "« nous » (SmartFixx parle à la 3e personne)"],
  [/€|\beuros?\b|\bprix\b|\btarif/i, "prix ou tarif"],
  [/\b\d+\s*(h|heures?|jours?|semaines?|mois)\b|\ben \d+/i, "délai chiffré"],
  [/garanti/i, "garantie de résultat"],
  [/premi[eè]re place|n[°o]\s*1|top\s*\d/i, "classement Google"],
  [/\bavis\b|t[ée]moignage|clients? satisfaits?|\d+\s*clients/i, "avis ou référence client"],
];
const sansBalises = (t) => t.replace(/\[[^\]]*\]\s*/g, "").trim();
const norm = (t) => t.replace(/\s+/g, " ").trim();

for (const [id, s] of Object.entries(segments)) {
  const dit = sansBalises(s.voix);
  const ecrit = s.cartons.map((c) => c.join(" ")).join(" ");
  if (norm(dit) !== norm(ecrit)) erreurs.push(`${id} : les cartons ne reprennent pas exactement la voix\n  voix   : ${dit}\n  cartons: ${ecrit}`);
  for (const c of s.cartons) {
    if (c.length > 2) erreurs.push(`${id} : carton de ${c.length} lignes`);
    for (const l of c) if ([...l].length > 32) erreurs.push(`${id} : ligne de ${[...l].length} caractères « ${l} »`);
  }
  for (const [re, quoi] of INTERDITS) if (re.test(dit)) erreurs.push(`${id} : formulation interdite (${quoi}) dans « ${dit} »`);
  if (!voix[id]) erreurs.push(`${id} : aucune voix préparée (lancer prepare-voix.mjs)`);
}

// --- Découpage des cartons dans un segment ------------------------------------------
// Frontière visée = proportion de caractères ; recalée sur le milieu de la pause la plus
// proche (à 0,7 s près) pour que le carton change pendant une respiration de la voix.
function frontieres(id, duree, pauses) {
  const poids = segments[id].cartons.map((c) => [...c.join(" ")].length);
  const total = poids.reduce((a, b) => a + b, 0);
  const res = [0];
  let cumul = 0;
  for (let k = 0; k < poids.length - 1; k++) {
    cumul += poids[k];
    const vise = (cumul / total) * duree;
    let meilleur = null;
    for (const [a, b] of pauses) {
      const m = (a + b) / 2;
      if (m <= res[res.length - 1] + 0.6 || m >= duree - 0.5) continue;
      if (Math.abs(m - vise) <= 0.7 && (meilleur === null || Math.abs(m - vise) < Math.abs(meilleur - vise))) meilleur = m;
    }
    res.push(meilleur ?? vise);
  }
  return res;
}

// --- Montages -----------------------------------------------------------------------
const sortie = {
  _lisezmoi:
    "Généré par vsl/audio/outils/minutage.mjs, ne pas éditer à la main. Temps en secondes depuis le début de la vidéo. " +
    "Les fichiers de voix sont relatifs à vsl/audio/. Un segment au statut PROVISOIRE n'a pas encore sa prise ElevenLabs.",
  segments_provisoires: Object.entries(voix).filter(([, v]) => v.statut !== "definitive").map(([id]) => id),
  montages: {},
};

for (const [nom, m] of Object.entries(montages)) {
  let t = m.debut_s;
  const segs = [];
  for (const p of m.pistes) {
    t += p.respiration_avant_s ?? 0;
    const v = voix[p.segment];
    const duree = dureeWav(join(AUDIO, v.fichier));
    segs.push({ id: p.segment, role: segments[p.segment].role, debut_s: t, fin_s: t + duree, duree_s: duree, ecran_final: !!p.ecran_final, fichier: v.fichier, statut: v.statut, texte_voix: sansBalises(segments[p.segment].voix) });
    t += duree;
  }
  const voixFin = t;
  let duree;
  if (m.duree_fixe_s) {
    duree = m.duree_fixe_s;
    if (duree - voixFin < m.fin_apres_voix_min_s) erreurs.push(`${nom} : la voix finit à ${voixFin.toFixed(2)} s, trop tard pour ${duree} s`);
  } else {
    duree = Math.max(voixFin + m.fin_apres_voix_s, m.duree_min_s ?? 0);
  }
  if (m.duree_max_s && duree > m.duree_max_s + 1e-9) erreurs.push(`${nom} : ${duree.toFixed(2)} s dépasse ${m.duree_max_s} s`);
  if (m.duree_min_s && duree < m.duree_min_s - 1e-9) erreurs.push(`${nom} : ${duree.toFixed(2)} s sous ${m.duree_min_s} s`);

  // Cartons
  const cartons = [];
  segs.forEach((s, i) => {
    const pauses = silences(join(AUDIO, s.fichier), -42, 0.09);
    const f = frontieres(s.id, s.duree_s, pauses);
    const suivant = segs[i + 1];
    const limite = suivant ? suivant.debut_s - 0.04 : duree - 0.1;
    s.cartons = segments[s.id].cartons.map((lignes, k) => {
      const debut = s.debut_s + f[k] - (k === 0 ? 0.08 : 0.05);
      const fin = k + 1 < f.length ? s.debut_s + f[k + 1] - 0.05 : Math.min(s.fin_s + (suivant ? 0.4 : 0.8), limite);
      return { debut_s: debut, fin_s: fin, lignes };
    });
    for (const c of s.cartons) {
      if (cartons.length && c.debut_s < cartons[cartons.length - 1].fin_s) c.debut_s = cartons[cartons.length - 1].fin_s;
      if (c.fin_s - c.debut_s < 0.7) erreurs.push(`${nom}/${s.id} : carton trop bref (${(c.fin_s - c.debut_s).toFixed(2)} s) « ${c.lignes.join(" ")} »`);
      cartons.push(c);
    }
  });

  const ecran = segs.find((s) => s.ecran_final);
  const tenu = ecran ? duree - ecran.debut_s : null;
  if (ecran && tenu < 3) erreurs.push(`${nom} : écran final tenu ${tenu.toFixed(2)} s (< 3 s)`);

  const r = (o) => JSON.parse(JSON.stringify(o, (k, v) => (typeof v === "number" ? arrondi(v) : v)));
  sortie.montages[nom] = r({
    titre: m.titre,
    duree_s: duree,
    voix_debut_s: segs[0].debut_s,
    voix_fin_s: voixFin,
    ecran_final_debut_s: ecran ? ecran.debut_s : null,
    ecran_final_tenu_s: tenu,
    provisoire: segs.some((s) => s.statut !== "definitive"),
    segments: segs,
    sous_titres: cartons.map((c, i) => ({ index: i + 1, ...c })),
  });
}

if (erreurs.length) {
  console.error("Contrôles en échec :\n- " + erreurs.join("\n- "));
  process.exit(1);
}

// --- Écriture -----------------------------------------------------------------------
writeFileSync(join(AUDIO, "minutage.json"), JSON.stringify(sortie, null, 2) + "\n");
const CAP = join(VSL, "captions");
mkdirSync(CAP, { recursive: true });
const hms = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, l = 2) => String(n).padStart(l, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
for (const [nom, m] of Object.entries(sortie.montages)) {
  const srt = m.sous_titres.map((c) => `${c.index}\n${hms(c.debut_s)} --> ${hms(c.fin_s)}\n${c.lignes.join("\n")}\n`).join("\n");
  writeFileSync(join(CAP, `smartfixx-vsl-${nom}.srt`), srt);
  console.log(
    `${nom.padEnd(11)} ${m.duree_s.toFixed(2)} s  voix ${m.voix_debut_s.toFixed(2)}–${m.voix_fin_s.toFixed(2)} s` +
      (m.ecran_final_debut_s != null ? `  écran final ${m.ecran_final_debut_s.toFixed(2)} s (tenu ${m.ecran_final_tenu_s.toFixed(2)} s)` : "") +
      `  ${m.sous_titres.length} cartons${m.provisoire ? "  [voix PROVISOIRE]" : ""}`,
  );
}
