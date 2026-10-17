// Musique originale de la VSL SmartFixx, entièrement synthétisée par ce programme.
// Aucun échantillon, aucune boucle ni mélodie tierce : chaque son est calculé ici
// (oscillateurs, bruit, filtres, écho et réverbération écrits à la main), donc pas de droits de tiers.
//
// Thème « Nuit cinétique » : nappe nocturne en ré mineur, petites notes cristallines comme des
// fenêtres qui s'allument, pulsation légère qui monte avec le récit, montée vers l'appel à l'action
// qui se résout en fa majeur (la demande s'allume), fin nette calée sur la durée de la vidéo.
//
// Lit audio/minutage.json pour caler la musique sur la voix (sections, appel à l'action, durée).
// Produit en WAV 48 kHz stéréo 16 bits :
//   musique/smartfixx-musique-principale.wav  (durée de la VSL principale)
//   musique/smartfixx-musique-courte.wav      (durée de la version 15 s)
//   musique/smartfixx-musique-boucle.wav      (boucle sans couture pour les accroches)
// Usage : node vsl/audio/outils/musique.mjs
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AUDIO, SR, ff, sonie, lireJson, arrondi } from "./commun.mjs";

const CIBLE_LUFS = -20; // niveau de la musique seule ; le mixage la place sous la voix.
const OUT = join(AUDIO, "musique");
mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- utilitaires DSP
const TAU = Math.PI * 2;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
function prng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Hash déterministe d'un entier -> [0,1) (motifs répétables, utile pour la boucle).
const hash01 = (n, s = 0) => prng((n * 2654435761) ^ (s * 40503))();
function polyblep(t, dt) {
  if (t < dt) { t /= dt; return t + t - t * t - 1; }
  if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
  return 0;
}
class SVF { // filtre d'état variable (Chamberlin), sorties passe-bas / passe-bande
  constructor() { this.lp = 0; this.bp = 0; }
  run(x, fc, q = 0.7) {
    const f = 2 * Math.sin(Math.PI * Math.min(fc, SR / 6) / SR);
    const d = 1 / q;
    this.lp += f * this.bp;
    const hp = x - this.lp - d * this.bp;
    this.bp += f * hp;
    return this.lp;
  }
}
class Reverb { // réverbération de type Freeverb (8 filtres en peigne + 4 passe-tout par canal)
  constructor(spread = 0, room = 0.84, damp = 0.3) {
    const k = SR / 44100;
    this.c = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((n) => ({ b: new Float32Array(Math.round((n + spread) * k)), i: 0, f: 0 }));
    this.a = [556, 441, 341, 225].map((n) => ({ b: new Float32Array(Math.round((n + spread) * k)), i: 0 }));
    this.room = room; this.damp = damp;
  }
  run(x) {
    let o = 0;
    for (const c of this.c) {
      const y = c.b[c.i];
      c.f = y * (1 - this.damp) + c.f * this.damp;
      c.b[c.i] = x + c.f * this.room;
      c.i = (c.i + 1) % c.b.length;
      o += y;
    }
    for (const a of this.a) {
      const y = a.b[a.i];
      a.b[a.i] = o + y * 0.5;
      a.i = (a.i + 1) % a.b.length;
      o = y - o;
    }
    return o * 0.12;
  }
}

// ---------------------------------------------------------------- harmonie
const ACC = {
  Dm9: [50, 57, 60, 64, 65],
  Gm11: [43, 50, 53, 58, 60],
  Bbmaj9: [46, 53, 57, 60, 62],
  Csus: [48, 53, 55, 58, 62],
  Fmaj9: [41, 48, 52, 55, 57, 64],
  BbF: [41, 50, 53, 57, 58, 62], // Sib majeur 9 sur basse fa : cadence plagale de fin
};
const CYCLE = ["Dm9", "Gm11", "Bbmaj9", "Dm9"]; // remonté depuis l'appel à l'action

// ---------------------------------------------------------------- moteur
// p = { duree, beat, cta (s ou null), energie(t) -> 0..4, accords: [{debut, fin, nom}], fin (bool),
//       boucle (s ou 0), graine }
function rendre(p) {
  const N = Math.round(p.duree * SR);
  const L = new Float32Array(N), R = new Float32Array(N);
  const rnd = prng(p.graine);
  const revL = new Reverb(0), revR = new Reverb(23);
  const fL = new SVF(), fR = new SVF();
  const riserF = new SVF();
  const dly = { L: new Float32Array(SR * 2), R: new Float32Array(SR * 2), i: 0, lpL: 0, lpR: 0 };
  const dlyN = Math.round(p.beat * 0.75 * SR); // écho à la croche pointée

  // Voix de nappe : 3 oscillateurs désaccordés par note et par canal, phases continues.
  const voix = [];
  for (const a of p.accords) {
    ACC[a.nom].forEach((m, k) => {
      const f = mtof(m);
      for (const ch of [0, 1]) for (const det of [-1, 0, 1]) {
        voix.push({ a, ch, f: f * 2 ** ((det * (ch ? 7 : 5) + (k % 2 ? 2 : -2)) / 1200), ph: rnd(), amp: k === 0 ? 0.55 : 0.32 });
      }
    });
  }
  const ATT = 0.45, REL = 0.9;
  const envAcc = (a, t) => {
    if (t < a.debut - 0.02 || t > a.fin + REL) return 0;
    const at = a.debut <= 0.001 ? 1 : Math.min(1, Math.max(0, (t - a.debut) / ATT));
    const rl = t <= a.fin ? 1 : Math.max(0, 1 - (t - a.fin) / REL);
    return Math.sin((at * Math.PI) / 2) * rl * rl;
  };
  const accA = (t) => p.accords.find((a) => t >= a.debut && t < a.fin) ?? p.accords[p.accords.length - 1];

  // Événements rythmiques sur la grille des croches.
  const croche = p.beat / 2;
  const evts = []; // {t, type, ...}
  const nCroches = Math.ceil(p.duree / croche) + 1;
  for (let n = 0; n < nCroches; n++) {
    const t = n * croche;
    if (t >= p.duree) break;
    const e = p.energie(t);
    const temps = n / 2; // en temps
    const dansMesure = ((temps % 4) + 4) % 4;
    const idx = p.boucle ? n % Math.round(p.boucle / croche) : n;
    // pulsation (grosse caisse douce)
    if (n % 2 === 0) {
      const tempsN = dansMesure;
      const joue = e >= 3 ? true : e >= 2 ? tempsN === 0 || tempsN === 2 : e >= 1 ? tempsN === 0 : false;
      if (joue && e < 4.5) evts.push({ t, type: "kick", v: e >= 4 ? 0.8 : 0.65 + 0.1 * Math.min(e, 3) / 3 });
    }
    // tic sur les contretemps
    if (e >= 2 && n % 2 === 1) evts.push({ t, type: "tic", v: e >= 3 ? 1 : 0.7 });
    // fenêtres qui s'allument : petites notes cristallines
    const proba = [0.1, 0.16, 0.3, 0.38, 0.42][Math.min(4, Math.floor(e))];
    if (hash01(idx, p.graine) < proba) {
      const a = accA(t);
      const notes = ACC[a.nom].slice(1);
      const m = notes[Math.floor(hash01(idx, p.graine + 1) * notes.length)] + 24 - (hash01(idx, p.graine + 2) < 0.3 ? 12 : 0);
      evts.push({ t, type: "pluck", m, pan: (hash01(idx, p.graine + 3) - 0.5) * 1.2, v: 0.5 + 0.3 * hash01(idx, p.graine + 4) });
    }
  }
  if (p.cta != null) {
    evts.push({ t: p.cta, type: "impact" });
    // arpège montant : les fenêtres de la ville s'allument d'un coup
    [65, 69, 72, 76, 79, 81].forEach((m, k) => evts.push({ t: p.cta + k * (p.beat / 4), type: "pluck", m: m + 12, pan: -0.6 + k * 0.24, v: 0.75 }));
  }
  if (p.fin) {
    const tb = p.duree - 1.45;
    evts.push({ t: tb, type: "kick", v: 0.7 });
    [53, 57, 60, 64, 67].forEach((m, k) => evts.push({ t: tb + k * 0.018, type: "pluck", m: m + 24, pan: -0.4 + k * 0.2, v: 0.55 }));
  }
  evts.sort((a, b) => a.t - b.t);

  // Rendu des événements (sur un tampon séparé, envoyé ensuite vers écho/réverbération).
  const pL = new Float32Array(N), pR = new Float32Array(N); // plucks (envoyés à l'écho)
  const dL = new Float32Array(N), dR = new Float32Array(N); // percussions sèches
  const pompe = new Float32Array(N).fill(1);
  for (const ev of evts) {
    const i0 = Math.round(ev.t * SR);
    if (ev.type === "kick") {
      const len = Math.min(N - i0, Math.round(0.45 * SR));
      let ph = 0;
      for (let j = 0; j < len; j++) {
        const t = j / SR;
        const f = 48 + 70 * Math.exp(-t / 0.035);
        ph += f / SR;
        const s = Math.sin(TAU * ph) * Math.exp(-t / 0.2) * ev.v * 0.55 + (j < 96 ? (rnd() - 0.5) * 0.08 * (1 - j / 96) : 0);
        dL[i0 + j] += s; dR[i0 + j] += s;
        pompe[i0 + j] = Math.min(pompe[i0 + j], 1 - 0.28 * Math.exp(-t / 0.16));
      }
    } else if (ev.type === "tic") {
      const len = Math.min(N - i0, Math.round(0.05 * SR));
      let prev = 0;
      for (let j = 0; j < len; j++) {
        const w = rnd() * 2 - 1, hp = w - prev; prev = w;
        const s = hp * Math.exp(-j / SR / 0.012) * 0.045 * ev.v;
        dL[i0 + j] += s * 0.8; dR[i0 + j] += s;
      }
    } else if (ev.type === "pluck") {
      const f = mtof(ev.m), len = Math.min(N - i0, Math.round(1.6 * SR));
      const gl = Math.cos(((ev.pan + 1) * Math.PI) / 4), gr = Math.sin(((ev.pan + 1) * Math.PI) / 4);
      for (let j = 0; j < len; j++) {
        const t = j / SR;
        const env = Math.min(1, t / 0.003) * Math.exp(-t / 0.38);
        const s = (Math.sin(TAU * f * t) + 0.28 * Math.sin(TAU * 2 * f * t) * Math.exp(-t / 0.12) + 0.1 * Math.sin(TAU * 3.01 * f * t) * Math.exp(-t / 0.06)) * env * ev.v * 0.11;
        pL[i0 + j] += s * gl; pR[i0 + j] += s * gr;
      }
    } else if (ev.type === "impact") {
      const len = Math.min(N - i0, Math.round(1.6 * SR));
      let ph = 0;
      const lp = new SVF();
      for (let j = 0; j < len; j++) {
        const t = j / SR;
        ph += (40 + 22 * Math.exp(-t / 0.25)) / SR;
        const boom = Math.sin(TAU * ph) * Math.exp(-t / 0.7) * 0.42;
        const souffle = lp.run(rnd() * 2 - 1, 900 * Math.exp(-t / 0.4) + 200) * Math.exp(-t / 0.35) * 0.25;
        dL[i0 + j] += boom + souffle; dR[i0 + j] += boom + souffle * 0.9;
      }
    }
  }

  // Boucle d'échantillons : nappe, basse, montée, mixage, écho, réverbération.
  const RISER = p.cta != null ? Math.min(3.2, p.cta - 0.5) : 0;
  const lfoF = p.boucle ? 1 / p.boucle : 0.07;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const e = p.energie(t);
    // nappe
    let sL = 0, sR = 0;
    for (const v of voix) {
      const g = envAcc(v.a, t);
      if (g <= 0) { v.ph += v.f / SR; v.ph -= Math.floor(v.ph); continue; }
      const dt = v.f / SR;
      v.ph += dt; if (v.ph >= 1) v.ph -= 1;
      const saw = 2 * v.ph - 1 - polyblep(v.ph, dt);
      if (v.ch) sR += saw * v.amp * g; else sL += saw * v.amp * g;
    }
    let fc = 520 + 260 * Math.min(e, 4) + 160 * Math.sin(TAU * lfoF * t);
    if (p.cta != null && t > p.cta - RISER && t < p.cta) fc += 2600 * ((t - (p.cta - RISER)) / RISER) ** 2;
    if (p.cta != null && t >= p.cta) fc += 1500 * Math.exp(-(t - p.cta) / 2.5);
    sL = fL.run(sL, fc, 0.8) * 0.16; sR = fR.run(sR, fc * 1.03, 0.8) * 0.16;
    // basse : sinus sur la fondamentale, à partir de l'énergie 1
    const a = accA(t);
    const fb = mtof(ACC[a.nom][0] - 12);
    const gb = Math.min(1, Math.max(0, e - 0.6)) * envAcc(a, t);
    const basse = (Math.sin(TAU * fb * t) + 0.15 * Math.sin(TAU * 2 * fb * t)) * 0.16 * gb;
    const pm = e >= 2 ? pompe[i] : 1 - (1 - pompe[i]) * 0.4;
    let xL = (sL + basse) * pm, xR = (sR + basse) * pm;
    // montée vers l'appel à l'action : bruit filtré qui grimpe
    if (p.cta != null && t > p.cta - RISER && t < p.cta) {
      const u = (t - (p.cta - RISER)) / RISER;
      const r = riserF.run(rnd() * 2 - 1, 250 * 2 ** (u * 4.3), 2.2) * u * u * 0.09 * Math.min(1, (p.cta - t) / 0.03);
      xL += r; xR += r;
    }
    // écho des notes cristallines (filtré, ping-pong)
    const j = dly.i, k = (j - dlyN + dly.L.length) % dly.L.length;
    dly.lpL += 0.35 * (dly.R[k] - dly.lpL); dly.lpR += 0.35 * (dly.L[k] - dly.lpR);
    dly.L[j] = pL[i] + dly.lpL * 0.38; dly.R[j] = pR[i] + dly.lpR * 0.38;
    dly.i = (j + 1) % dly.L.length;
    const ecL = pL[i] + dly.lpL * 0.5, ecR = pR[i] + dly.lpR * 0.5;
    // réverbération commune
    const envoi = (sL + sR) * 0.5 * 0.5 + (ecL + ecR) * 0.5 * 0.9 + (dL[i] + dR[i]) * 0.08;
    const wL = revL.run(envoi), wR = revR.run(envoi);
    L[i] = xL + ecL + dL[i] + wL;
    R[i] = xR + ecR + dR[i] + wR;
  }

  // Fin nette : fondu en cosinus sur la dernière seconde, silence exact à la dernière image.
  if (p.fin) {
    const n0 = Math.round((p.duree - 1.0) * SR);
    for (let i = n0; i < N; i++) {
      const g = Math.cos(((i - n0) / (N - n0)) * (Math.PI / 2)) ** 2;
      L[i] *= g; R[i] *= g;
    }
  } else if (!p.boucle) {
    for (let i = 0; i < Math.min(N, 480); i++) { L[i] *= i / 480; R[i] *= i / 480; }
  }
  // saturation douce de sécurité
  for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * 1.1) / 1.1; R[i] = Math.tanh(R[i] * 1.1) / 1.1; }
  return [L, R];
}

function ecrireWavFloat(path, [L, R]) {
  const N = L.length, data = Buffer.alloc(N * 8), h = Buffer.alloc(44);
  for (let i = 0; i < N; i++) { data.writeFloatLE(L[i], i * 8); data.writeFloatLE(R[i], i * 8 + 4); }
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 8, 28); h.writeUInt16LE(8, 32); h.writeUInt16LE(32, 34); h.write("data", 36); h.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([h, data]));
}

// Normalise à CIBLE_LUFS (sans limiteur : il décalerait le signal et casserait la boucle), puis 16 bits avec dither triangulaire.
function finaliser(canaux, nom) {
  const tmp = join(OUT, `.${nom}.f32.wav`), dst = join(OUT, `${nom}.wav`);
  ecrireWavFloat(tmp, canaux);
  const { lufs } = sonie(tmp);
  ff(["-i", tmp, "-af", `volume=${(CIBLE_LUFS - lufs).toFixed(2)}dB,aresample=osf=s16:dither_method=triangular`, "-c:a", "pcm_s16le", dst]);
  rmSync(tmp);
  const m = sonie(dst);
  console.log(`${nom.padEnd(34)} ${(canaux[0].length / SR).toFixed(3)} s  ${m.lufs} LUFS  crête ${m.tp} dBTP`);
  return { fichier: `musique/${nom}.wav`, duree_s: arrondi(canaux[0].length / SR), lufs: m.lufs, crete_dbtp: m.tp };
}

// ---------------------------------------------------------------- partitions calées sur la voix
// Tempo choisi pour que l'appel à l'action tombe exactement sur un temps fort.
function tempo(cta, viseBpm) {
  const temps = Math.max(1, Math.round(cta / (60 / viseBpm)));
  return cta / temps;
}
// Accords : blocs de 8 temps comptés à rebours depuis l'appel à l'action (dominante juste avant),
// puis fa majeur, et cadence plagale (Sib/fa -> fa) sur la fin.
function grilleAccords(cta, duree, beat) {
  const acc = [];
  let fin = cta, k = 0;
  acc.unshift({ debut: Math.max(0, fin - 8 * beat), fin, nom: "Csus" });
  fin = acc[0].debut;
  while (fin > 0) {
    const debut = Math.max(0, fin - 8 * beat);
    acc.unshift({ debut, fin, nom: CYCLE[CYCLE.length - 1 - (k++ % CYCLE.length)] });
    fin = debut;
  }
  const plagale = duree - 2.6;
  if (plagale - cta > 2.5) {
    acc.push({ debut: cta, fin: plagale, nom: "Fmaj9" }, { debut: plagale, fin: duree - 1.45, nom: "BbF" }, { debut: duree - 1.45, fin: duree + 1, nom: "Fmaj9" });
  } else acc.push({ debut: cta, fin: duree + 1, nom: "Fmaj9" });
  return acc;
}
const paliers = (marques) => (t) => { let e = 0; for (const [d, v] of marques) if (t >= d) e = v; return e; };

const minutage = lireJson(join(AUDIO, "minutage.json")).montages;
const debutSeg = (m, id) => m.segments.find((s) => s.id === id).debut_s;
const res = {};

{ // principale
  const m = minutage.principale;
  const cta = m.ecran_final_debut_s, beat = tempo(cta, 94);
  res.principale = finaliser(rendre({
    duree: m.duree_s, beat, cta, fin: true, graine: 7,
    accords: grilleAccords(cta, m.duree_s, beat),
    energie: paliers([[0, 0], [debutSeg(m, "P2") - 0.2, 1], [debutSeg(m, "P3") - 0.2, 2], [debutSeg(m, "P5") - 0.1, 3], [cta, 4]]),
  }), "smartfixx-musique-principale");
  res.principale.bpm = arrondi(60 / beat, 2);
}
{ // courte 15 s
  const m = minutage.courte;
  const cta = m.ecran_final_debut_s, beat = tempo(cta, 94);
  res.courte = finaliser(rendre({
    duree: m.duree_s, beat, cta, fin: true, graine: 11,
    accords: grilleAccords(cta, m.duree_s, beat),
    energie: paliers([[0, 1], [debutSeg(m, "C2") - 0.2, 2], [cta - 2.6, 3], [cta, 4]]),
  }), "smartfixx-musique-courte");
  res.courte.bpm = arrondi(60 / beat, 2);
}
{ // boucle sans couture : 8 temps à 96 BPM, rendue 3 fois, on garde le cycle du milieu
  const beat = 60 / 96, boucle = 8 * beat;
  const accords = [];
  for (let c = 0; c < 3; c++) accords.push({ debut: c * boucle, fin: c * boucle + 4 * beat, nom: "Dm9" }, { debut: c * boucle + 4 * beat, fin: (c + 1) * boucle, nom: "Bbmaj9" });
  const [L, R] = rendre({ duree: 3 * boucle, beat, cta: null, fin: false, boucle, graine: 5, accords, energie: () => 2.5 });
  // Les oscillateurs désaccordés ne sont pas périodiques sur 5 s : la fin du cycle est fondue
  // (puissance constante, 120 ms) dans ce qui précède son début, qui s'enchaîne donc sans couture.
  const n = Math.round(boucle * SR), F = Math.round(0.12 * SR);
  const cyc = [L.slice(n, 2 * n), R.slice(n, 2 * n)];
  [L, R].forEach((src, c) => {
    for (let j = 0; j < F; j++) {
      const w = (j + 1) / F;
      cyc[c][n - F + j] = cyc[c][n - F + j] * Math.cos((w * Math.PI) / 2) + src[n - F + j] * Math.sin((w * Math.PI) / 2);
    }
  });
  res.boucle = finaliser(cyc, "smartfixx-musique-boucle");
  res.boucle.bpm = 96;
}
writeFileSync(join(OUT, "musique.json"), JSON.stringify(res, null, 2) + "\n");
