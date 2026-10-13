# Outillage de recette — scripts/qa

Ces outils sont la référence de vérification de la refonte. Ils ne font pas partie du build du site
(`vps/prepare.py` ne copie pas `scripts/`) et n'ajoutent aucune dépendance au `package.json` du site.

Installation (Playwright 1.55.1, Chromium déjà présent dans `/opt/pw-browsers/chromium`) :

```bash
npm --prefix scripts/qa ci
```

## Règles

- Ne jamais lancer `npm run build` ni `next build` dans le dépôt : `node_modules` et `dist/` y sont ceux
  de l'ancien site. Toute construction se fait dans une copie hors dépôt (`rebuild-vps.sh`, `root-tests.sh`).
- Ne jamais se fier au code de sortie de l'ancien `tools/test-vps.sh` (faux vert avec « # fail 5 ») :
  utiliser `test-vps-strict.sh`.
- Avant toute construction : `python3 -I scripts/qa/check_prepare.py .` doit finir par « écarts: 0 ».
- Les sorties locales (captures, rapports) vont dans `scripts/qa/out/` (ignoré par git).

## Ports et dossiers réservés

| Lot | Variante VPS | Copie racine | Port de service |
| --- | --- | --- | --- |
| 0 | /home/user/vps-lot0 | /home/user/root-lot0 | 3300 |
| N (1 à 8) | /home/user/vps-lotN | /home/user/root-lotN | 33N0 (3310, 3320, … 3380) |
| 9 | /home/user/vps-lot9 | /home/user/root-lot9 | 3385 |
| 10 | /home/user/vps-lot10 | /home/user/root-lot10 | 3395 |

Les tests HTTP du VPS utilisent des ports fixes (3187, 3188) : `test-vps-strict.sh` les sérialise par
`flock /tmp/smartfixx-http.lock`, ce qui permet de lancer plusieurs lots en parallèle.

## Portes communes à chaque lot

```bash
python3 -I scripts/qa/check_prepare.py .                       # écarts: 0
bash scripts/qa/rebuild-vps.sh . /home/user/vps-lotN            # build Next OK, TypeScript compris
bash scripts/qa/test-vps-strict.sh . /home/user/vps-lotN standalone   # code de sortie 0
bash scripts/qa/root-tests.sh . /home/user/root-lotN            # 41/43 : seulement les 2 échecs connus
(cd /home/user/root-lotN && npm run lint)                       # ≤ 27 erreurs (référence 27 erreurs, 87 avertissements)
bash scripts/qa/serve-vps.sh /home/user/vps-lotN 33N0 &          # puis :
python3 scripts/qa/vps-crawl-check.py http://127.0.0.1:33N0      # 0 écart (--og-404-ok jusqu'au lot 7)
```

Les deux échecs connus de la racine, indépendants du design, sont les seuls tolérés :
« renders development preview metadata » (Node refuse `cloudflare:workers`) et
« emits the catalog's animation and scrolling utilities » (scrollbar-width:none et scrollbar-gutter:stable
ne sont générés par aucun utilitaire défini).

## Outils

| Script | Rôle |
| --- | --- |
| `check_prepare.py <dépôt>` | Chaînes remplacées par `vps/prepare.py`, comptes exacts du layout, fuites `signout-with-chatgpt`. |
| `rebuild-vps.sh <dépôt> <sortie>` | prepare.py strict, node_modules liés si le lock est identique, `next build --webpack`. |
| `test-vps-strict.sh <dépôt> <build> [standalone]` | Chaque `vps/tests/http*.test.mjs` (next start puis standalone), runtime, python ; code fiable. |
| `root-tests.sh <dépôt> <copie>` | vinext build et `node --test tests/*.test.mjs` sur une copie ; 2 échecs connus tolérés. |
| `serve-vps.sh <build> <port>` | Base temporaire et compte fictif owner@example.test / test-local-owner-password-32-characters. |
| `vps-crawl-check.py <base> [--og-404-ok]` | Toutes les URL du sitemap : 200, h1 unique, nonce, canonique unique et absolue, og:image, JSON-LD analysable, aucun lien /admin public, thème, en-têtes. |
| `seo-audit.py <base> [--chemins /a,/b]` | Titre ≤ 65, description 120 à 160, doublons, h1, canonique, og:image, types JSON-LD (LocalBusiness et FAQPage interdits), liens entrants hors pied. |
| `lh.sh <base> <sortie> <chemins…>` | Lighthouse mobile, 3 passes (LH_RUNS), médiane. |
| `shots.mjs <base> <sortie> [--admin] <chemins…>` | Captures 360 × 640, 390 × 844, 412 × 823, 1440 × 900, deux thèmes, consentement ouvert et fermé ; `--admin` se connecte au compte fictif. |
| `layout-check.mjs <base> <chemins…> [--checks=…]` | Défilement horizontal, CTA du hero au-dessus du consentement, LCP = H1, h1 unique, 0 animation en mode réduit, opacité finale des `.sx-reveal`, décalage du H1 au chargement de la police. |
| `motion-cost.mjs <base> <chemin> <sélecteur>` | CDP, CPU ralenti 4 fois : LayoutCount stable pendant l'animation. |
| `contrast.py [globals.css]` | Paires de jetons --sx- dans les deux thèmes (texte ≥ 4,5, contrôles ≥ 3). |
| `orphan-classes.mjs <dépôt> [--scope=admin] [--css=<build>/.next/static] [--save] [--base]` | Classes citées par les .tsx sans règle CSS. |
| `css-check.mjs <dossier>` | Rejoue les 8 assertions CSS de `tests/ui-components.test.mjs` sur un dossier de build. |

Le contrat des primitives, la charte du mouvement et les chaînes protégées sont dans
`docs/DESIGN_SYSTEM.md`.
