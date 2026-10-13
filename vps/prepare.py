#!/usr/bin/env python3
"""Produce the complete VPS source from the tracked Site and its Node overlays."""
from pathlib import Path
import sys,shutil,json
root=Path(__file__).resolve().parent.parent
out=Path(sys.argv[1]).resolve()
if out==root or root.is_relative_to(out) or out.exists():
    raise SystemExit('Use a new empty output path outside the source checkout.')
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
    text=path.read_text().replace('"cloudflare:workers"','"@/lib/runtime"').replace("'cloudflare:workers'","'@/lib/runtime'")
    path.write_text(text)
(out/'app/chatgpt-auth.ts').unlink()
# Canonical URLs and future email links are local to this VPS deployment.
for path in [*out.rglob('*.tsx'),*out.rglob('*.ts')]:
    if 'relay' in path.parts: continue
    text=path.read_text().replace('https://smartfixx-reach.wgg9cdxhs2.chatgpt.site','https://smartfixx.fr').replace('"cloudflare:workers"','"@/lib/runtime"').replace("'cloudflare:workers'","'@/lib/runtime'")
    if path.name=='admin-workspace.tsx':
        text=text.replace('/signout-with-chatgpt?return_to=%2Fadmin','/admin/logout').replace('Cette version est publiée sur son adresse Sites. Le rattachement de Smartfixx.fr et la migration de ses anciennes pages restent à effectuer.','Cette version est hébergée sur votre VPS et utilise smartfixx.fr. Les anciennes URL doivent conserver leurs redirections si elles ont changé.')
    if path==out/'app/mentions-legales/page.tsx':
        text=text.replace('Cette version du site est hébergée via la plateforme Sites de ChatGPT, sur l’infrastructure Cloudflare. L’accès à cette version est contrôlé par la plateforme.','Ce site est installé sur le serveur privé utilisé et administré par SmartFixx. Pour toute question technique relative à cet hébergement : contact@smartfixx.fr.')
    if path==out/'app/confidentialite/page.tsx':
        text=text.replace('Des mécanismes techniques nécessaires à l’hébergement et au contrôle d’accès peuvent être utilisés par la plateforme.','Un cookie de session strictement nécessaire est utilisé uniquement pour la connexion administrateur. Il expire après huit heures ou à la déconnexion. Les identifiants de session sont conservés hachés sur le serveur.')
    path.write_text(text)
layout=out/'app/layout.tsx';s=layout.read_text();s='import {headers} from "next/headers";\n'+s
s=s.replace('export default function RootLayout','export default async function RootLayout').replace('  return (','  const nonce=(await headers()).get("x-nonce")||undefined;\n  return (').replace('<script dangerouslySetInnerHTML','<script nonce={nonce} dangerouslySetInnerHTML')
layout.write_text(s)
j=out/'components/json-ld.tsx';j.write_text('import {headers} from "next/headers";\n'+j.read_text().replace('export function JsonLd','export async function JsonLd').replace('return <script','const nonce=(await headers()).get("x-nonce")||undefined;return <script nonce={nonce}'))
h=out/'lib/http-security.ts';h.write_text('import {SITE_URL} from "./seo";\n'+h.read_text().replace('origin===new URL(request.url).origin','origin===SITE_URL'))
pkg=json.loads((out/'package.json').read_text());pkg['scripts']={'build':'next build --webpack','start':'node server.js','admin:password':'node runtime/cli.mjs owner','backup':'node runtime/cli.mjs backup'}
(out/'package.json').write_text(json.dumps(pkg,indent=2)+'\n')
ts=json.loads((out/'tsconfig.json').read_text());ts['exclude']=['node_modules','relay','vps'];(out/'tsconfig.json').write_text(json.dumps(ts,indent=2)+'\n')
for name in ['Dockerfile','compose.yaml','.dockerignore','install.sh','nginx_switch.py','rollback.sh','LISEZ-MOI.md']:
    shutil.copy2(root/'vps'/name,out/name)
print(out)
