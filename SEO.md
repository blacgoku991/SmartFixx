# Référencement — état mesuré et leviers restants

Document de suivi. Les chiffres viennent d'une mesure réelle, pas d'une
estimation : Lighthouse en profil mobile (4G simulée, processeur ralenti 4×) sur
le build de production servi en local.

**Dernière mesure : 26 juillet 2026.**

---

## Scores

| Catégorie | Avant | Après | Cible |
| --- | --- | --- | --- |
| SEO technique | 100 | **100** | 100 |
| Bonnes pratiques | 100 | **100** | 100 |
| Accessibilité | 96 | **100** | 100 |
| Performance | 27 | **60** | 80+ |

| Métrique | Avant | Après |
| --- | --- | --- |
| First Contentful Paint | 10,1 s | **5,2 s** |
| Largest Contentful Paint | 10,9 s | **5,6 s** |
| Total Blocking Time | 1 660 ms | **220 ms** |
| Cumulative Layout Shift | 0,088 | 0,088 |
| Poids transféré | 1 755 Ko | **878 Ko** |

Les Core Web Vitals sont un facteur de classement, et Google les évalue sur
mobile. Le LCP visait 2,5 s pour être « bon » : il reste du chemin, voir
« Performance » plus bas.

### Reproduire la mesure

```bash
npm run build
npx http-server dist -p 4178 --silent &
npx lighthouse http://127.0.0.1:4178/ \
  --only-categories=seo,accessibility,best-practices,performance \
  --chrome-flags="--headless --no-sandbox" --view
```

---

## Ce qui est en place

**Architecture**

- 24 pages HTML statiques pré-rendues : le contenu est indexable sans JavaScript
- Une URL = un fichier ; aucune réécriture globale vers `index.html`
- `trailingSlash: false` — `/page/` redirige en 308 vers `/page`, pas de doublon
- `sitemap.xml` (24 URL), `robots.txt`, canonical et hreflang par page

**Données structurées** — `src/components/Seo.tsx`

- `Organization` + `LocalBusiness` + `ProfessionalService` : coordonnées, zone
  desservie, horaires, catalogue de prestations
- Identifiants publics et vérifiables : `vatID`, `taxID` (SIRET),
  `identifier` (SIREN), `founder`. Pour une entreprise jeune, sans historique ni
  liens entrants, c'est ce qui la rattache à une entité réelle que Google
  recoupe avec les registres.
- `Service` rattaché à une `City` sur chaque page commune
- `FAQPage`, `BreadcrumbList`
- `logo` en PNG 512 — Google ignore le SVG pour le logo d'une organisation

**Contenu local**

- 12 pages communes + 4 pages départementales + 1 index des zones
- Recouvrement textuel entre pages communes mesuré à 35 %, sous le seuil où
  Google traite des pages locales comme dupliquées
- Aucun nom de commune dans le texte visible de l'accueil : les pages locales
  servent le référencement sans donner l'impression d'un annuaire

---

## Ce qui reste, par impact décroissant

### 1. Fiche Google Business — hors code, et c'est le levier n°1

Dans le classement du bloc carte, l'essentiel des facteurs vient de la fiche,
pas du site. Tant qu'elle n'est pas validée, « agence web asnières » reste hors
d'atteinte quel que soit l'état du code.

Activité exercée depuis un domicile : se déclarer **prestataire de zone**
(« je me déplace chez mes clients »). L'adresse est vérifiée par Google mais
n'est pas affichée publiquement.

### 2. Avis clients

Deuxième facteur du classement local, environ 17 % du poids. Demander un avis à
chaque client livré, avec le lien direct fourni par la fiche. Répondre à tous.

⚠️ **Ne pas ajouter d'`AggregateRating` inventé dans le JSON-LD.** Les notes
auto-déclarées, sans avis réellement collectés et affichés sur le site, sont une
violation explicite des consignes de Google, sanctionnée par la perte des
résultats enrichis sur tout le domaine. Les avis Google se travaillent sur la
fiche, pas dans le balisage.

### 3. Performance — LCP encore à 5,6 s

Ce qui a déjà été corrigé :

- La scène WebGL n'est plus chargée sur mobile, sur machine modeste, ni en
  `prefers-reduced-motion` (`useLowPower`). Elle repoussait le LCP à 11 s.
- `three` et `@react-three/*` retirés de `manualChunks` : un chunk nommé les
  rattachait au graphe de l'entrée, et Vite émettait un `modulepreload` — près
  d'un mégaoctet téléchargé sur chaque page pour du code jamais exécuté.

Ce qui reste, par ordre de gain :

| Levier | Gain attendu | Coût |
| --- | --- | --- |
| Sortir `framer-motion` du chemin critique (891 ms d'exécution, 133 Ko) — remplacer `Reveal` par une animation CSS pilotée par `IntersectionObserver` | LCP −1 à −2 s | Refonte contenue, `Reveal` est utilisé partout |
| Réduire le nombre de fontes chargées d'emblée (5 fichiers, ~180 Ko) | FCP −0,5 s | Faible |
| Alléger le chunk principal (336 Ko, 151 Ko inutilisés) | −750 ms | Moyen |

### 4. Renseignements manquants dans `src/data/site.ts`

- **`phone`** — vide. Un numéro affiché est un signal local (cohérence
  nom/adresse/téléphone avec la fiche Google) *et* un levier de conversion.
- **`social`** — vide. Les entrées précédentes pointaient sur les accueils de
  LinkedIn et GitHub, ce qui n'identifie rien ; elles ont été retirées. Dès que
  des profils d'entreprise existent, les ajouter : ils alimentent `sameAs`, qui
  relie le site à une entité connue.
- **`host.address`** — l'adresse de Vercel a été renseignée sans vérification.
  À confronter à la page légale de Vercel.

### 5. Contenu éditorial

Le site répond aujourd'hui aux requêtes commerciales locales. Il ne capte rien
des requêtes informationnelles (« combien coûte un site vitrine », « refaire son
site sans perdre son référencement », « automatiser un devis »), qui sont moins
disputées et amènent des visiteurs plus tôt dans leur réflexion.

C'est le seul levier qui fasse progresser au-delà du local, et le plus lent :
compter plusieurs articles solides avant un effet mesurable.

---

## Ce qui n'est pas atteignable, et pourquoi le dire

« Agence web » et « création site web » **au national** sont parmi les requêtes
les plus disputées du marché français : les premières places sont tenues par des
sites installés depuis dix ou quinze ans, avec des milliers de liens entrants.
Aucun réglage technique ne compense cet écart.

L'ordre réaliste :

1. `smartfixx` — déjà premier
2. `agence web asnières`, `création site internet asnières` — atteignable en
   quelques mois avec la fiche Google et les avis
3. `agence web 92`, `agence web hauts-de-seine` — ensuite, via les pages
   départementales
4. `agence web` géolocalisé autour d'Asnières — dépend surtout de la fiche
5. `agence web` / `création site web` au national — hors de portée à court terme

---

## Ce qu'il ne faut pas faire

- **Servir un contenu différent aux robots et aux visiteurs** (cloaking). C'est
  la violation que Google sanctionne par une action manuelle sur le domaine
  entier, pas sur une page.
- **Mettre les pages locales en `noindex` ou les priver de tout lien interne.**
  Une page orpheline est explorée rarement et classée mal ; le sitemap seul n'y
  suffit pas.
- **Inventer des avis, des notes ou des dates.** `foundingYear` disait 2026
  alors que l'immatriculation date d'avril 2025 — ce genre d'écart se recoupe.
- **Redemander l'indexation en boucle** dans la Search Console. Cela n'accélère
  rien et épuise le quota journalier.
