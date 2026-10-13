#!/usr/bin/env python3
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import sys,hashlib,json
root=Path(__file__).resolve().parent.parent
source=Path(sys.argv[1]).resolve()
archive=root/'public/downloads/SmartFixx-site-VPS.zip'
excluded={'node_modules','.next','.git','__pycache__','.env','next-env.d.ts','tsconfig.tsbuildinfo'}
with ZipFile(archive,'w',ZIP_DEFLATED,compresslevel=6) as z:
    for p in sorted(source.rglob('*')):
        rel=p.relative_to(source)
        if any(part in excluded for part in rel.parts) or not p.is_file():continue
        if p.suffix in ['.sqlite','.smartfixx'] or p.name.endswith(('.sqlite-wal','.sqlite-shm')):raise SystemExit('Private data in build source')
        z.write(p,'SmartFixx-site-VPS/'+rel.as_posix())
sha=hashlib.sha256(archive.read_bytes()).hexdigest()
installer='''#!/usr/bin/env bash
set -euo pipefail
umask 077
[[ $EUID == 0 ]] || { echo 'Lancez avec sudo bash /tmp/smartfixx-installer-vps.sh'; exit 1; }
for program in curl unzip sha256sum; do command -v "$program" >/dev/null || { echo "Commande manquante : $program"; exit 1; }; done
package_dir=$(mktemp -d /opt/smartfixx-install.XXXXXXXX)
echo "Téléchargement de SmartFixx dans $package_dir"
curl --fail --location --proto '=https' --proto-redir '=https' https://smartfixx-reach.wgg9cdxhs2.chatgpt.site/downloads/SmartFixx-site-VPS.zip -o "$package_dir/site.zip"
printf '%s  %s\\n' 'CHECKSUM' "$package_dir/site.zip" | sha256sum --check --status
unzip -q "$package_dir/site.zip" -d "$package_dir"
bash "$package_dir/SmartFixx-site-VPS/install.sh"
'''.replace('CHECKSUM',sha)
(root/'public/downloads/SmartFixx-installer-site-VPS.sh').write_text(installer)
with ZipFile(archive) as z:
    for name in ['app/admin/login/page.tsx','runtime/database.mjs','runtime/auth.mjs','Dockerfile','compose.yaml','install.sh','nginx_switch.py','rollback.sh','lib/seo.ts','public/downloads/SmartFixx-contacts-exemple.csv']:
        assert 'SmartFixx-site-VPS/'+name in z.namelist(),name
    assert 'https://smartfixx.fr' in z.read('SmartFixx-site-VPS/lib/seo.ts').decode()
    assert 'cloudflare:workers' not in z.read('SmartFixx-site-VPS/lib/quote-db.ts').decode()
print(json.dumps({'archive':str(archive),'bytes':archive.stat().st_size,'sha256':sha}))
