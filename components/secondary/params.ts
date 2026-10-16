import type { ShortQuoteFormProps } from "@/components/short-quote-form";
import { cleanCampaign } from "@/lib/project-options";
/* Lecture des paramètres d'URL des pages de demande (/contact, /diagnostic) côté serveur.
   ?service vient des pages de prestation, des liens du panel (Acquisition) et des emails déjà envoyés ;
   ?utm_campaign est nettoyé par cleanCampaign (repli « site »). */
export type Params = Record<string, string | string[] | undefined>;
const OTHER = ["developpement", "automatisation", "cybersecurite", "seo", "conseil"] as const;
/* création ou refonte telles quelles ; une autre prestation connue en « autre » + précision ; une valeur
   inconnue (dont « emailing », qui n'a pas sa place dans le formulaire projet) en « autre » + conseil.
   Sans ?service : « création » sur /contact (son H1 annonce création ou refonte), « autre » + conseil sur
   /diagnostic (empty = "conseil"). */
export function formFromParams(p: Params, empty: "creation" | "conseil" = "creation"): ShortQuoteFormProps {
  const s = typeof p.service === "string" ? p.service : "";
  const campaign = cleanCampaign(p.utm_campaign);
  if (s === "creation" || s === "refonte") return { defaultService: s, campaign };
  if (!s && empty === "creation") return { defaultService: "creation", campaign };
  const other = (OTHER as readonly string[]).includes(s) ? (s as NonNullable<ShortQuoteFormProps["otherService"]>) : "conseil";
  return { defaultService: "autre", otherService: other, campaign };
}
/* Mode emailing de /contact (inchangé) : ?service=emailing, ou ?plan / ?volume sans service. */
export const isEmailingRequest = (p: Params) => p.service === "emailing" || (!p.service && (!!p.plan || !!p.volume));
