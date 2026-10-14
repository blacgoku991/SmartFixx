#!/usr/bin/env bash
# Lance les suites de la racine (vinext build + node --test tests/*.test.mjs) sur une COPIE du dépôt.
#   bash scripts/qa/root-tests.sh <dépôt> <copie_neuve_hors_dépôt>
# Copie les fichiers suivis et non ignorés (donc les modifications en cours), lie node_modules en
# liens physiques depuis /home/user/smartfixx-vps-dev (même package-lock.json exigé) : rien n'est
# écrit dans le dépôt. La copie est EFFACÉE puis recréée (gardes : qa-guard.sh). Échecs connus sur la
# base 6d95248 (indépendants du design), seuls tolérés :
#   - "renders development preview metadata"   (dist/server/index.js importe cloudflare:workers, illisible par Node)
#   - "emits the catalog's animation and scrolling utilities" (scrollbar-width:none et scrollbar-gutter:stable absents)
# Échoue aussi si la suite est tuée (délai de 600 s), si aucun test n'a tourné, ou si les comptes ne
# tombent pas juste (pass = tests − fail, fail ≤ 2).
set -uo pipefail
QA_DIR=$(cd "$(dirname "$0")" && pwd); REPO=$(realpath "${1:?dépôt}"); OUT=$(realpath -m "${2:?copie}"); DEPS=/home/user/smartfixx-vps-dev
. "$(dirname "$0")/qa-guard.sh"
qa_guard_out "$REPO" "$OUT" "$DEPS"
cmp -s "$REPO/package-lock.json" "$DEPS/package-lock.json" || { echo "package-lock.json différent de $DEPS : npm ci nécessaire dans la copie." >&2; exit 3; }
rm -rf -- "$OUT"; mkdir -p "$OUT"; qa_mark_out "$OUT"
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
timeout 600 node --test tests/*.test.mjs >"$LOG.tests" 2>&1; st=$?
grep -E "^\s*not ok |^# (tests|pass|fail)" "$LOG.tests"
if [ "$st" = 124 ]; then echo "ÉCHEC : suite tuée après 600 s (voir $LOG.tests)"; exit 1; fi
total=$(sed -n 's/^# tests //p' "$LOG.tests" | tail -1); pass=$(sed -n 's/^# pass //p' "$LOG.tests" | tail -1); fail=$(sed -n 's/^# fail //p' "$LOG.tests" | tail -1)
case "$total$pass$fail" in ''|*[!0-9]*) echo "ÉCHEC : résumé « # tests / # pass / # fail » illisible (code $st, voir $LOG.tests)"; exit 1;; esac
if [ "$total" -lt 1 ]; then echo "ÉCHEC : aucun test exécuté"; exit 1; fi
if [ "$fail" -gt 2 ] || [ "$pass" -ne $((total - fail)) ]; then echo "ÉCHEC : $pass réussis, $fail échoués sur $total (attendu : au plus 2 échecs connus, aucun test ignoré ni annulé)"; exit 1; fi
unexpected=$(grep -E "^not ok |^    not ok " "$LOG.tests" | grep -vE "renders development preview metadata|emits the catalog's animation and scrolling utilities" || true)
if [ -n "$unexpected" ]; then echo "ÉCHECS NOUVEAUX :"; echo "$unexpected"; echo "Détail : $LOG.tests"; exit 1; fi
# Le test connu « emits the catalog's animation… » s'arrête à sa 3e assertion : les 5 suivantes
# (scrollbar-gutter exceptée, connue) sont rejouées ici pour qu'une régression ne passe pas au vert.
absent=$(node "$QA_DIR/css-check.mjs" "$OUT/dist" 2>&1 | grep '^ABSENT' | grep -v -F -e 'scrollbar-width:\s*none' -e 'scrollbar-gutter:\s*stable' || true)
if [ -n "$absent" ]; then echo "ÉCHEC : assertions CSS masquées par l'échec connu : $absent"; exit 1; fi
echo "Racine : $pass/$total, aucun échec hors des 2 échecs connus de la base."
