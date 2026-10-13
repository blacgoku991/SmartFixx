"use client";
import { ProjectForm } from "@/components/project-form";
/* CONTRAT figé au lot 0 (implémentation réelle : lot 5, sans changer ces props).
   BOUCHON temporaire : rend l'ancien ProjectForm, réellement connecté à /api/devis.
   - defaultService : besoin présélectionné ; « autre » ouvre la liste otherService.
   - otherService : précision quand defaultService = « autre ».
   - campaign : code utm_campaign déjà nettoyé ; absent, la version finale le lit au montage dans
     window.location.search (les pages statiques restent statiques).
   - variant : « inline » (dans une section de page) ou « page » (colonne de /contact, /diagnostic).
   - headingLevel : niveau du titre du formulaire et du message de succès.
   Une seule instance par page (ids uniques project-*). */
export type ShortQuoteFormProps = {
  defaultService?: "creation" | "refonte" | "autre";
  otherService?: "developpement" | "automatisation" | "cybersecurite" | "seo" | "conseil";
  campaign?: string;
  variant?: "inline" | "page";
  headingLevel?: 2 | 3;
};
export function ShortQuoteForm({ defaultService, otherService, campaign }: ShortQuoteFormProps) {
  const initial = defaultService === "creation" || defaultService === "refonte" ? defaultService : otherService ?? "conseil";
  return <ProjectForm initialService={initial} campaign={campaign ?? "site"} />;
}
