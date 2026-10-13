import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getQuoteDb } from "./quote-db";
import { ownerMatches } from "./admin-policy";
export async function getAdmin(){
  const user=await getChatGPTUser();
  const owner=(env as unknown as {ADMIN_OWNER_EMAIL?:string}).ADMIN_OWNER_EMAIL;
  if(!ownerMatches(user,owner)||!user)return null;
  const ownerEmail=String(owner).trim().toLowerCase();
  const db=getQuoteDb();
  // Enrollment is restricted to the explicitly configured owner. Never the first visitor.
  await db.prepare("INSERT INTO admin_identities (owner_email,user_id,created_at) VALUES (?,?,?) ON CONFLICT(owner_email) DO NOTHING").bind(ownerEmail,user.id,Date.now()).run();
  const identity=await db.prepare("SELECT user_id FROM admin_identities WHERE owner_email = ?").bind(ownerEmail).first<{user_id:string}>();
  return identity?.user_id===user.id?user:null;
}
