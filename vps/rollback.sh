#!/usr/bin/env bash
set -euo pipefail
[[ $EUID == 0 ]] || { echo 'Lancez avec sudo.'; exit 1; }
base_dir=/opt/smartfixx-vps
backup_dir=$(cat "$base_dir/last-nginx-backup")
python3 "$base_dir/current/nginx_switch.py" rollback "$backup_dir"
saved=$(cat "$base_dir/last-backup")
relay_dir=/opt/smartfixx-relay/SmartFixx-relais-SMTP
if [[ -f "$saved/relay/.env" ]]; then
  docker compose --project-directory "$relay_dir" stop
  cp -p -- "$saved/relay/.env" "$relay_dir/.env"
  echo 'Le relais est arrêté et son ancienne adresse a été restaurée. Vérifiez vos campagnes avant de le relancer.'
fi
echo 'Le nouveau site et ses données sont conservés dans /opt/smartfixx-vps.'
echo 'Ses campagnes doivent rester en pause tant que l’ancien site est rétabli.'
