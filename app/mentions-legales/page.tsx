import Link from "next/link";
import { LegalLayout } from "@/components/legal-layout";
import { Chapter } from "@/components/editorial/reading";
import { pageMeta } from "@/lib/seo";
import { SITE_IDENTITY, mailHref, telHref } from "@/lib/site-identity";
/* Mentions légales (lot 9). Identité lue dans lib/site-identity.ts, jamais saisie ici. Un champ vide
   (directeur de la publication, hébergeur du serveur, RCS) affiche « Information en cours de mise à
   jour » : rien n'est inventé, et la page ne part pas en production tant que l'hébergeur du VPS manque.
   La phrase d'hébergement de la variante Sites est conservée MOT POUR MOT : vps/prepare.py la remplace
   par celle du serveur privé (ne pas déplacer ce fichier). Section « Prestations et tarifs » retirée
   (plus aucun prix affiché sur le site). */
export const metadata = pageMeta(
  "Mentions légales | SmartFixx",
  "Mentions légales du site smartfixx.fr : éditeur SmartFixx SASU, SIREN 943 047 290, siège social à Paris, hébergement du site, contenus et contact.",
  "/mentions-legales",
);
const PENDING = "Information en cours de mise à jour";
const or = (v: string | null | undefined) => (v && v.trim() ? v : PENDING);
const registered = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${SITE_IDENTITY.REGISTERED_ON}T12:00:00Z`));
const TOC = [
  { id: "editeur", label: "Éditeur du site" },
  { id: "publication", label: "Directeur de la publication" },
  { id: "hebergement", label: "Hébergement" },
  { id: "contenus", label: "Contenus et crédits" },
  { id: "donnees", label: "Données personnelles" },
];
export default function MentionsLegales() {
  const host = SITE_IDENTITY.HOST;
  return (
    <LegalLayout
      title="Mentions légales"
      path="/mentions-legales"
      lead="Qui édite ce site et comment me joindre."
      toc={TOC}
    >
      <Chapter id="editeur" n={1} title="Éditeur du site">
        <div className="ed-plate">
          <p className="ed-plate-head"><span className="ed-plate-dot" aria-hidden="true" />Fiche d’identité</p>
          <dl className="ed-plate-list">
            <div><dt>Dénomination</dt><dd>{SITE_IDENTITY.LEGAL_NAME}</dd></div>
            <div><dt>Forme</dt><dd>{SITE_IDENTITY.LEGAL_FORM} au capital de {SITE_IDENTITY.CAPITAL}</dd></div>
            <div><dt>SIREN</dt><dd className="sx-tabular">{SITE_IDENTITY.SIREN}</dd></div>
            <div><dt>SIRET (siège)</dt><dd className="sx-tabular">{SITE_IDENTITY.SIRET}</dd></div>
            <div><dt>RCS</dt><dd className="sx-tabular">{or(SITE_IDENTITY.RCS)}{SITE_IDENTITY.RCS ? <>, immatriculée le {registered}</> : null}</dd></div>
            <div><dt>TVA intracommunautaire</dt><dd className="sx-tabular">{SITE_IDENTITY.VAT}</dd></div>
            <div><dt>Siège social</dt><dd>{SITE_IDENTITY.SIEGE.label} (adresse de domiciliation)</dd></div>
            <div><dt>Téléphone</dt><dd><a href={telHref} className="sx-tabular sx-nowrap">{SITE_IDENTITY.PHONE_DISPLAY}</a></dd></div>
            <div><dt>Email</dt><dd><a href={mailHref}>{SITE_IDENTITY.EMAIL}</a></dd></div>
          </dl>
        </div>
        <p>Le site est édité par l’entreprise de Mohamed, SmartFixx, qui présente ses prestations de création et de refonte de sites internet, de développement, d’automatisation, de sécurité web, de référencement et de prospection emailing.</p>
        <p>Ces informations sont celles présentées sur la page <Link href="/mentions-legales">mentions légales</Link> du site principal de SmartFixx.</p>
      </Chapter>
      <Chapter id="publication" n={2} title="Directeur de la publication">
        <p>Directeur de la publication : <strong>{or(SITE_IDENTITY.PUBLICATION_DIRECTOR)}</strong>. Pour le joindre : <a href={mailHref}>{SITE_IDENTITY.EMAIL}</a>.</p>
      </Chapter>
      <Chapter id="hebergement" n={3} title="Hébergement">
        <p>Cette version du site est hébergée via la plateforme Sites de ChatGPT, sur l’infrastructure Cloudflare. L’accès à cette version est contrôlé par la plateforme.</p>
        <p>Hébergeur du serveur : {host ? <>{host.name}, {host.address}{host.phone ? <>, <span className="sx-tabular sx-nowrap">{host.phone}</span></> : null}</> : <em className="ed-pending">{PENDING}</em>}.</p>
      </Chapter>
      <Chapter id="contenus" n={4} title="Contenus et crédits">
        <p>Les textes, éléments graphiques et contenus originaux de ce site sont destinés à la présentation de l’offre SmartFixx. Pour une demande d’utilisation, une question ou le signalement d’une erreur, écrivez-moi à <a href={mailHref}>{SITE_IDENTITY.EMAIL}</a>.</p>
        <p>Les démonstrations visibles sur le site (tableau de suivi, demandes, références SF-…) sont étiquetées « Démonstration » et contiennent uniquement des données fictives.</p>
        <p>Police de titrage : Bricolage Grotesque, distribuée sous licence SIL Open Font License 1.1.</p>
      </Chapter>
      <Chapter id="donnees" n={5} title="Données personnelles">
        <p>La <Link href="/confidentialite">politique de confidentialité</Link> décrit les informations recueillies lors d’une demande, la mesure d’audience facultative, les durées de conservation et la manière d’exercer vos droits.</p>
      </Chapter>
    </LegalLayout>
  );
}
