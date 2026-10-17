# VSL SmartFixx — projet vidéo éditable

Vidéo de présentation en motion design de SmartFixx (création et refonte de sites, Asnières-sur-Seine,
Île-de-France), direction « Nuit cinétique : la demande qui s'allume ». Le cahier des charges est dans
`docs/BRIEF_DESIGN_VSL.md` (sections « VSL principale » et « Déclinaisons à livrer »).

> **État de la voix : PROVISOIRE.** Seuls les segments P1, P2 et P4 ont leur vraie voix (ElevenLabs,
> voix « Nico »). Les autres segments utilisent une voix de repérage robotique (espeak-ng) : les exports
> actuels servent à valider l'image, le rythme et le cadrage, **pas à être diffusés**. Voir
> `audio/README.md`, section « Pour terminer la voix ». Une fois les prises posées, relancer la chaîne
> ci-dessous : le montage se recale tout seul. Nouvel essai le 17 octobre 2026 (un appel par segment
> manquant) : refusé par ElevenLabs, quota toujours épuisé (5 crédits restants), rien n'a été généré.

## Contenu

```
vsl/
  exports/        livrables : MP4 (H.264 + AAC 48 kHz), SRT associés, miniatures JPEG, controle.json
                  (MP4 et JPEG non versionnés : voir « Exports »)
  src/            projet Remotion (React)
    donnees/      ← ce que l'on modifie sans toucher aux scènes : textes.json, theme.json, medias.json
    scenes/       actes de la vidéo (problème, nouveau design, refonte, écran final, courtes)
    composants/   ciel et ville, appareils (navigateur ↔ téléphone), maquettes fictives, tableau de suivi, textes
    compositions/ montages (principale 9:16 et 16:9, courte, accroches, miniatures)
  public/         polices (SFX Display, Inter, licences OFL), logo, captures du site (public/captures/)
  audio/          voix, musique originale, mixages, minutage.json (source du montage) — voir audio/README.md
  captions/       sous-titres SRT générés depuis le minutage
  script/         textes de la voix (segments.json) et scripts découpés
  outils/         rendu, contrôle, aperçus, captures
```

## Licence de Remotion

Le projet utilise [Remotion](https://www.remotion.dev/) (version épinglée `4.0.533`). Remotion est
gratuit pour les entreprises de 3 personnes au plus ; SmartFixx est une SASU d'une personne, elle entre
dans ce cas. Si l'effectif dépasse ce seuil, une licence entreprise Remotion devient nécessaire (voir la
licence publiée par Remotion avant tout changement de structure).

Polices : SFX Display (dérivée de Bricolage Grotesque) et Inter, toutes deux sous licence SIL OFL 1.1
(`public/polices/OFL-*.txt`). Musique : composition originale générée par code, libre d'usage commercial
(voir `audio/README.md`).

## Installation

Node 18 ou plus. Depuis `vsl/` :

```sh
npm ci            # installe Remotion, React, TypeScript et ffmpeg-static (versions exactes du package-lock)
```

Le rendu utilise un Chromium local : par défaut
`/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` ; sur une autre machine,
définir `REMOTION_CHROME=/chemin/vers/chrome-headless-shell` (ou supprimer la ligne
`setBrowserExecutable` de `remotion.config.ts` pour laisser Remotion télécharger le sien).

## Modifier

| Je veux changer… | Fichier | Puis |
| --- | --- | --- |
| un titre à l'écran, l'appel à l'action, l'URL, les libellés « Démonstration », les données fictives du formulaire ou du tableau de suivi | `src/donnees/textes.json` | rendu |
| une couleur ou une police | `src/donnees/theme.json` (jetons repris de `app/globals.css`) | rendu |
| une capture du site | remplacer le fichier dans `public/captures/`, ou pointer ailleurs dans `src/donnees/medias.json` (mêmes proportions) | rendu |
| toutes les captures (après une évolution du site) | `outils/captures.cjs` (voir en tête du fichier : servir une variante VPS construite, puis lancer le script) — il réécrit aussi les coordonnées des champs du formulaire | rendu |
| le texte dit ou les sous-titres | `script/segments.json` | chaîne audio complète, puis rendu |
| une prise de voix | `audio/outils/prepare-voix.mjs` (`RETENUES`) | chaîne audio complète, puis rendu |
| la musique | `audio/outils/musique.mjs` | `musique.mjs`, `mixage.mjs`, puis rendu |

Les scènes ne contiennent aucun temps en dur : chaque mouvement est calé sur les débuts de segments et
de cartons de sous-titres lus dans `audio/minutage.json`. Une nouvelle prise plus longue ou plus courte
décale donc l'image avec elle.

Studio (prévisualisation interactive, avec le mixage de référence) :

```sh
npm run studio
```

## Relancer la chaîne

Depuis `vsl/`, sur la machine partagée chaque étape lourde passe par le verrou commun :

```sh
# 1. audio (seulement si texte, voix ou musique ont changé)
node audio/outils/prepare-voix.mjs
node audio/outils/minutage.mjs                                         # minutage + SRT + contrôles bloquants
flock /tmp/smartfixx-build.lock node audio/outils/musique.mjs
flock /tmp/smartfixx-build.lock node audio/outils/mixage.mjs           # -14 LUFS, musique >= 15 dB sous la voix

# 2. vidéos (chaque rendu et chaque encodage prend lui-même le verrou)
node outils/rendu.mjs                          # tout
node outils/rendu.mjs principale-9x16          # une cible : principale-9x16, principale-16x9, courte-15s-9x16,
                                               # accroche-1-9x16, accroche-2-9x16, accroche-3-9x16,
                                               # principale-reels-9x16, courte-15s-reels-9x16,
                                               # accroche-1-reels-9x16 … accroche-3-reels-9x16,
                                               # miniature-9x16, miniature-16x9

# 3. contrôle
node outils/controle.mjs                       # exports/controle.json, images clés dans .rendu/controle/
```

`outils/apercus.mjs` rend des images fixes à des instants choisis
(`node outils/apercus.mjs principale-9x16:4.5,12 principale-16x9:30`), utile pour vérifier un cadrage
sans encoder de vidéo.

Le rendu se fait en deux temps : Remotion produit l'image seule (H.264 de travail, CRF 14), puis ffmpeg
encode le livrable (H.264 High, yuv420p, 30 i/s, débit plafonné à 3,2 Mbit/s, AAC 192 kbit/s 48 kHz,
`faststart`) en posant le mixage `audio/mix/smartfixx-vsl-<montage>-mix.wav` et en coupant à la durée
exacte du montage (`-t`, lue dans `minutage.json`) : la courte fait 15,000 s, conteneur compris.
`controle.mjs` refuse un conteneur plus long que le montage. Les SRT de `captions/`
sont copiés à côté de chaque MP4.

## Exports

| Fichier | Format | Durée |
| --- | --- | --- |
| `smartfixx-vsl-principale-9x16.mp4` (+ `.srt`) | 1080 × 1920 | ≈ 42,5 s |
| `smartfixx-vsl-principale-16x9.mp4` (+ `.srt`) | 1920 × 1080, mise en page paysage | ≈ 42,5 s |
| `smartfixx-vsl-courte-15s-9x16.mp4` (+ `.srt`) | 1080 × 1920 | 15 s |
| `smartfixx-vsl-accroche-1-9x16.mp4` … `-3` (+ `.srt`) | 1080 × 1920 | 3,2 à 3,6 s |
| `smartfixx-vsl-*-reels-9x16.mp4` (+ `.srt`) | 1080 × 1920, variante Reels | mêmes durées |
| `smartfixx-vsl-miniature-9x16.jpg`, `-16x9.jpg` | image fixe | — |

**Variantes Reels.** Meta recommande de laisser libres les 35 % du bas en Reels (légende et bouton de
l'annonce). Dans les variantes `-reels-9x16`, le ciel et la ville restent plein cadre, mais titres,
appareils et sous-titres sont réduits à 82,5 % autour d'un point situé sous les 15 % du haut : le bas
des sous-titres passe de 1 436 à 1 237 px. Les versions sans `-reels` gardent le gabarit 25 % du bas
(TikTok, YouTube Shorts, Stories). Réglage : `REELS` dans `src/compositions/Videos.tsx`.

**Versionnement.** Les MP4 et les JPEG ne sont plus suivis par git (`.gitignore`) tant que la voix est
provisoire : chaque rendu ajouterait environ 30 Mo définitifs à l'historique. Une fois la voix
définitive, les publier en pièce jointe d'une release GitHub (ou via Git LFS). `controle.json` et les
SRT restent suivis ; tout export se reproduit avec `node outils/rendu.mjs`.

Mesures de chaque export (codecs, dimensions, durée, poids, sonie, crête vraie, faststart) :
`exports/controle.json`.

## Règles de contenu tenues dans la vidéo

- Aucun prix, délai, avis, référence client, compteur ou chiffre présenté comme réel ; ni « première
  place Google » ni « clients garantis ».
- Le site « Votre Entreprise » (avant / après), le formulaire rempli et le tableau de suivi sont fictifs
  et portent l'étiquette « Démonstration », y compris sur le téléphone : quand le navigateur devient
  téléphone, la pastille quitte la barre d'adresse et se place sous l'encoche (`Appareil`, `badge`). Les captures « smartfixx.fr » sont les vraies pages refaites
  (thème sombre), sans donnée client.
- SmartFixx est nommé à la troisième personne ; jamais de « nous ».
- L'ambre `#FFB648` est réservé à l'appel à l'action et aux fenêtres allumées de la ville (motif
  signature : une fenêtre ambre s'allume quand la demande arrive).
- 9:16 : rien d'important dans les 15 % du haut, les 25 % du bas, ni sous la colonne d'icônes à droite ;
  les sous-titres (2 lignes, fond sombre opaque) s'arrêtent au-dessus des 25 % du bas.

## Points à vérifier avant diffusion

- Remplacer les voix provisoires (P3, P5, P6, P7, C2, A1, A2, A3) par les prises ElevenLabs, écouter, puis
  relancer la chaîne et le contrôle.
- Prévisualiser chaque export dans les outils des régies publicitaires visées (zones recouvertes par
  l'interface de chaque placement) ; en Reels, comparer la version standard et la variante `-reels`.
- Faire valider par le propriétaire les textes à l'écran (`src/donnees/textes.json`), en particulier
  l'appel « Demandez votre devis ».
