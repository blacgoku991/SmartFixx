import type { CSSProperties, ReactNode } from "react";
/* Cadre de maquette en DOM (serveur) : jamais candidat au LCP, aspect-ratio réservé, contain: layout paint.
   L'étiquette « Démonstration » est toujours visible ; le contenu de la maquette est aria-hidden et
   décrit par « description » pour les lecteurs d'écran. Aucun texte de moins de 12 px dedans. */
export function DemoFrame({ kind = "browser", url = "votre-entreprise.fr", label = "Démonstration", description, ratio, className, children }: { kind?: "browser" | "phone"; url?: string; label?: string; description?: string; ratio?: string; className?: string; children: ReactNode }) {
  return (
    <figure className={["sx-demo", `sx-demo--${kind}`, className].filter(Boolean).join(" ")}>
      <div className="sx-demo-chrome" aria-hidden="true"><span className="sx-demo-dots"><i /><i /><i /></span><span className="sx-demo-url">{url}</span></div>
      <div className="sx-demo-screen" aria-hidden="true" style={ratio ? ({ "--sx-demo-ratio": ratio } as CSSProperties) : undefined}>{children}</div>
      <figcaption><span className="sx-demo-label">{label}</span>{description ? <span className="sr-only">{description}</span> : null}</figcaption>
    </figure>
  );
}
