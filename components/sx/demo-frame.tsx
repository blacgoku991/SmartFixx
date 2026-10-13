import type { CSSProperties, ReactNode } from "react";
/* Cadre de maquette en DOM (serveur) : jamais candidat au LCP, aspect-ratio réservé, contain: layout paint.
   L'étiquette « Démonstration » est toujours visible ; le contenu de la maquette est aria-hidden et
   décrit par « description » pour les lecteurs d'écran. Aucun texte de moins de 12 px dedans. */
export function DemoFrame({ kind = "browser", url = "votre-entreprise.fr", label = "Démonstration", description, ratio, className, children }: { kind?: "browser" | "phone"; url?: string; label?: string; description?: string; ratio?: string; className?: string; children: ReactNode }) {
  // L'étiquette est dans la barre du cadre (élément flex, jamais en surimpression sur l'URL) ; sur un
  // téléphone, la barre devient une pastille en haut à droite de l'écran.
  return (
    <figure className={["sx-demo", `sx-demo--${kind}`, className].filter(Boolean).join(" ")}>
      <figcaption className="sx-demo-chrome">
        <span className="sx-demo-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="sx-demo-url" aria-hidden="true">{url}</span>
        <span className="sx-demo-label">{label}</span>
        {description ? <span className="sr-only">{description}</span> : null}
      </figcaption>
      <div className="sx-demo-screen" aria-hidden="true" style={ratio ? ({ "--sx-demo-ratio": ratio } as CSSProperties) : undefined}>{children}</div>
    </figure>
  );
}
