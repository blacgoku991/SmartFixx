#!/usr/bin/env bash
# SmartFixx — mise à jour du relais installé dans /opt/smartfixx-relay.
# Le site /opt/smartfixx, la configuration .env et les reçus ne sont pas modifiés.
set -euo pipefail
relay_dir=/opt/smartfixx-relay/SmartFixx-relais-SMTP
if [[ ! -f "$relay_dir/compose.yaml" || ! -f "$relay_dir/.env" ]]; then
  echo "Installation du relais introuvable. Aucun changement effectué."
  exit 1
fi
if [[ ! -w "$relay_dir" ]]; then
  echo "Connectez-vous avec le compte ubuntu propriétaire du dossier du relais."
  exit 1
fi
for command in curl unzip sha256sum docker; do
  command -v "$command" >/dev/null || { echo "Commande manquante : $command"; exit 1; }
done
sudo docker compose version >/dev/null
work_dir=$(mktemp -d /opt/smartfixx-relay/update.XXXXXXXX)
trap 'rm -rf -- "$work_dir"' EXIT
curl --fail --location --proto '=https' --proto-redir '=https' \
  https://smartfixx-reach.wgg9cdxhs2.chatgpt.site/downloads/SmartFixx-relais-SMTP.zip \
  -o "$work_dir/relais.zip"
printf '%s  %s\n' '15e12e03ddcbda4227604dc25e0cf9d1a7f483b2a8f634852130cebb19171620' "$work_dir/relais.zip" | sha256sum --check --status
unzip -q "$work_dir/relais.zip" -d "$work_dir/new"
backup_dir=$(mktemp -d /opt/smartfixx-relay/backup.XXXXXXXX)
chmod 700 "$backup_dir"
files=(agent.mjs transport.mjs journal.mjs scheduler.mjs Dockerfile compose.yaml package.json package-lock.json README.md .dockerignore)
for name in "${files[@]}"; do
  [[ -f "$work_dir/new/SmartFixx-relais-SMTP/$name" ]] || { echo "Archive incomplète."; exit 1; }
done
for name in "${files[@]}"; do
  if [[ -f "$relay_dir/$name" ]]; then cp -p -- "$relay_dir/$name" "$backup_dir/$name"; fi
done
printf 'Sauvegarde des fichiers du relais : %s\n' "$backup_dir"
for name in "${files[@]}"; do
  cp -- "$work_dir/new/SmartFixx-relais-SMTP/$name" "$relay_dir/$name"
done
cd "$relay_dir"
sudo docker compose build
sudo docker compose up -d --no-build
sudo docker compose ps
sudo docker compose logs --tail=20
echo "Mise à jour lancée. Vérifiez « Relais v3 connecté » dans le panel après quelques secondes."
echo "La clé de liaison et le volume des reçus sont conservés."

# Diagnostic en lecture seule pour préparer le remplacement du site existant.
echo "Installation actuelle du site (noms de fichiers uniquement) :"
if [[ -d /opt/smartfixx ]]; then ls -1 /opt/smartfixx; fi
echo "Services web à l’écoute :"
sudo ss -ltnp '( sport = :80 or sport = :443 or sport = :3000 or sport = :8000 or sport = :8080 )' || true
