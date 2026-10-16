import type { ReactNode } from "react";
import CampaignLink from "@/components/campaign-link";
import { PageHero } from "@/components/sx/page-hero";
import { ButtonLink, PhoneLink } from "@/components/sx/actions";
import { Glow, Skyline, SignalCard } from "@/components/sx/ambient";
import { Section, Container, SectionHead } from "@/components/sx/section";
import { CtaBand } from "@/components/sx/cta-band";
import { MailScene } from "@/components/mail-scene";
import { MethodContent } from "@/components/method-content";
import { SolutionsContent } from "@/components/solutions-content";
import { CampaignFlow } from "@/components/campaign-flow";
import { Faq } from "@/components/faq";
import type { CampaignConfig } from "@/lib/campaign-config";
import { SITE_IDENTITY, mailHref } from "@/lib/site-identity";
import { Facade, LinkCard } from "./shared";
/* Groupe emailing (lot 8) : /prospection-emailing, /solutions, /methode, /tarifs, /garanties.
   Au « je », sans aucun prix ni montant, sans engagement non confirmé (data ciblée, B2C, « sources
   vérifiées », remplacement sous 30 jours, avoirs, optimisation sans frais : masqués, décision n° 9).
   Chaque page a son moment signature : la scène de l'enveloppe (prospection), le fichier préparé
   (solutions), l'immeuble de la méthode, les tours de volume (formules), le tableau des voyants
   (engagements). Le CTA principal mène à /contact?service=emailing (CampaignFlow). */
const DEVIS = "/contact?service=emailing";
const CNIL = "https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique-sms-mms-et-automate-dappel";
const EMAILING_CRUMB = { name: "Prospection emailing", path: "/prospection-emailing" };

function Hero({ crumb, title, tagline, lead, cta = "Demander un devis", href = DEVIS, proofs, seed }: { crumb?: { name: string; path: string }; title: ReactNode; tagline: ReactNode; lead: ReactNode; cta?: string; href?: string; proofs?: string[]; seed: number }) {
  return (
    <PageHero
      className="sc-hero sc-hero--mail"
      breadcrumbs={crumb ? [EMAILING_CRUMB, crumb] : [{ name: "Prestations", path: "/services" }, EMAILING_CRUMB]}
      title={title}
      tagline={tagline}
      lead={lead}
      actions={<><ButtonLink variant="cta" href={href} size="lg">{cta}</ButtonLink><PhoneLink compact="sm" /></>}
      proofs={proofs}
      backdrop={<><Glow tone="blue" size={700} top="-260px" right="-220px" duration={26} /><Skyline seed={seed} signal depth={false} /><SignalCard className="sc-signal" meta="Prospection emailing · démonstration" right="6%" bottom="calc(var(--sx-skyline-h) + 40px)" /></>}
    />
  );
}

/* Maillage du groupe : liens descriptifs vers les autres pages emailing (la page courante exclue). */
const GROUP = [
  { href: "/methode", kicker: "Déroulé", title: "La méthode de prospection emailing en 4 étapes", text: "Cadrage, préparation, envoi et bilan : ce qui se passe à chaque étape." },
  { href: "/solutions", kicker: "Vos contacts", title: "Préparer votre fichier de contacts", text: "Qualité du fichier, base légale et désinscription : les points à vérifier." },
  { href: "/tarifs", kicker: "Sur devis", title: "Les formules de prospection emailing", text: "Volume d’envois et formule : composez votre demande de devis." },
  { href: "/garanties", kicker: "Engagements", title: "Mes engagements pour vos campagnes", text: "Validation des messages, désinscription, cadence et bilan." },
];
function GroupLinks({ current, title = "Pour aller plus loin" }: { current: string; title?: string }) {
  const items = GROUP.filter((g) => g.href !== current);
  return (
    <Section labelledBy="sc-group-titre" className="sc-group-sec">
      <Container>
        <h2 id="sc-group-titre" className="sx-h2 sc-group-title">{title}</h2>
        <div className={`sc-group sc-group--${items.length}`}>
          {items.map((g, i) => <LinkCard key={g.href} href={g.href} kicker={g.kicker} title={g.title} text={g.text} signal={i} />)}
        </div>
      </Container>
    </Section>
  );
}

/* Tableau de voyants : chaque ligne a sa fenêtre, allumée en permanence (le bloc est un état, pas une
   promesse animée). */
function Checks({ items, className }: { items: { title: string; text: ReactNode }[]; className?: string }) {
  return (
    <ul className={["sc-checks", className].filter(Boolean).join(" ")} role="list">
      {items.map((c) => (
        <li className="sc-check" key={c.title}>
          <span className="sc-check-lamp" aria-hidden="true" />
          <div><h3 className="sc-check-title">{c.title}</h3><p>{c.text}</p></div>
        </li>
      ))}
    </ul>
  );
}

export function ProspectionPage() {
  return (
    <>
      <Hero
        title="Prospection par email"
        tagline="pour les professionnels"
        lead="Avec votre propre fichier de contacts, et rien ne part sans votre accord."
        proofs={["Votre fichier, vos contacts", "Aucun envoi sans votre validation", "Désinscription respectée"]}
        seed={10}
      />
      <Section labelledBy="sc-pe-titre" className="sc-pe-sec">
        <Container className="sc-pe">
          <div className="sc-pe-copy">
            <SectionHead id="sc-pe-titre" eyebrow="Comment se déroule une campagne" title="Du message validé à la première réponse" text="Je prépare votre fichier et vos messages, vous les validez, un envoi de test part vers votre boîte. Ensuite seulement, les envois commencent, étalés dans le temps. Les réponses vous reviennent ; les désinscriptions sont appliquées partout." />
            <CampaignLink href="/methode" className="sc-textlink">Voir la méthode de prospection emailing en 4 étapes</CampaignLink>
          </div>
          <MailScene />
        </Container>
      </Section>
      <Section tone="night" labelledBy="sc-verif-titre" className="sc-verif-sec">
        <Container>
          <SectionHead id="sc-verif-titre" eyebrow="Avant le premier envoi" title="Ce que je vérifie avant d’envoyer" text="Une campagne ne part pas tant que ces quatre points ne sont pas réglés." />
          <Checks className="sc-checks--grid" items={[
            { title: "Le fichier", text: "Doublons, adresses mal formées, contacts hors cible : je les écarte avant l’envoi." },
            { title: "La base légale", text: "Entre professionnels, le message doit concerner l’activité de la personne et lui laisser la possibilité de s’opposer. Je vous demande d’où viennent vos contacts." },
            { title: "La désinscription", text: "Un lien de désinscription en un clic dans chaque message, et une liste STOP commune à toutes les campagnes." },
            { title: "Le message", text: "Relu et validé par vous, puis testé dans votre boîte avant le lancement." },
          ]} />
          <p className="sc-verif-cnil"><a className="sc-textlink" href={CNIL} target="_blank" rel="noreferrer">Recommandations de la CNIL sur la prospection par email (nouvel onglet)</a></p>
        </Container>
      </Section>
      <GroupLinks current="/prospection-emailing" />
      <CtaBand title="Vous avez un fichier de contacts et une offre à faire connaître&#8239;?" text="Décrivez votre activité et votre cible : votre demande est enregistrée et je vous recontacte moi-même." primaryHref={DEVIS} primaryLabel="Parler de ma campagne" />
    </>
  );
}

export function SolutionsPage() {
  return (
    <>
      <Hero
        crumb={{ name: "Votre fichier de contacts", path: "/solutions" }}
        title={<>Votre fichier<br className="sc-br-m" /> de contacts</>}
        tagline="ou une nouvelle audience"
        lead="Vos clients et vos prospects : le meilleur point de départ d’une campagne."
        seed={11}
      />
      <Section labelledBy="sc-so-titre" className="sc-so-sec">
        <Container>
          <SectionHead id="sc-so-titre" eyebrow="Votre point de départ" title="Préparer votre propre fichier" text="Un fichier préparé, c’est moins d’envois perdus et des destinataires qui ont une raison de vous lire." />
          <SolutionsContent />
        </Container>
      </Section>
      <Section tone="surface" labelledBy="sc-zero-titre" className="sc-zero-sec">
        <Container className="sc-zero">
          <div>
            <h2 id="sc-zero-titre" className="sx-h2">Vous partez de zéro&#8239;?</h2>
            <p className="sx-lead">Décrivez la cible que vous visez : métier, secteur, zone. Je regarde avec vous ce qui est envisageable, avant tout devis et sans engagement.</p>
          </div>
          <div className="sc-zero-actions">
            <ButtonLink variant="primary" href={DEVIS}>Décrire ma cible</ButtonLink>
            <CampaignLink href="/tarifs" className="sc-textlink">Voir les formules de prospection emailing</CampaignLink>
          </div>
        </Container>
      </Section>
      <GroupLinks current="/solutions" />
      <CtaBand title="Votre fichier mérite une vraie campagne" text="Présentez-moi votre offre et vos contacts : je vous propose un déroulé et un devis détaillé." primaryHref={DEVIS} primaryLabel="Parler de ma campagne" />
    </>
  );
}

export function MethodePage() {
  return (
    <>
      <Hero
        crumb={{ name: "Méthode", path: "/methode" }}
        title="Méthode de prospection emailing"
        tagline="en 4 étapes"
        lead="Cadrer, préparer, envoyer, faire le bilan : vous validez chaque message avant qu’il parte."
        seed={4}
      />
      <Section labelledBy="sc-mt-titre" className="sc-mt-sec">
        <Container>
          <SectionHead id="sc-mt-titre" eyebrow="Étage par étage" title="Les quatre étapes d’une campagne" text="Chaque étape s’appuie sur la précédente : rien ne part tant que le fichier et les messages ne sont pas prêts." />
          <MethodContent />
        </Container>
      </Section>
      <Section tone="night" labelledBy="sc-main-titre" className="sc-main-sec">
        <Container>
          <SectionHead id="sc-main-titre" eyebrow="Votre feu vert" title="Vous gardez la main" text="Je prépare, vous décidez. Aucune campagne n’est envoyée sans votre accord sur les messages et le périmètre." />
          <Checks className="sc-checks--grid sc-checks--3" items={[
            { title: "Avant l’envoi", text: "Cible, volume, messages et calendrier : vous validez tout, et vous recevez l’envoi de test." },
            { title: "Pendant la campagne", text: "Les envois sont suivis ; la campagne peut être mise en pause si quelque chose doit être corrigé." },
            { title: "Après la campagne", text: "Les résultats observés, et mes recommandations pour la suite." },
          ]} />
        </Container>
      </Section>
      <GroupLinks current="/methode" />
      <CtaBand title="On cadre votre première campagne&#8239;?" text="Une offre, une cible, un fichier : c’est assez pour commencer." primaryHref={DEVIS} primaryLabel="Parler de ma campagne" />
    </>
  );
}

const FACTORS = [
  { title: "Le volume d’envois", text: "Le nombre total d’emails, relances comprises." },
  { title: "L’état de votre fichier", text: "Un fichier à nettoyer et à segmenter demande plus de préparation." },
  { title: "Les messages", text: "Le nombre de messages à rédiger, de variantes et de relances." },
  { title: "L’accompagnement", text: "Le suivi pendant la campagne et l’analyse des réponses." },
];
export function TarifsPage({ config }: { config: CampaignConfig }) {
  return (
    <>
      <Hero
        crumb={{ name: "Formules", path: "/tarifs" }}
        title="Formules de prospection emailing"
        tagline="sur devis"
        lead="Je ne publie pas de prix : chaque campagne est chiffrée selon son volume et son accompagnement."
        cta="Composer ma demande"
        href="#formules"
        seed={6}
      />
      <Section id="formules" labelledBy="sc-fo-titre" className="sc-fo-sec">
        <Container>
          <SectionHead id="sc-fo-titre" eyebrow="Deux choix, un devis" title="Composez votre demande de devis" text="Le volume allume la tour ; la formule fixe le niveau d’accompagnement. Le contenu exact de chaque formule est écrit dans le devis." />
          <CampaignFlow kind="pricing" initial={config} key={JSON.stringify(config)} />
        </Container>
      </Section>
      <Section tone="surface" labelledBy="sc-var-titre" className="sc-var-sec">
        <Container>
          <SectionHead id="sc-var-titre" title="Ce qui fait varier le devis" />
          <ul className="sc-var" role="list">
            {FACTORS.map((f, i) => (
              <li className="sc-var-item sc-lit" key={f.title}>
                <Facade count={4} on={[0, 1, 2, 3].filter((k) => k < i + 1)} />
                <h3 className="sc-var-title">{f.title}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <Section labelledBy="sc-faq-titre" className="sc-faq-sec">
        <Container className="sc-faqwrap">
          <div>
            <h2 id="sc-faq-titre" className="sx-h2">Vos questions sur la prospection emailing</h2>
            <p className="sc-faq-aside">Une autre question&#8239;? <CampaignLink className="sc-textlink" href={DEVIS}>Posez-la avec votre demande</CampaignLink> ou appelez-moi.</p>
          </div>
          <Faq />
        </Container>
      </Section>
      <CtaBand title="Un volume, une formule, un devis" text="Votre demande est enregistrée et je vous réponds moi-même, avec un devis détaillé." primaryHref={DEVIS} primaryLabel="Demander mon devis" />
    </>
  );
}

export function GarantiesPage() {
  return (
    <>
      <Hero
        crumb={{ name: "Mes engagements", path: "/garanties" }}
        title="Mes engagements"
        tagline="pour vos campagnes d’emailing"
        lead="Je m’engage seulement sur ce que je maîtrise et que vous pouvez vérifier."
        seed={3}
      />
      <Section tone="night" labelledBy="sc-eng-titre" className="sc-eng-sec">
        <Container>
          <SectionHead id="sc-eng-titre" eyebrow="Quatre voyants allumés" title="Ce sur quoi je m’engage" text="Ces engagements valent pour chaque campagne, quelle que soit la formule." />
          <Checks className="sc-checks--board" items={[
            { title: "Aucun envoi sans votre validation", text: "Vous relisez et validez chaque message. Un envoi de test part vers votre boîte avant le lancement." },
            { title: "La désinscription respectée partout", text: "Chaque message porte un lien de désinscription en un clic. Une adresse désinscrite rejoint une liste STOP commune : elle est exclue de toutes les campagnes, pas seulement de la vôtre. Les adresses qui n’existent pas sont écartées de la même façon." },
            { title: "Une cadence maîtrisée", text: "Les envois sont étalés dans le temps, avec une limite par jour, pour ménager votre réputation d’expéditeur et les messageries des destinataires." },
            { title: "Un bilan partagé", text: "À la fin de la campagne, je vous présente les envois, les réponses et les désinscriptions, et on décide ensemble de la suite." },
          ]} />
        </Container>
      </Section>
      <Section labelledBy="sc-limit-titre" className="sc-limit-sec">
        <Container className="sc-limit">
          <div>
            <h2 id="sc-limit-titre" className="sx-h2">Ce que je ne promets pas</h2>
            <p className="sx-lead">Ni un nombre de ventes, ni un chiffre d’affaires, ni un taux d’ouverture, ni l’arrivée en boîte principale. Ils dépendent aussi de votre offre, de votre cible et des messageries de vos destinataires.</p>
          </div>
          <div className="sc-limit-frame">
            <h3 className="sc-limit-sub">Le cadre de chaque campagne</h3>
            <p>Le devis accepté fixe la cible, le volume, les messages prévus et le calendrier. Une demande faite sur ce site ne déclenche ni commande, ni paiement, ni envoi.</p>
            <p>Une question sur un engagement&#8239;? Écrivez-moi à <a className="sc-textlink" href={mailHref}>{SITE_IDENTITY.EMAIL}</a> avec la référence de votre devis.</p>
            <p><a className="sc-textlink" href={CNIL} target="_blank" rel="noreferrer">Recommandations de la CNIL sur la prospection par email (nouvel onglet)</a></p>
          </div>
        </Container>
      </Section>
      <GroupLinks current="/garanties" />
      <CtaBand title="Une campagne claire, du premier message au bilan" text="Décrivez votre offre et vos contacts : je vous propose un déroulé et un devis détaillé." primaryHref={DEVIS} primaryLabel="Parler de ma campagne" />
    </>
  );
}
