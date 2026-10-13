import type { ReactNode } from "react";
/* Primitives de mise en page (serveur). Gelées après le lot 0 : les lots les utilisent sans les modifier. */
type SectionProps = {
  tone?: "bg" | "surface" | "night";
  id?: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
  /* Décor d'ambiance (Glow, Skyline…) rendu derrière le contenu, aria-hidden. */
  ambient?: ReactNode;
};
export function Section({ tone = "bg", id, labelledBy, className, children, ambient }: SectionProps) {
  const cls = ["sx-section", tone === "surface" ? "sx-section--surface" : tone === "night" ? "sx-section--night" : "", className].filter(Boolean).join(" ");
  return (
    <section id={id} aria-labelledby={labelledBy} className={cls}>
      {ambient ? <div className="sx-ambient" aria-hidden="true" data-sx-ambient="">{ambient}</div> : null}
      {children}
    </section>
  );
}
export function Container({ size = "default", className, children, as: Tag = "div" }: { size?: "default" | "narrow" | "wide"; className?: string; children: ReactNode; as?: "div" | "header" | "footer" | "nav" }) {
  const cls = ["sx-container", size === "narrow" ? "sx-container--narrow" : size === "wide" ? "sx-container--wide" : "", className].filter(Boolean).join(" ");
  return <Tag className={cls}>{children}</Tag>;
}
/* Surtitre ; dot = point ambre (signal de conversion). */
export function Eyebrow({ dot = false, children, className }: { dot?: boolean; children: ReactNode; className?: string }) {
  return <p className={["sx-eyebrow", className].filter(Boolean).join(" ")}>{dot ? <span className="sx-dot" aria-hidden="true" /> : null}{children}</p>;
}
/* En-tête de section : surtitre facultatif, H2 et texte d'introduction. */
export function SectionHead({ eyebrow, title, text, id, level = 2 }: { eyebrow?: ReactNode; title: ReactNode; text?: ReactNode; id?: string; level?: 2 | 3 }) {
  const H = level === 3 ? "h3" : "h2";
  return (
    <div className="sx-section-head">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <H id={id}>{title}</H>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
