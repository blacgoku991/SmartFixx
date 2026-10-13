import nodemailer from 'nodemailer';
import {lookup} from 'node:dns/promises';
import {createPrivateKey} from 'node:crypto';
import ipaddr from 'ipaddr.js';
export function publicAddress(address){try{return ipaddr.process(address).range()==='unicast'}catch{return false}}
export async function smtpOptions(config,resolver=lookup){
 if(![465,587,2525].includes(config.port)||!config.host||!config.user||!config.password)throw Object.assign(new Error('Configuration SMTP invalide'),{safeCode:'CONNECTION'});
 const addresses=await resolver(config.host,{all:true,verbatim:true});if(!addresses.length||addresses.some(r=>!publicAddress(r.address)))throw Object.assign(new Error('Destination non publique'),{safeCode:'DNS'});
 const options={host:addresses[0].address,port:config.port,secure:config.port===465,requireTLS:true,auth:{user:config.user,pass:config.password},tls:{servername:config.host,rejectUnauthorized:true,minVersion:'TLSv1.2'},connectionTimeout:15000,greetingTimeout:15000,socketTimeout:30000,logger:false,debug:false,disableFileAccess:true,disableUrlAccess:true,maxRecipients:1};
 if(config.dkimMode==='local'){
  try{const key=createPrivateKey(config.dkimPrivateKey);if(key.asymmetricKeyType!=='rsa'||key.asymmetricKeyDetails.modulusLength<2048||!config.dkimSelector)throw new Error('Key');}catch{throw Object.assign(new Error('Clé DKIM invalide'),{safeCode:'DKIM'})}
  options.dkim={domainName:config.fromEmail.split('@')[1],keySelector:config.dkimSelector,privateKey:config.dkimPrivateKey,hashAlgo:'sha256',headerFieldNames:'from:to:subject:mime-version:content-type:content-transfer-encoding:list-unsubscribe:list-unsubscribe-post',cacheDir:false};
 }
 return options;
}
export async function smtpTransport(config,pooled=false){const options=await smtpOptions(config);return nodemailer.createTransport(pooled?{...options,pool:true,maxConnections:Math.max(1,Math.min(50,config.maxConnections||20)),maxMessages:100,maxRequeues:0}:options)}
export function makeMessage(message,config){
 const headers={};for(const key of ['List-Unsubscribe','List-Unsubscribe-Post'])if(typeof message.headers?.[key]==='string'&&!/[\r\n]/.test(message.headers[key]))headers[key]=message.headers[key];
 return {from:{name:config.fromName,address:config.fromEmail},to:[{address:message.to}],replyTo:config.replyTo,envelope:{from:config.fromEmail,to:[message.to]},subject:message.subject,html:message.html,text:message.text,messageId:message.messageId,date:new Date(),headers,disableFileAccess:true,disableUrlAccess:true,textEncoding:'quoted-printable'};
}
export function classifyFailure(error){
 const code=String(error?.code||''),command=String(error?.command||'').toUpperCase(),safe=error?.safeCode,response=Number(error?.responseCode||0);
 if(safe==='DKIM')return {result:'failed',error:'DKIM',hardBounce:false};
 if(safe==='DNS'||code==='EDNS'||code==='ENOTFOUND')return {result:'retry',error:'DNS',hardBounce:false};
 if(code==='EAUTH'||command==='AUTH')return {result:'failed',error:'AUTH',hardBounce:false};
 if(command==='STARTTLS'||/CERT|TLS|SSL|SELF_SIGNED/.test(code)||/certificate|self.signed|unable to verify/i.test(String(error?.message||'')))return {result:'failed',error:'TLS',hardBounce:false};
 if(response>=400&&response<500)return {result:'retry',error:'TEMPORARY',hardBounce:false};
 if(response>=500&&response<600){const hardBounce=/\b5\.1\.1\b/.test(String(error?.response||''));return {result:'failed',error:hardBounce?'INVALID_RECIPIENT':'REJECTED',hardBounce}}
 if(command==='CONN'||safe==='CONNECTION')return {result:'retry',error:'CONNECTION',hardBounce:false};
 return {result:'unknown',error:'UNCERTAIN',hardBounce:false};
}

// Only structured codes leave the VPS. Never forward SMTP response text,
// authentication challenges, message bodies, addresses or credentials.
export function diagnosticFromFailure(error){
 const diagnostic={},response=Number(error?.responseCode),text=String(error?.response||'').slice(0,4000),command=String(error?.command||'').toUpperCase();
 if(Number.isInteger(response)&&response>=400&&response<=599)diagnostic.responseCode=response;
 const enhanced=text.match(/\b([45]\.\d{1,3}\.\d{1,3})\b/);if(enhanced)diagnostic.enhancedStatus=enhanced[1];
 if(command)diagnostic.command=command.startsWith('AUTH')?'AUTH':command.startsWith('MAIL FROM')?'MAIL FROM':command.startsWith('RCPT TO')?'RCPT TO':command==='CONN'?'CONNECTION':command==='DATA'?'DATA':command==='STARTTLS'?'STARTTLS':'OTHER';
 if(/(?:sender|domain|identity|email address).{0,80}(?:not verified|unverified)|(?:not verified|unverified).{0,60}(?:sender|domain|identity)/i.test(text))diagnostic.reason='DOMAIN_NOT_VERIFIED';
 else if(/send as denied|sender.{0,60}(?:not allowed|not authorized|unauthorized|not owned)|not permitted to (?:send|relay)|relay(?:ing)? (?:access )?denied/i.test(text))diagnostic.reason='SENDER_NOT_ALLOWED';
 else if(/(?:daily|sending|rate|message) (?:limit|quota).{0,30}(?:exceeded|reached)|too many messages|throttl/i.test(text))diagnostic.reason='QUOTA';
 else if(/account.{0,50}(?:suspended|disabled|restricted)/i.test(text))diagnostic.reason='ACCOUNT_RESTRICTED';
 else if(/(?:mailbox|recipient).{0,30}disabled/i.test(text))diagnostic.reason='RECIPIENT_DISABLED';
 else if(/message (?:size|too large)|maximum message size/i.test(text))diagnostic.reason='MESSAGE_TOO_LARGE';
 else if(/authentication required|must authenticate/i.test(text))diagnostic.reason='AUTH_REQUIRED';
 else if(response>=500&&!command.startsWith('AUTH')&&error?.code!=='EAUTH'&&(/blocked by policy|rejected.{0,30}policy/i.test(text)||diagnostic.enhancedStatus?.startsWith('5.7.')))diagnostic.reason='POLICY';
 return diagnostic;
}
