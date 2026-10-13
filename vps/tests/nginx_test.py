import importlib.util,unittest,tempfile,subprocess
from pathlib import Path
from unittest.mock import patch
import json
spec=importlib.util.spec_from_file_location('switch',Path(__file__).resolve().parents[1]/'nginx_switch.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class NginxTests(unittest.TestCase):
 def setUp(self):
  self.cert_dir=tempfile.TemporaryDirectory()
  self.addCleanup(self.cert_dir.cleanup)
  public_dir=patch.object(module,'PUBLIC_CERT_DIR',Path(self.cert_dir.name)/'smartfixx-public')
  public_dir.start();self.addCleanup(public_dir.stop)
 def test_parser_preserves_unrelated_servers_and_replaces_only_smartfixx(self):
  with tempfile.TemporaryDirectory() as d:
   cert=Path(d)/'cert.pem';cert.touch();key=Path(d)/'key.pem';key.touch()
   other='server { listen 443 ssl; server_name other.example; location / { return 200 "ok { }"; } }'
   source=other+f'\nserver {{ listen 80; server_name smartfixx.fr; return 301 https://$host$request_uri; }}\nserver {{ listen 443 ssl; server_name smartfixx.fr www.smartfixx.fr; ssl_certificate {cert}; ssl_certificate_key {key}; location / {{ proxy_pass http://old; }} }}'
   with patch.object(module,'command',return_value='Hostname smartfixx.fr does match certificate'):
    result,names,matched=module.proposed(source)
   self.assertIn(other,result);self.assertIn('proxy_pass http://127.0.0.1:3100',result);self.assertIn('X-Smartfixx-Client-IP $remote_addr',result);self.assertNotIn('http://old',result);self.assertEqual(names,{'smartfixx.fr','www.smartfixx.fr'})
 def test_shared_domain_and_non_redirecting_http_fail_before_changes(self):
  with self.assertRaises(ValueError):module.proposed('server { server_name smartfixx.fr other.example; }')
  with self.assertRaises(ValueError):module.proposed('server { listen 80; server_name smartfixx.fr; root /old; }')
 def wildcard(self,d):
  cert=Path(d)/'cert.pem';cert.touch();key=Path(d)/'key.pem';key.touch()
  return f'''# Existing SaaS configuration
server {{
    listen 443 ssl http2 default_server;
    server_name saas.smartfixx.fr *.smartfixx.fr;
    ssl_certificate {cert};
    ssl_certificate_key {key};
    location / {{ proxy_pass http://old-saas; }}
}}
server {{ listen 80 default_server; server_name saas.smartfixx.fr *.smartfixx.fr; return 301 https://$host$request_uri; }}
'''
 def test_wildcard_adds_exact_hosts_without_changing_saas_or_default(self):
  with tempfile.TemporaryDirectory() as d:
   before=self.wildcard(d)
   with patch.object(module,'command',return_value='Hostname does match certificate') as check:
    after,names=module.dedicated_for_wildcard(before)
   original=[before[a:b] for a,b,_ in module.blocks(before)]
   for block in original:self.assertIn(block,after)
   self.assertEqual(len(module.blocks(after)),4);self.assertEqual(names,module.HOSTS)
   self.assertEqual(after.count('default_server'),2);self.assertEqual(after.count('proxy_pass http://old-saas'),1)
   self.assertEqual(after.count('server_name smartfixx.fr www.smartfixx.fr;'),2)
   self.assertEqual(after.count('proxy_set_header CF-Connecting-IP $remote_addr;'),1)
   self.assertEqual({c.args[0][-1] for c in check.call_args_list},module.HOSTS)
   with self.assertRaises(ValueError):module.dedicated_for_wildcard(after)
 def test_wildcard_certificate_must_cover_apex_and_www(self):
  with tempfile.TemporaryDirectory() as d:
   with patch.object(module,'command',return_value='Hostname smartfixx.fr does NOT match certificate'):
    with self.assertRaisesRegex(ValueError,'certificat ne couvre'):module.dedicated_for_wildcard(self.wildcard(d))
 def test_plan_apply_rollback_preserve_original_and_reject_stale_config(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'smartfixx';original=self.wildcard(d);p.write_text(original);folder=Path(d)/'backup'
   def command(args):return f'# configuration file {p}:\n'+original if args[:2]==['nginx','-T'] else 'Hostname does match certificate'
   with patch.object(module,'command',side_effect=command):
    module.plan(folder);self.assertEqual(p.read_text(),original)
    manifest=json.loads((folder/'manifest.json').read_text());self.assertEqual(len(manifest),1)
    p.write_text(original+'# changed\n')
    with self.assertRaisesRegex(ValueError,'changé'):module.switch(folder)
    p.write_text(original);module.switch(folder);self.assertIn('127.0.0.1:3100',p.read_text())
    module.switch(folder,True);self.assertEqual(p.read_text(),original)
 def make_certificate(self,d,san):
  d.mkdir(parents=True,exist_ok=True)
  cert=d/'fullchain.pem';key=d/'privkey.pem'
  subprocess.run(['openssl','req','-x509','-newkey','rsa:2048','-nodes','-keyout',str(key),'-out',str(cert),'-days','1','-subj','/CN=smartfixx.fr','-addext','subjectAltName='+san],capture_output=True,check=True)
  return str(cert),str(key)
 def test_separate_public_certificate_is_used_and_saas_is_preserved(self):
  with tempfile.TemporaryDirectory() as d:
   original=self.wildcard(d);p=Path(d)/'nginx';p.write_text(original)
   self.make_certificate(module.PUBLIC_CERT_DIR,'DNS:smartfixx.fr,DNS:www.smartfixx.fr')
   actual_command=module.command
   def command(args):
    if args[:2]==['nginx','-T']:return f'# configuration file {p}:\n'+original
    return actual_command(args)
   folder=Path(d)/'backup'
   with patch.object(module,'command',side_effect=command):module.plan(folder)
   staged=(folder/'0.new').read_text()
   self.assertEqual(p.read_text(),original)
   for a,b,_ in module.blocks(original):self.assertIn(original[a:b],staged)
   public=[direct for _,_,direct in module.blocks(staged) if any(row and row[0]=='server_name' and 'smartfixx.fr' in row for row in direct)]
   self.assertTrue(any(['ssl_certificate',str(module.PUBLIC_CERT_DIR/'fullchain.pem')] in block for block in public))
   self.assertEqual(staged.count(str(module.PUBLIC_CERT_DIR/'privkey.pem')),1)
 def test_separate_certificate_does_not_bypass_hostname_validation(self):
  with tempfile.TemporaryDirectory() as d:
   original=self.wildcard(d)
   for san in ('DNS:*.smartfixx.fr','DNS:smartfixx.fr'):
    cert=self.make_certificate(module.PUBLIC_CERT_DIR,san)
    with self.assertRaisesRegex(ValueError,'certificat ne couvre'):module.dedicated_for_wildcard(original,cert)
 def test_incomplete_public_certificate_is_rejected(self):
  self.assertIsNone(module.public_certificate())
  module.PUBLIC_CERT_DIR.mkdir()
  (module.PUBLIC_CERT_DIR/'fullchain.pem').touch()
  with self.assertRaisesRegex(ValueError,'incomplet'):module.public_certificate()
if __name__=='__main__':unittest.main()
