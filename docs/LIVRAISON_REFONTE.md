# Livraison de la refonte SmartFixx

Branche : `claude/site-ect-repo-setup-2ddopb`, partie du dernier `main` de GitHub (`origin/main`, 1154494). Les lots 0 à 9 y sont
fusionnés, puis l'intégration finale (lot 10) a été faite par-dessus. **Rien n'a été déployé** : aucune
commande n'a été lancée sur le VPS ni sur le domaine, et aucune campagne n'a été envoyée. La mise en ligne
suit la procédure prudente ci-dessous, et seulement sur consigne explicite du propriétaire.

La VSL (vidéo et projet source) est produite sur la branche `refonte/vsl`, hors de cette livraison. Sur le
site, son emplacement reste masqué (`VSL_AVAILABLE: false` dans `lib/site-identity.ts`).

## 1. Ce qui est livré

- **Site public** : 24 pages au sitemap, plus la 404. Elles sont refaites sur la direction « Nuit cinétique » :
  bleu nuit, ville dont les fenêtres s'allument, ambre réservé à l'appel à l'action, thèmes sombre et clair.
  Le site parle au « je » (Mohamed), sans prix, sans délai promis, sans avis ni référence client inventés.
  Pages principales : accueil, création et refonte de site, Asnières-sur-Seine, Île-de-France, France,
  quatre prestations, quatre pages emailing, contact, diagnostic, trois guides, pages juridiques.
- **Formulaire court réellement relié** : projet, nom, activité, puis email OU téléphone, et site
  facultatif. Le succès et la référence `SF-XXXXXXXX` ne s'affichent qu'après le 201 du serveur. Les
  validations serveur, le contrôle d'origine et les limites de requêtes sont conservés.
- **Panel** : demandes (tableau, volet, notes, statuts), tableau de bord, campagnes, désinscriptions et
  emails, acquisition et SEO. Il est remis au design, dans les deux thèmes, et toutes ses fonctions sont
  conservées. Le HTML des emails reste nettoyé et prévisualisé dans un iframe isolé (`sandbox=""`).
- **SEO technique** : canoniques `https://smartfixx.fr`, titres et descriptions uniques, un seul H1 par
  page, JSON-LD exact (Organization, WebSite, BreadcrumbList, Service, Article ; ni LocalBusiness ni
  FAQPage), sitemap, robots, image de partage, icônes. Redirections 308 ciblées (`lib/legacy-redirects.ts`),
  sans aucune redirection globale vers l'accueil.
- **Lot 10** (ce commit de livraison et les trois précédents) :
  - nettoyage du CSS de transition du panel ;
  - suppression de deux composants morts ;
  - réalisation « Ce site et son tableau de suivi des demandes » illustrée par de vraies captures de
    démonstration ;
  - focus clavier rendu visible sur le panneau d'onglet du panel ;
  - recette complète et ce document.

## 2. Tests réellement exécutés (build final, commit 1868b38 + ce document)

Variante VPS construite par `scripts/qa/rebuild-vps.sh` dans `/home/user/vps-lot10` (Next 16.2.6,
`next build --webpack`). Elle est servie par `scripts/qa/serve-vps.sh` sur `127.0.0.1:3395`, avec une base
temporaire et le compte fictif `owner@example.test`. Toutes les données saisies sont fictives
(« Démonstration … », adresses `example.test`).

| # | Porte | Résultat |
| --- | --- | --- |
| 1 | `python3 -I scripts/qa/check_prepare.py .` | `écarts: 0` |
| 2 | `rebuild-vps.sh` puis `test-vps-strict.sh … standalone` | Code 0. `http-seo` 10/10 et `http` 9/9, en `next start` puis en standalone ; `runtime` 6/6 ; Python (Nginx, empaquetage) 8/8 |
| 3 | `root-tests.sh` (copie `/home/user/root-lot10`) | 44/46 : seulement les 2 échecs connus de la base (« renders development preview metadata », « emits the catalog's animation and scrolling utilities ») ; `css-check` sans autre assertion manquante |
| 4 | `npm run lint` sur la copie racine | 7 erreurs, 17 avertissements (plafond : 27 erreurs) |
| 5a | `vps-crawl-check.py` **sans** `--og-404-ok` ni `--icons-404-ok` | 0 écart sur les 24 URL du sitemap et `/admin/login` |
| 5b | `seo-audit.py` | 0 page en défaut sur 24, aucun titre ni description en double, og:image partout. Asnières a 23 liens entrants hors pied (≥ 5), les guides 8, 6 et 4 (≥ 2) |
| 6 | `layout-check.mjs`, 24 URL + 404, tous les contrôles | 0 écart, 1 089 contrôles réussis : aucun débordement de 360 à 1 600 px ; en-tête sur 42 largeurs dans les deux thèmes ; CTA au-dessus du consentement ; LCP = H1 sur les 25 pages à 390 et 1 440 px ; 0 animation en mode réduit ; aucune révélation dans les 900 premiers pixels ; interrupteur de thème atteint au clavier |
| 7 | `lh.sh` (Lighthouse 13 mobile), 5 passes, puis 10 sur l'accueil | Voir § 3 : perf 97-98, a11y 100, CLS ≤ 0,002 |
| 8 | Lighthouse connecté sur les 6 onglets du panel, deux thèmes | a11y 100 et 0 échec de contraste sur les 12 mesures. Perf 86 à 98, TBT 63 à 125 ms |
| 9 | Recherche dans le HTML servi des 24 URL | 0 « chatgpt.site », 0 « Sites de ChatGPT », 0 « € » sur les pages emailing. Exceptions justifiées, voir plus bas. 0 « signout-with-chatgpt » dans `components` du build |
| 10 | Parcours Playwright de bout en bout (`parcours.mjs`) | 30 contrôles réussis, 0 échec (détail ci-dessous) |
| — | `orphan-classes.mjs` admin (référence 6d95248) | 0 orpheline nouvelle |
| — | `orphan-classes.mjs` public | 115 classes sans règle CSS. Ce sont des crochets de section ou des préfixes de modificateur construits dynamiquement, sans effet visuel ; la porte « 0 orpheline » n'est **pas** atteinte (voir § 7) |

Exceptions de la recherche n° 9 (lues dans leur contexte, toutes légitimes) :

- **Asnières**, « Atelier en équipe » : intitulé d'une maquette fictive de prestation, étiquetée
  « Démonstration ».
- **Refonte**, « Bienvenue sur notre site » et `/nos-services.html` : contre-exemple cité dans la planche
  avant/après et dans le plan d'URL fictif.
- **Mentions légales**, « SASU au capital de 50 € » : mention légale obligatoire, sur une page qui n'est pas
  une page emailing.

Détail du parcours de bout en bout. Il est rejoué sur le build final : seul l'en-tête `Origin` est réécrit
en `https://smartfixx.fr`, comme l'exige le serveur.

1. Accueil au clavier (1 440 px) : la 1re tabulation atteint « Aller au contenu ». Sur 14 tabulations,
   l'indicateur de focus est toujours visible.
2. Téléphone seul, sur mobile (390 × 844, tactile) : le CTA du hero mène au formulaire `#demande`. Le
   `POST /api/devis` répond 201, puis la référence s'affiche. Aucun défilement horizontal.
3. Email seul, **au clavier uniquement**, sur `/contact` (1 440 px) : chaque champ est atteint et son focus
   est visible ; Espace coche le consentement, Entrée envoie la demande ; le serveur répond 201 avec une
   référence.
4. Contrôles serveur :
   - sans email ni téléphone : 400 ;
   - origine étrangère : 403.
5. Admin non connecté : `/admin?tab=requests` redirige vers `/admin/login?retour=requests`. Après
   connexion par l'écran, on revient sur `/admin?tab=requests`, à 1 440 comme à 390 px. Les deux demandes
   des étapes 2 et 3 y sont visibles, et le volet ouvert montre le téléphone saisi.
6. Panel au clavier : focus visible sur 12 tabulations. Le panneau d'onglet n'avait aucun indicateur ;
   c'est corrigé au lot 10.
7. STOP :
   - un destinataire fictif est créé par l'API admin, sans aucun envoi ;
   - le lien signé pointe bien vers `https://smartfixx.fr/email/stop/…` ;
   - la page répond 200, en `noindex, nofollow` ;
   - après « Confirmer l'arrêt », l'état « désinscrit » est conservé au rechargement, donc enregistré par
     le serveur.

Non exécuté ici : envoi réel d'email ou de campagne (exclu par principe), parcours sur Safari et Firefox,
vrai téléphone, production derrière Nginx (voir § 6).

## 3. Mesures avant / après

« Avant » : Lighthouse 13 mobile sur la version ChatGPT de `main`, une passe par page (13 octobre 2026).
« Après » : build final, même outil, même machine (4 processeurs partagés), passe médiane.

| Page | Perf | A11y | LCP | TBT | CLS | JS (gzip) | CSS (gzip) | Poids transféré |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Accueil, avant | 74 | 97 | 3,40 s | 703 ms | 0 | 183 Ko | 65 Ko | 417 Ko |
| Accueil, après (10 passes) | **98** | **100** | **2,38 s** | **52 ms** | 0,001 | 151 Ko | 31 Ko | 291 Ko |
| Création, avant | 90 | 96 | 3,40 s | 128 ms | 0 | 174 Ko | 65 Ko | 410 Ko |
| Création, après (5 passes) | **97** | **100** | **2,48 s** | 40 ms | 0,002 | 152 Ko | 34 Ko | 276 Ko |
| Asnières, avant | 96 | 96 | 2,57 s | 140 ms | 0 | 172 Ko | 65 Ko | 279 Ko |
| Asnières, après (5 passes) | **97** | **100** | **2,48 s** | 44 ms | 0,002 | 151 Ko | 30 Ko | 271 Ko |
| Refonte, après (5 passes) | 98 | 100 | 2,10 s | 42 ms | 0,002 | 152 Ko | 34 Ko | 276 Ko |
| Contact, après (5 passes) | 97 | 100 | 2,52 s | 42 ms | 0,002 | 155 Ko | 33 Ko | 261 Ko |

Ko = 1 024 octets transférés, en-têtes HTTP compris. LCP et TBT sont les médianes propres de chaque série.

- **LCP de l'accueil, bimodal.** Sur 10 passes : 7 autour de 2,37 s, 3 autour de 2,75 s (2 780, 2 371,
  2 706, 2 366, 2 378, 2 367, 2 384, 2 748, 2 380, 2 372 ms). La médiane, 2,38 s, respecte la cible de
  2,5 s. Sur une première série de 5 passes, plus chargée, elle valait 2,62 s : au-dessus de la cible, mais
  sous le seuil d'échec de 2,8 s. Le LCP est toujours le H1.
- **CSS public**, mesuré par `curl` en gzip, fichiers de chaque page additionnés : de 21,8 Ko (404) à
  33,2 Ko (prestations, création, refonte). Avant : 64,8 Ko sur toutes les pages, 3 fichiers et
  347 362 octets bruts. Plafond : 40 Ko.
- **JS de l'accueil** : 154 682 octets transférés (151 Kio). C'est 17 % de moins qu'avant, mais
  **légèrement au-dessus** du budget de 150 Ko. Le surplus vient des morceaux partagés par toutes les pages :
  React, Next et le layout du socle représentent 148 Ko. La page d'accueil n'ajoute que 2,7 Ko. Voir § 7.
- **Admin** : les 86 Ko de jetons `--sfx-*` sans lecteur ont été retirés de chaque route admin.
- **Panel**, Lighthouse connecté, une passe par onglet et par thème :
  - accessibilité 100 et 0 échec de contraste partout ;
  - TBT de 63 à 125 ms ;
  - perf la plus basse : campagnes (86, dans les deux thèmes).

## 4. Captures

Elles sont dans `docs/livraison/` (WebP, 1 200 px de large au plus, 902 Ko au total). Toutes les données
visibles sont fictives.

| Fichier | Contenu |
| --- | --- |
| `01-accueil-clavier-1440-sombre.webp` | Accueil, focus clavier visible dans l'en-tête |
| `02-accueil-1440-sombre.webp`, `03-accueil-1440-clair.webp` | Hero de l'accueil, deux thèmes |
| `04-accueil-390-sombre.webp`, `05-accueil-390-clair.webp` | Accueil sur mobile |
| `06-formulaire-telephone-seul-390.webp` | Formulaire rempli avec le téléphone seul |
| `07-formulaire-succes-reference-390.webp` | Confirmation après enregistrement, avec la référence |
| `08-contact-email-seul-clavier-1440.webp` | /contact, demande par email seul envoyée au clavier |
| `09-creation-1440-sombre.webp`, `10-creation-390-sombre.webp` | Création de site |
| `11-refonte-1440-sombre.webp`, `12-refonte-390-clair.webp` | Refonte de site |
| `13-asnieres-1440-sombre.webp`, `14-asnieres-390-sombre.webp` | Asnières-sur-Seine |
| `15-ile-de-france-390-clair.webp` | Île-de-France |
| `16-referencement-seo-1440-sombre.webp` | Prestation Référencement SEO |
| `17-services-390-sombre.webp` | Services |
| `18-guide-refonte-390-clair.webp` | Guide « Préparer la refonte » |
| `19-mentions-legales-390-sombre.webp` | Mentions légales |
| `20-page-404-390-sombre.webp` | 404 |
| `21-realisation-demonstration-1440-sombre.webp`, `22-…-390-sombre.webp` | Carte Réalisations avec la capture de démonstration |
| `23-admin-connexion-390.webp` | Connexion propriétaire |
| `24-admin-demandes-1440.webp`, `25-admin-demandes-390.webp` | Demandes reçues dans le panel |
| `26-admin-demande-telephone-seul-1440.webp` | Volet de la demande « téléphone seul » |
| `27-stop-avant-390.webp`, `28-stop-apres-390.webp` | Page STOP avant et après confirmation |

Captures servies sur le site (plan B des réalisations) : `public/media/realisations/`.

- Le tableau de suivi, l'accueil et la page Création, en AVIF et WebP 480/768/1200.
- Seul le tableau de suivi est affiché, dans le cadre étiqueté « Démonstration ».
- Les demandes visibles ont été créées par l'API sur une base de recette : « Démonstration Dupont »,
  « Démonstration Martin », etc.

## 5. Contenus et décisions à valider par le propriétaire

### Bloquant avant la mise en production

1. **Hébergeur du VPS** (nom, adresse, téléphone), à renseigner dans `SITE_IDENTITY.HOST`
   (`lib/site-identity.ts`). Les mentions légales affichent « Information en cours de mise à jour ».
2. **Directeur de la publication** : la loi demande le nom complet (Mohamed Maatoug, confirmé ; à vérifier
   à l'affichage des mentions générées sur le VPS). Confirmer aussi le RCS, le n° de TVA FR15943047290 et la
   date d'immatriculation avant de les garder dans le JSON-LD.
3. **Communes** :
   - les 13 communes de `/agence-web-ile-de-france` (`ILE_DE_FRANCE_ZONE.validated = false`) : c'est la
     condition des 308 des anciennes pages de villes (une commune retirée = une 404 assumée) ;
   - les voisines d'Asnières (`ASNIERES_NEIGHBOURS`) et le schéma indicatif de la Seine.
4. **Page Hauts-de-Seine** : décider avant la mise en ligne s'il y aura une vraie page. Une 308 reste en
   cache dans les navigateurs.
5. **Export Search Console** (Introuvable (404), Pages indexées) : le croiser avec `lib/legacy-redirects.ts`
   avant de figer les redirections.
6. **Date de mise en ligne** : `REFONTE_DATE` vaut provisoirement `2026-10-14` dans `app/sitemap.ts`.

### Textes et libellés

- **Accueil**
  - Les trois preuves du hero et la phrase « Je le conçois, je le construis et je reste votre seul
    interlocuteur » (visible dès 640 px).
  - Le sous-titre du H1 tient sur 3 lignes en mobile, au lieu du budget de 2 : l'accepter, ou raccourcir le
    H1 (impact SEO).
  - Les 6 réponses de la FAQ, les livrables, la zone et les modalités de rendez-vous.
- **Création et refonte**
  - Preuves du hero, tableau Inclus / Option / Défini au devis (frais récurrents compris), objections.
  - Titres des Réalisations : « Un exemple concret : ce site », « Le niveau de finition visé après la
    refonte ».
  - Maquettes « Menuiserie Démo » et pastilles « Méthode · Projets · FAQ ».
- **Réalisation de repli** : libellé « Ce site et son tableau de suivi des demandes » et ses captures
  fictives. Rangvia et Rydar Drive restent `published: false` : pour les publier, il faut leurs captures
  (1 440 × 900 et 390 × 844, sans données personnelles), une phrase de présentation chacun et
  l'autorisation de publier.
- **Quatre prestations** (développement, automatisation, cybersécurité, SEO)
  - FAQ : propriété du code « précisée dans le devis », fiche Google Business « à votre nom ».
  - Limites : « je n'achète pas de liens », « je ne demande jamais de mot de passe par formulaire ni par
    email ».
  - Exemples « Situation type, pas un client ».
  - Ordre de la planche SEO.
- **Pages locales**
  - Les 5 questions d'Asnières.
  - Les exemples types (commerce, artisan, profession libérale).
  - Le déroulement de la page France.
  - Les notes par département.
  - La mention « Je travaille depuis Asnières-sur-Seine (92) », la ville seulement.
- **Pages secondaires** : nouveaux chapeaux de `/services`, `/solutions`, `/methode` et `/tarifs`.
- **Guides**
  - Phrases au « je » ajoutées.
  - Auteur affiché « SmartFixx » tant que `personAuthorAccepted = false`. Passer le drapeau à `true` affiche
    « Mohamed, SmartFixx » (Person).
  - Appel principal du guide emailing vers `/contact?service=emailing`.
- **Mentions et confidentialité** : la mention des démonstrations étiquetées et le crédit de la police
  Bricolage Grotesque (OFL 1.1).
- **Page STOP**
  - Libellé du bouton : « Confirmer l'arrêt ».
  - Les textes juridiques restent inchangés (« notre liste d'exclusion », « écrivez-nous ») : les passer au
    « je » demande l'accord du propriétaire.
- **Image de partage et 404** : leurs textes. Monogramme S du favicon (trait ambre) ; l'en-tête garde le
  logo actuel.
- **Panel**
  - Libellés de navigation : « Désinscriptions & emails », « Tableau de bord », « Acquisition & SEO ».
  - En-tête « Mohamed · Propriétaire », sans photo.
  - Statuts au féminin.
  - Titre de secours d'une demande : activité avant le nom.

### Décisions commerciales encore ouvertes

- **Emailing** : les engagements de `/garanties` (remplacement sous 30 jours, avoirs, optimisation sans
  frais), l'offre « data ciblée », le B2C et les « sources vérifiées » sont **retirés ou masqués**. Ils ne
  reviennent que sur confirmation écrite.
- **Grille tarifaire interne** (`lib/offers.ts`) : la garder comme estimation visible seulement dans le
  panel (choix actuel), ou la neutraliser.
- **Pages et outils**
  - `/diagnostic` : la garder (choix actuel) ou la fusionner en 308 vers `/contact?service=conseil`.
  - `/admin/transfert-vps` (« Migration des données ») : la garder, la renommer « Sauvegarde chiffrée » ou
    la retirer de la variante VPS.
- **Modèles d'email** (`lib/email-template.ts` et suivants) : toujours au « nous », avec « SMARTFIXX / POUR
  VOTRE ENTREPRISE ». Ils ne sont pas modifiés sans accord, car ce sont les emails réellement envoyés.
- **Notification et statuts**
  - Aucune notification au propriétaire à l'arrivée d'une demande : il faut ouvrir le panel.
  - Les statuts commerciaux de `SEO_ADS.md` demandent une évolution de l'API.
- **Thème et voix**
  - Thème par défaut (sombre imposé ou réglage du système).
  - Ambre comme couleur de conversion.
  - Voix des annonces et de la VSL : « je » ou « nous » (« Présentez-moi votre projet » proposé).

### Points de mesure à surveiller

Mesures prises sur une machine partagée, qui restent proches des limites :

- LCP de l'accueil bimodal (§ 3) ;
- `/contact`, 2,52 s ;
- les prestations entre 2,43 et 2,58 s aux lots ;
- TBT du panel en vue d'ensemble, de 87 à 125 ms ici.

## 6. À vérifier sur le VPS réel

- **Port Nginx** : `vps/nginx_switch.py` et `vps/compose.yaml` utilisent `3100`, alors que
  `docs/TRANSFERT.md` indique `3101` en production. Relever le port réellement servi avant toute bascule et
  garder celui-là.
- **Connexion derrière Nginx**
  - `x-smartfixx-client-ip` transmis et retour `?retour=` après connexion.
  - Le contrôle d'origine des écritures (formulaire, panel, CampaignFlow) avec la vraie origine
    `https://smartfixx.fr`. Ici, l'en-tête `Origin` était réécrit par Playwright.
  - Une vraie expiration de session : le PATCH d'une demande doit répondre 403 « Accès administrateur
    requis. », et aucun proxy ne doit transformer ce 403 en page HTML.
- **CSP de production** : chargement à la demande des écrans du panel, styles en ligne des captures.
- **Emails** : rejouer STOP et préférences avec un vrai lien d'email, même origine et **sans envoi de
  campagne**. Les liens `chatgpt.site` déjà envoyés restent servis par l'ancien panel en pause.
- **Mentions légales** générées par `prepare.py` : texte « installé sur le serveur privé… », hébergeur
  complété, directeur de la publication.
- **Téléphone réel** (iPhone et Android) :
  - saut vers `#demande` ;
  - feuille « Plus » du panel (zone de sécurité iOS) et ThemeControl masqué à l'ouverture ;
  - allumage au défilement de `/services`, `/diagnostic`, `/methode` et `/garanties` ;
  - Safari et Firefox, non testés ici (`:has`, `:target`, `view-timeline` sur Chromium seulement : le
    sommaire des guides reste statique ailleurs, ce qui est voulu).
- **Search Console** : export avant la bascule, puis soumission du sitemap `https://smartfixx.fr/sitemap.xml`
  après la bascule.
- **Mesures** : un Lighthouse sur la production (HTTPS, compression Nginx), pour comparer avec les mesures
  de laboratoire ci-dessus.

## 7. Écarts connus de cette livraison

- **JS de l'accueil** : 151 Kio transférés, pour un budget de 150 Ko. Le dépassement de 1 % vient du socle
  partagé (React, Next, layout). Le réduire demande d'alléger les composants clients du layout (en-tête,
  consentement, mouvement), un travail de socle hors du périmètre du lot 10.
- **Classes sans règle CSS sur les pages publiques** : 115, dans les fichiers des lots 1 à 9. Il s'agit de
  crochets de section (`*-section`, `*-sec`), de préfixes de modificateur construits dynamiquement
  (`sx-demo--`, `lc-pin--`…) ou de clés de données. Aucune n'a d'effet visuel constaté (layout-check à
  0 écart), mais la porte « 0 orpheline » n'est pas atteinte. Le nettoyage est à faire dans les fichiers de
  chaque lot. Liste : `node scripts/qa/orphan-classes.mjs . --css=<build>/.next/static`.
- **`app/admin/legacy-tokens.css`** : il n'est pas supprimé, mais réduit de 86 Ko à 3 Ko. Il garde des
  règles hors jetons qu'aucune feuille du panel ne reprend : focus clavier hors couche, qui bat le
  `outline-none` de shadcn (WCAG 2.4.7), police et interlettrage du panel, couleurs des graphiques en thème
  clair. Le supprimer ferait disparaître le focus de plusieurs contrôles. Son nom est donc désormais
  trompeur ; `docs/DESIGN_SYSTEM.md` (socle) annonce encore sa suppression.
- **`components/location-page.tsx`** est conservé : les trois pages locales en importent encore les
  utilitaires. Seuls `next-step.tsx` et `service-scene.tsx` ont été supprimés.
- **Primitive `Realisations` du socle** : elle a été complétée par l'intégrateur (`<picture>` AVIF/WebP,
  cadre « Démonstration »). C'était nécessaire pour servir les captures ; c'est une exception au gel du
  socle.
- **Liens entrants** : `/mentions-legales` n'a qu'un lien hors pied de page. Il reste lié depuis le pied de
  page de toutes les pages.

## 8. Mise en ligne prudente (à faire seulement sur consigne explicite)

Il n'existe pas encore de script de mise à jour **complète** du site. `vps/install.sh` est une installation
initiale : elle refuse de tourner si le port 3100 répond déjà. `vps/update-email.sh`, lui, ne remplace
qu'une liste fixe de fichiers d'emailing et télécharge son paquet depuis `chatgpt.site`. La refonte touche
la plupart des fichiers : il faut donc une procédure de mise à jour en release séparée, sur le modèle de
`update-email.sh`. Elle est à écrire, puis à **tester d'abord sur une copie du VPS**.

1. **Avant**
   - Exporter Search Console.
   - Compléter l'hébergeur et valider les communes (§ 5).
   - Relever le port Nginx réel (3100 ou 3101).
   - Mettre les campagnes en pause dans le panel et attendre la fin des transmissions (aucun
     `campaign_runs` en `running`, aucun `campaign_targets` en `leased` ou `sending`).
   - Arrêter le relais SMTP, puis faire une sauvegarde :
     `sudo docker compose exec -T web node runtime/cli.mjs backup` depuis `/opt/smartfixx-vps/current`.
     Copier la sauvegarde hors du VPS.
2. **Préparer**
   - Construire la release depuis cette branche : `vps/prepare.py` en mode strict, puis empaquetage.
   - Transférer l'archive par SCP ou SFTP, sans téléchargement depuis `chatgpt.site`, et vérifier son
     empreinte SHA-256.
   - Copier la release courante dans `/opt/smartfixx-vps/releases/refonte-<date>`, y déposer les nouveaux
     fichiers, puis `docker build -t smartfixx-refonte:<date>`. Le site actuel reste en ligne pendant ce
     temps.
3. **Basculer**
   - Noter l'image actuelle : `docker inspect --format '{{.Image}}'` du conteneur `web`.
   - Lancer la nouvelle image avec un `compose.override.yaml`, sur le **même** dossier de données
     `/opt/smartfixx-vps/data`.
   - Vérifier `/api/health`. Ne repointer `/opt/smartfixx-vps/current` qu'en cas de succès.
4. **Vérifier**, sans reprendre les campagnes :
   - accueil, création, Asnières ;
   - une demande par téléphone seul et une par email seul, visibles dans le panel, puis archivées ;
   - connexion et déconnexion, test SMTP sans campagne, page STOP avec un lien réel ;
   - sitemap, robots, canoniques et 308 ;
   - § 6.
   Reprendre les campagnes et le relais seulement ensuite.

## 9. Retour arrière

- **Application** : relancer l'image précédente notée à l'étape 3 (`compose.override.yaml` pointant vers
  l'ancienne image, `docker compose up -d --no-build web`), puis remettre le lien `current` vers l'ancienne
  release. C'est exactement ce que fait le `trap rollback` de `update-email.sh`.
- **Base de données** : la base SQLite est partagée entre les deux versions. La seule migration de la
  refonte, `drizzle/0011_giant_anthem.sql`, est additive :
  `ALTER TABLE quote_requests ADD activity text DEFAULT '' NOT NULL`. L'ancienne version continue de lire
  et d'écrire les demandes, car ses insertions nomment leurs colonnes (`app/api/devis/route.ts` de `origin/main`) et la nouvelle colonne prend sa valeur par défaut. Les
  demandes reçues pendant la refonte restent dans la base ; leur activité n'est simplement pas affichée par
  l'ancien panel. Aucune restauration de sauvegarde n'est nécessaire pour revenir en arrière ; ne restaurer
  la sauvegarde de l'étape 1 qu'en cas de corruption, car elle effacerait les demandes reçues entre-temps.
- **Transfert de données** : un export fait par la nouvelle version contient la colonne `activity`. Ne pas
  l'importer dans l'ancienne version, dont l'import refuse les colonnes inconnues. Dans l'autre sens,
  `vps/runtime/transfer.mjs` complète `activity = ''`.
- **Nginx** : si la configuration Nginx a été modifiée, `sudo bash /opt/smartfixx-vps/current/rollback.sh`
  restaure la sauvegarde de configuration. Cela n'affecte pas les données.
- **Côté Git** : la branche reste séparée de `main`. Revenir en arrière = redéployer le commit de `main`
  précédemment en production.
