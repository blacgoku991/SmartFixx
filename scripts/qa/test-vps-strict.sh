#!/usr/bin/env bash
# Lance les suites VPS avec un code de sortie FIABLE (contrairement à tools/test-vps.sh, qui rend 0
# même avec « # fail 5 » : « || true » sous pipefail remet PIPESTATUS à 0).
#   bash scripts/qa/test-vps-strict.sh <dépôt> <variante_VPS_construite> [standalone]
# Exécute CHAQUE fichier vps/tests/http*.test.mjs (sérialisés par flock /tmp/smartfixx-http.lock,
# les ports de test étant fixes ; NE PAS envelopper ce script dans ce même flock : les verrous flock(1)
# valent par descripteur ouvert et le verrou intérieur attendrait l'enveloppe. Un appelant qui tient déjà
# le verrou exporte SMARTFIXX_HTTP_LOCK_HELD=1 ; sinon l'attente est bornée à 30 min, puis échec explicite), en « next start » puis, avec « standalone », sur .next/standalone
# (mode du conteneur Docker). Puis runtime.test.mjs et la suite python (nginx, empaquetage).
# Échoue aussi sans aucun fichier http*.test.mjs, ou si une suite n'exécute aucun test (# tests 0, Ran 0).
set -uo pipefail
REPO=$(realpath "${1:?dépôt}"); OUT=$(realpath "${2:?variante construite}"); rc=0
LOGS=$(mktemp -d /tmp/smartfixx-tests-XXXX); echo "journaux : $LOGS"
shopt -s nullglob; HTTP_TESTS=("$REPO"/vps/tests/http*.test.mjs); shopt -u nullglob
# Faux vert : sans aucun fichier HTTP (renommage, motif vide), aucun test ne tournerait et le code serait 0.
[ ${#HTTP_TESTS[@]} -gt 0 ] || { echo "ÉCHEC : aucun vps/tests/http*.test.mjs dans $REPO"; exit 1; }
# La suite python ne doit rien écrire dans le dépôt (vps/tests/__pycache__).
export PYTHONDONTWRITEBYTECODE=1
run_http(){ local mode=$1; shift; local extra=("$@")
  for t in "${HTTP_TESTS[@]}"; do
    local n; n=$(basename "$t" .test.mjs); local log="$LOGS/$n-$mode.log"
    echo "## $n ($mode)"
    if [ "${SMARTFIXX_HTTP_LOCK_HELD:-}" = 1 ]; then
      ( cd "$OUT" && env SMARTFIXX_TEST_BUILD="$OUT" "${extra[@]}" timeout 900 node --test "$t" ) >"$log" 2>&1
    else
      ( cd "$OUT" && flock -w 1800 -E 75 /tmp/smartfixx-http.lock env SMARTFIXX_TEST_BUILD="$OUT" "${extra[@]}" timeout 900 node --test "$t" ) >"$log" 2>&1
    fi
    local s=$?
    [ $s = 75 ] && { echo "  -> ÉCHEC $n ($mode) : verrou /tmp/smartfixx-http.lock non obtenu en 30 min (script enveloppé dans ce même flock ? exporter SMARTFIXX_HTTP_LOCK_HELD=1)"; rc=1; continue; }
    grep -E "^\s*(not )?ok |^# (pass|fail)" "$log"
    # Comme root-tests.sh : « # pass » = « # tests » (aucun ignoré ni annulé) et au moins un VRAI test : un
    # fichier sans test() est compté par Node comme un test réussi qui porte le chemin du fichier.
    local total pass real; total=$(sed -n 's/^# tests //p' "$log" | tail -1); pass=$(sed -n 's/^# pass //p' "$log" | tail -1)
    real=$(grep -E "^\s*ok [0-9]+ - " "$log" | grep -cvF -- "- $t")
    { [ $s = 0 ] && grep -q "^# fail 0" "$log" && [ "$real" -ge 1 ] && [ "$pass" = "$total" ]; } || { echo "  -> ÉCHEC $n ($mode) : code $s, ${pass:-?}/${total:-0}, ${real} test(s) nommé(s) (détail : $log)"; grep -E "AssertionError|expected|actual|Error" "$log" | head -15; rc=1; }
  done; }
echo "### HTTP (next start)"; run_http start
if [ "${3:-}" = standalone ]; then
  SA=$LOGS/standalone; rm -rf "$SA"; cp -a "$OUT/.next/standalone" "$SA"; cp -a "$OUT/public" "$SA/public"; cp -a "$OUT/.next/static" "$SA/.next/static"; cp -a "$OUT/drizzle" "$SA/drizzle"; cp -a "$OUT/runtime" "$SA/runtime"
  echo "### HTTP (standalone, comme le conteneur)"; run_http standalone SMARTFIXX_STANDALONE="$SA"; rm -rf "$SA"
fi
echo "### runtime"
( cd "$REPO" && timeout 300 node --test vps/tests/runtime.test.mjs ) >"$LOGS/runtime.log" 2>&1 || { rc=1; echo "  -> ÉCHEC runtime ($LOGS/runtime.log)"; }
grep -E "^\s*not ok |^# (tests|pass|fail)" "$LOGS/runtime.log"
grep -q "^# fail 0" "$LOGS/runtime.log" || rc=1
rt=$(grep -E "^\s*ok [0-9]+ - " "$LOGS/runtime.log" | grep -cvF -- "- $REPO/vps/tests/runtime.test.mjs"); [ "$rt" -ge 1 ] || { echo "  -> ÉCHEC runtime : aucun test exécuté"; rc=1; }
echo "### python (nginx, empaquetage)"
( cd "$REPO" && timeout 300 python3 -m unittest discover -s vps/tests -p '*_test.py' ) >"$LOGS/py.log" 2>&1 || { rc=1; echo "  -> ÉCHEC python ($LOGS/py.log)"; }
grep -E "^Ran |^OK|^FAILED" "$LOGS/py.log"
grep -qE "^Ran [1-9]" "$LOGS/py.log" || { echo "  -> ÉCHEC python : aucun test exécuté"; rc=1; }
echo "code de sortie : $rc"; exit $rc
