#!/usr/bin/env bash
# Reconstruit la variante VPS (Next.js + SQLite) depuis le dépôt, HORS du dépôt.
#   bash scripts/qa/rebuild-vps.sh <dépôt> <dossier_de_sortie>
# 1. vps/prepare.py (strict : échoue si une chaîne remplacée a disparu) ;
# 2. node_modules : lien vers /home/user/smartfixx-vps-dev/node_modules si package-lock.json est
#    identique, sinon npm ci complet dans la sortie ;
# 3. npm run build (= next build --webpack, TypeScript compris).
# Ne jamais lancer « npm run build » dans le dépôt : son node_modules et dist/ sont ceux de l'ancien site.
set -euo pipefail
REPO=$(realpath "${1:?dépôt}"); OUT=$(realpath -m "${2:?sortie}")
DEPS=/home/user/smartfixx-vps-dev
case "$OUT/" in "$REPO"/*) echo "La sortie doit être hors du dépôt." >&2; exit 2;; esac
NEED_CI=0
if ! cmp -s "$REPO/package-lock.json" "$DEPS/package-lock.json"; then
  echo "package-lock.json a changé : installation complète (npm ci) dans $OUT." >&2; NEED_CI=1
fi
rm -rf "$OUT"
python3 "$REPO/vps/prepare.py" "$OUT" >/dev/null
cd "$OUT"
if [ "$NEED_CI" = 1 ]; then npm ci --no-audit --no-fund >/dev/null; else ln -s "$DEPS/node_modules" node_modules; fi
NEXT_TELEMETRY_DISABLED=1 npm run build
