import "./local.css";
import { Mail } from "lucide-react";
import { ButtonLink, Cartouche, Container, Eyebrow, FaqList, Glow, PageHero, PhoneLink, Realisations, Section, SectionHead, SignalCard, Skyline } from "@/components/sx";
import { ShortQuoteForm } from "@/components/short-quote-form";
import CampaignLink from "@/components/campaign-link";
import { Commune, LocalLinks, LocalServiceJsonLd } from "@/components/location-page";
import { ASNIERES_NEIGHBOURS } from "@/lib/locations";
import { SITE_IDENTITY, mailHref } from "@/lib/site-identity";
import { SeineSchema } from "./seine-schema";
/* /creation-site-internet-asnieres-sur-seine — cible locale n° 1 (lot 4). Composition propre :
   hero « la ville au bord de la Seine » (la ville se reflète dans le fleuve, la fenêtre signal aussi),
   modalités de rendez-vous, communes voisines avec schéma indicatif joué une fois, exemples types,
   réalisations, cartouche, questions locales, formulaire court relié (#demande), maillage.
   Aucune adresse publiée, aucun délai, aucun client : les exemples sont des exemples types.
   Le texte reste au « je » ; « agence web » n'apparaît que dans le titre de la page (métadonnées). */
const PATH = "/creation-site-internet-asnieres-sur-seine";
/* Reflets dans la Seine, sous la ville (positions en % de la largeur ; signal sous la fenêtre ambre). */
const REFLETS = [
  { left: "7%", w: "s" }, { left: "19%", w: "m" }, { left: "31%", w: "s" }, { left: "44%", w: "m" },
  { left: "63%", w: "s" }, { left: "74%", w: "m" }, { left: "88%", w: "s" },
] as const;
function HeroBackdrop() {
  return (
    <>
      <Glow tone="blue" size={760} top="-320px" right="-220px" />
      <span className="lc-wide"><Glow tone="amber" alt size={460} top="14%" right="4%" duration={28} /></span>
      <span className="lc-wide"><SignalCard right="5%" bottom="calc(var(--sx-skyline-h) + 20px)" reference="SF-92A60C1E" meta="Création · Asnières · démonstration" /></span>
      <div className="lc-bank"><Skyline seed={3} signal height="var(--lc-city-h)" /></div>
      <div className="lc-seine">
        {REFLETS.map((r, i) => <i key={i} className={`lc-reflet lc-reflet--${r.w} lc-r${i + 1}`} style={{ left: r.left }} />)}
        <i className="lc-reflet lc-reflet--signal" />
        <i className="lc-ripple lc-ripple--a" />
        <i className="lc-ripple lc-ripple--b" />
      </div>
    </>
  );
}
const MODES = [
  { title: "Chez vous ou à votre local", text: <>Je me déplace à <Commune>Asnières-sur-Seine</Commune> et dans les communes voisines pour un premier rendez-vous. Je vois votre activité telle qu’elle est : votre comptoir, votre atelier, vos documents, la façon dont vos clients vous trouvent aujourd’hui.</> },
  { title: "En visio, écran partagé", text: <>Un appel en visio permet de parcourir votre site actuel, regarder ensemble des exemples et poser la liste des pages. Vous restez à votre bureau, et je note les décisions dans un document que vous gardez.</> },
  { title: "Au téléphone, sans standard", text: <>Vous m’appelez au <span className="sx-tabular sx-nowrap">{SITE_IDENTITY.PHONE_DISPLAY}</span> : c’est ma ligne. Pas de prise de ticket ni de transfert d’un service à l’autre ; si je suis en rendez-vous, vous tombez sur ma messagerie.</> },
];
const EXAMPLES = [
  { kind: "Commerce de quartier", title: "Afficher ses horaires et se faire appeler", text: "Une boutique, un salon ou un restaurant : avant de venir, vos clients veulent savoir si vous êtes ouvert, comment vous joindre et ce que vous proposez. Le site met les horaires, l’appel en un geste et l’accès en tête de la page, lisibles sur un téléphone, dans la rue.", proto: "shop" },
  { kind: "Artisan", title: "Recevoir des demandes de devis précises", text: "Plombier, électricien, menuisier, peintre : vous préférez une demande claire à un appel pendant un chantier. Un formulaire court demande le type de travaux, la commune et une description ; chaque demande arrive avec sa référence dans votre tableau de suivi.", proto: "quote" },
  { kind: "Profession libérale", title: "Présenter ses prestations sans jargon", text: "Consultant, coach, architecte d’intérieur, formateur : vos prestations méritent chacune une page claire, avec ce qu’elles comprennent, pour qui, et comment prendre rendez-vous. Le site répond aux questions qu’on vous pose au premier appel.", proto: "services" },
] as const;
function Proto({ kind }: { kind: "shop" | "quote" | "services" }) {
  return (
    <div className={`lc-proto lc-proto--${kind}`} aria-hidden="true">
      <span className="lc-proto-label">Démonstration</span>
      {kind === "shop" ? (
        <>
          <b className="lc-proto-title">Ouvert aujourd’hui</b>
          <span className="lc-proto-row"><span>Lun. – ven.</span><span>9 h – 19 h</span></span>
          <span className="lc-proto-row"><span>Samedi</span><span>9 h – 13 h</span></span>
          <span className="lc-proto-btn">Appeler la boutique</span>
        </>
      ) : kind === "quote" ? (
        <>
          <b className="lc-proto-title">Demande de devis</b>
          <span className="lc-proto-field">Type de travaux</span>
          <span className="lc-proto-field">Commune</span>
          <span className="lc-proto-field lc-proto-field--tall">Votre besoin</span>
          <span className="lc-proto-btn">Envoyer</span>
        </>
      ) : (
        <>
          <b className="lc-proto-title">Prestations</b>
          <span className="lc-proto-item">Accompagnement individuel</span>
          <span className="lc-proto-item">Atelier en équipe</span>
          <span className="lc-proto-item">Premier rendez-vous</span>
          <span className="lc-proto-btn">Prendre rendez-vous</span>
        </>
      )}
    </div>
  );
}
const FAQ = [
  { q: "Vous déplacez-vous à Asnières ?", a: <p>Oui. Je travaille depuis <Commune>Asnières-sur-Seine</Commune> et je peux venir vous voir chez vous ou à votre local pour un premier rendez-vous, à Asnières comme dans les communes voisines. Si c’est plus simple pour vous, on fait le point en visio ou au téléphone.</p> },
  { q: "Je n’ai pas de local commercial : est-ce un problème ?", a: <p>Non. Beaucoup d’indépendants travaillent chez leurs clients ou depuis chez eux. Le site présente alors votre zone d’intervention, vos prestations et la façon de vous joindre, sans afficher d’adresse. C’est d’ailleurs ce que je fais pour SmartFixx : seul le siège social figure dans les mentions légales.</p> },
  { q: "Faut-il être à Asnières pour travailler avec vous ?", a: <p>Non. Je travaille d’abord avec les entreprises d’Asnières et des communes voisines, mais j’accompagne aussi des projets <CampaignLink href="/agence-web-ile-de-france">ailleurs en Île-de-France</CampaignLink> et <CampaignLink href="/agence-web-france">à distance, partout en France</CampaignLink>.</p> },
  { q: "Site internet et fiche Google Business Profile : quelle différence ?", a: <><p>La fiche Google présente l’essentiel dans Google Maps et dans les résultats : horaires, zone desservie, avis, lien vers votre site. Le site, lui, vous appartient : il explique vos prestations en détail, rassure et recueille des demandes précises.</p><p>Les deux se complètent, et leurs informations doivent concorder. Je pose des bases propres (titres, pages claires, coordonnées cohérentes) ; personne ne peut garantir une position dans Google.</p></> },
  { q: "Comment se passe le premier échange ?", a: <p>Vous m’appelez, ou vous envoyez une demande courte avec le formulaire ci-dessous. Je vous recontacte pour comprendre votre activité, vos clients et ce que le site doit leur permettre de faire. Je vous envoie ensuite une proposition et un devis détaillé : rien n’est engagé avant votre accord.</p> },
];
export function AsnieresPage() {
  const n = ASNIERES_NEIGHBOURS.communes;
  return (
    <>
      <LocalServiceJsonLd
        name="Création de site internet"
        description="Création et refonte de site internet pour les commerces, artisans et indépendants d’Asnières-sur-Seine et des Hauts-de-Seine, par Mohamed (SmartFixx)."
        path={PATH}
        areaServed={[{ "@type": "City", name: "Asnières-sur-Seine" }, { "@type": "AdministrativeArea", name: "Hauts-de-Seine" }]}
      />
      <PageHero
        className="lc-hero lc-hero--asnieres"
        breadcrumbs={[{ name: "Zones d’intervention", path: "/agence-web-ile-de-france" }, { name: "Asnières-sur-Seine", path: PATH }]}
        title={<>Création de site internet à <span className="sx-keyword"><Commune>Asnières-sur-Seine</Commune></span></>}
        tagline="création et refonte pour les commerces et les artisans"
        lead={<>Je travaille depuis <Commune>Asnières-sur-Seine</Commune>. Cette page ne présente pas un établissement ouvert au public : on se voit chez vous ou en visio.</>}
        actions={<><ButtonLink href="#demande" size="lg">Recevoir mon devis</ButtonLink><PhoneLink compact="sm" /></>}
        proofs={["Un seul interlocuteur : moi, Mohamed", "Rendez-vous chez vous, en visio ou au téléphone", "Téléphone direct, sans standard"]}
        backdrop={<HeroBackdrop />}
      />

      <Section id="rendez-vous" labelledBy="rendez-vous-titre" className="lc-modes-section">
        <Container>
          <div className="lc-split">
            <div className="lc-split-head"><SectionHead
              eyebrow="Travailler ensemble ici"
              id="rendez-vous-titre"
              title="Un rendez-vous là où c’est simple pour vous"
              text={<>Je n’ai ni vitrine ni bureau qui reçoit du public, et je ne publie pas d’adresse. Le premier échange se fait chez vous, en visio ou au téléphone : vous choisissez, et on garde le même interlocuteur du devis à la mise en ligne.</>}
            /></div>
            <ol className="lc-modes">
              {MODES.map((m, i) => (
                <li key={m.title} className="lc-mode">
                  <span className="lc-win lc-mode-win" aria-hidden="true"><i /></span>
                  <span className="lc-mode-num sx-tabular" aria-hidden="true">0{i + 1}</span>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section tone="night" id="communes" labelledBy="communes-titre" className="lc-communes-section" ambient={<Glow tone="blue" size={680} top="-200px" left="-240px" alt duration={30} />}>
        <Container>
          <div className="lc-communes">
            <div className="lc-communes-copy">
              <div className="lc-head"><Eyebrow className="lc-eyebrow">Communes voisines</Eyebrow><h2 id="communes-titre" className="sx-h2">Asnières et les communes au bord de la Seine</h2></div>
              <div className="sx-prose lc-prose">
                <p>Je travaille d’abord pour les entreprises d’<Commune>Asnières-sur-Seine</Commune>, du centre-ville jusqu’aux limites de Gennevilliers et de Bois-Colombes, et j’interviens aussi dans les communes voisines, sur les deux rives de la Seine.</p>
                <p>Si votre clientèle vient aussi de l’autre côté du fleuve ou du nord de la boucle, votre site doit le dire clairement : quelles communes vous couvrez, si vous vous déplacez, et comment vous joindre.</p>
              </div>
              <ul className="lc-neighbours" aria-label="Communes voisines où j’interviens">
                {n.map((c) => <li key={c}><i aria-hidden="true" /><Commune>{c}</Commune></li>)}
              </ul>
              <p className="lc-more">Pour le reste des Hauts-de-Seine, Paris, la Seine-Saint-Denis et le Val-d’Oise : <CampaignLink href="/agence-web-ile-de-france">les communes où j’interviens en Île-de-France</CampaignLink>.</p>
            </div>
            <SeineSchema />
          </div>
        </Container>
      </Section>

      <Section id="exemples" labelledBy="exemples-titre" className="lc-examples-section">
        <Container>
          <SectionHead
            eyebrow="Exemples types"
            id="exemples-titre"
            title="Trois besoins d’entreprises d’Asnières"
            text="Ce sont des exemples pour illustrer, pas des clients : chacun montre ce qu’un site doit d’abord permettre, selon l’activité."
          />
          <div className="lc-examples sx-reveal">
            {EXAMPLES.map((e) => (
              <article key={e.kind} className="lc-example">
                <Proto kind={e.proto} />
                <div className="lc-example-copy">
                  <span className="sx-chip">Exemple type · {e.kind}</span>
                  <h3>{e.title}</h3>
                  <p>{e.text}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="surface" id="realisations" labelledBy="realisations-titre" className="lc-works-section">
        <Container>
          <SectionHead
            eyebrow="Réalisations"
            id="realisations-titre"
            title="Ce que je construis"
            text="Pas de référence client inventée : voici le site que vous parcourez et son tableau de suivi des demandes, montré avec des données fictives."
          />
          <Realisations headingLevel={3} />
        </Container>
      </Section>
      <Cartouche variant="band" />

      <Section id="questions" labelledBy="questions-titre" className="lc-faq-section">
        <Container size="narrow">
          <SectionHead eyebrow="Questions locales" id="questions-titre" title="Vos questions sur un site à Asnières" />
          <FaqList items={FAQ} />
        </Container>
      </Section>

      <Section tone="surface" id="demande" labelledBy="demande-titre" className="lc-demande-section">
        <Container>
          <div className="lc-demande">
            <div className="lc-demande-copy">
              <SectionHead
                eyebrow="Demande de devis"
                id="demande-titre"
                title="Parlons de votre site"
                text={<>Décrivez votre activité en quelques lignes. Je vous recontacte pour un premier échange, à <Commune>Asnières-sur-Seine</Commune>, en visio ou au téléphone.</>}
              />
              <ul className="lc-direct">
                <li><PhoneLink /></li>
                <li><a className="lc-mail" href={mailHref}><span className="sx-phone-icon" aria-hidden="true"><Mail /></span><span>{SITE_IDENTITY.EMAIL}</span></a></li>
              </ul>
            </div>
            <div className="lc-demande-form">
              <ShortQuoteForm defaultService="creation" variant="inline" headingLevel={3} />
            </div>
          </div>
        </Container>
      </Section>

      <LocalLinks
        id="aller-plus-loin"
        eyebrow="Pour aller plus loin"
        title="Le reste de mon travail, au-delà d’Asnières"
        items={[
          { href: "/creation-site-internet", label: "Création de site internet vitrine", text: "Ce qui est inclus, ce qui se décide au devis, et comment se déroule un projet." },
          { href: "/refonte-site-internet", label: "Refonte d’un site existant", text: "Moderniser un site sans perdre les pages qui fonctionnent déjà." },
          { href: "/agence-web-ile-de-france", label: "Communes où j’interviens en Île-de-France", text: <>Les Hauts-de-Seine, Paris, la Seine-Saint-Denis et le <Commune>Val-d’Oise</Commune>.</> },
          { href: "/agence-web-france", label: "Un projet à distance, ailleurs en France", text: "Visio, documents partagés et validations par étapes." },
        ]}
      />
    </>
  );
}
