/* Client des campagnes et des réglages d'envoi. URL et corps inchangés : GET sans corps (cache no-store),
   POST JSON du corps tel quel. Passe par le client défensif du panel (admin-panel/api) : message français
   au lieu de « Failed to fetch » ou « Unexpected token '<' », session perdue → reconnexion. */
import { panelApi } from "./admin-panel/api";
export function campaignApi<T>(url: string, body?: unknown): Promise<T> { return panelApi<T>(url, body); }
export const humanDate=(date:number|null|undefined)=>date?new Date(date).toLocaleString('fr-FR',{timeZone:'Europe/Paris',dateStyle:'short',timeStyle:'short'}):'—';
export type SenderState={configured:boolean;revision:number;config:null|{host:string;port:465|587|2525;user:string;fromName:string;fromEmail:string;replyTo:string;intervalSeconds:number;ratePerSecond?:number;providerMaxRate?:number|null;maxConnections?:number;dailyLimit:number;dkimSelector:string;dkimMode:'provider'|'local';passwordSaved:boolean;dkimKeySaved:boolean};runnerPaired:boolean;runnerConnected:boolean;runnerSeenAt:number|null;runnerVersion?:string;verifyErrorCode?:string;verifyDiagnostic?:import('@/lib/smtp-diagnostics').SmtpDiagnostic;verifyStatus:string;verifyError?:string;verifiedAt?:number|null;dns?:{domain?:string;spf?:string;dmarc?:string;dkim?:string;selector?:string};dnsCheckedAt?:number|null;reservedToday?:number};
