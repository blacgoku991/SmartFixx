#!/usr/bin/env bash
set -euo pipefail
umask 077
[[ $EUID == 0 ]] || { echo 'Lancez ce fichier avec sudo bash install.sh'; exit 1; }
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
for program in docker nginx python3 openssl curl tar; do command -v "$program" >/dev/null || { echo "Commande manquante : $program"; exit 1; }; done
docker compose version >/dev/null
nginx -t
install_id=$(date -u +%Y%m%dT%H%M%SZ)
base_dir=/opt/smartfixx-vps
release_dir="$base_dir/releases/$install_id"
backup_dir="$base_dir/backups/$install_id"
nginx_switched=0
on_exit(){
  status=$?
  if [[ $status != 0 ]]; then
    if [[ $nginx_switched == 1 ]]; then python3 "$release_dir/nginx_switch.py" rollback "$backup_dir/nginx" || true; fi
    if [[ -f "$backup_dir/relay/.env" ]]; then
      cp -p -- "$backup_dir/relay/.env" /opt/smartfixx-relay/SmartFixx-relais-SMTP/.env
      docker compose --project-directory /opt/smartfixx-relay/SmartFixx-relais-SMTP stop || true
      echo 'Installation interrompue. Ancienne adresse du relais restaurée ; relais laissé arrêté.'
    fi
    echo "L’ancien site est conservé. Diagnostic et sauvegardes : $backup_dir"
  fi
}
trap on_exit EXIT
mkdir -p "$release_dir" "$backup_dir" "$base_dir/data"
chmod 700 "$base_dir" "$base_dir/data" "$base_dir/backups"
echo 'Vérification de la configuration Nginx…'
python3 "$script_dir/nginx_switch.py" plan "$backup_dir/nginx"
if curl -s --max-time 2 http://127.0.0.1:3100/api/health >/dev/null; then
  echo 'Le port 3100 est déjà occupé. Cette installation initiale ne remplace pas une installation VPS existante.'
  exit 1
fi
echo "Sauvegarde : $backup_dir"
tar -czf "$backup_dir/nginx.tar.gz" -C /etc nginx
if [[ -d /opt/smartfixx ]]; then tar --exclude=node_modules --exclude=.git -czf "$backup_dir/ancien-site.tar.gz" -C /opt smartfixx; fi
cp -a "$script_dir/." "$release_dir/"
chown -R 1000:1000 "$base_dir/data"
cd "$release_dir"
echo 'Construction du nouveau site. L’ancien continue de fonctionner.'
docker compose build
docker compose run --rm --no-deps web node runtime/cli.mjs init
read -r -p 'Fichier de données .smartfixx à importer (chemin complet, Entrée si nouvelle base) : ' transfer_path </dev/tty
if [[ -n "$transfer_path" ]]; then
  [[ -f "$transfer_path" ]] || { echo 'Fichier de données introuvable.'; exit 1; }
  cp -- "$transfer_path" "$base_dir/data/transfer.smartfixx"
  chown 1000:1000 "$base_dir/data/transfer.smartfixx"
  read -r -s -p 'Clé de déchiffrement du fichier : ' transfer_key </dev/tty; echo
  printf '%s' "$transfer_key" | docker compose run --rm --no-deps -T web node runtime/cli.mjs import /data/transfer.smartfixx
  unset transfer_key
  rm -- "$base_dir/data/transfer.smartfixx"
fi
read -r -p 'Votre adresse email de connexion au panel : ' owner_email </dev/tty
while true; do
  read -r -s -p 'Nouveau mot de passe administrateur (16 caractères minimum) : ' owner_password </dev/tty; echo
  read -r -s -p 'Confirmez le mot de passe : ' owner_confirm </dev/tty; echo
  [[ "$owner_password" == "$owner_confirm" && ${#owner_password} -ge 16 && ${#owner_password} -le 256 ]] && break
  echo 'Les mots de passe doivent correspondre et contenir 16 à 256 caractères.'
done
printf '%s\n%s\n' "$owner_email" "$owner_password" | docker compose run --rm --no-deps -T web node runtime/cli.mjs owner
unset owner_password owner_confirm
relay_dir=/opt/smartfixx-relay/SmartFixx-relais-SMTP
if [[ -f "$relay_dir/.env" && -f "$relay_dir/compose.yaml" ]]; then
  echo 'Préparation du relais existant ; sa clé et ses reçus seront conservés.'
  mkdir -p "$backup_dir/relay"
  for name in agent.mjs transport.mjs journal.mjs scheduler.mjs Dockerfile compose.yaml package.json package-lock.json README.md .dockerignore .env; do
    [[ ! -f "$relay_dir/$name" ]] || cp -p -- "$relay_dir/$name" "$backup_dir/relay/$name"
  done
  docker compose --project-directory "$relay_dir" stop
  for name in agent.mjs transport.mjs journal.mjs scheduler.mjs Dockerfile compose.yaml package.json package-lock.json README.md .dockerignore; do cp -- "$release_dir/relay/$name" "$relay_dir/$name"; done
  python3 - "$relay_dir/.env" <<'PY'
from pathlib import Path
import sys,re
p=Path(sys.argv[1]);s=p.read_text()
if not re.search(r'^SMARTFIXX_SITE_URL=',s,re.M):raise SystemExit('URL du relais introuvable ; configuration préservée.')
p.write_text(re.sub(r'^SMARTFIXX_SITE_URL=.*$', 'SMARTFIXX_SITE_URL=https://smartfixx.fr',s,flags=re.M))
PY
  python3 - "$relay_dir/.env" <<'PY' | docker compose run --rm --no-deps -T web node runtime/cli.mjs pair-relay
from pathlib import Path
import sys,re
s=Path(sys.argv[1]).read_text();m=re.search(r'^SMARTFIXX_RELAY_TOKEN=(.+)$',s,re.M)
if not m:raise SystemExit('Clé du relais introuvable.')
token=m.group(1).strip().strip('"\'')
if not re.fullmatch(r'[A-Za-z0-9_-]{43}',token):raise SystemExit('Clé du relais invalide.')
sys.stdout.write(token)
PY
  docker compose --project-directory "$relay_dir" build
fi
docker compose up -d --no-build
healthy=0
for attempt in {1..40}; do
  if curl --fail --silent http://127.0.0.1:3100/api/health | python3 -c 'import sys,json; d=json.load(sys.stdin);sys.exit(0 if d.get("ok") and d.get("application")=="smartfixx-vps" else 1)' 2>/dev/null; then healthy=1; break; fi
  sleep 2
done
[[ $healthy == 1 ]] || { echo 'Le nouveau site ne démarre pas. Nginx conserve l’ancien site.'; docker compose logs --tail=30; exit 1; }
python3 "$release_dir/nginx_switch.py" apply "$backup_dir/nginx"
nginx_switched=1
if ! curl --fail --silent --resolve smartfixx.fr:443:127.0.0.1 https://smartfixx.fr/api/health | python3 -c 'import sys,json;sys.exit(0 if json.load(sys.stdin).get("application")=="smartfixx-vps" else 1)'; then
  python3 "$release_dir/nginx_switch.py" rollback "$backup_dir/nginx"
  nginx_switched=0
  echo 'Vérification HTTPS échouée : ancien site rétabli.';exit 1
fi
ln -sfn "$release_dir" "$base_dir/current"
printf '%s\n' "$backup_dir/nginx" > "$base_dir/last-nginx-backup"
printf '%s\n' "$backup_dir" > "$base_dir/last-backup"
if [[ -d "$backup_dir/relay" ]]; then docker compose --project-directory "$relay_dir" up -d --no-build; fi
nginx_switched=0
echo 'Nouveau site actif : https://smartfixx.fr'
echo 'Administration : https://smartfixx.fr/admin'
echo 'Ouvrez Campagnes → Réglages d’envoi et validez la connexion SMTP avant de reprendre.'
echo 'Retour arrière : sudo bash /opt/smartfixx-vps/current/rollback.sh'
