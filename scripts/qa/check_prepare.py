#!/usr/bin/env python3
"""Vérifie que chaque chaîne substituée par vps/prepare.py existe dans la source (lecture seule).
   python3 -I scripts/qa/check_prepare.py <dépôt>   → dernière ligne « écarts: N » (0 attendu)
Contrôle aussi les comptes exacts exigés par prepare.py strict (layout : « ␣␣return ( » et le script
de thème une seule fois) et l'absence de « signout-with-chatgpt » hors de components/admin-workspace.tsx."""
import sys
from pathlib import Path
root=Path(sys.argv[1]).resolve()
checks=[
 ('app/admin-workspace? -> components/admin-workspace.tsx','components/admin-workspace.tsx','/signout-with-chatgpt?return_to=%2Fadmin'),
 ('admin-workspace phrase Sites','components/admin-workspace.tsx','Cette version est publiée sur son adresse Sites. Le rattachement de Smartfixx.fr et la migration de ses anciennes pages restent à effectuer.'),
 ('mentions-legales hébergeur','app/mentions-legales/page.tsx','Cette version du site est hébergée via la plateforme Sites de ChatGPT, sur l’infrastructure Cloudflare. L’accès à cette version est contrôlé par la plateforme.'),
 ('confidentialite cookie','app/confidentialite/page.tsx','Des mécanismes techniques nécessaires à l’hébergement et au contrôle d’accès peuvent être utilisés par la plateforme.'),
 ('layout async','app/layout.tsx','export default function RootLayout'),
 ('layout return','app/layout.tsx','  return ('),
 ('layout script','app/layout.tsx','<script dangerouslySetInnerHTML'),
 ('json-ld export','components/json-ld.tsx','export function JsonLd'),
 ('json-ld return','components/json-ld.tsx','return <script'),
 ('http-security origin','lib/http-security.ts','origin===new URL(request.url).origin'),
]
bad=0
for label,f,s in checks:
    p=root/f
    n=p.read_text().count(s) if p.exists() else -1
    status='OK' if n>=1 else 'ABSENT'
    if n<1: bad+=1
    print(f'{status:6} x{n:<2} {f} :: {s[:70]}')
# fichiers et dossiers exigés par prepare.py
for f in ['app/chatgpt-auth.ts','public/downloads/SmartFixx-relais-SMTP.zip','public/downloads/SmartFixx-mettre-a-jour-relais.sh','public/downloads/SmartFixx-contacts-exemple.csv','package.json','package-lock.json','postcss.config.mjs','tsconfig.json','worker-configuration.d.ts','db/index.ts']+[f'vps/{n}' for n in ['Dockerfile','compose.yaml','.dockerignore','install.sh','nginx_switch.py','rollback.sh','LISEZ-MOI.md']]:
    e=(root/f).exists(); bad+= (not e); print(('OK    ' if e else 'ABSENT'),f)
for d in ['app','components','hooks','lib','db','drizzle','public','vendor','relay']:
    e=(root/d).is_dir(); bad+=(not e); print(('OK    ' if e else 'ABSENT'),d+'/')
# domaine chatgpt.site hors .ts/.tsx (non substitué par prepare.py) dans les dossiers copiés
dom='smartfixx-reach.wgg9cdxhs2.chatgpt.site'
for d in ['app','components','hooks','lib','db','drizzle','public','vendor']:
    for p in (root/d).rglob('*'):
        if p.is_file() and p.suffix not in ('.ts','.tsx') and 'downloads' not in p.parts:
            try:
                if dom in p.read_text(errors='ignore'): print('FUITE  domaine Sites dans fichier non substitué :',p.relative_to(root)); bad+=1
            except Exception: pass
# cloudflare:workers dans des fichiers NON couverts (ex. app/*.ts couverts par rglob ; .mjs non)
for p in root.rglob('*'):
    if 'node_modules' in p.parts or 'dist' in p.parts or '.git' in p.parts or 'relay' in p.parts or 'worker' in p.parts: continue
    if p.is_file() and p.suffix in ('.mjs','.js','.jsx') and 'cloudflare:workers' in p.read_text(errors='ignore'):
        print('ATTENTION cloudflare:workers non substitué :',p.relative_to(root))
# fichiers racine masqués par les overlays VPS
ov=root/'vps/overlay'
for p in ov.rglob('*'):
    if p.is_file():
        r=p.relative_to(ov); print(('MASQUE ' if (root/r).exists() else 'AJOUT  '),r)
# comptes exacts (prepare.py strict échoue sinon)
for f,needle,want in [('app/layout.tsx','  return (',1),('app/layout.tsx','<script dangerouslySetInnerHTML',1),('app/layout.tsx','export default function RootLayout',1),('components/json-ld.tsx','return <script',1)]:
    n=(root/f).read_text().count(needle)
    if n!=want: bad+=1; print(f'COMPTE x{n} (attendu {want}) {f} :: {needle!r}')
# lien de déconnexion Sites : seul admin-workspace.tsx est traité par prepare.py
for p in (root/'components').rglob('*.tsx'):
    if p.name!='admin-workspace.tsx' and 'signout-with-chatgpt' in p.read_text():
        bad+=1; print('FUITE  signout-with-chatgpt non traité par prepare.py :',p.relative_to(root))
# SITE_URL de lib/seo.ts : prepare.py exige qu'il devienne https://smartfixx.fr (donc qu'il vaille
# exactement l'URL Sites, remplacée par portable()).
site_decl='export const SITE_URL="https://smartfixx-reach.wgg9cdxhs2.chatgpt.site"'
n=(root/'lib/seo.ts').read_text().count(site_decl)
if n!=1: bad+=1; print(f'COMPTE x{n} (attendu 1) lib/seo.ts :: {site_decl!r}')
# Même règle que le contrôle de fuite final de prepare.py : après remplacement de l'URL Sites dans les
# .ts/.tsx (portable()), plus aucun « chatgpt.site » dans app, components et lib (overlays VPS appliqués,
# relay exclu, app/chatgpt-auth.ts supprimé par prepare.py).
SITES='https://smartfixx-reach.wgg9cdxhs2.chatgpt.site'
effective={}
for base in [root,ov]:
    for d in ['app','components','lib']:
        if not (base/d).is_dir(): continue
        for p in (base/d).rglob('*'):
            if p.is_file() and 'relay' not in p.parts: effective[p.relative_to(base)]=p
effective.pop(Path('app/chatgpt-auth.ts'),None)
for r,p in sorted(effective.items()):
    text=p.read_text(errors='ignore')
    if p.suffix in ('.ts','.tsx'): text=text.replace(SITES,'')
    if 'chatgpt.site' in text: bad+=1; print('FUITE  chatgpt.site restant après prepare.py :',r)
print('écarts:',bad)
sys.exit(1 if bad else 0)
