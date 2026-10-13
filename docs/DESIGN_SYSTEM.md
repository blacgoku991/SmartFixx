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

Le bloc de jetons est dans `app/globals.css`, tel que défini par le plan ; sombre par défaut
(`<html data-theme="dark">` rendu par le serveur), clair sous `:root[data-theme='light']`.

| Rôle | Jeton |
| --- | --- |
| Fonds | `--sx-bg`, `--sx-surface`, `--sx-surface-2`, `--sx-surface-3` |
| Lignes | `--sx-line` (décor), `--sx-line-strong` (champs, ≥ 3:1) |
| Texte | `--sx-text`, `--sx-text-muted`, `--sx-text-faint` (jamais sur `--sx-surface-3` ni sur une pastille en clair) |
| Liens, bleu | `--sx-accent` (liens TOUJOURS soulignés), `--sx-accent-strong`, `--sx-on-accent` |
| Conversion | `--sx-cta`, `--sx-cta-hover`, `--sx-on-cta`, `--sx-cta-icon` |
| Signal ambre | `--sx-signal` (décor), `--sx-signal-text` (texte ambre lisible) |
| États | `--sx-success`, `--sx-warning`, `--sx-danger`, `--sx-violet`, `--sx-neutral` (toujours avec icône + texte) |
| Motif nocturne | `--sx-facade`, `--sx-window-off` (alpha ≤ 7 %), `--sx-window-on`, `--sx-glow` |
| Typo | `--sx-font-display`, `--sx-font-text`, `--sx-font-mono`, `--sx-step--1` … `--sx-step-5` |
| Espaces | `--sx-space-1` … `--sx-space-10`, `--sx-section-y`, `--sx-gutter`, `--sx-container` (1240), `--sx-measure` |
| Formes | `--sx-radius-sm/md/lg/xl/pill`, `--sx-shadow-1/2` |
| Pile | `--sx-z-raised` 10, `--sx-z-header` 100, `--sx-z-sticky` 200, `--sx-z-float` 300, `--sx-z-consent` 400, `--sx-z-overlay` 500, `--sx-z-toast` 600, `--sx-z-skip` 700 |
| Flottants | `--sx-header-h` (60/72), `--sx-consent-reserve` (122 px sous 768), `--sx-float-h` (posé par JS) |
| Mouvement | `--sx-dur-fast/base/slow/scene`, `--sx-ease-out`, `--sx-ease-inout` |

Pastilles : `color-mix(in srgb, <couleur> var(--sx-chip-tint), var(--sx-surface))` (classes `sx-chip`,
`sx-chip--signal`, `sx-chip--accent`). Le pont shadcn (`--background`, `--primary`, `--chart-*`…) pointe
sur ces jetons ; `dark:` suit `data-theme`, pas l'OS.

**Toute nouvelle couleur passe par `python3 scripts/qa/contrast.py`** (138 paires, 0 échec dans les deux
thèmes au lot 0 ; texte ≥ 4,5:1, contrôles ≥ 3:1).

## 3. Typographie

- Titres : **SFX Display** (Bricolage Grotesque, OFL 1.1), graisse 700, opsz 96, deux instances statiques :
  `public/fonts/sfx-display-82.v1.woff2` (sous 768 px) et `sfx-display-92.v1.woff2` (à partir de 768 px),
  18,0 Ko chacune (plafond 24 Ko), cmap complète des 211 points de code exigés (U+00A0, U+202F, flèches
  ← → ↗ comprises). Un appareil ne télécharge qu'une face (`font-stretch` par face). Construction :
  `scripts/qa/fonts/build-sfx-display.py` ; licence : `public/fonts/OFL-bricolage-grotesque.txt`.
- Texte : police système (`--sx-font-text`), chiffres tabulaires (`sx-tabular`) pour téléphone, références,
  dates.
- Replis calés : famille « SFX Display Fallback » (Arial Bold et ses équivalents métriques Liberation Sans
  et Arimo ; Roboto reçoit les mêmes réglages, approximation). Décalage du H1 mesuré au chargement de la
  police : 0,00 px à 360, 390, 412 et 1440 px (layout-check, police bloquée puis libérée).
- Échelle : H1 `step-5` / .98 ; H2 `step-3` ; H2 de chapitre `step-4` ; H3 `step-2` ; chapeau `step-1` /
  1.45 ; corps `step-0` / 1.55 ; jamais sous 12 px. Interdit : animer `font-stretch` ou
  `font-variation-settings`.
- Composition : espace fine insécable avant « ; : ! ? » et dans « », téléphone en espaces insécables
  (`SITE_IDENTITY.PHONE_DISPLAY`), noms de lieux en `sx-nowrap`, mot-clé souligné ambre : `sx-keyword`.

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
  900 premiers pixels.
- R7 : `KineticHeading` réservé aux H2 de chapitre (accueil, création, refonte), un par écran.
- R8 : survol translateY(-1px), flèche 3 px, appui scale(.98), 120–180 ms, focus 3 px décalé de 3 px.
- R9 : bascule de thème sans transition (`html.sx-theme-switching`), fondu `startViewTransition` seulement
  si `data-motion=on` ; aucune transition de page.
- R11 : LayoutCount = 0 pendant l'animation, < 20 ms de tâches par seconde (CPU × 4) :
  `node scripts/qa/motion-cost.mjs <base> <chemin> <sélecteur>`.
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
  `html[data-motion-paused]`) : flottant en bas à gauche à partir de 768 px, dans le menu mobile et dans
  le pied de page. Il satisfait WCAG 2.2.2 pour tout le site. En pause : l'ambiance est figée, les
  révélations, titres cinétiques et parallaxes sont désactivés (contenu visible), une scène en cours se
  fige ;
- les scènes narratives peuvent rejouer quand on revient dessus (`ScenePlayer replayOnReturn`).

Pièges mesurés (CDP, CPU × 4) :
- **jamais de `var()` dans des `@keyframes`** : l'animation sort du compositeur ;
- **pas de délai positif** sur une animation d'ambiance : chaque démarrage différé réveille le fil
  principal. Utiliser des délais NÉGATIFS (départ en cours de cycle) et des cycles longs (≥ 16 s).
  Skyline : 62 ms/s → 8,8 ms/s après correction, LayoutCount 0.

Classes d'ambiance disponibles (CSS du socle) : `sx-glow` (+ `--amber`, `--alt`), `sx-skyline`,
`sx-skyline-b`, `sx-win` (+ `is-lit`), `sx-sheen` (reflet), `sx-parallax` (+ `--deep`), `sx-reveal`,
`sx-kinetic`/`sx-kw`. Animations propres à un lot : écrites dans sa feuille, sous
`html[data-motion='on']` (ambiance) ou `.sx-scene.is-playing` (scène), avec les mêmes règles.

## 5. Primitives (components/sx)

Serveur sauf mention. Props gelées (des props facultatives peuvent seulement s'ajouter au lot 10).

| Primitive | Props | Notes |
| --- | --- | --- |
| `PublicShell` | `children` | SiteHeader (avec lien d'évitement), `<main id="contenu">`, Footer, MobileCtaBar, MotionGate. Toute page publique ; jamais /admin ni /email. |
| `Section` | `tone?: 'bg'\|'surface'\|'night'`, `id?`, `labelledBy?`, `className?`, `ambient?: ReactNode` | `ambient` est rendu derrière, aria-hidden, dans un conteneur `data-sx-ambient`. |
| `Container` | `size?: 'default'\|'narrow'\|'wide'`, `as?`, `className?` | 1240 / 820 / 1440 px. |
| `Eyebrow` | `dot?`, `className?` | Point ambre facultatif. |
| `SectionHead` | `eyebrow?`, `title`, `text?`, `id?`, `level?: 2\|3` | En-tête de section. |
| `PageHero` | `eyebrow?`, `eyebrowDot?` (true), `title`, `tagline?`, `lead?`, `proofs?: string[]`, `actions?`, `aside?`, `breadcrumbs?: {name,path}[]`, `backdrop?`, `id?` (`hero-titre`), `className?` | Un seul `<h1><span class="sx-h1-main">{title}</span> <span class="sx-h1-tagline">{tagline}</span></h1>` : vraie espace, les deux parties en ligne (un seul candidat LCP). Ordre du DOM : surtitre, H1, chapeau, actions (`.sx-hero-actions`), preuves, aside. `data-sx-hero`. Réserve `--sx-consent-reserve` sous 768 px tant que `data-consent=pending`. `backdrop` = décor plein cadre (motif nocturne), aria-hidden + `data-sx-ambient`. |
| `Breadcrumbs` | `items: {name,path}[]` (SANS l'accueil, ajouté en tête ; le dernier = page courante) | Fil visible + JSON-LD BreadcrumbList identique (via `breadcrumb()` de lib/seo). Serveur uniquement. |
| `ButtonLink` | `variant?: 'cta'\|'primary'\|'ghost'`, `href`, `icon?: 'arrow'\|'phone'\|'none'\|ReactNode`, `size?: 'md'\|'lg'` (48/52 px), `className?`, + attributs de lien | Passe par CampaignLink (utm_campaign propagé). `data-analytics="contact"` automatique vers /contact, /diagnostic, #demande. |
| `PhoneLink` | `compact?: boolean\|'sm'`, `label?`, `className?` | `tel:+33618745180`, « 06 18 74 51 80 ». `compact` : icône seule, aria-label « Appeler Mohamed au … ». `'sm'` : icône seule sous 480 px — à utiliser dans le hero mobile pour garder CTA et appel sur une ligne. |
| `CtaBand` | `title`, `text?`, `primaryHref?` (/contact), `primaryLabel?` (« Parler de mon projet »), `id?`, `phone?` (true), `skyline?` (true) | Remplace NextStep (alias conservé). |
| `ProofList` | `items: string[]`, `className?` | Chaque élément = UN span de texte. |
| `Cartouche` | `variant?: 'band'\|'footer'\|'compact'` | SmartFixx SASU, SIREN, siège Paris 1er, Interlocuteur Mohamed, « Je travaille depuis Asnières-sur-Seine (92) », téléphone, email. |
| `FaqList` | `items: {q, a: ReactNode}[]` | `<details>` natifs, sans JSON-LD FAQPage. |
| `KineticHeading` | `as?: 'h2'\|'h3'`, `children: string`, `id?` | Mots en inline-block, vraies espaces. |
| `Media` | `src`, `base?: 'studio-web'\|'studio-automation'\|'studio-security'\|'mail-sculpture'`, `sizes?`, `alt`, `width`, `height`, `loading?` (lazy), `sheen?` | AVIF + WebP 240/480/768 depuis `public/media/studio/`, original en dernier candidat (1024w). Jamais dans un hero. |
| `DemoFrame` | `kind?: 'browser'\|'phone'`, `url?`, `label?` (« Démonstration »), `description?`, `ratio?`, `children` | Contenu aria-hidden, étiquette toujours visible, `contain: layout paint`. Aucun texte < 12 px. |
| `Realisations` | `items?`, `headingLevel?: 2\|3` | Entrées `published` de lib/realisations ; carte texte + maquette DOM sans capture ; rien si aucune entrée. |
| `Glow` | `tone?: 'blue'\|'amber'`, `size?`, `top/left/right/bottom?`, `alt?`, `duration?` | Lueur d'ambiance, à placer dans un conteneur `data-sx-ambient`. |
| `Skyline` | `seed?`, `buildings?` (11), `signal?`, `height?`, `className?` | Façades nocturnes CSS, fenêtres qui s'allument ; `signal` = une fenêtre ambre fixe. |
| `ScenePlayer` (client) | `label`, `description?`, `duration?` (≤ 7200), `replayOnReturn?`, `className?`, `children` | Pose `.is-playing` (R3/R4) ; état final rendu par le serveur ; Pause/Reprendre/Rejouer hors aria-hidden ; `data-state`. |
| `StateLoading` (client) | `rows?`, `label?`, `rowHeight?` | `role=status`, `aria-busy`, squelettes à taille réservée. |
| `StateEmpty` (client) | `title`, `text?`, `action?` | |
| `StateError` (client) | `message`, `onRetry?`, `retryLabel?` (« Réessayer ») | `role=alert`. |
| `MotionGate` (client) | — | Monté par PublicShell. |
| `MotionToggle` (client) | `variant?: 'inline'\|'floating'` | Contrôle global de pause. |
| `MobileCtaBar` (client) | — | Monté par PublicShell (voir plan). |

Interface globale : `SiteHeader` (components/site-header.tsx, client), `Brand` et `Footer`
(components/brand.tsx), `ThemeControl` (rendu par le layout, fixé dans `.sx-theme-slot` de l'en-tête public,
dans la barre du panel quand `html.sx-admin` — position réglable par le panel via `--sx-admin-theme-top`,
`--sx-admin-theme-right`, `--sx-admin-theme-left` posées sur `html.sx-admin` —, flottant ailleurs),
`AudienceMeasurement` (consentement).

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
  REGISTERED_ON, SIEGE, WORK_BASE, PUBLICATION_DIRECTOR, HOST = null, PHONE_DISPLAY, PHONE_E164, EMAIL, AREAS,
  VSL_AVAILABLE = false, confirmedLegalIds = true, personAuthorAccepted = false). Identifiants confirmés par
  le propriétaire ; **l'hébergeur du VPS n'est pas connu : ne rien inventer**.
- `lib/fetch-json.ts` : `postJson`, `getJson` → `{ok, status, data, kind?: 'network'|'http'|'invalid-json'}` ;
  `frenchError(kind, status, data)`.
- `lib/realisations.ts` : smartfixx publié (maquette DOM), rangvia et rydar non publiés.
- Données : `seoTitle`, `seoDescription` dans services, locations, guides ; `related: ServiceId[]` dans services.
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
| CSS public servi par page (gzip -9) | 64 764 o (3 fichiers, 347 Ko bruts) | 19 109 o (1 fichier, 106 Ko bruts) |
| Contrastes (contrast.py, 2 thèmes) | — | 138 paires, 0 échec |
| Police de titre | aucune (Arial) | 1 fichier de 18,0 Ko par appareil |
| Page jetable, layout-check | — | 0 écart : pas de défilement horizontal (360–1440), CTA au-dessus du consentement aux 4 formats, LCP = H1 (390 et 1440), 0 animation en mode réduit, dernier `.sx-reveal` à opacité 1, décalage du H1 0 px |
| Coût d'animation (motion-cost, CPU × 4) | — | ambiance du hero 8,8 ms/s, scène 17,7 ms/s, reflet 4,1 ms/s, bandeau 7,9 ms/s ; LayoutCount 0 partout |
| Lint (copie racine) | 27 erreurs, 87 avertissements | 26 erreurs |

Variante Sites (vinext) : toutes les feuilles, panel compris, sont concaténées en un seul fichier servi
partout ; ce n'est pas la cible de production (VPS), mais les règles de lot doivent rester préfixées.
