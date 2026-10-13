#!/usr/bin/env python3
"""Produce the complete VPS source from the tracked Site and its Node overlays.

Mode strict : chaque remplacement ciblé passe par sub(), qui arrête la génération
si la chaîne attendue a disparu de la source. Une retouche de forme dans
app/layout.tsx, components/json-ld.tsx, lib/http-security.ts, le panel ou les
pages légales casse donc la préparation au lieu de produire en silence un VPS
sans nonce, avec un contrôle d'origine faux ou un hébergeur inexact.
"""
from pathlib import Path
import sys,shutil,json
root=Path(__file__).resolve().parent.parent
out=Path(sys.argv[1]).resolve()
if out==root or root.is_relative_to(out) or out.is_relative_to(root) or out.exists():
    raise SystemExit('Use a new empty output path outside the source checkout.')

SITES_URL='https://smartfixx-reach.wgg9cdxhs2.chatgpt.site'

def sub(text,old,new,label,exactly=None):
    """Remplace old par new ; échoue si old est absent (ou si son nombre diffère de exactly)."""
    n=text.count(old)
    if n==0:
        raise SystemExit(f'prepare.py : chaîne introuvable pour « {label} » : {old[:90]!r}')
    if exactly is not None and n!=exactly:
        raise SystemExit(f'prepare.py : « {label} » attendu exactement {exactly} fois, trouvé {n} fois : {old[:90]!r}')
    return text.replace(old,new)

def portable(text):
    """Remplacements globaux (domaine Sites, module Cloudflare) : facultatifs par fichier."""
    return text.replace(SITES_URL,'https://smartfixx.fr').replace('"cloudflare:workers"','"@/lib/runtime"').replace("'cloudflare:workers'","'@/lib/runtime'")

out.mkdir(parents=True)
for name in ['app','components','hooks','lib','db','drizzle','public','vendor','relay']:
    shutil.copytree(root/name,out/name,ignore=shutil.ignore_patterns('node_modules','.env','data','downloads') if name in ['public','relay'] else None)
(out/'public/downloads').mkdir()
for name in ['SmartFixx-relais-SMTP.zip','SmartFixx-mettre-a-jour-relais.sh','SmartFixx-contacts-exemple.csv']:
    shutil.copy2(root/'public/downloads'/name,out/'public/downloads'/name)
for name in ['package.json','package-lock.json','postcss.config.mjs','tsconfig.json','worker-configuration.d.ts']:
    shutil.copy2(root/name,out/name)
for name in ['runtime','overlay']:
    target=out/'runtime' if name=='runtime' else out
    shutil.copytree(root/'vps'/name,target,dirs_exist_ok=True)
for path in [*out.glob('lib/*.ts'),out/'db/index.ts']:
    path.write_text(path.read_text().replace('"cloudflare:workers"','"@/lib/runtime"').replace("'cloudflare:workers'","'@/lib/runtime'"))
(out/'app/chatgpt-auth.ts').unlink()

# Canonical URLs and future email links are local to this VPS deployment.
seen={'admin-workspace':False,'mentions':False,'confidentialite':False}
for path in [*out.rglob('*.tsx'),*out.rglob('*.ts')]:
    if 'relay' in path.parts: continue
    text=portable(path.read_text())
    if path==out/'components/admin-workspace.tsx':
        seen['admin-workspace']=True
        text=sub(text,'/signout-with-chatgpt?return_to=%2Fadmin','/admin/logout','déconnexion du panel')
        text=sub(text,'Cette version est publiée sur son adresse Sites. Le rattachement de Smartfixx.fr et la migration de ses anciennes pages restent à effectuer.','Cette version est hébergée sur votre VPS et utilise smartfixx.fr. Les anciennes URL doivent conserver leurs redirections si elles ont changé.','phrase d’hébergement du panel')
    if path==out/'app/mentions-legales/page.tsx':
        seen['mentions']=True
        text=sub(text,'Cette version du site est hébergée via la plateforme Sites de ChatGPT, sur l’infrastructure Cloudflare. L’accès à cette version est contrôlé par la plateforme.','Ce site est installé sur le serveur privé utilisé et administré par SmartFixx. Pour toute question technique relative à cet hébergement : contact@smartfixx.fr.','hébergeur des mentions légales')
    if path==out/'app/confidentialite/page.tsx':
        seen['confidentialite']=True
        text=sub(text,'Des mécanismes techniques nécessaires à l’hébergement et au contrôle d’accès peuvent être utilisés par la plateforme.','Un cookie de session strictement nécessaire est utilisé uniquement pour la connexion administrateur. Il expire après huit heures ou à la déconnexion. Les identifiants de session sont conservés hachés sur le serveur.','cookie de la confidentialité')
    path.write_text(text)
for k,v in seen.items():
    if not v: raise SystemExit(f'prepare.py : fichier attendu absent ({k}).')

layout=out/'app/layout.tsx';s=layout.read_text()
s=sub(s,'export default function RootLayout','export default async function RootLayout','layout async',exactly=1)
s=sub(s,'  return (','  const nonce=(await headers()).get("x-nonce")||undefined;\n  return (','layout return',exactly=1)
s=sub(s,'<script dangerouslySetInnerHTML','<script nonce={nonce} dangerouslySetInnerHTML','layout nonce du script de thème')
layout.write_text('import {headers} from "next/headers";\n'+s)
j=out/'components/json-ld.tsx';t=j.read_text()
t=sub(t,'export function JsonLd','export async function JsonLd','JsonLd async',exactly=1)
t=sub(t,'return <script','const nonce=(await headers()).get("x-nonce")||undefined;return <script nonce={nonce}','JsonLd nonce',exactly=1)
j.write_text('import {headers} from "next/headers";\n'+t)
h=out/'lib/http-security.ts';t=h.read_text()
t=sub(t,'origin===new URL(request.url).origin','origin===SITE_URL','contrôle d’origine')
h.write_text('import {SITE_URL} from "./seo";\n'+t)
if 'https://smartfixx.fr' not in (out/'lib/seo.ts').read_text():
    raise SystemExit('prepare.py : SITE_URL de lib/seo.ts n’a pas été remplacé par https://smartfixx.fr.')

pkg=json.loads((out/'package.json').read_text());pkg['scripts']={'build':'next build --webpack','start':'node server.js','admin:password':'node runtime/cli.mjs owner','backup':'node runtime/cli.mjs backup'}
(out/'package.json').write_text(json.dumps(pkg,indent=2)+'\n')
ts=json.loads((out/'tsconfig.json').read_text());ts['exclude']=['node_modules','relay','vps'];(out/'tsconfig.json').write_text(json.dumps(ts,indent=2)+'\n')
for name in ['Dockerfile','compose.yaml','.dockerignore','install.sh','nginx_switch.py','rollback.sh','LISEZ-MOI.md']:
    shutil.copy2(root/'vps'/name,out/name)

# Contrôles après génération : aucun lien de déconnexion Sites ni domaine Sites dans le code du VPS.
leaks=[]
for p in (out/'components').rglob('*'):
    if p.is_file() and 'signout-with-chatgpt' in p.read_text(errors='ignore'):
        leaks.append(f'signout-with-chatgpt dans {p.relative_to(out)}')
for d in ['app','components','lib']:
    for p in (out/d).rglob('*'):
        if p.is_file() and 'chatgpt.site' in p.read_text(errors='ignore'):
            leaks.append(f'chatgpt.site dans {p.relative_to(out)}')
if leaks:
    raise SystemExit('prepare.py : fuites dans la variante VPS :\n  '+'\n  '.join(leaks))
print(out)
