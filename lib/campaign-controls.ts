import {getQuoteDb} from './quote-db';
/** Durable milestones. Unique indexes and guarded inserts prevent duplicate copies. */
export async function enqueueControls(){
 const db=getQuoteDb(),now=Date.now();
 const {results}=await db.prepare(`SELECT c.id,c.code,c.control_email,c.control_every,c.control_cursor,c.expires_at,c.control_accepted AS accepted FROM campaign_runs c WHERE c.status IN ('running','completed') AND c.expires_at>? AND c.control_every>0 AND c.control_cursor+c.control_every<=c.control_accepted AND c.control_email<>'' AND NOT EXISTS(SELECT 1 FROM email_suppressions s WHERE s.email=c.control_email) ORDER BY c.created_at LIMIT 200`).bind(now).all<{id:string;code:string;control_email:string;control_every:number;control_cursor:number;expires_at:number;accepted:number}>();
 let made=0;
 for(const c of results){for(let milestone=c.control_cursor+c.control_every;milestone<=c.accepted&&made<25;milestone+=c.control_every){
  const id=crypto.randomUUID();
  await db.batch([
   db.prepare(`INSERT OR IGNORE INTO campaign_targets(id,run_id,email,is_test,control_milestone,created_at,updated_at) SELECT ?,?,?,1,?,?,? WHERE EXISTS(SELECT 1 FROM campaign_runs WHERE id=? AND status IN ('running','completed') AND control_every=? AND control_email=?) AND NOT EXISTS(SELECT 1 FROM email_suppressions WHERE email=?)`).bind(id,c.id,c.control_email,milestone,now,now,c.id,c.control_every,c.control_email,c.control_email),
   db.prepare(`INSERT INTO email_recipients(id,campaign,email,name,company,source,created_at,expires_at) SELECT ?,?,?,'Mohamed','Contrôle SmartFixx','Adresse de contrôle configurée par le propriétaire',?,? WHERE EXISTS(SELECT 1 FROM campaign_targets WHERE id=?)`).bind(id,'controle_'+c.code,c.control_email,now,c.expires_at,id),
   db.prepare(`UPDATE campaign_runs SET control_cursor=MAX(control_cursor,?) WHERE id=? AND EXISTS(SELECT 1 FROM campaign_targets WHERE run_id=? AND control_milestone=?)`).bind(milestone,c.id,c.id,milestone)
  ]);made++;
 }}
}
