import {emailDestination} from '@/lib/email-destination';
import {resolveEmailToken,emailPrivateHeaders} from '@/lib/email-campaign';
import {getQuoteDb} from '@/lib/quote-db';
export async function GET(request:Request){try{const r=await resolveEmailToken(new URL(request.url).searchParams.get('token')||'','click');if(!r)return new Response(null,{status:302,headers:{...emailPrivateHeaders,Location:emailDestination()}});if(request.method!=='HEAD'&&r.sent_at&&r.tracking_consent&&!r.tracking_revoked_at&&!r.first_click_at&&r.created_at>Date.now()-90*86400000)await getQuoteDb().prepare('UPDATE email_recipients SET first_click_at=? WHERE id=? AND first_click_at IS NULL AND tracking_consent=1 AND tracking_revoked_at IS NULL AND sent_at IS NOT NULL AND NOT EXISTS (SELECT 1 FROM email_suppressions WHERE email=email_recipients.email)').bind(Date.now(),r.id).run();return new Response(null,{status:302,headers:{...emailPrivateHeaders,Location:emailDestination(r.campaign,new URL(request.url).searchParams.get('service'))}});}catch{return new Response(null,{status:302,headers:{...emailPrivateHeaders,Location:emailDestination()}})}}

export const HEAD=GET;
