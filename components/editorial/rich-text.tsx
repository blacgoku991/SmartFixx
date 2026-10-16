import CampaignLink from "@/components/campaign-link";
import { fr } from "./reading";
/* Texte d'un guide avec liens contextuels (serveur). Seule syntaxe reconnue : [ancre](/chemin-interne).
   Les liens internes passent par CampaignLink (utm_campaign propagé) et restent soulignés (ed-prose a).
   Tout autre texte est rendu tel quel : aucune interprétation HTML. */
const LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;
export function RichText({ text: raw }: { text: string }) {
  const text = fr(raw);
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    out.push(<CampaignLink key={i} href={m[2]}>{m[1]}</CampaignLink>);
    last = i + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
