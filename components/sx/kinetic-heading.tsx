import { Fragment } from "react";
/* Titre cinétique (charte R7) : réservé aux H2 de chapitre de l'accueil, de la création et de la refonte,
   un seul par écran. Les mots sont des span inline-block séparés par de vraies espaces : le texte reste
   intact et se lit d'un seul tenant. Visible par défaut ; l'entrée mot à mot (décalage de 8 % par mot)
   n'existe que sous html[data-motion=on], au défilement (CSS, animation-timeline: view()). */
export function KineticHeading({ as: Tag = "h2", children, id, className }: { as?: "h2" | "h3"; children: string; id?: string; className?: string }) {
  const words = children.split(/\s+/).filter(Boolean);
  return (
    <Tag id={id} className={["sx-kinetic", className].filter(Boolean).join(" ")}>
      {words.map((w, i) => <Fragment key={i}><span className="sx-kw" style={{ ["--i" as string]: i }}>{w}</span>{i < words.length - 1 ? " " : null}</Fragment>)}
    </Tag>
  );
}
