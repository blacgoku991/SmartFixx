#!/usr/bin/env python3
"""Build the narrow email update against an explicit baseline revision."""
from pathlib import Path
import subprocess,hashlib,json,zipfile,sys
root=Path(__file__).resolve().parent.parent
prepared=Path(sys.argv[1]);baseline=sys.argv[2]
files=['app/api/admin/campaigns/route.ts','app/api/email/click/route.ts','components/campaign-message-editor.tsx','lib/campaign-message.ts','lib/campaign-sending-config.ts','lib/email-destination.ts','lib/email-template.ts','lib/email-block-template.ts','lib/email-service-links.ts','package.json','package-lock.json']
manifest={}
archive=root/'public/downloads/SmartFixx-email-update.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for name in files:
  r=subprocess.run(['git','show',baseline+':'+name],cwd=root,capture_output=True)
  old=r.stdout if r.returncode==0 else None
  if old is not None and name=='package.json':
   p=json.loads(old);p['scripts']={'build':'next build --webpack','start':'node server.js','admin:password':'node runtime/cli.mjs owner','backup':'node runtime/cli.mjs backup'};old=(json.dumps(p,indent=2)+'\n').encode()
  new=(prepared/name).read_bytes()
  manifest[name]={'before':hashlib.sha256(old).hexdigest() if old is not None else None,'after':hashlib.sha256(new).hexdigest()}
  z.writestr(name,new)
 z.writestr('manifest.json',json.dumps(manifest))
sha=hashlib.sha256(archive.read_bytes()).hexdigest()
(root/'public/downloads/SmartFixx-mettre-a-jour-email.sh').write_text((root/'vps/update-email.sh').read_text().replace('UPDATE_SHA',sha))
print('Email update archive ready:',len(files),'files')
