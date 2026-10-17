# Audio de la VSL SmartFixx

Tout ce qui s'entend dans les vidéos : voix, musique, mixages de référence, et le minutage qui
sert de source au montage et aux sous-titres.

```
audio/
  minutage.json        généré : segments, débuts/fins, cartons de sous-titres, écran final (fait foi)
  voix/                prises retenues (WAV 48 kHz mono, -18 LUFS), voix.json, variantes/, provisoire/
  musique/             musique originale synthétisée (WAV 48 kHz stéréo, -20 LUFS), musique.json
  mix/                 voix posée + musique en retrait, par montage (-14 LUFS, crête <= -1,5 dBTP)
  outils/              scripts Node sans dépendance (ffmpeg requis ; espeak-ng pour les voix provisoires)
../captions/           SRT générés depuis minutage.json
../script/             textes : segments.json (source) et scripts découpés en tableaux
```

Regénérer après une modification de texte ou de prise :

```sh
node vsl/audio/outils/prepare-voix.mjs     # voix retenues + provisoires, voix/voix.json
node vsl/audio/outils/minutage.mjs         # minutage.json + captions/*.srt + contrôles bloquants
flock /tmp/smartfixx-build.lock node vsl/audio/outils/musique.mjs   # musiques calées sur le minutage
flock /tmp/smartfixx-build.lock node vsl/audio/outils/mixage.mjs    # mixages de référence
```

`minutage.mjs` refuse de produire un minutage si un carton dépasse 2 lignes de 32 caractères, s'il ne
reprend pas mot pour mot la voix, si une formulation interdite apparaît (« nous », prix, délai chiffré,
garantie, classement Google, avis ou nombre de clients), si la principale sort de 35–45 s, si la courte
dépasse 15 s, si une accroche sort de 3–4 s ou si l'écran final est tenu moins de 3 s.

## Voix

- **Service :** ElevenLabs, modèle `eleven_v4`, flow « SmartFixx VSL — voix off » (`7NHAMcW9YDcvAPzxY1rf`).
- **Voix retenue : Nico** (`MAZdzkb78f8SA7DNBT41`), voix masculine française, accent parisien,
  décrite comme douce, rassurante et souriante, conçue pour la publicité. Choisie parmi les voix
  françaises « publicité » de la bibliothèque parce qu'elle sonne comme un professionnel de proximité
  qui explique calmement, sans ton de bonimenteur (Paul K, Eric ou Sam sont plus « spot radio »), avec
  un accent d'Île-de-France cohérent avec Asnières-sur-Seine. Une seule voix pour toutes les déclinaisons.
- **Personne :** SmartFixx est nommé à la troisième personne ; la voix ne dit jamais « nous ». La voix
  n'est pas celle de Mohamed : elle ne parle donc pas en son nom au « je ».
- **Génération :** un appel par segment, 4 variations par appel (valeur par défaut), aucun nouvel essai
  d'un même segment.

### État des prises (16 octobre 2026)

| Segment | Statut | Prise retenue | Pourquoi |
| --- | --- | --- | --- |
| P1 | définitive | `variantes/P1_v3.mp3` (génération `NTzJIo7iogycFTlLFtXn`) | Une seule pause franche sur les points de suspension (0,72 s) et une respiration naturelle avant « pourquoi » ; les autres prises ont de petites coupures parasites dans « pourquoi vous choisir ». |
| P2 | définitive | `variantes/P2_v2.mp3` (génération `Rd2WuLAkjLXcJu4U2fVw`) | Énumération la plus régulière (pauses sur les deux virgules, longue pause de 0,96 s sur « mobile… ») et la plus resserrée (8,33 s utiles). |
| P4 | définitive | `variantes/P4_v1.mp3` (génération `H7vtrSKAPzFOdbgT4UpK`) | Seule variation produite (voir ci-dessous). |
| P3, P5, P6, P7, C2, A1, A2, A3 | **PROVISOIRE** | `provisoire/<ID>_PROVISOIRE.wav` | Pas de prise ElevenLabs : quota épuisé. |

Le choix des prises a été fait sur des mesures (structure des pauses détectées à -42/-45 dB, débit,
sonie), l'environnement de production ne permettant pas d'écoute. Les quatre variations de P1 et P2
sont conservées dans `voix/variantes/` : il suffit de changer `RETENUES` dans `outils/prepare-voix.mjs`
après écoute, puis de relancer la chaîne.

**Blocage rencontré :** pendant la génération, le compte ElevenLabs a atteint son quota
(« This request exceeds your basic seat quota of 50000 », 0 à 5 crédits restants). Ont abouti : P1 (4
variations), P2 (4 variations) et une variation de P4 ; toutes les autres générations ont échoué sans
produire d'audio. Rien n'a été relancé. Coût des prises obtenues : environ 1 000 crédits
(4 × 101 + 4 × 136 + 52).

**Voix provisoires :** synthèse locale espeak-ng (robotique, sans droit de tiers sur le rendu), étirée à
la durée estimée d'une voix naturelle (`estimation_s` dans `script/segments.json`) pour que le montage
garde son rythme. Elles servent de piste de repérage et **ne doivent pas être diffusées**.
`minutage.json` les signale (`segments_provisoires`, `provisoire: true` par montage).

**Nouvel essai (17 octobre 2026) :** un appel par segment manquant (P3, P5, P6, P7, C2, A1, A2, A3),
avec le texte exact de `script/segments.json`, la voix Nico et `eleven_v4`. Les huit appels ont été
refusés par ElevenLabs (« exceeds your basic seat quota of 50000 », 0 à 5 crédits restants) : aucun
audio produit, aucun crédit consommé. Les deux connecteurs ElevenLabs de la session pointent sur le
même espace de travail (le flow `7NHAMcW9YDcvAPzxY1rf` est visible des deux). Le flow garde des nœuds
en échec de ces essais ; ils peuvent être supprimés depuis l'interface.

**Pour terminer la voix** une fois des crédits disponibles : dans le même flow, avec la voix Nico et
`eleven_v4`, un appel par segment manquant avec le texte `voix` exact de `script/segments.json` ;
télécharger les variations dans `voix/variantes/<ID>_vN.mp3`, ajouter la prise choisie à `RETENUES`,
puis relancer les quatre commandes ci-dessus (le montage relit `minutage.json`). Coût estimé d'après
les tarifs affichés : environ 600 crédits pour une variation par segment, 2 400 pour quatre.

## Musique

**Composition originale générée par code** (`outils/musique.mjs`) : chaque son est calculé par le
programme (oscillateurs en dents de scie anti-repliement, sinus, bruit, filtres, écho et réverbération
écrits à la main). Aucun échantillon, aucune boucle, aucune mélodie ni aucun enregistrement de tiers,
aucune musique trouvée en ligne, aucun service de génération musicale. Elle appartient au propriétaire
de SmartFixx et peut être utilisée commercialement sans licence ni redevance (publicités comprises).

- Nappe nocturne en ré mineur (Rém9, Solm11, Sib maj9), pulsation douce qui entre avec le problème,
  notes cristallines comme des fenêtres qui s'allument, densité croissante avec le récit.
- Montée filtrée de 3 s, puis impact et arpège exactement au début de l'appel à l'action ; l'harmonie
  se résout en fa majeur (« la demande qui s'allume »), cadence Sib/fa → fa sur l'écran final.
- Tempo calculé pour que l'appel à l'action tombe sur un temps (93,9 BPM pour la principale, 92,8 pour la courte) ; fin nette
  par fondu d'une seconde, silence exact sur la dernière image.

| Fichier | Durée | Usage |
| --- | --- | --- |
| `musique/smartfixx-musique-principale.wav` | 42,53 s | VSL principale 9:16 et 16:9 |
| `musique/smartfixx-musique-courte.wav` | 15,00 s | Version courte |
| `musique/smartfixx-musique-boucle.wav` | 5,00 s | Boucle sans couture (8 temps à 96 BPM) pour les accroches |

Les durées et les repères suivent `minutage.json` : relancer `musique.mjs` si le minutage change.

## Mixages de référence (`mix/`)

Pour chaque montage : `smartfixx-vsl-<montage>-mix.wav` (voix + musique, posé tel quel dans les MP4 par
`../outils/rendu.mjs`) et `-voix.wav` (voix seule posée sur le minutage). La musique est baissée de 9 dB
puis compressée par la voix (sidechain) ; `mixage.mjs` mesure, segment par segment, la sonie de la voix
et celle de la musique telles qu'elles sont dans le mixage et **refuse** le résultat si la musique n'est
pas au moins 15 dB sous la voix (mesuré : 17,6 dB au plus serré dans la principale, 20 à 22 dB ailleurs).
Elle remonte dans les respirations et sur l'écran final. Sonie finale -14 LUFS (±0,2, gain corrigé après
le limiteur), crête vraie -1,7 dBTP avant AAC. Résultats détaillés : `mix/mix.json`.
Tant que des segments sont provisoires, ces mixages le sont aussi.
