import {resolveEmailToken,emailPrivateHeaders} from '@/lib/email-campaign';
import {getQuoteDb} from '@/lib/quote-db';
const pixel=new Uint8Array([71,73,70,56,57,97,1,0,1,0,128,0,0,0,0,0,255,255,255,33,249,4,1,0,0,0,0,44,0,0,0,0,1,0,1,0,0,2,2,68,1,0,59]);
export async function GET(request:Request){try{const r=await resolveEmailToken(new URL(request.url).searchParams.get('token')||'','open');if(r&&r.sent_at&&r.tracking_consent&&!r.tracking_revoked_at&&!r.first_open_at&&r.created_at>Date.now()-90*86400000)await getQuoteDb().prepare('UPDATE email_recipients SET first_open_at=? WHERE id=? AND first_open_at IS NULL AND tracking_consent=1 AND tracking_revoked_at IS NULL AND sent_at IS NOT NULL AND NOT EXISTS (SELECT 1 FROM email_suppressions WHERE email=email_recipients.email)').bind(Date.now(),r.id).run();}catch{/* A measuring image must never reveal recipient state. */}return new Response(pixel,{status:200,headers:{...emailPrivateHeaders,'Content-Type':'image/gif','Content-Length':String(pixel.length)}})}

export function HEAD(){return new Response(null,{headers:{...emailPrivateHeaders,"Content-Type":"image/gif","Content-Length":String(pixel.length)}})}
