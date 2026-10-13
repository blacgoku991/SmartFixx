#!/usr/bin/env bash
# Lance les suites de la racine (vinext build + node --test tests/*.test.mjs) sur une COPIE du dépôt.
#   bash scripts/qa/root-tests.sh <dépôt> <copie_neuve_hors_dépôt>
# Copie les fichiers suivis et non ignorés (donc les modifications en cours), lie node_modules en
# liens physiques depuis /home/user/smartfixx-vps-dev (même package-lock.json exigé) : rien n'est
# écrit dans le dépôt. Échecs connus sur la base 6d95248 (indépendants du design) :
#   - "renders development preview metadata"   (dist/server/index.js importe cloudflare:workers, illisible par Node)
#   - "emits the catalog's animation and scrolling utilities" (scrollbar-width:none et scrollbar-gutter:stable absents)
set -uo pipefail
REPO=$(realpath "${1:?dépôt}"); OUT=${2:?copie}; DEPS=/home/user/smartfixx-vps-dev
case "$(realpath -m "$OUT")/" in "$REPO"/*) echo "La copie doit être hors du dépôt." >&2; exit 2;; esac
cmp -s "$REPO/package-lock.json" "$DEPS/package-lock.json" || { echo "package-lock.json différent de $DEPS : npm ci nécessaire dans la copie." >&2; exit 3; }
rm -rf "$OUT"; mkdir -p "$OUT"
if git -C "$REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  ( cd "$REPO" && git ls-files -z -co --exclude-standard | tar --null -T - -cf - ) | tar -xf - -C "$OUT"
else
  tar -C "$REPO" --exclude=./node_modules --exclude=./dist --exclude=./.next --exclude=./.sites-runtime -cf - . | tar -xf - -C "$OUT"
fi
[ -f "$OUT/package.json" ] || { echo "Copie vide : $REPO" >&2; exit 4; }
cp -al "$DEPS/node_modules" "$OUT/node_modules"
cd "$OUT"
LOG=$OUT/.root-tests.log
if ! SITES_BUILD_TIMEOUT=9m npm run build >"$LOG" 2>&1; then echo "ÉCHEC vinext build (voir $LOG)"; tail -30 "$LOG"; exit 1; fi
timeout 600 node --test tests/*.test.mjs >"$LOG.tests" 2>&1
grep -E "^\s*not ok |^# (tests|pass|fail)" "$LOG.tests"
unexpected=$(grep -E "^not ok |^    not ok " "$LOG.tests" | grep -vE "renders development preview metadata|emits the catalog's animation and scrolling utilities" || true)
if [ -n "$unexpected" ]; then echo "ÉCHECS NOUVEAUX :"; echo "$unexpected"; echo "Détail : $LOG.tests"; exit 1; fi
echo "Racine : aucun échec hors des 2 échecs connus de la base."
