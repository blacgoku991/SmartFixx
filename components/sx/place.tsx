import { nb } from "@/lib/site-identity";
/* Nom de lieu qui ne se coupe jamais (charte typographique) : « Asnières‑sur‑Seine », « Île‑de‑France ».
   Traits d'union U+2011 et espaces insécables (nb), plus white-space: nowrap. Serveur ou client. */
export function Place({ children }: { children: string }) {
  return <span className="sx-nowrap">{nb(children)}</span>;
}
