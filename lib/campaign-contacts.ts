import {parseCampaignCsv} from './campaign-csv';
import {importRowSchema,mailAddress} from './campaign-sending-config';

export function prepareCampaignContacts(input:string,source:string){
 const text=input.replace(/^\uFEFF/,'').trim();
 if(text.length>25*1024*1024)throw new Error('Le fichier dépasse 25 Mo.');
 if(!text)return {rows:[],invalid:[],duplicates:0,total:0,format:'text' as const};
 const first=text.split(/\r?\n/,1)[0];
 const csv=!first.includes('@')&&/(?:^|[,;\t])\s*"?(?:email|mail|adresse[ _]email)"?\s*(?:[,;\t]|$)/i.test(first);
 const entries=csv?parseCampaignCsv(text).map((row,i)=>({row,line:i+2})):text.split(/\r\n|\n|\r/).flatMap((line,i)=>line.split(/[;,\t]+/).map(email=>({row:{email:email.trim(),name:'',company:'',source:'',trackingConsent:false,consentProof:''},line:i+1})).filter(x=>x.row.email));
 if(entries.length>50000)throw new Error('Maximum 50 000 adresses par import.');
 const rows:ReturnType<typeof importRowSchema.parse>[]=[],invalid:{line:number;email:string;message:string}[]=[];
 const seen=new Set<string>();let duplicates=0;
 for(const entry of entries){
  const candidate={...entry.row,source:entry.row.source||source.trim()};
  const parsed=importRowSchema.safeParse(candidate);
  if(!parsed.success){invalid.push({line:entry.line,email:entry.row.email,message:!mailAddress.safeParse(candidate.email).success?'Adresse email invalide':candidate.source.length<3?'Précisez l’origine des adresses':candidate.trackingConsent&&candidate.consentProof.length<15?'Preuve de consentement manquante ou trop courte':'Champ trop long ou invalide'});continue}
  if(seen.has(parsed.data.email)){duplicates++;continue}
  seen.add(parsed.data.email);rows.push(parsed.data);
 }
 return {rows,invalid,duplicates,total:entries.length,format:csv?'csv' as const:'text' as const};
}
