#!/usr/bin/env bash
# Démarre une variante VPS construite, avec une base temporaire et un compte fictif.
#   bash scripts/qa/serve-vps.sh <build> <port>
# Compte : owner@example.test / test-local-owner-password-32-characters (données fictives uniquement).
# Les écritures (formulaire, panel) exigent l'en-tête Origin https://smartfixx.fr.
set -euo pipefail
BUILD=${1:?build (dossier produit par rebuild-vps.sh)}; PORT=${2:?port}
[ -f "$BUILD/.smartfixx-qa-build" ] || [ -f "$BUILD/runtime/cli.mjs" ] || { echo "$BUILD ne ressemble pas à une variante VPS construite." >&2; exit 2; }
DATA=$(mktemp -d /tmp/smartfixx-data-XXXX)
export SMARTFIXX_DATA_DIR=$DATA NEXT_TELEMETRY_DISABLED=1
cd "$BUILD"
node runtime/cli.mjs init >/dev/null 2>&1
printf 'owner@example.test\ntest-local-owner-password-32-characters\n' | node runtime/cli.mjs owner >/dev/null 2>&1
echo "DATA=$DATA"
exec node node_modules/next/dist/bin/next start -p "$PORT" -H 127.0.0.1
