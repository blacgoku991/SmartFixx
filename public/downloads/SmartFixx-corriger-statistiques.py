#!/usr/bin/env python3
"""Repair the installed VPS analytics header without touching SMTP or data."""
from pathlib import Path
import importlib.util
import os
import re
import shutil
import subprocess
import tempfile


def corrected(text, parse):
    candidates = []
    for start, end, direct in parse(text):
        names = {n for d in direct if d and d[0] == 'server_name' for n in d[1:]}
        block = text[start:end]
        if 'smartfixx.fr' in names and names <= {'smartfixx.fr', 'www.smartfixx.fr'}:
            if re.search(r'proxy_pass\s+http://127\.0\.0\.1:310[01]\s*;', block):
                candidates.append((start, end, block))
    if len(candidates) != 1:
        raise ValueError('Bloc public SmartFixx ambigu ou introuvable. Aucun changement.')
    start, end, block = candidates[0]
    anchor = list(re.finditer(r'(?m)^([ \t]*)proxy_set_header\s+X-Smartfixx-Client-IP\s+\$remote_addr\s*;', block))
    if len(anchor) != 1:
        raise ValueError('En-tête du client non reconnu. Aucun changement.')
    existing = re.findall(r'proxy_set_header\s+CF-Connecting-IP\s+([^;]+);', block, re.I)
    if existing:
        if len(existing) == 1 and existing[0].strip() == '$remote_addr':
            return text
        raise ValueError('Une configuration personnalisée existe déjà. Aucun changement.')
    a = anchor[0]
    block = block[:a.end()] + '\n' + a[1] + 'proxy_set_header CF-Connecting-IP $remote_addr;' + block[a.end():]
    return text[:start] + block + text[end:]


def main():
    if os.geteuid() != 0:
        raise ValueError('Lancez ce correctif avec sudo python3.')
    helper = Path('/opt/smartfixx-vps/current/nginx_switch.py')
    spec = importlib.util.spec_from_file_location('smartfixx_nginx', helper)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    path = Path('/etc/nginx/sites-enabled/smartfixx').resolve(strict=True)
    subprocess.run(['nginx', '-t'], check=True)
    before = path.read_bytes()
    after = corrected(before.decode(), module.blocks).encode()
    if after == before:
        print('Correctif déjà présent. Vérifiez les préférences de statistiques et actualisez le panel.')
        return
    folder = Path(tempfile.mkdtemp(prefix='statistiques-', dir='/opt/smartfixx-vps/backups'))
    shutil.copy2(path, folder / 'nginx-avant.conf')
    if path.read_bytes() != before:
        raise ValueError('Nginx a changé pendant la préparation. Aucun changement appliqué.')
    try:
        path.write_bytes(after)
        subprocess.run(['nginx', '-t'], check=True)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
    except Exception:
        path.write_bytes(before)
        subprocess.run(['nginx', '-t'], check=True)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
        raise
    print('CORRECTIF APPLIQUÉ : en-tête des statistiques transmis par Nginx.')
    print('Campagnes, relais SMTP et base de données inchangés.')
    print('Sauvegarde : ' + str(folder))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        raise SystemExit(str(error))
