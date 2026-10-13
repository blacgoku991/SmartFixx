import {resolveEmailToken,suppressEmail,emailPrivateHeaders} from '@/lib/email-campaign';
// RFC 8058 uses a signed capability, without browser cookies or an Origin header.
export async function POST(request:Request){
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/x-www-form-urlencoded'))return new Response('Format invalide',{status:415,headers:emailPrivateHeaders});
 try{const reader=request.body?.getReader();if(!reader)return new Response(null,{status:400,headers:emailPrivateHeaders});let length=0,body='';const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>1024){await reader.cancel();return new Response(null,{status:413,headers:emailPrivateHeaders})}body+=decoder.decode(value,{stream:true})}body+=decoder.decode();if(new URLSearchParams(body).get('List-Unsubscribe')!=='One-Click')return new Response(null,{status:400,headers:emailPrivateHeaders});
 const r=await resolveEmailToken(new URL(request.url).searchParams.get('token')||'','stop',true);if(!r)return new Response('Lien invalide',{status:404,headers:emailPrivateHeaders});await suppressEmail(r.email,'one_click');return new Response('Désinscription enregistrée',{headers:emailPrivateHeaders});
 }catch{return new Response('Réessayez ultérieurement',{status:503,headers:emailPrivateHeaders})}
}
