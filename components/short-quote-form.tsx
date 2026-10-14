import "./forms/forms.css";
import { ShortQuoteFormClient, type ShortQuoteFormProps } from "./forms/short-quote-form-client";
/* CONTRAT figé au lot 0, implémenté au lot 5 (props inchangées).
   - defaultService : besoin présélectionné ; « autre » ouvre la liste otherService.
   - otherService : précision quand defaultService = « autre ».
   - campaign : code utm_campaign déjà nettoyé ; absent, il est lu au montage dans window.location.search
     (les pages statiques restent statiques).
   - variant : « inline » (dans une section de page) ou « page » (colonne de /contact, /diagnostic).
   - headingLevel : niveau du titre du formulaire et du message de succès.
   Une seule instance par page (ids uniques project-*).
   Module sans « use client » : il importe la feuille du lot (règle d'import des CSS de lot) et rend le
   composant client ; il reste utilisable depuis un composant serveur comme depuis un composant client. */
export type { ShortQuoteFormProps };
export function ShortQuoteForm(props: ShortQuoteFormProps) {
  return <ShortQuoteFormClient {...props} />;
}
