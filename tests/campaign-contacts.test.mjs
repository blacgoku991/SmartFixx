import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {build} from 'esbuild';
import {pathToFileURL} from 'node:url';
const dir=mkdtempSync(join(tmpdir(),'smartfixx-contacts-'));
try{
 await build({entryPoints:['lib/campaign-contacts.ts'],outfile:join(dir,'contacts.mjs'),bundle:true,platform:'node',format:'esm',logLevel:'silent'});
 const {prepareCampaignContacts}=await import(pathToFileURL(resolve(dir,'contacts.mjs')).href);
 test('plain TXT preserves first email, normalizes case, removes duplicates and keeps tracking off',()=>{
  const d=prepareCampaignContacts('\uFEFFFirst@example.com\r\nsecond@example.com\r\nFIRST@example.com\n','Mon fichier clients');
  assert.equal(d.format,'text');assert.equal(d.rows.length,2);assert.equal(d.rows[0].email,'first@example.com');assert.equal(d.duplicates,1);assert.equal(d.invalid.length,0);
  assert.ok(d.rows.every(r=>r.company===''&&!r.trackingConsent&&r.source==='Mon fichier clients'));
 });
 test('comma, semicolon and tab lists retain invalid line numbers without silently fixing addresses',()=>{
  const d=prepareCampaignContacts('a@example.com;b@example.com\nbad-address\nc@example.com\td@example.com,e@example.com','Mon fichier clients');
  assert.equal(d.rows.length,5);assert.equal(d.invalid.length,1);assert.equal(d.invalid[0].line,2);assert.equal(d.invalid[0].email,'bad-address');
 });
 test('CSV supports optional names, quoted company separators, multiline fields and documented consent',()=>{
  const d=prepareCampaignContacts('email;prenom;entreprise;source;consentement_mesure;preuve_consentement\nuser@example.com;Camille;"Entreprise; Paris";"Site\nprofessionnel";oui;"2026-09-15 : accord conservé"','');
  assert.equal(d.format,'csv');assert.equal(d.invalid.length,0);assert.equal(d.rows[0].company,'Entreprise; Paris');assert.equal(d.rows[0].trackingConsent,true);
  assert.equal(prepareCampaignContacts('email\nuser@example.com','Mon fichier clients').rows.length,1);
 });
 test('missing source, invalid consent, malformed CSV and excess rows are rejected explicitly',()=>{
  assert.equal(prepareCampaignContacts('user@example.com','').invalid[0].message,'Précisez l’origine des adresses');
  const d=prepareCampaignContacts('email;consentement_mesure\nuser@example.com;oui','Mon fichier clients');assert.equal(d.rows.length,0);assert.equal(d.invalid.length,1);
  assert.throws(()=>prepareCampaignContacts('email;entreprise\nuser@example.com;"unterminated','Mon fichier clients'));
  assert.throws(()=>prepareCampaignContacts(Array.from({length:50001},(_,i)=>`u${i}@example.com`).join('\n'),'Mon fichier clients'),/50 000/);
 });
}finally{rmSync(dir,{recursive:true,force:true})}
