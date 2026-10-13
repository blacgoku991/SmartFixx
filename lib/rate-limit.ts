import { env } from "cloudflare:workers";
import { getQuoteDb } from "./quote-db";
export async function consumeLimit(subject:string,maximum:number,windowMs:number){
 const secret=(env as unknown as {RATE_LIMIT_SECRET?:string}).RATE_LIMIT_SECRET;
 if(!secret)throw new Error("Rate limit unavailable");
 const now=Date.now();const bucket=Math.floor(now/windowMs);
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const digest=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(`${subject}|${windowMs}|${bucket}`));
 const id=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
 const row=await getQuoteDb().prepare("INSERT INTO request_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count").bind(id,(bucket+1)*windowMs,maximum).first<{count:number}>();
 return !!row;
}
