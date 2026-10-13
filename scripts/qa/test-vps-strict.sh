#!/usr/bin/env bash
# Lance les suites VPS avec un code de sortie FIABLE (contrairement à tools/test-vps.sh, qui rend 0
# même avec « # fail 5 » : « || true » sous pipefail remet PIPESTATUS à 0).
#   bash scripts/qa/test-vps-strict.sh <dépôt> <variante_VPS_construite> [standalone]
# Exécute CHAQUE fichier vps/tests/http*.test.mjs (sérialisés par flock /tmp/smartfixx-http.lock,
# les ports de test étant fixes), en « next start » puis, avec « standalone », sur .next/standalone
# (mode du conteneur Docker). Puis runtime.test.mjs et la suite python (nginx, empaquetage).
set -uo pipefail
REPO=$(realpath "${1:?dépôt}"); OUT=$(realpath "${2:?variante construite}"); rc=0
LOGS=$(mktemp -d /tmp/smartfixx-tests-XXXX); echo "journaux : $LOGS"
mapfile -t HTTP_TESTS < <(ls "$REPO"/vps/tests/http*.test.mjs)
run_http(){ local mode=$1; shift; local extra=("$@")
  for t in "${HTTP_TESTS[@]}"; do
    local n; n=$(basename "$t" .test.mjs); local log="$LOGS/$n-$mode.log"
    echo "## $n ($mode)"
    ( cd "$OUT" && flock /tmp/smartfixx-http.lock env SMARTFIXX_TEST_BUILD="$OUT" "${extra[@]}" timeout 900 node --test "$t" ) >"$log" 2>&1
    local s=$?; grep -E "^\s*(not )?ok |^# (pass|fail)" "$log"
    { [ $s = 0 ] && grep -q "^# fail 0" "$log"; } || { echo "  -> ÉCHEC $n ($mode) (détail : $log)"; grep -E "AssertionError|expected|actual|Error" "$log" | head -15; rc=1; }
  done; }
echo "### HTTP (next start)"; run_http start
if [ "${3:-}" = standalone ]; then
  SA=$LOGS/standalone; rm -rf "$SA"; cp -a "$OUT/.next/standalone" "$SA"; cp -a "$OUT/public" "$SA/public"; cp -a "$OUT/.next/static" "$SA/.next/static"; cp -a "$OUT/drizzle" "$SA/drizzle"; cp -a "$OUT/runtime" "$SA/runtime"
  echo "### HTTP (standalone, comme le conteneur)"; run_http standalone SMARTFIXX_STANDALONE="$SA"; rm -rf "$SA"
fi
echo "### runtime"
( cd "$REPO" && timeout 300 node --test vps/tests/runtime.test.mjs ) >"$LOGS/runtime.log" 2>&1 || { rc=1; echo "  -> ÉCHEC runtime ($LOGS/runtime.log)"; }
grep -E "^\s*not ok |^# (pass|fail)" "$LOGS/runtime.log"
grep -q "^# fail 0" "$LOGS/runtime.log" || rc=1
echo "### python (nginx, empaquetage)"
( cd "$REPO" && timeout 300 python3 -m unittest discover -s vps/tests -p '*_test.py' ) >"$LOGS/py.log" 2>&1 || { rc=1; echo "  -> ÉCHEC python ($LOGS/py.log)"; }
grep -E "^Ran |^OK|^FAILED" "$LOGS/py.log"
echo "code de sortie : $rc"; exit $rc
