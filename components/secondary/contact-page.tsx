import { Mail } from "lucide-react";
import CampaignLink from "@/components/campaign-link";
import { Breadcrumbs } from "@/components/sx/breadcrumbs";
import { PhoneLink } from "@/components/sx/actions";
import { Glow, Skyline } from "@/components/sx/ambient";
import { ShortQuoteForm, type ShortQuoteFormProps } from "@/components/short-quote-form";
import { CampaignFlow } from "@/components/campaign-flow";
import type { CampaignConfig } from "@/lib/campaign-config";
import { SITE_IDENTITY, mailHref } from "@/lib/site-identity";
import { Floors } from "./shared";
/* /contact (lot 8) — composition de hero sans PageHero (deux colonnes) qui reprend le contrat du socle :
   section .sx-hero[data-sx-hero], un seul H1 (.sx-h1 en deux parties), .sx-hero-actions (téléphone et
   email, au-dessus du consentement sur mobile), décor aria-hidden dans [data-sx-ambient].
   Ordre du DOM = ordre du clavier : texte → formulaire (#demande) → « Ce qui se passe ensuite ». À partir
   de 1024 px, la grille place la suite sous le texte, à gauche, et le formulaire à droite.
   Moment signature : « le trajet d'une demande ». Trois étages-fenêtres ; la première s'allume en ambre
   dès que la demande est enregistrée (data-sx-signal-on posé sur <html> par le formulaire après un 201),
   comme la fenêtre signal de la ville en bas du hero. Aucun délai de rappel promis. */
type Props =
  | { mode: "project"; form: ShortQuoteFormProps }
  | { mode: "emailing"; config: CampaignConfig };

const NEXT = [
  { title: "Votre demande est enregistrée", text: "Elle reçoit une référence et arrive dans mon tableau de suivi. Le message de confirmation s’affiche seulement quand c’est fait." },
  { title: "Je la lis et je vous recontacte", text: "Par téléphone ou par email, selon ce que vous m’avez laissé. Pas de standard, pas de relance automatique : c’est moi qui vous réponds." },
  { title: "On définit ensemble le périmètre", text: "Un échange pour préciser vos besoins, puis un devis détaillé. Rien n’est engagé avant votre accord." },
];

export function ContactPage(props: Props) {
  const emailing = props.mode === "emailing";
  return (
    <section className="sx-hero sc-ct" data-sx-hero="" aria-labelledby="hero-titre">
      <div className="sx-hero-backdrop" aria-hidden="true" data-sx-ambient="">
        <Glow tone="blue" size={720} top="-280px" left="-260px" duration={28} />
        <Skyline seed={8} signal depth={false} />
      </div>
      <div className="sx-container sc-ct-grid">
        <div className="sx-hero-copy sc-ct-copy">
          <Breadcrumbs items={[{ name: "Demande de devis", path: "/contact" }]} />
          <h1 id="hero-titre" className="sx-h1">
            <span className="sx-h1-main">Demande de devis&#8239;:</span>{" "}
            <span className="sx-h1-tagline">{emailing ? "prospection par email" : "création ou refonte de site"}</span>
          </h1>
          <p className="sx-lead">
            {emailing
              ? "Votre offre, votre cible, votre fichier : je vous réponds moi-même."
              : "Décrivez votre projet en quelques lignes, je vous réponds moi-même."}
          </p>
          <div className="sx-hero-actions">
            <PhoneLink compact="sm" />
            <a className="sx-btn sx-btn--ghost" href={mailHref}><span>Écrire un email</span><Mail className="sx-btn-icon" aria-hidden="true" /></a>
          </div>
        </div>
        <div className="sc-ct-form" id="demande">
          {props.mode === "emailing" ? <CampaignFlow kind="contact" initial={props.config} key={JSON.stringify(props.config)} /> : <ShortQuoteForm {...props.form} variant="page" headingLevel={2} />}
        </div>
        <div className="sc-ct-next">
          <h2 className="sc-ct-next-title">Ce qui se passe ensuite</h2>
          <Floors items={NEXT} className="sc-floors--trip" />
          <p className="sc-ct-direct">
            Vous préférez parler directement&#8239;? Appelez-moi au <a className="sc-textlink sx-tabular sx-nowrap" href={`tel:${SITE_IDENTITY.PHONE_E164}`}>{SITE_IDENTITY.PHONE_DISPLAY}</a> ou écrivez à <a className="sc-textlink" href={mailHref}>{SITE_IDENTITY.EMAIL}</a>.
            {" "}<CampaignLink className="sc-textlink" href="/confidentialite">Comment j’utilise vos données</CampaignLink>.
          </p>
          <p className="sc-ct-direct">Pas encore de projet précis&#8239;? <CampaignLink className="sc-textlink" href="/diagnostic">Faire le point sur votre site et vos outils</CampaignLink>.</p>
        </div>
      </div>
    </section>
  );
}
