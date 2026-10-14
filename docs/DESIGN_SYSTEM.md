# Système de design SmartFixx — « Nuit cinétique »

Référence des lots de la refonte. Le lot 0 a posé la fondation ; tout ce qui est décrit ici est **gelé** :
un lot l'utilise, il ne le modifie pas. Un besoin non couvert se signale, il ne se contourne pas.

- Direction : le bleu nuit construit, l'ambre appelle. L'ambre (`--sx-cta`, `--sx-signal`) est réservé à ce
  qui fait venir un client : CTA principal, trait sous le mot-clé du H1, point du surtitre, pastille
  « Nouvelle demande », compteur « À traiter » du panel, fenêtre qui s'allume.
- Voix : « je », au nom de Mohamed, sans photo. Le cartouche d'identité remplace le portrait.
- Outillage et portes de validation : `scripts/qa/README.md`.

## 1. Fichiers et règles d'import

| Élément | Où |
| --- | --- |
| Jetons, base, primitives `sx-`, contrat legacy, mouvement | `app/globals.css` (seul point d'entrée, importé par `app/layout.tsx`) |
| Primitives React | `components/sx/*.tsx` (index : `components/sx/index.ts`) |
| Identité légale et contact | `lib/site-identity.ts` (`SITE_IDENTITY`, `telHref`, `mailHref`) |
| Métadonnées et JSON-LD | `lib/seo.ts` |
| Client JSON défensif | `lib/fetch-json.ts` |
| Réalisations | `lib/realisations.ts` |
| Jetons de transition du panel et de la page email | `app/admin/legacy-tokens.css` (supprimé au lot 10) |

### Préfixes CSS par lot

| Lot | Dossier | Feuille | Préfixe |
| --- | --- | --- | --- |
| 1 Accueil | `components/home/` | `components/home/home.css` | `hm-` |
| 2 Acquisition | `components/acquisition/` | `components/acquisition/acquisition.css` | `aq-` |
| 3 Prestations | `components/services/` | `components/services/services.css` | `sv-` |
| 4 Pages locales | `components/local/` | `components/local/local.css` | `lc-` |
| 5 Formulaire | `components/forms/` | `components/forms/forms.css` | `fm-` ; panel des demandes `rq-` (`app/admin/admin.css`) |
| 6 Panel | `components/admin-panel/` | `app/admin/workspace.css`, `sending.css`, `campaigns.css` | `pn-` (et `camp-` existantes) |
| 8 Pages secondaires | `components/secondary/` | `components/secondary/secondary.css` | `sc-` |
| 9 Éditorial | `components/editorial/` | `components/editorial/editorial.css` | `ed-` |

Règles :
- **Ne jamais redéclarer une classe `sx-`** ni un sélecteur global (`html`, `body`, `h1`, `a`, `:root`…) dans
  une feuille de lot. Les feuilles de lot sont hors couche (`@layer`) : elles l'emportent toujours sur les
  règles `sx-` (qui sont dans `@layer components`), quel que soit l'ordre — d'où l'interdiction.
- **Résultat du spike (porte 10)** : une feuille importée par un composant SERVEUR de `components/` est bien
  chargée dans les deux chaînes, après `globals.css` :
  - `next build` (VPS) : feuille séparée, liée seulement sur les routes qui rendent le composant, après la
    feuille du socle (vérifié : `outline: rgb(1, 2, 3)` appliqué, règle de même spécificité gagnante) ;
  - vinext (racine, variante Sites) : TOUTES les feuilles sont concaténées dans un seul
    `dist/client/assets/index-*.css` servi partout ; la feuille du lot y figure après le socle.
  → Règle : importer la feuille du lot depuis son composant serveur principal
  (`import "./home.css"` dans `components/home/…`). Comme vinext sert tout partout, chaque règle d'un lot
  doit être préfixée : elle s'applique aussi aux autres pages de la variante Sites.
- Tailwind est restreint (`source(none)`) : il ne scanne que `app`, `lib`, `components/*.tsx`, les dossiers
  `components/{sx,home,acquisition,services,local,forms,secondary,editorial,admin-panel}` et les 18
  composants ui utilisés. Un utilitaire Tailwind écrit ailleurs n'est pas généré. `@source not` ne se
  laisse pas contredire par une source plus précise : d'où la liste explicite.
- Pas de nouveau dossier de premier niveau (prepare.py ne copie que `app components hooks lib db drizzle
  public vendor relay`), pas de sous-dossier `public/**/data` ni `public/**/downloads`.
- Client et serveur : un composant client n'importe jamais `@/components/sx` (l'index) ni `Breadcrumbs`
  (JsonLd devient async sur le VPS) ; il importe le fichier précis (`@/components/sx/actions`…).

## 2. Jetons

Le bloc de jetons est dans `app/globals.css` ; sombre par défaut (`<html data-theme="dark">` rendu par le
serveur), clair sous `:root[data-theme='light']`. Il part du bloc du plan (`systeme-design.md`), avec les
écarts ci-dessous, tous voulus et passés par `contrast.py` (0 échec dans les deux thèmes).

Deux blocs `:root` : le premier, `:root,[data-sx-tone='night']`, ne contient QUE les couleurs et le pont
shadcn ; le second, `:root`, la typographie, les espaces, les formes, la pile et le mouvement. La **portée
nuit** `[data-sx-tone='night']` redéclare les couleurs sombres sur un élément (et y recalcule `color`) :
`CtaBand` (toujours), `Section tone="night"`, `PageHero tone="night"`. La nuit reste la nuit dans les deux
thèmes ; en clair, la page part de l'aube (hero) et finit sur la ville de nuit (bandeau d'appel).

### Écarts au plan

| Jeton | Plan | Socle | Raison | Ratio vérifié (contrast.py) |
| --- | --- | --- | --- | --- |
| `--sx-surface` (sombre) | #0D1426 | #0E1730 | hiérarchie des fonds lisible (cartes trop proches du fond) | text-muted 8,4:1 |
| `--sx-surface-2` (sombre) | #131D35 | #172242 | idem | text-muted 7,69:1, text-faint 5,55:1, line-strong 3,81:1 |
| `--sx-surface-3` (sombre) | #1B2846 | #1F2D54 | idem | text 11,99:1, text-muted 6,62:1 |
| `--sx-line` (sombre) | #1E2B49 | #24335C | séparateurs visibles sur les nouveaux fonds (décor) | — |
| `--sx-danger` (sombre) | #FF8A8A | #FF9696 | marge sur surface-3 | 9,40:1 sur bg, 6,44:1 sur surface-3 |
| `--sx-tracking-title` | -0,025 em | -0,018 em (82 %), -0,012 em (92 %, ≥ 768 px) | les glyphes condensés se touchaient | — |
| `--sx-facade` | #0A1022 | `--sx-facade-far` #0E1838 / `--sx-facade-near` #121D42 (`--sx-facade` = alias du plan proche) | ville en deux plans | décor |
| `--sx-horizon` (sombre) | halo bleu | halo sodium ambre puis bleu | ciel de ville éclairée | décor |
| `--sx-bg` (clair) | #F5F7FC | #EEF2FA | cartes blanches détachées du fond | text-muted ≥ 6,1:1 sur tous les fonds |
| `--sx-surface-2`/`-3` (clair) | #EDF0F8 / #E1E6F3 | #E7ECF7 / #DCE3F2 | idem | text-muted 6,59:1 / 6,06:1, text-faint 4,86:1 |
| `--sx-line` (clair) | #D9DEEA | #D3DAEA | idem (décor) | — |
| `--sx-danger` (clair) | #B42318 | #A51E14 | marge sur surface-3 | 6,69:1 sur bg, 5,84:1 sur surface-3 |
| `--sx-window-off` (clair) | rgba(44,71,217,.06) | rgba(255,214,160,.10) | fenêtres éteintes sur façades encrées de l'aube | décor |
| façades (clair) | — | far #46527A, near #1B2846, `--sx-rim` ambré | concept « aube » : silhouettes encre sur ciel pêche | décor |
| `--sx-step-5` (H1) | max 5,25 rem (84 px dès 1 330 px) | `clamp(2.5rem,1.5rem + 4.6vw,6rem)` | H1 plus présent sur grand écran (89 px à 1 440) | — |

Ajouts du socle (absents du plan) : `--sx-sky-top/-mid/-low` et `--sx-sky` (ciel du hero et du bandeau :
nuit → indigo → violet sodium ; en clair, aube → pêche), `--sx-sodium` (halo ambre de l'éclairage public à la
ligne des toits), `--sx-indigo` #2A2370 (seconde température « nuit » : piste de l'interrupteur, lueur des
sections nocturnes ; texte 14,3:1 dessus), `--sx-step-6` et `--sx-leading-display` (énoncé « display »),
`--sx-radius-window` 12 px (CTA, boutons, contrôles de l'en-tête), `--sx-skyline-h`
(`clamp(120px,20vw,300px)`), `--sx-window-warm`, `--sx-rim`, `--sx-grain`, `--sx-edge`.
Ciel contrôlé : texte, text-muted, accent et signal-text ≥ 5,3:1 sur chaque arrêt dans les deux thèmes ;
CTA, focus et line-strong ≥ 3,36:1.

| Rôle | Jeton |
| --- | --- |
| Fonds | `--sx-bg`, `--sx-surface`, `--sx-surface-2`, `--sx-surface-3` (hiérarchie franche : sombre #070B18 / #0E1730 / #172242 / #1F2D54 ; clair #EEF2FA / #FFFFFF / #E7ECF7 / #DCE3F2) |
| Lignes | `--sx-line` (décor), `--sx-line-strong` (champs, ≥ 3:1), `--sx-edge` (liseré des cartes clés, décor) |
| Texte | `--sx-text`, `--sx-text-muted`, `--sx-text-faint` (jamais sur `--sx-surface-3` ni sur une pastille en clair) |
| Liens, bleu | `--sx-accent` (liens TOUJOURS soulignés), `--sx-accent-strong`, `--sx-on-accent` |
| Conversion | `--sx-cta`, `--sx-cta-hover`, `--sx-on-cta`, `--sx-cta-icon` |
| Signal ambre | `--sx-signal` (décor), `--sx-signal-text` (texte ambre lisible) |
| États | `--sx-success`, `--sx-warning`, `--sx-danger`, `--sx-violet`, `--sx-neutral` (toujours avec icône + texte) |
| Ciel (décor) | `--sx-sky` (arrêts `--sx-sky-top`, `--sx-sky-mid`, `--sx-sky-low`), `--sx-sodium`, `--sx-indigo` |
| Ville nocturne (décor) | `--sx-facade-far`, `--sx-facade-near` (`--sx-facade` = alias du plan proche), `--sx-rim` (liseré de toit, cobalt des objets chrome), `--sx-horizon` (ciel ; « aube » ambrée en clair), `--sx-window-off`, `--sx-window-on`, `--sx-window-warm` (étages allumés), `--sx-glow`, `--sx-grain` (texture SVG statique, data-URI) |
| Typo | `--sx-font-display`, `--sx-font-text`, `--sx-font-mono`, `--sx-step--1` … `--sx-step-6`, `--sx-leading-display` |
| Espaces | `--sx-space-1` … `--sx-space-10`, `--sx-section-y`, `--sx-gutter`, `--sx-container` (1240), `--sx-measure` |
| Formes | `--sx-radius-sm/md/lg/xl/pill`, `--sx-radius-window` (12 px : boutons, CTA, contrôles), `--sx-shadow-1/2`, `--sx-skyline-h` |
| Pile | `--sx-z-raised` 10, `--sx-z-header` 100, `--sx-z-sticky` 200, `--sx-z-float` 300, `--sx-z-consent` 400, `--sx-z-overlay` 500, `--sx-z-toast` 600, `--sx-z-skip` 700 |
| Flottants | `--sx-header-h` (60/72), `--sx-consent-reserve` (122 px sous 768), `--sx-float-h` (posé par JS) |
| Mouvement | `--sx-dur-fast/base/slow/scene`, `--sx-ease-out`, `--sx-ease-inout` |

Pastilles : `color-mix(in srgb, <couleur> var(--sx-chip-tint), var(--sx-surface))` (classes `sx-chip`,
`sx-chip--signal` (avec point ambre), `sx-chip--accent` (En cours), `sx-chip--violet` (Devis envoyé),
`sx-chip--success`). Statuts : Nouvelle = signal, En cours = accent, Devis envoyé = violet, Archivée = neutre. Le pont shadcn (`--background`, `--primary`, `--chart-*`…) pointe
sur ces jetons ; `dark:` suit `data-theme`, pas l'OS.

**Toute nouvelle couleur passe par `python3 scripts/qa/contrast.py`** (182 paires, 0 échec dans les deux
thèmes au lot 0, ciel compris ; texte ≥ 4,5:1, contrôles ≥ 3:1). contrast.py ne contrôle que des jetons : les
combinaisons réelles (menu mobile ouvert…) sont contrôlées par `layout-check.mjs --checks=menu`.

Pile (z-index) : les surcouches Radix du panel et des formulaires (Sheet, Dialog, AlertDialog : overlay et
contenu) sont raccordées à `--sx-z-overlay` (500), Select et Tooltip à `--sx-z-toast` (600), par des règles
HORS COUCHE en fin de `globals.css` (l'utilitaire `z-50` est dans `@layer utilities`). Elles passent donc
au-dessus de l'en-tête, du ThemeControl (300 ou 101) et du consentement (400).

## 3. Typographie

- Titres : **SFX Display** (Bricolage Grotesque, OFL 1.1), graisse 700, opsz 96, deux instances statiques :
  `public/fonts/sfx-display-82.v1.woff2` (sous 768 px) et `sfx-display-92.v1.woff2` (à partir de 768 px),
  17,9 et 18,1 Ko (plafond 24 Ko), cmap complète des 213 points de code exigés (U+00A0, U+202F, U+2010,
  U+2011 trait d'union insécable, flèches ← → ↗ comprises). Un appareil ne télécharge qu'une face (`font-stretch` par face). Construction :
  `scripts/qa/fonts/build-sfx-display.py` ; licence : `public/fonts/OFL-bricolage-grotesque.txt`.
- Texte : police système (`--sx-font-text`), chiffres tabulaires (`sx-tabular`) pour téléphone, références,
  dates.
- Replis calés : famille « SFX Display Fallback » (Arial Bold et ses équivalents métriques Liberation Sans
  et Arimo ; Roboto reçoit les mêmes réglages, approximation). Décalage du H1 mesuré au chargement de la
  police : 0,00 px à 360, 390, 412 et 1440 px (layout-check, police bloquée puis libérée).
- Échelle : H1 `step-5` / .98 ; énoncé « display » `step-6` / .88 (classe `sx-display` : H2 de chapitre
  d'exception, chiffre-clé ; 52 px à 390, 144 px au plus) ; H2 `step-3` ; H2 de chapitre `step-4` ; H3
  `step-2` ; chapeau `step-1` / 1.45 ; corps `step-0` / 1.55 ; jamais sous 12 px. Interdit : animer `font-stretch` ou
  `font-variation-settings`.
- Composition : espace fine insécable avant « ; : ! ? » et dans « », téléphone en espaces insécables
  (`SITE_IDENTITY.PHONE_DISPLAY`), mot-clé souligné ambre : `sx-keyword`. **Noms de lieux insécables** :
  `<Place>Asnières-sur-Seine</Place>` (components/sx/place.tsx : traits d'union U+2011, espaces insécables,
  `white-space: nowrap`) ou, dans une chaîne, `nb(SITE_IDENTITY.WORK_CITY)` (lib/site-identity.ts). Le
  U+2011 est dans SFX Display : un titre ne retombe pas sur la police de repli.
- Approche des titres : -0,018 em à 82 % (sous 768 px), -0,012 em à 92 % (`--sx-tracking-title`) : les
  glyphes ne se touchent plus à 1440 px.
- Surtitre (`Eyebrow`) en casse de phrase avec le point ambre, sans capitales espacées. Les petites
  étiquettes de rubrique (pied de page, groupes du menu) restent en capitales.
- Seconde voix sans seconde police : les chiffres tabulaires du titrage servent d'éléments graphiques
  (`sx-figure` pour un délai ou un nombre, `sx-ref` pour une référence SF-…).
- Panel, connexion et pages email (transition, `app/admin/legacy-tokens.css`) : texte en **Arial** (largeurs
  fixes du panel calées sur Arial : avec la pile système, le tableau des demandes débordait en 1 280-1 440 px),
  h2 et h3 en police de texte ; seul le H1 d'écran est en SFX Display, à l'approche `--sx-tracking-title`
  (l'ancien -0,045 à -0,05 em faisait se toucher les lettres), jusqu'à la refonte du panel (lots 5 et 6).

### Chargement de la police : mesure des trois variantes (lot 0)

Page jetable (PageHero, ProofList, ButtonLink, consentement, ambiance), Lighthouse 13 mobile,
`scripts/qa/lh.sh`, CPU et réseau simulés :

| Variante | LCP médiane (5 passes) | min – max | FCP médiane | CLS max |
| --- | --- | --- | --- | --- |
| swap, sans préchargement | **2,36 s** | 2,33 – 2,76 s | 1,37 s | 0,010 |
| swap + `ReactDOM.preload` | 2,75 s | 2,30 – 2,75 s | 1,07 s | 0 |
| optional, sans préchargement | 2,75 s | 2,30 – 2,80 s | 1,52 s | 0 |

Série de 3 passes : 2,75 / 2,29 / 2,75 s (même ordre). Le LCP est bimodal (≈ 2,3 ou ≈ 2,75 s) dans les
trois variantes : l'écart entre elles est dans le bruit. **Retenu : swap sans préchargement** (LCP médian
le plus bas sur 5 passes, CLS 0,010 ≤ 0,02, pas de préchargement qui viserait la mauvaise face sur
ordinateur). Le préchargement améliore le FCP mais pas le LCP ; il n'est donc pas ajouté au layout.

## 4. Mouvement — charte opposable et amendement du propriétaire

Règles R1 à R12 du plan, inchangées, sauf l'amendement ci-dessous.

- R1 : H1, chapeau, preuves et CTA du premier écran jamais animés, masqués ni à opacité de départ.
- R2 : transform et opacity seulement (clip-path et stroke-dashoffset limités à un SVG < 400 × 500).
- R3 : rien avant load + requestIdleCallback (2,5 s) ; `MotionGate` pose `html[data-motion=on|off]`
  (reduced-motion, Save-Data, deviceMemory ≥ 4, hardwareConcurrency ≥ 4).
- R4 : une scène joue une fois (≤ 7,2 s) puis reste sur un état final lisible, bouton Pause/Rejouer hors
  de la zone aria-hidden ; pas de WebGL, GSAP, Lottie ni compteur animé.
- R5 : mode réduit = zéro animation (`animation: none`, `transition: none`), contrôlé par
  `document.getAnimations().length === 0`.
- R6 : révélations en CSS (`sx-reveal`, `animation-timeline: view()`, visibles par défaut), jamais dans les
  900 premiers pixels. **Écart au plan** : la plage est bornée en longueur, `entry 0% entry 220px`, et non
  `entry 0% entry 100%` : avec la plage du plan, un bloc plus haut qu'un tiers d'écran restait lu à 35-78 %
  d'opacité (contraste du texte atténué jusqu'à 2,0:1). Un bloc est opaque dès que son haut est à 220 px
  au-dessus du bas de l'écran ; `layout-check --checks=reveal` l'exige pour CHAQUE `.sx-reveal` dont le haut
  atteint la mi-hauteur (390 × 844 et 1440 × 900). La règle des 900 px est contrôlée par
  `layout-check --checks=reveal900` (actif par défaut) : page en haut, à 390 × 844 et 1440 × 900, aucun
  `.sx-reveal`, `.sx-kinetic .sx-kw` ni `.sx-parallax` dont le haut (`top + scrollY`) est sous 900 px.
- R7 : `KineticHeading` réservé aux H2 de chapitre (accueil, création, refonte), un par écran.
- R8 : survol translateY(-1px), flèche 3 px, appui scale(.98), 120–180 ms, focus 3 px décalé de 3 px.
- R9 : bascule de thème sans transition (`html.sx-theme-switching`), fondu `startViewTransition` seulement
  si `data-motion=on` ; aucune transition de page.
- R11 : LayoutCount = 0 pendant l'animation, < 20 ms de tâches par seconde (CPU × 4) :
  `node scripts/qa/motion-cost.mjs <base> <chemin> <sélecteur>`. **Au défilement** :
  `motion-cost.mjs <base> <chemin> --scroll [--width=1440 --height=900]` parcourt la page à la molette en mode
  animé puis avec la pause globale (référence) : LayoutCount au plus +2, surcoût ≤ +40 % ou ≤ +60 ms/s
  (médianes de 3 passes). Chaque `.sx-reveal`, chaque mot de `KineticHeading` (`.sx-kw`), chaque
  `.sx-parallax` et chaque plan de ville est une animation de timeline recalculée à chaque image de
  défilement : en poser peu par écran (une section révélée d'un bloc, pas chaque carte), et mesurer.
  MotionGate pose `html[data-sx-scrolling]` pendant un défilement : l'ambiance temporelle (lueurs,
  fenêtres, reflets, halo) s'y suspend, les animations liées au défilement continuent (mesuré à 1 440 px :
  +98 ms/s avant, +70 ms/s après).
- R12 : en-tête opaque sur mobile, `backdrop-filter` seulement avec pointeur fin et ≥ 1024 px.

**Amendement (« des animations et des effets partout »)** : une AMBIANCE continue est autorisée — lueurs
qui dérivent, fenêtres du motif nocturne qui s'allument et s'éteignent, reflets, parallaxe lente — à
condition :
- transform et opacity uniquement ; uniquement sous `html[data-motion="on"]` ;
- suspendue hors écran : tout décor d'ambiance est dans un conteneur `[data-sx-ambient]`, que MotionGate
  observe et marque `data-sx-visible` ; sans cet attribut, `animation-play-state: paused` ;
- arrêtée net en `prefers-reduced-motion` ;
- contrôle GLOBAL « Mettre en pause les animations » / « Relancer les animations » (`MotionToggle`,
  ≥ 44 px, clavier, mémorisé dans `localStorage['smartfixx-motion-paused']`, pose
  `html[data-motion-paused]`) : icône de 44 × 44 dans l'en-tête à TOUTES les largeurs (visible au premier
  écran sur mobile, tôt dans l'ordre du clavier), doublée en toutes lettres dans le menu mobile et le pied
  de page. Sémantique unique : le libellé (texte ou nom accessible) dit l'action, sans `aria-pressed`. Il
  satisfait WCAG 2.2.2 pour tout le site. En pause : l'ambiance est figée, les révélations, titres
  cinétiques et parallaxes sont désactivés (contenu visible), une scène en cours se fige, et « Relancer les
  animations » la reprend. Pendant la pause globale, le bouton propre d'une scène reste utilisable (choix
  explicite de l'utilisateur) ;
- les scènes narratives peuvent rejouer quand on revient dessus (`ScenePlayer replayOnReturn`).

Pièges mesurés (CDP, CPU × 4) :
- **jamais de `var()` dans des `@keyframes`** : l'animation sort du compositeur ;
- **pas de délai positif** sur une animation d'ambiance : chaque démarrage différé réveille le fil
  principal. Utiliser des délais NÉGATIFS (départ en cours de cycle) et des cycles longs (≥ 16 s).
  Skyline : 62 ms/s → 8,8 ms/s après correction, LayoutCount 0.

- **chaque départ ou itération d'animation coûte une rafale d'images sur le fil principal** (recalcul
  de style du document) : une entrée de 0,9 s différée a été mesurée à 40 ms/s, un flottement infini de
  7 s à 8–10 ms/s de plus sur le hero ; d'où une `SignalCard` immobile. Préférer peu d'animations
  longues (cycles ≥ 20 s, délais négatifs) qui démarrent toutes ensemble au passage à `data-motion=on`.
- `motion-cost.mjs` attend 2,5 s après `data-motion=on` (`--settle`) : le pic de démarrage commun à toutes
  les animations (environ 1,5 s sous CPU × 4) n'est pas imputé à l'effet mesuré. Mesure répétée 3 fois,
  budget sur la médiane.

Classes d'ambiance disponibles (CSS du socle) : `sx-glow` (+ `--amber`, `--alt` ; la lueur ambre ne se pose
JAMAIS derrière un CTA), `sx-skyline` (`sx-skyline-plane--far|--near`, `sx-skyline-b` (+ `--b`), `sx-win`
(+ `is-on` fixe, `sx-win--signal`), `sx-floor`), `sx-signal-card`, `sx-sheen` (reflet), `sx-parallax`
(+ `--deep`), `sx-reveal`, `sx-kinetic`/`sx-kw`, `sx-grain` (texture statique, déjà posée sur `.sx-hero`,
`.sx-section--night` et `.sx-cta-band`), `sx-edge` (liseré dégradé d'une carte clé).

Geste signature « la demande qui s'allume » : la fenêtre `sx-win--signal` (16 × 22 px) de `Skyline signal`
respire lentement (halo, cycle de 9 s) et reçoit un halo ambre au survol, au focus ou à l'appui (toucher) du
CTA du hero (`[data-sx-hero]:has(.sx-btn--cta:hover|:focus-visible|:active)`),
et chaque fois qu'un ancêtre porte `data-sx-signal-on` : le formulaire (lot 5) le pose sur `<html>` après
un 201. `SignalCard` (carte « Nouvelle demande · SF-… · démonstration ») est posée, immobile, au-dessus de
la ville ; elle est masquée sous 768 px (pas de place sans toucher aux CTA). Animations propres à un lot : écrites dans sa feuille, sous
`html[data-motion='on']` (ambiance) ou `.sx-scene.is-playing` (scène), avec les mêmes règles.

## 5. Primitives (components/sx)

Serveur sauf mention. Props gelées (des props facultatives peuvent seulement s'ajouter au lot 10).

| Primitive | Props | Notes |
| --- | --- | --- |
| `PublicShell` | `children` | SiteHeader, `<main id="contenu">`, Footer, MobileCtaBar, MotionGate. Toute page publique ; jamais /admin ni /email. Le lien d'évitement « Aller au contenu » et le ThemeControl sont rendus par le layout racine AVANT la page (1er et 2e arrêts du clavier, WCAG 2.4.3) ; le lien est masqué sans `#contenu`. |
| `Section` | `tone?: 'bg'\|'surface'\|'night'`, `id?`, `labelledBy?`, `className?`, `ambient?: ReactNode` | `ambient` est rendu derrière, aria-hidden, dans un conteneur `data-sx-ambient`. `night` : portée nuit (`data-sx-tone`), nocturne dans les deux thèmes. |
| `Container` | `size?: 'default'\|'narrow'\|'wide'`, `as?`, `className?` | 1240 / 820 / 1440 px. |
| `Eyebrow` | `dot?`, `className?` | Point ambre facultatif, aligné sur la première ligne ; le texte est un seul élément (contenu mixte, `<Place>` compris, en ligne). |
| `SectionHead` | `eyebrow?`, `title`, `text?`, `id?`, `level?: 2\|3` | En-tête de section. |
| `PageHero` | `eyebrow?`, `eyebrowShort?` (surtitre affiché sous 480 px à la place d'`eyebrow`), `eyebrowDot?` (true), `title`, `tagline?`, `lead?`, `proofs?: string[]`, `actions?`, `aside?`, `breadcrumbs?: {name,path}[]`, `backdrop?`, `id?` (`hero-titre`), `className?`, `tone?: 'auto'\|'night'` (auto) | Fond : ciel `--sx-sky` + halo `--sx-sodium` (nuit en sombre, aube en clair ; `tone="night"` : nuit dans les deux thèmes). Avec une ville, le bas du hero réserve `--sx-skyline-h` + 16 px : aucun texte sur les façades. `backdrop` couvre tout le hero (`inset: 0`, `overflow: clip`). | Un seul `<h1><span class="sx-h1-main">{title}</span> <span class="sx-h1-tagline">{tagline}</span></h1>` : vraie espace, les deux parties en ligne (un seul candidat LCP). Ordre du DOM : surtitre, H1, chapeau, actions (`.sx-hero-actions`), preuves, aside. `data-sx-hero`. Réserve `--sx-consent-reserve` sous 768 px tant que `data-consent=pending`. `backdrop` = décor plein cadre (motif nocturne), aria-hidden + `data-sx-ambient`. **Anti-veuve** : la dernière espace du titre devient insécable si les deux derniers mots tiennent en 16 caractères (chaîne, ou dernier enfant d'un fragment ou d'un élément) ; une espace placée ENTRE deux nœuds (« Création de <span>site</span> ») n'est pas traitée : le lot lie lui-même ses deux derniers mots par U+00A0. Budget de lignes du hero mobile : voir plus bas. |
| `Breadcrumbs` | `items: {name,path}[]` (SANS l'accueil, ajouté en tête ; le dernier = page courante) | Fil visible + JSON-LD BreadcrumbList identique (via `breadcrumb()` de lib/seo). Serveur uniquement. |
| `ButtonLink` | `variant?: 'cta'\|'primary'\|'ghost'`, `href`, `icon?: 'arrow'\|'phone'\|'none'\|ReactNode`, `size?: 'md'\|'lg'` (48/52 px), `className?`, + attributs de lien | Passe par CampaignLink (utm_campaign propagé). `data-analytics="contact"` automatique vers /contact, /diagnostic, #demande. |
| `PhoneLink` | `compact?: boolean\|'sm'`, `label?`, `className?` | `tel:+33618745180`, « 06 18 74 51 80 ». `compact` : icône seule, aria-label « Appeler Mohamed au … ». `'sm'` : icône seule sous 480 px — à utiliser dans le hero mobile pour garder CTA et appel sur une ligne. |
| `CtaBand` | `title`, `text?`, `primaryHref?` (/contact), `primaryLabel?` (« Parler de mon projet »), `id?`, `phone?` (true), `skyline?` (true) | Remplace NextStep (alias conservé). Toujours nocturne (portée nuit) : ciel, sodium, ville (graine 5, distincte de celle du hero). La réserve basse suit `--sx-skyline-h` : aucun texte ni CTA sur les façades. |
| `ProofList` | `items: string[]`, `className?` | Chaque élément = UN span de texte ; puce « fenêtre allumée » ambre (`sx-proof-mark`, aria-hidden), plus de coche verte. |
| `Place` | `children: string` | Nom de lieu insécable (U+2011, espaces insécables, `sx-nowrap`). Serveur ou client. |
| `Cartouche` | `variant?: 'band'\|'footer'\|'compact'` | SmartFixx SASU, SIREN, siège Paris 1er, Interlocuteur Mohamed, « Je travaille depuis Asnières-sur-Seine (92) », téléphone, email. Téléphone et email : cibles de 44 px de haut (leurs lignes grandissent ; aucune zone ne se recouvre, de 360 à 1440 px). |
| `FaqList` | `items: {q, a: ReactNode}[]` | `<details>` natifs, sans JSON-LD FAQPage. |
| `KineticHeading` | `as?: 'h2'\|'h3'`, `children: string`, `id?` | Mots en inline-block, vraies espaces. |
| `Media` | `src`, `base?: 'studio-web'\|'studio-automation'\|'studio-security'\|'mail-sculpture'`, `sizes?`, `maxWidth?` (480), `alt`, `width`, `height`, `loading?` (lazy), `sheen?` | AVIF + WebP 240/480/768/1024 depuis `public/media/studio/`, original en `src`. Largeur affichée bornée à `maxWidth` (`--sx-media-max`) ; le `sizes` par défaut en découle. `layout-check --checks=media` exige un fichier ≥ 0,8 × largeur rendue × DPR (390 en DPR 3, 1440 en DPR 1 et 2). Jamais dans un hero. |
| `DemoFrame` | `kind?: 'browser'\|'phone'`, `url?`, `label?` (« Démonstration »), `description?`, `ratio?`, `children` | La barre du cadre est la `figcaption` : l'étiquette y est un élément flex (jamais sur l'URL) ; en `phone`, pastille en haut à droite. Contenu aria-hidden, `contain: layout paint`, largeur ≤ 880 px. Aucun texte < 12 px. |
| `Realisations` | `items?`, `headingLevel?: 2\|3` | Entrées `published` de lib/realisations ; carte texte + maquette DOM sans capture (tableau de suivi : compteurs, 5 demandes de démonstration avec référence, type, date et statut ; 3 demandes en 4/3 sous 480 px) ; rien si aucune entrée. |
| `Glow` | `tone?: 'blue'\|'amber'`, `size?`, `top/left/right/bottom?`, `alt?`, `duration?` | Lueur d'ambiance, à placer dans un conteneur `data-sx-ambient`. Ambre : jamais derrière un CTA. |
| `Skyline` | `seed?`, `buildings?` (11), `signal?`, `depth?` (true), `height?`, `className?` | Ville en profondeur (ciel, plan lointain, plan proche, deux gabarits de fenêtres, étages allumés, environ 10 % de lumière) et silhouette locale (immeubles de rapport à toit mansardé, cheminées, portes-fenêtres 1:2, balcons filants ; pavillons à deux pans), fenêtres qui s'allument ; `signal` = la fenêtre ambre du geste signature ; parallaxe des deux plans au défilement. Dans un hero, le bas du hero lui réserve sa hauteur. Graines : chaque graine donne une ville différente (aucune paire identique de 0 à 11) ; les graines impaires lisent la suite de hauteurs avec un autre pas. Hero : graine 0 (défaut) ; CtaBand : 5 ; un lot qui pose une troisième ville choisit une autre graine. |
| `SignalCard` | `title?`, `reference?`, `meta?`, `top/left/right/bottom?`, `className?` | Carte « Nouvelle demande » (démonstration) immobile au-dessus de la ville, dans un conteneur `data-sx-ambient` ; ≥ 768 px ; jamais sur les CTA ni le H1. |
| `ScenePlayer` (client) | `label`, `description?`, `duration?` (≤ 7200), `replayOnReturn?`, `className?`, `children` | Pose `.is-playing` (R3/R4) ; état final rendu par le serveur ; Pause/Reprendre/Rejouer hors aria-hidden ; `data-state`. |
| `StateLoading` (client) | `rows?`, `label?`, `rowHeight?` | `role=status`, `aria-busy`, squelettes à taille réservée. |
| `StateEmpty` (client) | `title`, `text?`, `action?` | |
| `StateError` (client) | `message`, `onRetry?`, `retryLabel?` (« Réessayer ») | `role=alert`. |
| `MotionGate` (client) | — | Monté par PublicShell. |
| `MotionToggle` (client) | `variant?: 'inline'\|'icon'` | Contrôle global de pause (`icon` : en-tête ; `inline` : menu et pied). |
| `MobileCtaBar` (client) | — | Monté par PublicShell (voir plan). |

Consentement : « Refuser » et « Accepter » strictement égaux (taille, graisse, couleurs ; recommandation CNIL
2020). ThemeControl : repère `region` nommé « Apparence du site » ; interrupteur natif (`button role="switch"`,
`aria-checked`, `data-slot="switch"` et `data-state`, sans radix-ui ni tailwind-merge dans le JS public) ; piste indigo et curseur ambre en mode
sombre (le bleu plein reste au panel) ; hors pages publiques, icônes seules sous 768 px.

Interface globale : `SiteHeader` (components/site-header.tsx, client ; paliers mesurés au tour 3, voir
« En-tête » ci-dessous ; pause des animations ; emplacement du thème), `Brand` et `Footer`
(components/brand.tsx), `ThemeControl` (rendu par le layout, fixé dans `.sx-theme-slot` de l'en-tête public,
dans la barre du panel quand `html.sx-admin` — position réglable par le panel via `--sx-admin-theme-top`,
`--sx-admin-theme-right`, `--sx-admin-theme-left` posées sur `html.sx-admin` —, flottant ailleurs),
`AudienceMeasurement` (consentement).

### En-tête : paliers (tour 3)

| Largeur | Navigation | Menu | Téléphone | CTA | Thème |
| --- | --- | --- | --- | --- | --- |
| < 360 px | — | oui | masqué | — | interrupteur (44 px) |
| 360-767 px | — | oui | icône | — | interrupteur (44 px) |
| 768-1023 px | — | oui | en toutes lettres | — | interrupteur (52 px) |
| 1024-1179 px | — | oui | en toutes lettres | oui | interrupteur (52 px) |
| 1180-1419 px | Création de site, Refonte, Prestations ▾ | oui (tous les liens) | icône | oui | interrupteur (52 px) |
| 1420-1519 px | + Asnières & Île-de-France | oui | icône | oui | interrupteur (52 px) |
| ≥ 1520 px | complète (+ Conseils) | non | icône | oui | soleil, interrupteur, lune (96 px) |

Le conteneur large est plafonné à 1 440 px dès 1 520 px : la place ne grandit plus. Espace libre minimal
mesuré entre la navigation et les actions, bouton de pause affiché, police DejaVu (Linux, parmi les plus
larges) : 58 px à 1 180, 65 px à 1 420, 76 px à 1 520. Le numéro en toutes lettres (+158 px) ne tient pas à
côté de la navigation complète. `layout-check --checks=header` balaie 42 largeurs (dont 1024 à 1600 px par
pas de 20 px), deux thèmes, bouton de pause forcé : ni débordement, ni chevauchement, ni libellé tronqué,
ni recouvrement par le ThemeControl, et la navigation attendue à chaque palier. Écart au plan : navigation
complète à 1 520 px et non 1 180 ; à 1 380 px (réglage du tour 1), elle chevauchait déjà les actions.

### Budget de lignes du hero mobile

À 360 × 640, consentement ouvert, le CTA du hero doit rester au moins 16 px au-dessus du consentement
(`layout-check --checks=cta`, 360 × 640, 390 × 664, 412 × 823). Budget à 360 px :

| Élément | Lignes au plus | Coût d'une ligne |
| --- | --- | --- |
| Surtitre | 1 (utiliser `eyebrowShort` sous 480 px, ex. « Mohamed · Asnières (92) ») | 22 px |
| H1 (`title`) | 3 | 39 px |
| Sous-titre (`tagline`) | 2 | 22 px |
| Chapeau (`lead`) | 3 | 25 px |

Une ligne de H1 coûte presque deux lignes de texte. Mesure de référence (page jetable, textes de l'accueil
du plan, surtitre court) : surtitre 1, H1 2, sous-titre 3, chapeau 4 lignes, marge de 34 px ; le budget
ci-dessus donne environ 42 px. Sans surtitre court, l'accueil et la page Asnières tombaient à 10 et 8 px.

Attributs posés sur `<html>` : `data-theme`, `data-consent` (`pending|set`, par le script du layout avant
le premier rendu), `data-consent-open`, `data-motion` (`on|off`), `data-motion-paused`, et la variable
`--sx-float-h` (hauteur de l'occupant flottant du bas).

Conversion « demande enregistrée » : le formulaire émet UNE fois
`window.dispatchEvent(new CustomEvent('smartfixx-lead', {detail: {reference, service}}))` après un 201
contenant une référence `SF-XXXXXXXX` ; AudienceMeasurement envoie l'événement `lead` une seule fois par
référence, seulement avec consentement et sur un chemin mesuré.

## 6. Contrats gelés pour les lots parallèles

- `components/short-quote-form.tsx` : `ShortQuoteForm({defaultService?: 'creation'|'refonte'|'autre';
  otherService?: 'developpement'|'automatisation'|'cybersecurite'|'seo'|'conseil'; campaign?: string;
  variant?: 'inline'|'page'; headingLevel?: 2|3})` — bouchon sur ProjectForm jusqu'au lot 5.
- `components/acquisition-page.tsx` : `AcquisitionPage({service: 'creation'|'refonte'})` — bouchon jusqu'au lot 2.
- `app/[slug]/page.tsx` : gelé (création/refonte → AcquisitionPage, 4 autres → ServicePage, métadonnées
  `pageMeta(s.seoTitle, s.seoDescription, '/' + slug)`, `notFound()`).
- `lib/seo.ts` (signatures gelées ; le lot 7 enrichit le contenu) :
  `pageMeta(title, description, path, opts?: {type?: 'website'|'article'; noindex?: boolean;
  publishedTime?: string; modifiedTime?: string})` (titre complet « … | SmartFixx », og:image
  `/og-image.png` 1200 × 630, `summary_large_image`) ; `breadcrumb(items)` (ajoute l'accueil) ;
  `serviceJsonLd({name, description, path, areaServed?})` ; `articleJsonLd({headline, description, path,
  datePublished, dateModified?})` ; `organization` ; `OG_IMAGE`. Le layout fournit une og:image par défaut
  aux pages qui n'utilisent pas encore pageMeta.
- `lib/site-identity.ts` : `SITE_IDENTITY` (NAME, BRAND, LEGAL, LEGAL_NAME, SIREN, SIRET, RCS, VAT,
  REGISTERED_ON, SIEGE, WORK_BASE, WORK_CITY, PUBLICATION_DIRECTOR, HOST = null, PHONE_DISPLAY, PHONE_E164, EMAIL, AREAS,
  VSL_AVAILABLE = false, confirmedLegalIds = true, personAuthorAccepted = false). Identifiants confirmés par
  le propriétaire ; **l'hébergeur du VPS n'est pas connu : ne rien inventer**. **`PHONE_DISPLAY` sépare les
  paires par U+00A0** (espace insécable) : un test doit utiliser `/06[\s\u00A0]18[\s\u00A0]74[\s\u00A0]51[\s\u00A0]80/`,
  jamais `/06 18 74 51 80/`. Exports : `nb(s)` (lieu insécable), `telHref`, `mailHref`.
- `lib/fetch-json.ts` : `postJson`, `getJson` → `{ok, status, data, kind?: 'network'|'http'|'invalid-json'}` ;
  `frenchError(kind, status, data)`.
- `lib/realisations.ts` : smartfixx publié (maquette DOM), rangvia et rydar non publiés.
- Fichiers déclarés par le layout et livrés par le lot 7 : `/og-image.png`, `/icon-192.png`,
  `/apple-touch-icon.png`, `/favicon.ico` répondent 404 jusque-là (ce n'est pas une régression ;
  `vps-crawl-check.py --og-404-ok --icons-404-ok` les tolère avec une note). `/favicon.svg` répond 200.
- Données : `seoTitle`, `seoDescription` dans services, locations, guides ; `related: ServiceId[]` dans services.
- `lib/measured-paths.ts` (tour 3) : chemins mesurés et identifiants de service, SANS contenu éditorial ;
  seul module que les composants clients rendus partout (AudienceMeasurement) importent pour la mesure.
  Ses listes recopient les slugs de services, locations et guides et les clés de `serviceLabels` ;
  `tests/measured-paths.test.mjs` vérifie l'égalité. **Un lot qui ajoute, renomme ou retire une page de
  service, de ville ou de conseil met ce fichier à jour dans le même commit** (exception assumée au gel :
  sinon le test de la racine échoue). Ne jamais importer lib/services, lib/locations, lib/guides ni
  lib/analytics-config depuis un composant client présent sur toutes les pages.
- `'lead'` dans `analyticsEvents`.

## 7. Chaînes protégées (vps/prepare.py strict)

`python3 -I scripts/qa/check_prepare.py .` doit afficher « écarts: 0 » avant toute construction ;
`vps/prepare.py` échoue désormais si une chaîne manque.

- `app/layout.tsx` : « export default function RootLayout » (non async, une fois), « ␣␣return ( » (deux
  espaces, EXACTEMENT une fois — y compris dans les commentaires), « <script dangerouslySetInnerHTML » sans
  attribut avant (une fois), clé `'smartfixx-theme'` dans ce script.
- `components/json-ld.tsx` : « export function JsonLd », « return <script ». Tout script en ligne passe par
  JsonLd (composant serveur) ou par le layout : la CSP du VPS exige le nonce.
- `lib/http-security.ts` : « origin===new URL(request.url).origin », sans import de ./seo.
- `components/admin-workspace.tsx` : « /signout-with-chatgpt?return_to=%2Fadmin » et « Cette version est
  publiée sur son adresse Sites. Le rattachement de Smartfixx.fr et la migration de ses anciennes pages
  restent à effectuer. » ; aucun autre fichier de components ne doit contenir signout-with-chatgpt.
- `app/mentions-legales/page.tsx` : « Cette version du site est hébergée via la plateforme Sites de
  ChatGPT, sur l’infrastructure Cloudflare. L’accès à cette version est contrôlé par la plateforme. »
- `app/confidentialite/page.tsx` : « Des mécanismes techniques nécessaires à l’hébergement et au contrôle
  d’accès peuvent être utilisés par la plateforme. »
- L'URL chatgpt.site uniquement dans `lib/seo.ts` (SITE_URL).
- Textes testés : « Créer mon site », « Gagner du temps », « Protéger mes outils », studio-web.webp
  (accueil) ; « Votre projet touche aussi », project-email, project-phone ; « Apparence du site »,
  « Activer le mode sombre » ; « Se connecter avec ChatGPT », « Votre activité, en clair », « Un bel
  email », « Nouvelle campagne ».

## 8. Mesures du lot 0

| Mesure | Avant | Après |
| --- | --- | --- |
| CSS public servi par page (gzip -9) | 64 764 o (3 fichiers, 347 Ko bruts) | 21 494 o (1 fichier) après le 2e tour de correction (ciel, ville locale, portée nuit compris) |
| Contrastes (contrast.py, 2 thèmes) | — | 182 paires, 0 échec (ciel compris) |
| Police de titre | aucune (Arial) | 1 fichier de 17,9 ou 18,1 Ko par appareil |
| Page jetable, layout-check | — | 0 écart : pas de défilement horizontal (360–1600, dont 1024, 1180, 1280, 1366), en-tête sans débordement ni recouvrement (deux thèmes), menu mobile ≥ 10,9:1, interrupteur de thème contenu dans sa piste et atteint à la 2e tabulation, CTA au-dessus du consentement aux 4 formats, LCP = H1 (390 et 1440), 0 animation en mode réduit, chaque `.sx-reveal` opaque à mi-hauteur, aucune icône comprimée, images `.sx-media` nettes en DPR 1 à 3, décalage du H1 0 px ; axe-core : 0 violation (8 configurations) |
| Coût d'animation (motion-cost par défaut : `--settle=2500`, médiane de 3 passes, CPU × 4) | — | ambiance du hero 10,2 ms/s après le 2e tour (ville locale, halo de la fenêtre signal qui respire ; 4,4 ms/s avant), défilement complet (`--scroll`) : +38,6 ms/s (+11 %) à 390 px, +70,2 ms/s (+25 %) à 1 440 px contre la pause globale, LayoutCount +1 ; scène de la page jetable 14,9 ms/s (passes de 6 à 15 : fenêtre courte, bruitée), reflet 4 à 6 ms/s, bandeau 1 à 6 ms/s ; LayoutCount 0 partout |
| Lint (copie racine) | 27 erreurs, 87 avertissements | 26 erreurs |
| JS transféré par page (tour 3, Playwright, gzip -9 des scripts chargés) | /mentions-legales 162 855 o, / 177 025 o | /mentions-legales 139 826 o, / 162 306 o : lib/measured-paths (plus de services, locations ni guides dans le JS client, environ 11 Ko gzip) et interrupteur natif (plus de radix-ui ni tailwind-merge, environ 11,5 Ko gzip) |
| Lighthouse mobile (tour 3, médiane de 3) | /mentions-legales : perf 96, JS 164 Ko, LCP 2,57 s, TBT 118 ms ; / : perf 89, JS 179 Ko, LCP 3,55 s | /mentions-legales : perf 98, JS 141 Ko, LCP 2,21 s, TBT 64 ms ; / : perf 90, JS 164 Ko, LCP 3,39 s (accueil non migré : LCP = image studio, composant de services de l'ancienne page) |
| En-tête (tour 3) | navigation absente de 1024 à 1379 px, chevauchement dès 1384 px | navigation courte dès 1180 px, complète dès 1520 ; 42 largeurs × 2 thèmes sans débordement, chevauchement, troncature ni recouvrement ; espace libre minimal 58 px |
| Élément LCP du hero (tour 3) | grain du fond (tuile 180 × 180 = 32 400 px²) à 360 et 390 px sur un titre court | H1 à 360, 390 et 1440 px (tuile de 64 px) |
| Tests de la racine | 41/43 | 42/44 (nouveau : tests/measured-paths.test.mjs), toujours les 2 seuls échecs connus |

Variante Sites (vinext) : toutes les feuilles, panel compris, sont concaténées en un seul fichier servi
partout ; ce n'est pas la cible de production (VPS), mais les règles de lot doivent rester préfixées.
