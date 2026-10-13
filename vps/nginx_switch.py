#!/usr/bin/env python3
"""Replace only dedicated SmartFixx virtual hosts, with exact backups and rollback."""
from pathlib import Path
import os,sys,re,json,subprocess,shutil
HOSTS={'smartfixx.fr','www.smartfixx.fr'}
PUBLIC_CERT_DIR=Path('/etc/letsencrypt/live/smartfixx-public')
TOKEN=re.compile(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|\#[^\n]*|[{};]|[^\s{};#]+')
def blocks(text):
    tokens=[m for m in TOKEN.finditer(text) if not m.group().startswith('#')]
    out=[];i=0
    while i<len(tokens)-1:
        if tokens[i].group()=='server' and tokens[i+1].group()=='{':
            start=tokens[i].start();depth=1;j=i+2;direct=[];part=[]
            while j<len(tokens) and depth:
                v=tokens[j].group()
                if v=='{': depth+=1;part=[]
                elif v=='}': depth-=1;part=[]
                elif depth==1 and v==';':direct.append(part);part=[]
                elif depth==1:part.append(v.strip('"\''))
                j+=1
            if depth:raise ValueError('Bloc Nginx incomplet')
            out.append((start,tokens[j-1].end(),direct));i=j
        else:i+=1
    return out
def command(args):
    result=subprocess.run(args,text=True,capture_output=True)
    if result.returncode:raise RuntimeError('Échec : '+args[0]+' '+args[1])
    return result.stdout
def public_certificate():
    cert=PUBLIC_CERT_DIR/'fullchain.pem';key=PUBLIC_CERT_DIR/'privkey.pem'
    if not any(p.exists() or p.is_symlink() for p in (cert,key)):return None
    if not all(p.is_file() for p in (cert,key)):
        raise ValueError('Le certificat smartfixx-public est incomplet ; terminez sa création avec Certbot.')
    return str(cert),str(key)
def proposed(text,certificate=None):
    edits=[];tls_names=set();matched=False
    for start,end,direct in blocks(text):
        names={x for d in direct if d and d[0]=='server_name' for x in d[1:]}
        if not names&HOSTS:continue
        matched=True
        if names-HOSTS:raise ValueError('Un bloc SmartFixx héberge aussi un autre domaine : adaptation manuelle requise.')
        listens=[d[1:] for d in direct if d and d[0]=='listen']
        https=any('ssl' in d or any(x.endswith(':443') or x=='443' for x in d) for d in listens)
        if not https:
            # Preserve certificate renewal challenges and the current HTTPS redirect.
            if not re.search(r'\breturn\s+30[18]\s+https://',text[start:end]):
                raise ValueError('Le bloc HTTP doit rediriger vers HTTPS avant la bascule automatique.')
            continue
        cert=next((d[1] for d in direct if len(d)==2 and d[0]=='ssl_certificate'),None)
        key=next((d[1] for d in direct if len(d)==2 and d[0]=='ssl_certificate_key'),None)
        if certificate:cert,key=certificate
        if not cert or not key or any('$' in p or not Path(p).is_file() for p in [cert,key]):raise ValueError('Certificats HTTPS explicites introuvables ; adaptation manuelle requise.')
        for name in names:
            verified=command(['openssl','x509','-in',cert,'-noout','-checkhost',name])
            if 'does match certificate' not in verified:raise ValueError('Le certificat ne couvre pas '+name)
        tls_names.update(names)
        redirect=names=={'www.smartfixx.fr'}
        body='  return 308 https://smartfixx.fr$request_uri;\n' if redirect else '''  if ($host = www.smartfixx.fr) { return 308 https://smartfixx.fr$request_uri; }
  client_max_body_size 1m;
  add_header Strict-Transport-Security "max-age=31536000" always;
  location / {
    proxy_pass http://127.0.0.1:3100;
    proxy_http_version 1.1;
    proxy_set_header Host smartfixx.fr;
    proxy_set_header X-Forwarded-Host smartfixx.fr;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Smartfixx-Client-IP $remote_addr;
    proxy_set_header CF-Connecting-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header Connection "";
    proxy_set_header oai-authenticated-user-id "";
    proxy_set_header oai-authenticated-user-email "";
    proxy_buffering off;
    proxy_read_timeout 120s;
    proxy_connect_timeout 10s;
  }
'''
        https_listens=[d for d in listens if any(x.endswith(':443') or x=='443' for x in d)]
        if not https_listens:raise ValueError('Un port HTTPS personnalisé nécessite une adaptation manuelle.')
        listen_text=''.join('  listen '+' '.join(d if 'ssl' in d else [*d,'ssl'])+';\n' for d in https_listens)
        replacement='server {\n'+listen_text+'  server_name '+ ' '.join(sorted(names))+';\n  ssl_certificate "'+cert+'";\n  ssl_certificate_key "'+key+'";\n  ssl_protocols TLSv1.2 TLSv1.3;\n'+body+'}\n'
        edits.append((start,end,replacement))
    for start,end,replacement in reversed(edits):text=text[:start]+replacement+text[end:]
    return text,tls_names,matched
def dedicated_for_wildcard(text,certificate=None):
    """Add exact public hosts beside the wildcard; never rewrite SaaS routing."""
    parsed=blocks(text);tls=[];http=[]
    for start,end,direct in parsed:
        names={x for d in direct if d and d[0]=='server_name' for x in d[1:]}
        if names&HOSTS:raise ValueError('Un nom public existe déjà ; aucun hôte supplémentaire ajouté.')
        if '*.smartfixx.fr' not in names:continue
        listens=[d[1:] for d in direct if d and d[0]=='listen']
        secure=[d for d in listens if any(x=='443' or x.endswith(':443') for x in d)]
        plain=[d for d in listens if any(x=='80' or x.endswith(':80') for x in d)]
        if secure:tls.append((end,direct,secure))
        if plain:http.extend(plain)
    if len(tls)!=1 or not http:
        raise ValueError('La configuration générique doit présenter un seul bloc HTTPS et une écoute HTTP explicite.')
    end,direct,secure=tls[0]
    cert=next((d[1] for d in direct if len(d)==2 and d[0]=='ssl_certificate'),None)
    key=next((d[1] for d in direct if len(d)==2 and d[0]=='ssl_certificate_key'),None)
    if not cert or not key:raise ValueError('Les chemins du certificat et de sa clé doivent être explicites dans le bloc HTTPS générique.')
    # Keep the original block as the default when it was already the default.
    def listen_lines(values):
        unique=list(dict.fromkeys(tuple(x for x in d if x not in {'default_server','default'}) for d in values))
        return ''.join('  listen '+' '.join(d)+';\n' for d in unique)
    stub='server {\n'+listen_lines(secure)+'  server_name smartfixx.fr www.smartfixx.fr;\n  ssl_certificate "'+cert+'";\n  ssl_certificate_key "'+key+'";\n}\n'
    # The regular path checks the certificate for BOTH exact hostnames.
    https,names,_=proposed(stub,certificate)
    redirect='server {\n'+listen_lines(http)+'  server_name smartfixx.fr www.smartfixx.fr;\n  return 308 https://smartfixx.fr$request_uri;\n}\n'
    addition='\n\n# SmartFixx : site public. Les blocs SaaS et génériques sont conservés.\n'+https+'\n'+redirect
    return text[:end]+addition+text[end:],names
def plan(folder):
    result=command(['nginx','-T']);paths=list(dict.fromkeys(re.findall(r'^# configuration file ([^\n]+):$',result,re.M)))
    certificate=public_certificate()
    folder.mkdir(parents=True,exist_ok=True,mode=0o700);manifest=[];all_names=set();seen=set();sources=[];explicit=set();wildcards=[]
    for name in paths:
        p=Path(name).resolve()
        if p in seen:continue
        seen.add(p);before=p.read_text();sources.append((p,before))
        for _,_,direct in blocks(before):
            declared={x for d in direct if d and d[0]=='server_name' for x in d[1:]}
            explicit.update(declared&HOSTS)
            if '*.smartfixx.fr' in declared and any(d and d[0]=='listen' and any(x=='443' or x.endswith(':443') for x in d[1:]) for d in direct):wildcards.append(p)
    fallback=None
    if not explicit and len(wildcards)==1:
        fallback=wildcards[0]
    for p,before in sources:
        if p==fallback:
            after,names=dedicated_for_wildcard(before,certificate)
        else:after,names,_=proposed(before,certificate)
        all_names.update(names)
        if after==before:continue
        i=len(manifest);shutil.copy2(p,folder/f'{i}.old');(folder/f'{i}.new').write_text(after);manifest.append({'path':str(p),'index':i})
    if 'smartfixx.fr' not in all_names or not manifest:raise ValueError('Aucun hôte HTTPS dédié à smartfixx.fr trouvé. Aucun changement effectué.')
    (folder/'manifest.json').write_text(json.dumps(manifest));print('Configuration Nginx reconnue. Sauvegardes prêtes.')
    if fallback:print('Hôtes publics smartfixx.fr et www.smartfixx.fr préparés ; routage SaaS et autres sous-domaines conservé.')
    if certificate:print('Certificat smartfixx-public sélectionné uniquement pour le site public ; certificats des sous-domaines conservés.')
def switch(folder,rollback=False):
    manifest=json.loads((folder/'manifest.json').read_text())
    if not rollback:
        for row in manifest:
            if Path(row['path']).read_bytes()!=(folder/f"{row['index']}.old").read_bytes():raise ValueError('Nginx a changé depuis la préparation. Relancez le diagnostic.')
    for row in manifest:shutil.copyfile(folder/f"{row['index']}.{'old' if rollback else 'new'}",row['path'])
    try:command(['nginx','-t']);command(['systemctl','reload','nginx'])
    except Exception:
        if not rollback:
            for row in manifest:shutil.copyfile(folder/f"{row['index']}.old",row['path'])
            command(['nginx','-t']);command(['systemctl','reload','nginx'])
        raise
    print('Ancien site rétabli.' if rollback else 'Nginx utilise le nouveau site.')
if __name__=='__main__':
    try:
        if os.geteuid()!=0:raise ValueError('Lancez avec sudo.')
        action=sys.argv[1];folder=Path(sys.argv[2]).resolve()
        if action=='plan':plan(folder)
        elif action in ['apply','rollback']:switch(folder,action=='rollback')
        else:raise ValueError('Action inconnue')
    except Exception as e:raise SystemExit(str(e))
