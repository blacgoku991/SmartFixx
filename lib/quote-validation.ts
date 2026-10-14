import { z } from "zod";
import { normalizePhone } from "./phone";
import { completeWebsiteUrl, isWebsiteUrl, fieldMessages, CONTACT_REQUIRED } from "./project-options";
export { fieldMessages, CONTACT_REQUIRED };
/* Schéma partagé de POST /api/devis. Deux branches, distinguées par `service` :
   - emailing (CampaignFlow) : STRICTEMENT inchangée (entreprise, email et message obligatoires, plan et
     volume, prix calculé côté serveur). Un payload sans `service` reste traité comme emailing.
   - projet (formulaire court) : nom requis ; activité, entreprise et message facultatifs ; email OU
     téléphone ; téléphone normalisé par lib/phone.ts ; site actuel complété par https://. Les anciens
     payloads du formulaire projet (ville, budget, calendrier) restent acceptés. Une valeur null est
     refusée (un input retiré du formulaire ne doit jamais envoyer null). */
const shared={
 requestedServices:z.array(z.enum(["creation","refonte","developpement","automatisation","cybersecurite","seo","emailing","conseil"])).max(8).optional().default([]),
 name:z.string().trim().min(2).max(100),company:z.string().trim().min(2).max(150),email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),phone:z.string().trim().max(30).optional().default(""),message:z.string().trim().min(15).max(3000),website:z.string().max(0).optional().default(""),consent:z.literal(true),
 websiteUrl:z.union([z.literal(""),z.string().url().max(500).refine(v=>/^https?:\/\//i.test(v))]).optional().default(""),city:z.string().trim().max(100).optional().default(""),budget:z.enum(["a_definir","moins_1000","de_1000_3000","de_3000_10000","plus_10000"]).optional().default("a_definir"),timeline:z.enum(["flexible","un_mois","trois_mois","plus_tard"]).optional().default("flexible"),campaign:z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/).optional().default("site")
};
const email=z.object({...shared,service:z.literal("emailing"),audience:z.enum(["b2b","b2c"]),source:z.enum(["client","included"]),volume:z.union([z.literal(5000),z.literal(10000),z.literal(25000),z.literal(50000)]),plan:z.enum(["essentiel","acceleration","performance"])});

const projectWebsite=z.preprocess(v=>typeof v==="string"?completeWebsiteUrl(v):v,z.string().refine(v=>v===""||isWebsiteUrl(v))).optional().default("");
const projectEmail=z.preprocess(v=>typeof v==="string"?v.trim():v,z.union([z.literal(""),z.string().email().max(254)])).optional().default("").transform(v=>v.toLowerCase());
const projectPhone=z.string().trim().max(30).optional().default("").transform((v,ctx)=>{if(!v)return "";const n=normalizePhone(v);if(!n){ctx.addIssue({code:z.ZodIssueCode.custom,message:"phone"});return z.NEVER;}return n;});
const project=z.object({...shared,
 service:z.enum(["creation","refonte","developpement","automatisation","cybersecurite","seo","conseil"]),
 company:z.string().trim().max(150).refine(v=>v===""||v.length>=2).optional().default(""),
 activity:z.string().trim().max(120).optional().default(""),
 email:projectEmail,phone:projectPhone,
 message:z.string().trim().max(3000).optional().default(""),
 websiteUrl:projectWebsite,
 audience:z.literal("b2b").optional().default("b2b"),source:z.literal("client").optional().default("client"),volume:z.literal(0).optional().default(0),plan:z.literal("projet").optional().default("projet")});

export const quoteSchema=z.preprocess(value=>value&&typeof value==="object"&&!Array.isArray(value)&&!("service" in value)?{...value,service:"emailing"}:value,
 z.discriminatedUnion("service",[email,project]).superRefine((q,ctx)=>{if(q.service!=="emailing"&&!q.email&&!q.phone)ctx.addIssue({code:z.ZodIssueCode.custom,path:["email"],message:CONTACT_REQUIRED});}));
export type Quote=z.infer<typeof quoteSchema>;

/* Construit {champ: message} depuis une erreur zod. Le champ piège (website) n'est jamais signalé : l'API
   répond alors un 400 générique. */
export function fieldErrors(error:z.ZodError):Record<string,string>{
 const out:Record<string,string>={};
 for(const issue of error.issues){const key=String(issue.path[0]??"");if(!key||key in out)continue;if(key==="email"&&issue.message===CONTACT_REQUIRED){out.email=CONTACT_REQUIRED;continue;}out[key]=fieldMessages[key]||"Vérifiez ce champ.";}
 return out;
}
