import { Reveal } from "../ui/Reveal";
import { site } from "@/data/site";

/**
 * Pages légales. Au-delà de l'obligation (LCEN pour les mentions légales, RGPD
 * pour la confidentialité), elles pèsent en référencement : Google évalue la
 * fiabilité d'un site marchand et l'absence d'identification est un signal
 * négatif franc.
 *
 * Toutes les données d'identité viennent de `site.legal` : rien n'est écrit en
 * dur ici. La section « Médiation » ne s'affiche que si un médiateur est
 * renseigné — publier « à compléter » sur une page légale est pire que de taire
 * une mention qui ne s'applique pas encore.
 */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section className="border-t border-white/[0.07] pt-8">
        <h2 className="headline text-[clamp(1.25rem,2.6vw,1.6rem)] leading-tight">{title}</h2>
        <div className="mt-4 space-y-3.5 text-[15px] leading-[1.75] text-fog-dim">{children}</div>
      </section>
    </Reveal>
  );
}

export function LegalNotice() {
  return (
    <article className="pt-[68px]">
      <div className="container-x py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h1 className="headline text-[clamp(2rem,5vw,3rem)] leading-[1.05]">
              Mentions légales
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-fog-dim">
              Informations publiées en application de la loi n° 2004-575 du 21 juin 2004 pour la
              confiance dans l&apos;économie numérique.
            </p>
          </Reveal>

          <div className="mt-12 space-y-10">
            <Section title="Éditeur du site">
              <p>
                <strong className="font-medium text-fog">{site.legal.company}</strong>
                <br />
                {site.legal.legalForm} au capital de {site.legal.capital}
                <br />
                Siège social : {site.legal.address}
                <br />
                SIREN : {site.legal.siren} — SIRET : {site.legal.siret}
                <br />
                RCS {site.legal.rcs} — TVA intracommunautaire : {site.legal.vat}
                <br />
                E-mail :{" "}
                <a href={`mailto:${site.email}`} className="text-mint hover:underline">
                  {site.email}
                </a>
                {site.phone && (
                  <>
                    <br />
                    Téléphone : {site.phone}
                  </>
                )}
              </p>
              <p>Directeur de la publication : {site.legal.publisher}.</p>
            </Section>

            <Section title="Hébergement">
              <p>
                Le site est hébergé par {site.host.name}, {site.host.address} —{" "}
                <a
                  href={site.host.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-mint hover:underline"
                >
                  {site.host.url.replace(/^https?:\/\//, "")}
                </a>
                .
              </p>
            </Section>

            <Section title="Propriété intellectuelle">
              <p>
                L&apos;ensemble du contenu de ce site — textes, identité visuelle, code, animations
                — est la propriété de {site.legal.company}, sauf mention contraire. Toute
                reproduction ou représentation, totale ou partielle, sans autorisation écrite
                préalable est interdite.
              </p>
              <p>
                Les projets livrés aux clients font l&apos;objet d&apos;une cession de droits : le
                code, le nom de domaine et les comptes associés appartiennent au client.
              </p>
            </Section>

            <Section title="Responsabilité">
              <p>
                Les informations publiées sur ce site sont fournies à titre indicatif. Les tarifs
                affichés sont des points de départ ; seul un devis signé engage {site.legal.company}
                . Malgré le soin apporté à leur mise à jour, ces informations peuvent comporter des
                inexactitudes.
              </p>
            </Section>

            {site.legal.mediator && (
              <Section title="Médiation de la consommation">
                <p>
                  Conformément à l&apos;article L. 612-1 du Code de la consommation, tout
                  consommateur peut recourir gratuitement à un médiateur de la consommation en vue
                  de la résolution amiable d&apos;un litige. Coordonnées du médiateur :{" "}
                  {site.legal.mediator}.
                </p>
              </Section>
            )}

            <Section title="Droit applicable">
              <p>
                Le présent site et les prestations qui y sont décrites sont soumis au droit
                français.
              </p>
            </Section>
          </div>

          <Reveal>
            <p className="mt-14 text-[14px]">
              <a href="/" className="text-mint hover:underline">
                Retour à l&apos;accueil
              </a>
            </p>
          </Reveal>
        </div>
      </div>
    </article>
  );
}

export function PrivacyPolicy() {
  return (
    <article className="pt-[68px]">
      <div className="container-x py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h1 className="headline text-[clamp(2rem,5vw,3rem)] leading-[1.05]">
              Politique de confidentialité
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-fog-dim">
              Ce site collecte le strict minimum : les informations que vous saisissez vous-même
              dans le formulaire de contact. Il n&apos;y a ni cookie de suivi, ni outil de mesure
              d&apos;audience tiers, ni police chargée depuis un serveur externe.
            </p>
          </Reveal>

          <div className="mt-12 space-y-10">
            <Section title="Responsable du traitement">
              <p>
                {site.legal.company}, {site.legal.address}, France — SIREN {site.legal.siren}.
                Contact :{" "}
                <a href={`mailto:${site.email}`} className="text-mint hover:underline">
                  {site.email}
                </a>
                .
              </p>
            </Section>

            <Section title="Données collectées et finalité">
              <p>
                Le formulaire de contact recueille votre nom, votre société le cas échéant, votre
                adresse e-mail, votre téléphone si vous le renseignez, le type de projet, le budget
                envisagé et votre message. Ces données servent uniquement à répondre à votre demande
                et à établir un devis.
              </p>
              <p>
                À ce stade, l&apos;envoi ouvre votre logiciel de messagerie avec un message
                pré-rempli : les informations transitent donc par votre propre fournisseur de
                messagerie, et ce site n&apos;enregistre rien.
              </p>
            </Section>

            <Section title="Base légale">
              <p>
                Votre consentement, recueilli par la case à cocher du formulaire (article 6.1.a du
                RGPD), et l&apos;intérêt légitime de répondre à une demande commerciale que vous
                avez initiée.
              </p>
            </Section>

            <Section title="Durée de conservation">
              <p>
                Les échanges liés à une demande sans suite sont conservés douze mois. Les données
                liées à une relation contractuelle sont conservées le temps de la prestation puis
                pendant la durée légale de conservation des pièces comptables.
              </p>
            </Section>

            <Section title="Destinataires">
              <p>
                Vos données ne sont ni vendues, ni louées, ni transmises à des fins publicitaires.
                Le formulaire de contact n&apos;envoyant rien à nos serveurs — il ouvre votre
                logiciel de messagerie —, le contenu de votre message ne transite par aucun
                prestataire de notre côté : il suit le trajet de votre propre messagerie.
              </p>
              <p>
                L&apos;hébergement du site est assuré par {site.host.name} ({site.host.address}),
                société établie hors de l&apos;Union européenne. Ce prestataire traite les données
                techniques de connexion inhérentes à l&apos;affichage des pages (adresse IP,
                horodatage) ; le transfert est encadré par les clauses contractuelles types
                adoptées par la Commission européenne.
              </p>
            </Section>

            <Section title="Cookies et mesure d'audience">
              <p>
                Aucun cookie publicitaire ni traceur tiers n&apos;est déposé. Le site utilise
                uniquement le stockage local de votre navigateur pour se souvenir que
                l&apos;animation d&apos;introduction a déjà été jouée pendant votre visite. Cette
                information ne quitte pas votre appareil et disparaît à la fermeture de
                l&apos;onglet.
              </p>
            </Section>

            <Section title="Vos droits">
              <p>
                Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de
                limitation, d&apos;opposition et de portabilité. Écrivez à{" "}
                <a href={`mailto:${site.email}`} className="text-mint hover:underline">
                  {site.email}
                </a>{" "}
                : une réponse vous parvient sous un mois au plus tard.
              </p>
              <p>
                En cas de désaccord persistant, vous pouvez saisir la CNIL —{" "}
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-mint hover:underline"
                >
                  cnil.fr
                </a>
                .
              </p>
            </Section>
          </div>

          <Reveal>
            <p className="mt-14 text-[14px]">
              <a href="/" className="text-mint hover:underline">
                Retour à l&apos;accueil
              </a>
            </p>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
