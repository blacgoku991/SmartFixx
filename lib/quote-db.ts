import { env } from "cloudflare:workers";
export function getQuoteDb() {
  if (!env.DB) throw new Error("Quote storage unavailable");
  return env.DB;
}
