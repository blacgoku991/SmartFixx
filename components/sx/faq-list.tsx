import type { ReactNode } from "react";
import { Plus } from "lucide-react";
/* Questions en <details>/<summary> natifs : sans JS, sans JSON-LD FAQPage (aucun résultat enrichi pour ce
   type de site). */
export function FaqList({ items, className }: { items: { q: string; a: ReactNode }[]; className?: string }) {
  return (
    <div className={["sx-faq", className].filter(Boolean).join(" ")}>
      {items.map(({ q, a }) => (
        <details className="sx-faq-item" key={q}>
          <summary><span>{q}</span><span className="sx-faq-icon" aria-hidden="true"><Plus /></span></summary>
          <div className="sx-faq-answer">{typeof a === "string" ? <p>{a}</p> : a}</div>
        </details>
      ))}
    </div>
  );
}
