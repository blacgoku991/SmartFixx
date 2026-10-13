import { Check } from "lucide-react";
/* Liste de preuves. Chaque élément est UN seul span de texte (corrige les espaces doublées des anciennes
   listes en inline-flex mêlant texte et <strong>). */
export function ProofList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={["sx-proofs", className].filter(Boolean).join(" ")}>
      {items.map((item) => <li key={item}><Check aria-hidden="true" /><span>{item}</span></li>)}
    </ul>
  );
}
