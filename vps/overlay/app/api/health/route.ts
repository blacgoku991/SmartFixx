import {getQuoteDb} from '@/lib/quote-db';
export const dynamic='force-dynamic';
export async function GET(){try{await getQuoteDb().prepare('SELECT 1 AS ok').first();return Response.json({ok:true,application:'smartfixx-vps'},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({ok:false},{status:503,headers:{'Cache-Control':'no-store'}})}}
