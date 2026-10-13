import {z} from 'zod';
import {smtpErrors} from './campaign-sending-config';
export const smtpDiagnosticSchema=z.object({
 responseCode:z.number().int().min(400).max(599).optional(),
 enhancedStatus:z.string().regex(/^[45]\.\d{1,3}\.\d{1,3}$/).optional(),
 command:z.enum(['CONNECTION','AUTH','STARTTLS','MAIL FROM','RCPT TO','DATA','OTHER']).optional(),
 reason:z.enum(['SENDER_NOT_ALLOWED','DOMAIN_NOT_VERIFIED','QUOTA','ACCOUNT_RESTRICTED','RECIPIENT_DISABLED','MESSAGE_TOO_LARGE','AUTH_REQUIRED','POLICY']).optional()
}).strict();
export type SmtpDiagnostic=z.infer<typeof smtpDiagnosticSchema>;
const reasons:Record<string,{title:string;action:string}>={
 SENDER_NOT_ALLOWED:{title:'Adresse d’expédition non autorisée.',action:'Utilisez une adresse d’expédition autorisée pour ce compte SMTP, puis refaites un test.'},
 DOMAIN_NOT_VERIFIED:{title:'Expéditeur ou domaine non vérifié.',action:'Validez cette adresse ou ce domaine dans le compte de votre fournisseur SMTP.'},
 QUOTA:{title:'Limite d’envoi atteinte.',action:'Consultez votre quota chez le fournisseur et attendez sa remise à zéro avant de reprendre.'},
 ACCOUNT_RESTRICTED:{title:'Compte d’envoi restreint.',action:'Consultez les alertes et restrictions dans le compte de votre fournisseur SMTP.'},
 RECIPIENT_DISABLED:{title:'Boîte du destinataire désactivée.',action:'Vérifiez cette adresse auprès du contact. Une autre adresse peut être nécessaire.'},
 MESSAGE_TOO_LARGE:{title:'Message trop volumineux.',action:'Vérifiez la taille maximale autorisée par votre fournisseur SMTP.'},
 AUTH_REQUIRED:{title:'Authentification requise pour cet envoi.',action:'Vérifiez le compte SMTP et son autorisation à envoyer depuis cette adresse.'},
 POLICY:{title:'Envoi refusé par une règle du serveur.',action:'Consultez le journal de votre fournisseur avec le code affiché : la règle exacte n’est pas précisée ici.'}
};
const actions:Record<string,string>={AUTH:'Vérifiez l’identifiant et le mot de passe SMTP, puis enregistrez et retestez la connexion.',TLS:'Vérifiez le serveur et son port sécurisé auprès du fournisseur.',DNS:'Vérifiez le nom du serveur SMTP : utilisez celui fourni par votre messagerie.',CONNECTION:'Vérifiez que le VPS peut joindre ce serveur sur le port choisi.',TEMPORARY:'Le serveur demande de réessayer plus tard. Les refus temporaires sont repris automatiquement, jusqu’à trois tentatives.',REJECTED:'Consultez le journal du fournisseur avec l’adresse, l’heure et le Message-ID. Le relais précédent n’a pas transmis le motif détaillé.',INVALID_RECIPIENT:'Vérifiez l’adresse du destinataire. Elle a été exclue des prochains envois.',UNCERTAIN:'Vérifiez le Message-ID chez votre fournisseur avant tout renvoi : le serveur a peut-être reçu le message.',DKIM:'Vérifiez la clé privée et le sélecteur DKIM, ou utilisez la signature de votre fournisseur.',EXPIRED:'Ajoutez ce contact à une nouvelle campagne si la prise de contact est toujours pertinente.'};
export function readSmtpDiagnostic(value:unknown):SmtpDiagnostic{try{const parsed=smtpDiagnosticSchema.safeParse(typeof value==='string'?JSON.parse(value):value);return parsed.success?parsed.data:{}}catch{return {}}}
export function explainSmtp(error:string,value?:unknown){const diagnostic=readSmtpDiagnostic(value),reason=diagnostic.reason?reasons[diagnostic.reason]:undefined;return {title:reason?.title||smtpErrors[error]||'Envoi à vérifier.',action:reason?.action||(error==='REJECTED'&&diagnostic.responseCode?'Consultez le journal du fournisseur avec ce code, l’adresse et le Message-ID pour connaître la règle exacte.':actions[error])||'Vérifiez le résultat dans votre compte de messagerie.',code:[diagnostic.responseCode,diagnostic.enhancedStatus].filter(Boolean).join(' · '),stage:diagnostic.command||''}}
