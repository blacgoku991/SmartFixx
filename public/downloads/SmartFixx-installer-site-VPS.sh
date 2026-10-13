#!/usr/bin/env bash
set -euo pipefail
umask 077
[[ $EUID == 0 ]] || { echo 'Lancez avec sudo bash /tmp/smartfixx-installer-vps.sh'; exit 1; }
for program in curl unzip sha256sum; do command -v "$program" >/dev/null || { echo "Commande manquante : $program"; exit 1; }; done
package_dir=$(mktemp -d /opt/smartfixx-install.XXXXXXXX)
echo "Téléchargement de SmartFixx dans $package_dir"
curl --fail --location --proto '=https' --proto-redir '=https' https://smartfixx-reach.wgg9cdxhs2.chatgpt.site/downloads/SmartFixx-site-VPS.zip -o "$package_dir/site.zip"
printf '%s  %s\n' '5673278db39e19b344e8fb7fed0b5280580ebd6f278f952ac40976e17a9de855' "$package_dir/site.zip" | sha256sum --check --status
unzip -q "$package_dir/site.zip" -d "$package_dir"
bash "$package_dir/SmartFixx-site-VPS/install.sh"
