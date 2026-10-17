# Livraison de la refonte SmartFixx

Branche : `claude/site-ect-repo-setup-2ddopb` (code final : commit 66dabcc), partie du dernier `main` de GitHub (`origin/main`, 1154494). Les lots 0 à 9 y sont
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
- **Lot 10** (commits 167369f à 7abae04) :
  - nettoyage du CSS de transition du panel ;
  - suppression de deux composants morts ;
  - réalisation « Ce site et son tableau de suivi des demandes » illustrée par de vraies captures de
    démonstration ;
  - focus clavier rendu visible sur le panneau d'onglet du panel ;
  - recette complète et ce document.
- **Correction finale** (après trois vérifications indépendantes de la livraison) :
  - LCP et JavaScript de l'accueil (détail au § 3) : document HTML allégé sur toutes les pages, logo
    de 120 px, JavaScript partagé débarrassé de modules inutiles ;
  - menu mobile et tablette : il se ferme quand le focus clavier en sort (WCAG 2.4.11) ;
  - 404 : une seule balise `robots` (`noindex`, posée par Next) ;
  - accueil mobile compacté (« Création ou refonte ? » et zone d'intervention) ;
  - retour arrière corrigé et complété (§ 9), procédure de release sans superposition (§ 8), § 5 et § 6
    complétés, `.gitignore` protégeant bases, sauvegardes et exports.

## 2. Tests réellement exécutés (build final de la correction finale)

Variante VPS construite par `scripts/qa/rebuild-vps.sh` dans `/home/user/vps-final` (Next 16.2.6,
`next build --webpack`), à partir du code du commit 66dabcc. Elle est servie par
`scripts/qa/serve-vps.sh` sur `127.0.0.1:3395`, avec une base temporaire et le compte fictif
`owner@example.test`. Toutes les données saisies sont fictives (« Démonstration … », adresses
`example.test`). Copie racine : `/home/user/root-final`.

| # | Porte | Résultat |
| --- | --- | --- |
| 1 | `python3 -I scripts/qa/check_prepare.py .` | `écarts: 0` |
| 2 | `rebuild-vps.sh` puis `test-vps-strict.sh … standalone` | Code 0. `http-seo` 10/10 et `http` 9/9, en `next start` puis en standalone ; `runtime` 6/6 ; Python (Nginx, empaquetage) 8/8 |
| 3 | `root-tests.sh` (copie `/home/user/root-final`) | 44/46 : seulement les 2 échecs connus de la base (« renders development preview metadata », « emits the catalog's animation and scrolling utilities ») ; `css-check` sans autre assertion manquante |
| 4 | `npm run lint` sur la copie racine | 7 erreurs, 17 avertissements (plafond : 27 erreurs) |
| 5a | `vps-crawl-check.py` **sans** `--og-404-ok` ni `--icons-404-ok` | 0 écart sur les 24 URL du sitemap et `/admin/login` |
| 5b | `seo-audit.py` | 0 page en défaut sur 24, aucun titre ni description en double, og:image partout. Asnières a 23 liens entrants hors pied (≥ 5), les guides 8, 6 et 4 (≥ 2) |
| 6 | `layout-check.mjs`, 24 URL + 404, tous les contrôles | 0 écart, 1 089 contrôles réussis : aucun débordement de 360 à 1 600 px ; en-tête sur 42 largeurs dans les deux thèmes ; CTA au-dessus du consentement ; LCP = H1 sur les 25 pages à 390 et 1 440 px ; 0 animation en mode réduit ; aucune révélation dans les 900 premiers pixels ; interrupteur de thème atteint au clavier |
| 7 | `lh.sh` (Lighthouse 13 mobile) : 2 séries de 10 passes sur l'accueil, 5 passes sur création, Asnières, refonte et contact | Voir § 3 : porte TBT ≤ 200 ms et LCP ≤ 2,6 s respectée partout ; a11y 100, CLS ≤ 0,002 |
| 8 | Lighthouse connecté sur les 6 onglets du panel, deux thèmes, une passe chacun | a11y 100 et 0 échec de contraste sur les 12 mesures. Perf de 80 à 97 et TBT de 57 à 289 ms selon l'onglet et la passe (détail au § 3) |
| 9 | Recherche dans le HTML servi des 24 URL | 0 « chatgpt.site », 0 « Sites de ChatGPT », 0 « € » sur les pages emailing. Exceptions justifiées, voir plus bas. 0 « signout-with-chatgpt » dans `components` du build |
| 10 | Parcours Playwright de bout en bout (`parcours.mjs`) | 30 contrôles réussis, 0 échec (détail ci-dessous) |
| 10b | Menu au clavier (`menu-out.mjs`, 390 et 1 280 px) | Après la dernière entrée du menu, la tabulation suivante ferme le panneau (`open=false`) et le focus arrive sur le fil d'Ariane, visible et non recouvert. Avant correction, le panneau restait ouvert et cachait l'élément focalisé |
| — | `orphan-classes.mjs` admin (référence 6d95248) | 0 orpheline nouvelle |
| — | `orphan-classes.mjs` public | 113 classes sans règle CSS (voir § 7) : la porte « 0 orpheline » n'est **pas** atteinte |

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
6. Panel au clavier : focus visible sur 12 tabulations.
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
« Après » : build final, même outil, même machine (4 processeurs partagés). Le LCP et le TBT sont les
médianes propres de chaque série ; perf et poids sont ceux de la passe médiane par score.

| Page | Perf | A11y | LCP | TBT | CLS | JS (gzip) | CSS (gzip) | Poids transféré |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Accueil, avant | 74 | 97 | 3,40 s | 703 ms | 0 | 183 Ko | 65 Ko | 417 Ko |
| Accueil, après (2 séries de 10 passes) | 97 à 99 | **100** | **2,27 s et 2,51 s** | 46 et 47 ms | 0,001 | 149 Ko | 31 Ko | 271 Ko |
| Création, avant | 90 | 96 | 3,40 s | 128 ms | 0 | 174 Ko | 65 Ko | 410 Ko |
| Création, après (5 passes) | **97** | **100** | **2,50 s** | 51 ms | 0,002 | 150 Ko | 34 Ko | 256 Ko |
| Asnières, avant | 96 | 96 | 2,57 s | 140 ms | 0 | 172 Ko | 65 Ko | 279 Ko |
| Asnières, après (5 passes) | **97** | **100** | **2,38 s** | 38 ms | 0,002 | 149 Ko | 30 Ko | 252 Ko |
| Refonte, après (5 passes) | 97 | 100 | 2,49 s | 42 ms | 0,002 | 150 Ko | 34 Ko | 255 Ko |
| Contact, après (5 passes) | 97 | 100 | 2,51 s | 50 ms | 0,002 | 153 Ko | 33 Ko | 242 Ko |

Ko = 1 024 octets transférés, en-têtes HTTP compris. Les vérificateurs de la livraison avaient obtenu, sur le
build précédent (7abae04), un LCP médian de l'accueil de 2,55 s puis 2,70 s sur deux séries de 10 passes, et
non les 2,38 s annoncés alors : ce chiffre venait d'une seule série favorable. Les valeurs ci-dessus sont
toutes celles mesurées sur le build final.

- **LCP de l'accueil : toujours bimodal, mais plus bas.** Le LCP est le H1. Lighthouse simule le chargement
  mobile : quand les deux gros morceaux de JavaScript partagés (React et Next, environ 62 Ko gzip chacun)
  s'exécutent avant l'affichage du H1 dans la trace, il les compte dans le chemin du LCP ; sinon, non. Cet
  ordre varie d'une passe à l'autre et donne deux modes.
  - Avant correction (7abae04, 10 passes des vérificateurs) : 2,37 s ou 2,74 s.
  - Après correction, série 1 (10 passes, build intermédiaire qui ne diffère du final que par deux hauteurs
    de réserve CSS hors écran) : 2 084, 2 072, 2 457, 2 519, 2 074, 2 521, 2 545, 2 576, 2 074
    et 2 082 ms ; médiane 2,27 s.
  - Après correction, série 2 (10 passes, build final) : 2 065, 2 080, 2 071, 2 080, 2 544, 2 570, 2 505,
    2 511, 2 551 et 2 556 ms ; médiane 2,51 s.
  - Les deux modes valent donc désormais environ 2,07 s et 2,46 à 2,58 s. Les 20 passes restent sous la
    porte de 2,6 s et sous le seuil d'échec de 2,8 s ; la cible de 2,5 s est tenue dans le mode bas, pas
    toujours dans le mode haut (10 passes sur 20 entre 2,505 et 2,576 s).
  - Leviers appliqués : le document HTML de l'accueil passe de 49 990 à 41 541 octets gzip (`curl`), sous le
    seuil où la simulation demande un aller-retour réseau de plus, et le logo préchargé de 14 258 à
    4 466 octets. La plus grosse part venait de la page 404 racine, que Next sérialise dans la charge RSC de **chaque** page :
    classes courtes, façade en une seule chaîne HTML, pied de page partagé avec la page et sans ville de fond,
    soit 47,6 Ko bruts ramenés à 19,3 Ko. La ville du socle est aussi sérialisée plus sobrement (DOM
    identique).
- **JS de l'accueil** : 148 651 octets gzip pour les 10 scripts modernes (`curl`), 149 Kio transférés selon
  Lighthouse : **sous** le budget de 150 Ko. Gains : `CampaignLink`, rendu partout, ne tire plus
  `lib/seo`, `lib/email-destination` ni les libellés de budget du panel (`lib/campaign-href.ts`) ; le bouton
  « Gérer la mesure d'audience » ne duplique plus le composant de consentement dans le morceau des pages
  (`components/privacy-preferences.tsx`) ; `PhoneLink` et le formulaire lisent `lib/contact-links.ts` au lieu
  de toute l'identité légale.
- **CSS public**, mesuré par `curl` en gzip, fichiers de chaque page additionnés : de 21,5 Kio (404) à
  33,0 Kio (refonte). Avant : 64,8 Ko sur toutes les pages, 3 fichiers et 347 362 octets bruts. Plafond :
  40 Ko.
- **Admin** : les 86 Ko de jetons `--sfx-*` sans lecteur ont été retirés de chaque route admin.
- **Panel**, Lighthouse connecté, une passe par onglet et par thème (12 mesures) :
  - accessibilité 100 et 0 échec de contraste partout ;
  - perf de 91 à 97 et TBT de 57 à 232 ms sur les onglets autres que Campagnes ;
  - Campagnes, le plus lourd : perf 80 (sombre) et 87 (clair), TBT 289 et 128 ms ;
  - une seule passe par mesure : les vérificateurs avaient relevé de 39 à 198 ms de TBT sur le build
    précédent, et le compte rendu du lot 10 de 63 à 125 ms. Ces valeurs varient d'une passe à l'autre sur
    cette machine partagée ; elles sont à lire comme des fourchettes.

## 4. Captures

Elles sont dans `docs/livraison/` (WebP, 1 200 px de large au plus, 938 Kio au total). Toutes les données
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
| `20-page-404-390-sombre.webp` | 404 (refaite sur le build final : façade « 404 », sans ville de fond) |
| `21-realisation-demonstration-1440-sombre.webp`, `22-…-390-sombre.webp` | Carte Réalisations avec la capture de démonstration |
| `23-admin-connexion-390.webp` | Connexion propriétaire |
| `24-admin-demandes-1440.webp`, `25-admin-demandes-390.webp` | Demandes reçues dans le panel |
| `26-admin-demande-telephone-seul-1440.webp` | Volet de la demande « téléphone seul » |
| `27-stop-avant-390.webp`, `28-stop-apres-390.webp` | Page STOP avant et après confirmation |
| `29-menu-tabulation-sortie-390.webp` | Correction finale : après la dernière entrée du menu, la tabulation ferme le panneau et le focus reste visible (ici sur le CTA de /refonte-site-internet) |

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

### Points des comptes rendus de lots, ajoutés à la recette finale

Sources : `a-valider-lots.json` (socle, lots 1, 2, 4, 5 et 7) et `decisions-et-verites.md` (plan de la
refonte). Les points des lots 3, 6, 8 et 9 ci-dessus (prestations, panel, pages secondaires et emailing,
guides, pages juridiques et STOP) ont été relevés dans leur code et leurs commits de fusion : leurs comptes
rendus n'ont pas été archivés avec le plan.

- **En-tête** : navigation courte de 1 180 à 1 519 px, Asnières & Île-de-France ajouté dès 1 420 px,
  navigation complète dès 1 520 px ; téléphone en icône sur ordinateur, en toutes lettres de 768 à 1 179 px.
- **Grain du hero** : texture en tuile de 64 px, même rendu attendu. À confirmer à l'œil sur un vrai écran.
- **Fil d'Ariane sous 480 px** : il tient sur une ligne ; seul l'élément courant est abrégé par « … », et
  seulement s'il ne tient pas.
- **Formulaire** : titres « Demandez votre devis » (création), « Présentez votre projet de refonte »
  (refonte), « Parlez-moi de votre besoin » (autre besoin) et bouton « Envoyer ma demande ».
- **Accueil** : textes de « Pour qui » (des cibles, jamais des clients), les 4 étapes de la méthode, et la
  démonstration fictive (artisan plombier « Votre Entreprise », « Démonstration Dupont »,
  `dupont@example.test`, référence SF-3A91C2E0, résultats de recherche fictifs).
- **Asnières, modalités de rendez-vous** : déplacement chez le client à Asnières et dans les communes
  voisines, visio, téléphone avec messagerie si je suis en rendez-vous ; « selon le projet » pour Paris et le
  reste de la région.
- **Variante Sites** : vinext perd les paramètres de requête des redirections 308 (`?utm_campaign=…`). À
  accepter, ou à signaler au fournisseur. La variante VPS les conserve.
- **Mot-clé « agence web »** (décision n° 19) : gardé seulement comme mot-clé (URL `/agence-web-…`,
  titres), jamais comme « nous ». À confirmer, comme la voix « Présentez-moi votre projet ».
- **VSL** (décision n° 21) : valider le script au « je », la voix, une musique sous licence commerciale et les
  déclinaisons. L'emplacement du site reste masqué (`VSL_AVAILABLE: false`) tant que la vidéo n'est pas
  livrée.
- **Demande du lot 2 au lot 10 : recalculs complets du style** (`html:has()`, `--sx-float-h` posée sur
  `<html>`). Elle n'est pas traitée au-delà de ce que le socle faisait déjà : `--sx-float-h` n'est écrite que
  si sa valeur change, et les `:has()` restants ont pour argument une classe ou un identifiant, jamais un
  attribut. Elle est abandonnée pour cette livraison : création et refonte passent la porte Lighthouse
  (TBT et LCP, § 3). Elle reste une piste si le TBT de ces pages remonte.

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

- LCP de l'accueil bimodal, 2,07 s ou 2,46 à 2,58 s (§ 3) : il repasserait au-dessus de 2,6 s si le
  document HTML de l'accueil regagnait environ 1 Ko gzip. Toute section ajoutée à l'accueil, ou tout contenu
  ajouté à la page 404 (sérialisée dans chaque page), est à mesurer ;
- `/contact`, création et refonte, médianes de 2,49 à 2,51 s ;
- les prestations entre 2,43 et 2,58 s aux lots ;
- TBT et performance du panel (§ 3), variables d'une passe à l'autre.

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
- **Références `chatgpt.site` restantes hors des pages** (identiques dans la variante VPS d'avant la refonte,
  sans effet sur les canoniques ni sur le HTML des 24 pages) :
  - `public/downloads/SmartFixx-mettre-a-jour-relais.sh`, servi en 200, télécharge depuis `chatgpt.site` :
    décider de le retirer, de le neutraliser ou de le garder pour l'ancien panel ;
  - `relay/.env.example` (`SMARTFIXX_SITE_URL=https://smartfixx-reach….chatgpt.site`) et `relay/README.md`
    renvoient encore au panel `chatgpt.site`. Sur le VPS, après la bascule, vérifier que
    `SMARTFIXX_SITE_URL` du relais vaut `https://smartfixx.fr` (`install.sh` l'a réécrit à l'installation ;
    `rollback.sh` le remettrait à l'ancienne valeur) ;
  - `robots.txt` interdit encore `/signin-with-chatgpt` et `/signout-with-chatgpt` : chemins sans objet sur
    le VPS, à retirer à terme.
- **404 de la variante Sites** : la 404 ne déclare plus elle-même `robots` ; Next ajoute `noindex` (vérifié
  sur la variante VPS). Le comportement de vinext sur la variante Sites n'est pas vérifié ici.

## 7. Écarts connus de cette livraison

- **JS de l'accueil** : corrigé (148 651 octets gzip, 149 Kio transférés, sous le budget de 150 Ko). La marge
  reste faible : React et Next en représentent à eux seuls environ 128 Ko.
- **LCP de l'accueil** : la cible de 2,5 s n'est pas garantie (mode haut jusqu'à 2,58 s) ; la porte de 2,6 s
  et le seuil d'échec de 2,8 s sont respectés sur les 20 passes (§ 3).
- **Accueil mobile** : 17 062 px à 390 px une fois toutes les sections rendues, soit encore une vingtaine
  d'écrans. « Création ou refonte ? » passe de 2 812 à 2 176 px (illustrations à 160 px, « D'autres
  besoins » en liste compacte) ; le schéma de la zone passe de 358 à 280 px de côté (section de 1 245 px). Le
  relevé de 18 334 px des vérificateurs comptait les hauteurs de réserve des sections non encore rendues. Le
  formulaire `#demande` reste en fin de page (à 13 468 px) : le CTA du hero et la barre d'appel mobile y
  mènent directement. Le remonter changerait l'ordre de `pages.md` et reste une décision du propriétaire.
- **Classes sans règle CSS sur les pages publiques** : 113, dans les fichiers des lots 1 à 9. Il s'agit de
  crochets de section (`*-section`, `*-sec`), de préfixes de modificateur construits dynamiquement
  (`sx-demo--`, `lc-pin--`…) ou de clés de données. Aucune n'a d'effet visuel constaté (layout-check à
  0 écart), mais la porte « 0 orpheline » n'est pas atteinte. Le nettoyage est à faire dans les fichiers de
  chaque lot. Liste : `node scripts/qa/orphan-classes.mjs . --css=<build>/.next/static`.
- **`app/admin/legacy-tokens.css`** : il n'est pas supprimé, mais réduit de 86 Ko à 3 Ko. Il garde des
  règles hors jetons qu'aucune feuille du panel ne reprend : focus clavier hors couche, qui bat le
  `outline-none` de shadcn (WCAG 2.4.7), police et interlettrage du panel, couleurs des graphiques en thème
  clair. Le supprimer ferait disparaître le focus de plusieurs contrôles. Son nom est donc désormais
  trompeur ; `docs/DESIGN_SYSTEM.md` le dit maintenant.
- **`components/location-page.tsx`** est conservé : les trois pages locales en importent encore les
  utilitaires. Seuls `next-step.tsx` et `service-scene.tsx` ont été supprimés.
- **Page 404** : sa ville de fond (Skyline) est retirée pour alléger la charge RSC de chaque page ; la façade
  dont les fenêtres écrivent « 404 » reste le moment signature. Ses fenêtres sont une chaîne HTML statique.
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
`update-email.sh`. Elle est à écrire, puis à **tester d'abord sur une copie du VPS**. Les étapes ci-dessous
en donnent le contenu.

1. **Avant**
   - Exporter Search Console.
   - Compléter l'hébergeur et valider les communes (§ 5).
   - Relever le port Nginx réel (3100 ou 3101).
   - Mettre les campagnes en pause dans le panel et attendre la fin des transmissions (aucun
     `campaign_runs` en `running`, aucun `campaign_targets` en `leased` ou `sending`).
   - Arrêter le relais SMTP, puis faire une sauvegarde depuis `/opt/smartfixx-vps/current` :
     `sudo docker compose -p smartfixx-web exec -T web node runtime/cli.mjs backup`. La commande affiche le
     chemin du fichier, dans le conteneur : `/data/backups/smartfixx-<date>.sqlite`, soit
     `/opt/smartfixx-vps/data/backups/` sur le VPS. Copier ce fichier hors du VPS.
2. **Préparer la release, hors du dépôt**
   - Sur un poste de travail, depuis cette branche, générer la variante complète dans un dossier **neuf et
     hors du dépôt** : `python3 vps/prepare.py /tmp/smartfixx-release-<date>/SmartFixx-site-VPS`
     (mode strict : il échoue si une chaîne attendue a disparu).
   - Empaqueter ce dossier hors du dépôt, sans `node_modules` ni `.next` :
     `tar -C /tmp/smartfixx-release-<date> --exclude=node_modules --exclude=.next -czf /tmp/smartfixx-release-<date>.tar.gz SmartFixx-site-VPS`,
     puis noter `sha256sum` de l'archive.
   - **Ne pas utiliser `vps/package.py`** : il écrit l'archive dans `public/downloads/` du dépôt et génère un
     installeur qui télécharge depuis `chatgpt.site`.
   - Transférer l'archive par SCP ou SFTP, puis vérifier l'empreinte SHA-256 sur le VPS.
3. **Installer la release à côté de l'actuelle**
   - Extraire l'archive dans un dossier **neuf** : `/opt/smartfixx-vps/releases/refonte-<date>`. Ne pas
     partir d'une copie de la release courante : 9 fichiers supprimés depuis `origin/main`
     (`app/multipage.css`, `app/redesign.css`, `app/studio.css`, `app/theme-tokens.css`, `app/unified.css`,
     `components/next-step.tsx`, `components/service-explorer.tsx`, `components/service-scene.tsx`,
     `scripts/theme-palette.py`) y resteraient.
   - Comparer avec la release courante pour repérer une éventuelle retouche locale :
     `diff -rq --exclude=node_modules --exclude=.next /opt/smartfixx-vps/current /opt/smartfixx-vps/releases/refonte-<date>`.
   - `docker build -t smartfixx-refonte:<date> /opt/smartfixx-vps/releases/refonte-<date>`. Le site actuel
     reste en ligne pendant ce temps.
4. **Basculer**
   - Noter l'image actuelle : `docker inspect --format '{{.Image}}'` du conteneur `web`.
   - Écrire `compose.override.yaml` dans la nouvelle release (`services: web: image: smartfixx-refonte:<date>`)
     et lancer `docker compose -p smartfixx-web --project-directory <nouvelle release> up -d --no-build web`,
     sur le **même** dossier de données `/opt/smartfixx-vps/data`.
   - Vérifier `/api/health`. Ne repointer `/opt/smartfixx-vps/current` qu'en cas de succès.
   - La refonte ne modifie pas Nginx : aucune commande Nginx n'est nécessaire.
5. **Vérifier**, sans reprendre les campagnes :
   - accueil, création, Asnières ;
   - une demande par téléphone seul et une par email seul, visibles dans le panel, puis archivées ;
   - connexion et déconnexion, test SMTP sans campagne, page STOP avec un lien réel ;
   - sitemap, robots, canoniques et 308 ;
   - adresse du relais : `SMARTFIXX_SITE_URL` dans `/opt/smartfixx-relay/SmartFixx-relais-SMTP/.env` doit
     valoir `https://smartfixx.fr` (et non une adresse `chatgpt.site`) ;
   - § 6.
   Reprendre les campagnes et le relais seulement ensuite.

## 9. Retour arrière

- **Application** : relancer l'image précédente notée à l'étape 4. Écrire un fichier
  `rollback.yaml` (`services: web: image: <ancienne image>`), puis
  `docker compose -p smartfixx-web --project-directory <ancienne release> -f <ancienne release>/compose.yaml -f rollback.yaml up -d --no-build web`,
  et remettre le lien `current` vers l'ancienne release. C'est exactement ce que fait le `trap rollback` de
  `update-email.sh`.
- **Nginx : ne pas utiliser `rollback.sh`.** `sudo bash /opt/smartfixx-vps/current/rollback.sh` ne restaure
  pas la release précédente : il relit `last-nginx-backup` et `last-backup`, écrits par `install.sh` lors de
  l'installation initiale du VPS, et revient **au site d'avant le VPS** (« Ancien site rétabli »). Il arrête
  aussi le relais SMTP et lui remet son ancien `.env`, qui pointe vers `chatgpt.site`. La refonte ne modifie
  pas Nginx. Si le port doit malgré tout changer, sauvegarder le vhost avant toute modification, puis, en cas
  de retour, le restaurer à la main : `sudo nginx -t`, puis `sudo systemctl reload nginx`.
- **Base de données** : la base SQLite est partagée entre les deux versions. La seule migration de la
  refonte, `drizzle/0011_giant_anthem.sql`, est additive :
  `ALTER TABLE quote_requests ADD activity text DEFAULT '' NOT NULL`. L'ancienne version continue de lire
  et d'écrire les demandes, car ses insertions nomment leurs colonnes (`app/api/devis/route.ts` de
  `origin/main`) et la nouvelle colonne prend sa valeur par défaut. Les demandes reçues pendant la refonte
  restent dans la base. Aucune restauration n'est nécessaire pour revenir en arrière.
- **Ce que l'ancien panel affiche des nouvelles demandes** :
  - l'activité n'est pas affichée ;
  - une demande « téléphone seul » apparaît dans la liste avec un email et une entreprise vides, car la
    requête de liste d'`origin/main` ne lit pas le téléphone. Dans le détail, le lien `mailto:` est vide. Le
    numéro reste dans la base et réapparaît dès le retour à la refonte (constaté sur une copie de base :
    `SF-NEW00001[email='',company='']`).
- **Restaurer la sauvegarde**, seulement en cas de corruption, car elle efface les demandes reçues
  entre-temps. `runtime/cli.mjs` n'a pas d'action `restore` : la restauration est manuelle.
  1. `sudo docker compose -p smartfixx-web --project-directory /opt/smartfixx-vps/current stop web`
  2. Mettre de côté la base actuelle :
     `sudo cp -p /opt/smartfixx-vps/data/smartfixx.sqlite /opt/smartfixx-vps/data/smartfixx.sqlite.avant-restauration`
  3. `sudo cp /opt/smartfixx-vps/data/backups/smartfixx-<date>.sqlite /opt/smartfixx-vps/data/smartfixx.sqlite`
  4. `sudo rm -f /opt/smartfixx-vps/data/smartfixx.sqlite-wal /opt/smartfixx-vps/data/smartfixx.sqlite-shm`
  5. `sudo chmod 600 /opt/smartfixx-vps/data/smartfixx.sqlite`, puis
     `sudo chown 1000:1000 /opt/smartfixx-vps/data/smartfixx.sqlite`. L'image tourne sous l'utilisateur
     `node` de `node:24-alpine`, d'UID 1000 : le vérifier avec `ls -ln /opt/smartfixx-vps/data`.
  6. `sudo docker compose -p smartfixx-web --project-directory /opt/smartfixx-vps/current up -d --no-build web`,
     puis vérifier `/api/health` et la liste des demandes.
- **Transfert de données** : un export fait par la nouvelle version contient la colonne `activity`. Ne pas
  l'importer dans l'ancienne version, dont l'import refuse les colonnes inconnues. Dans l'autre sens,
  `vps/runtime/transfer.mjs` complète `activity = ''`.
- **Côté Git** : la branche reste séparée de `main`. Revenir en arrière = redéployer le commit de `main`
  précédemment en production.
