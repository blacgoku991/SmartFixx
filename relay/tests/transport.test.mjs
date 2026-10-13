import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync} from 'node:crypto';
import {mkdtempSync,rmSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import nodemailer from 'nodemailer';
import {smtpOptions,publicAddress,classifyFailure,makeMessage,diagnosticFromFailure} from '../transport.mjs';
import {Journal} from '../journal.mjs';
const config={host:'smtp.example.com',port:587,user:'user@example.com',password:'local-test-only',fromName:'Mohamed — SmartFixx',fromEmail:'contact@example.com',replyTo:'contact@example.com',dkimMode:'provider'};
const resolver=async()=>[{address:'8.8.8.8',family:4}];
test('SMTP destinations reject local, private, link-local and mapped private addresses',async()=>{
 for(const ip of ['127.0.0.1','10.0.0.1','169.254.169.254','172.16.0.1','192.168.2.1','::1','fe80::1','fc00::1','::ffff:127.0.0.1','100.64.0.1','0.0.0.0'])assert.equal(publicAddress(ip),false,ip);
 assert.equal(publicAddress('8.8.8.8'),true);
 await assert.rejects(()=>smtpOptions(config,async()=>[{address:'8.8.8.8'},{address:'127.0.0.1'}]),/non publique/);
});
test('STARTTLS, strict certificates and pinned DNS addresses are mandatory',async()=>{
 const o=await smtpOptions(config,resolver);assert.equal(o.host,'8.8.8.8');assert.equal(o.secure,false);assert.equal(o.requireTLS,true);assert.equal(o.tls.rejectUnauthorized,true);assert.equal(o.tls.servername,config.host);assert.equal(o.tls.minVersion,'TLSv1.2');assert.equal(o.disableFileAccess,true);assert.equal(o.disableUrlAccess,true);assert.equal(o.maxRecipients,1);
 assert.equal((await smtpOptions({...config,port:465},resolver)).secure,true);await assert.rejects(()=>smtpOptions({...config,port:25},resolver));
});
test('SMTP failures distinguish retryable rejection, invalid address and uncertain transmission',()=>{
 assert.deepEqual(classifyFailure({responseCode:451,command:'DATA'}),{result:'retry',error:'TEMPORARY',hardBounce:false});
 assert.deepEqual(classifyFailure({responseCode:550,response:'550 5.1.1 mailbox unknown'}),{result:'failed',error:'INVALID_RECIPIENT',hardBounce:true});
 assert.equal(classifyFailure({responseCode:550,response:'550 5.7.1 blocked by policy'}).hardBounce,false);
 assert.equal(classifyFailure({code:'ETIMEDOUT',command:'DATA'}).result,'unknown');
 assert.equal(classifyFailure({code:'EAUTH'}).error,'AUTH');
 assert.equal(classifyFailure({code:'ESOCKET',command:'CONN',message:'certificate has expired'}).error,'TLS');
});
test('diagnostics carry only structured SMTP codes, never response text or credentials',()=>{
 const raw={responseCode:550,command:'MAIL FROM:<private@example.com>',response:'550 5.7.1 Sender not allowed private@example.com password=do-not-export token=secret'};
 assert.deepEqual(diagnosticFromFailure(raw),{responseCode:550,enhancedStatus:'5.7.1',command:'MAIL FROM',reason:'SENDER_NOT_ALLOWED'});
 const auth=diagnosticFromFailure({code:'EAUTH',command:'AUTH LOGIN c2VjcmV0',responseCode:535,response:'535 5.7.8 Authentication failed'});
 assert.deepEqual(auth,{responseCode:535,enhancedStatus:'5.7.8',command:'AUTH'});
 assert.equal(diagnosticFromFailure({responseCode:554,response:'554 Message rejected: Email address is not verified'}).reason,'DOMAIN_NOT_VERIFIED');
 assert.equal(diagnosticFromFailure({responseCode:452,response:'452 4.2.2 mailbox quota exceeded'}).reason,undefined,'a full recipient mailbox is not a sender quota');
 assert.equal(diagnosticFromFailure({responseCode:451,response:'451 daily sending quota exceeded'}).reason,'QUOTA');
 assert.ok(!JSON.stringify(diagnosticFromFailure(raw)).includes('private@example.com'));
});
test('MIME output preserves single recipient, text/HTML, DKIM and signed unsubscribe headers',async()=>{
 const keys=generateKeyPairSync('rsa',{modulusLength:2048,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}});
 const options=await smtpOptions({...config,dkimMode:'local',dkimSelector:'reach',dkimPrivateKey:keys.privateKey},resolver);
 const message={to:'prospect@example.com',subject:'Votre prochaine campagne',html:'<p>Bonjour <a href="https://example.com/email/interest/token">Parlons-en</a></p><img src="https://example.com/api/email/open?token=unique" width="1" height="1" alt="">',text:'Bonjour, parlons-en : https://example.com/email/interest/token',messageId:'<smartfixx-test@example.com>',headers:{'List-Unsubscribe':'<https://example.com/api/email/unsubscribe?token=stop>','List-Unsubscribe-Post':'List-Unsubscribe=One-Click','Bcc':'injected@example.com'}};
 const transport=nodemailer.createTransport({streamTransport:true,buffer:true,newline:'unix',dkim:options.dkim});const result=await transport.sendMail(makeMessage(message,config));const raw=result.message.toString('utf8');
 assert.match(raw,/multipart\/alternative/);assert.match(raw,/Content-Type: text\/plain/);assert.match(raw,/Content-Type: text\/html/);assert.match(raw,/DKIM-Signature:/);assert.match(raw,/List-Unsubscribe-Post: List-Unsubscribe=One-Click/);assert.match(raw,/list-unsubscribe-post/i);assert.match(raw,/To: prospect@example.com/);assert.ok(!raw.includes('injected@example.com'));assert.match(raw,/open\?token=3Dunique/);
});
test('weak or invalid DKIM keys are rejected before SMTP connection',async()=>{
 const key=generateKeyPairSync('rsa',{modulusLength:1024,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}});
 await assert.rejects(()=>smtpOptions({...config,dkimMode:'local',dkimSelector:'reach',dkimPrivateKey:key.privateKey},resolver),/DKIM/);
});
test('receipts survive a process restart and are removed only after acknowledgement',()=>{
 const dir=mkdtempSync(join(tmpdir(),'smartfixx-receipts-'));try{const id='f21901ca-4afb-43ae-a7ad-7c4538a730a1',j=new Journal(dir);j.save({id,lease:'test-lease',result:'unknown',error:'UNCERTAIN'});assert.equal(new Journal(dir).pending()[0].result,'unknown');assert.equal(statSync(join(dir,id+'.json')).mode&0o777,0o600);j.save({id,lease:'test-lease',result:'accepted',error:''});assert.equal(new Journal(dir).pending()[0].result,'accepted');j.remove(id);assert.equal(j.pending().length,0);assert.throws(()=>j.path('../../escape'))}finally{rmSync(dir,{recursive:true,force:true})}
});
