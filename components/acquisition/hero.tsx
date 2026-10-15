import { PageHero } from "@/components/sx/page-hero";
import { ButtonLink, PhoneLink } from "@/components/sx/actions";
import { Glow, Skyline } from "@/components/sx/ambient";
import { ShortQuoteForm } from "@/components/short-quote-form";
import type { AcquisitionContent } from "@/lib/content/acquisition";
/* Hero d'acquisition (serveur), page d'arrivée d'une annonce Search.
   - Fil d'Ariane visible (Accueil › Prestations › …) + BreadcrumbList : il tient lieu de surtitre (budget
     de lignes du hero mobile : fil OU surtitre).
   - H1 en deux parties séparées par une vraie espace (PageHero) ; mot-clé souligné ambre, statique.
   - CTA vers #demande et téléphone (PhoneLink compact="sm" : icône seule sous 480 px), jamais animés.
   - UNE seule instance de ShortQuoteForm, dans l'aside (ancre #demande ; le formulaire du lot 5 porte son
     propre cadre, son titre et sa mention de suivi : l'aside n'en ajoute pas) : ordre du DOM copie → formulaire → sections. À
     partir de 1024 px, la grille du socle place l'aside dans la colonne de droite ; en dessous, le
     formulaire suit immédiatement le texte du hero. Aucun « order » CSS ne contredit le DOM.
   - Décor : ville nocturne (graine propre à la page, distincte du hero d'accueil 0 et du bandeau 5), avec la
     fenêtre signal qui s'allume au survol du CTA, et une lueur bleue. Un seul plan (depth={false}) : ces pages
     sont longues (environ 1 000 éléments) et chaque recalcul complet du style au chargement (variable
     --sx-float-h posée sur <html>, insertion du consentement) coûte en proportion ; le plan lointain
     (44 éléments) est gardé pour le bandeau d'appel. */
export function AcquisitionHero({ content, seed }: { content: AcquisitionContent; seed: number }) {
  const h = content.hero;
  const title = <>{h.titleBefore}<span className="sx-keyword">{h.titleKeyword}</span>{h.titleAfter}</>;
  return (
    <PageHero
      className="aq-hero"
      breadcrumbs={[{ name: "Prestations", path: "/services" }, { name: content.crumb, path: content.path }]}
      title={title}
      tagline={h.tagline}
      lead={h.lead}
      actions={<><ButtonLink variant="cta" href="#demande" size="lg">{h.cta}</ButtonLink><PhoneLink compact="sm" /></>}
      proofs={h.proofs}
      backdrop={<><Glow tone="blue" size={720} top="-260px" right="-220px" duration={26} /><Skyline seed={seed} signal depth={false} /></>}
      aside={
        <div className="aq-form" id="demande">
          <ShortQuoteForm defaultService={content.id} variant="inline" headingLevel={2} />
        </div>
      }
    />
  );
}
