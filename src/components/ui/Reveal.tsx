import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Révélations au défilement — en CSS natif, sans framer-motion.
 *
 * Ces composants s'appuyaient sur `whileInView`, ce qui faisait entrer
 * framer-motion dans le chemin critique de presque toutes les sections : 133 Ko
 * et près de 900 ms d'exécution relevés au profilage, pour des fondus. Les
 * classes employées ici sont définies dans `src/index.css` et pilotées par
 * `animation-timeline: view()` : le navigateur les anime sur le compositeur,
 * sans observateur, sans calcul à chaque image, sans une ligne de JavaScript.
 *
 * Le contrat qui rend le remplacement sûr : l'état par défaut est l'état FINAL.
 * Sans prise en charge de `animation-timeline`, sans JavaScript, ou avec
 * `prefers-reduced-motion`, le contenu est simplement visible. Un robot, un
 * lecteur d'écran et un navigateur ancien reçoivent une page complète — c'est
 * aussi ce qui protège le LCP, qu'un `opacity: 0` de départ repoussait.
 *
 * L'API publique est inchangée : les sections n'ont pas eu à être modifiées.
 */

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Retard en secondes, appliqué comme décalage de l'animation. */
  delay?: number;
  once?: boolean;
};

/** Fait monter un bloc en place lorsqu'il entre dans le champ. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <div
      className={cn("sf-reveal", className)}
      style={delay ? ({ animationDelay: `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

/** Enveloppe une liste pour que ses enfants entrent les uns après les autres. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("sf-stagger", className)}>{children}</div>;
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

/**
 * Découpe une ligne en mots qui montent de derrière un masque.
 *
 * À n'employer que hors du premier écran : l'élément LCP ne doit jamais partir
 * d'une opacité nulle.
 */
export function MaskedWords({
  text,
  className,
  delay = 0,
  wordClassName,
}: {
  text: string;
  className?: string;
  delay?: number;
  wordClassName?: string;
}) {
  const words = text.split(" ");

  return (
    <span className={cn("inline", className)}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <span
            className={cn("sf-reveal-soft inline-block", wordClassName)}
            style={{ animationDelay: `${delay + index * 0.055}s` } as CSSProperties}
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </span>
  );
}
