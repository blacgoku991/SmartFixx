/* Liste de preuves. Chaque élément est UN seul span de texte (corrige les espaces doublées des anciennes
   listes en inline-flex mêlant texte et <strong>). Puce : une « fenêtre allumée » ambre (décor, aria-hidden),
   signature du motif nocturne, à la place des coches vertes de catalogue. */
export function ProofList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={["sx-proofs", className].filter(Boolean).join(" ")}>
      {items.map((item) => <li key={item}><span className="sx-proof-mark" aria-hidden="true" /><span>{item}</span></li>)}
    </ul>
  );
}
