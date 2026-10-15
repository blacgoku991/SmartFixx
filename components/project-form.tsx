import { ShortQuoteForm } from "./short-quote-form";
import type { ServiceId } from "@/lib/services";
/* Ré-export compatible de l'ancien ProjectForm (/contact, /diagnostic) vers le formulaire court.
   initialService : création et refonte deviennent le type de projet ; les autres prestations ouvrent
   « Autre besoin » sur la bonne précision ; emailing et conseil retombent sur « Faire le point ». */
const others = ["developpement", "automatisation", "cybersecurite", "seo", "conseil"] as const;
type Other = typeof others[number];
export function ProjectForm({ initialService = "conseil", campaign = "site" }: { initialService?: ServiceId; campaign?: string }) {
  if (initialService === "creation" || initialService === "refonte") return <ShortQuoteForm defaultService={initialService} campaign={campaign} variant="page" />;
  const other: Other = (others as readonly string[]).includes(initialService) ? initialService as Other : "conseil";
  return <ShortQuoteForm defaultService="autre" otherService={other} campaign={campaign} variant="page" />;
}
