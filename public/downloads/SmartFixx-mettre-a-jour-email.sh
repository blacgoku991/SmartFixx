#!/usr/bin/env bash
set -euo pipefail
umask 077
[[ $EUID == 0 ]] || { echo 'Utilisez sudo bash pour cette mise à jour.'; exit 1; }
base=/opt/smartfixx-vps
old=$(readlink -f "$base/current")
[[ "$old" == "$base/releases/"* && -f "$old/compose.yaml" ]] || { echo 'Installation actuelle non reconnue.'; exit 1; }
exec 9>"$base/update-email.lock"
flock -n 9 || { echo 'Une mise à jour est déjà en cours.'; exit 1; }
cid=$(docker compose -p smartfixx-web --project-directory "$old" ps -q web)
[[ -n "$cid" ]] || { echo 'Le site doit être démarré avant la mise à jour.'; exit 1; }
# Do not interrupt a campaign or an SMTP exchange.
docker exec "$cid" node --input-type=module -e "import {sqlite} from './runtime/database.mjs'; const db=sqlite();const active=db.prepare(\"SELECT COUNT(*) n FROM campaign_runs WHERE status='running'\").get().n;const pending=db.prepare(\"SELECT COUNT(*) n FROM campaign_targets WHERE status IN ('leased','sending')\").get().n;if(active||pending){console.error('Mettez les campagnes en pause dans le panel, attendez la fin des transmissions, puis relancez cette commande.');process.exit(1)}"
stamp=$(date -u +%Y%m%dT%H%M%SZ)
work=$(mktemp -d "$base/email-update.XXXXXXXX")
curl --fail --location --proto '=https' --proto-redir '=https' https://smartfixx-reach.wgg9cdxhs2.chatgpt.site/downloads/SmartFixx-email-update.zip -o "$work/update.zip"
printf '%s  %s\n' 'd831a20abac042bcab7a6efb0b27ac8b6b8bd3947efd94a7a41f17f478f9daca' "$work/update.zip" | sha256sum --check --status
next="$base/releases/email-$stamp"
python3 - "$old" "$next" "$work/update.zip" <<'PY'
import sys,zipfile,json,hashlib,shutil
from pathlib import Path
old,new,archive=map(Path,sys.argv[1:])
with zipfile.ZipFile(archive) as z:
    manifest=json.loads(z.read('manifest.json'))
    for name,entry in manifest.items():
        if Path(name).is_absolute() or '..' in Path(name).parts: raise SystemExit('Chemin invalide')
        p=old/name
        actual=hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else None
        if actual not in [entry['before'],entry['after']]: raise SystemExit('Fichier personnalisé ou version différente : '+name+'. Aucun changement effectué.')
        if hashlib.sha256(z.read(name)).hexdigest()!=entry['after']: raise SystemExit('Archive invalide')
    shutil.copytree(old,new,ignore=shutil.ignore_patterns('node_modules','.next','.git'))
    for name in manifest:
        p=new/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(z.read(name))
PY
old_image=$(docker inspect --format '{{.Image}}' "$cid")
new_image="smartfixx-email:$stamp"
echo 'Préparation du nouveau site. Le site actuel reste accessible.'
docker build -t "$new_image" "$next"
# Recheck after the build in case a campaign was resumed meanwhile.
docker exec "$cid" node --input-type=module -e "import {sqlite} from './runtime/database.mjs';const d=sqlite();if(d.prepare(\"SELECT COUNT(*) n FROM campaign_runs WHERE status='running'\").get().n||d.prepare(\"SELECT COUNT(*) n FROM campaign_targets WHERE status IN ('leased','sending')\").get().n){console.error('Une campagne a repris : mettez-la en pause puis relancez.');process.exit(1)}"
docker exec "$cid" node runtime/cli.mjs backup
printf 'services:\n  web:\n    image: %s\n' "$new_image" > "$next/compose.override.yaml"
printf 'services:\n  web:\n    image: %s\n' "$old_image" > "$work/rollback.yaml"
rollback(){ status=$?; if [[ $status != 0 ]]; then echo 'Contrôle échoué : restauration du site précédent.'; docker compose -p smartfixx-web --project-directory "$old" -f "$old/compose.yaml" -f "$work/rollback.yaml" up -d --no-build web; ln -sfn "$old" "$base/current"; fi; }
trap rollback EXIT
docker compose -p smartfixx-web --project-directory "$next" up -d --no-build web
healthy=0
for attempt in {1..15}; do
 if curl --noproxy '*' --fail --silent --show-error --max-time 5 --resolve smartfixx.fr:443:127.0.0.1 https://smartfixx.fr/api/health | python3 -c 'import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get("ok") is True and d.get("application")=="smartfixx-vps" else 1)' 2>/dev/null; then healthy=1; break; fi
 sleep 2
done
[[ "$healthy" == 1 ]]
ln -sfn "$next" "$base/current"
trap - EXIT
echo 'MISE À JOUR TERMINÉE : ouvrez Campagnes > Message > Blocs cliquables.'
echo 'Données et réglages conservés. Reprenez vos campagnes depuis le panel quand vous le souhaitez.'
echo "Version précédente conservée : $old"
