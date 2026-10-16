import CampaignLink from "@/components/campaign-link";
import { PageHero } from "@/components/sx/page-hero";
import { ButtonLink, PhoneLink } from "@/components/sx/actions";
import { Glow, Skyline, SignalCard } from "@/components/sx/ambient";
import { Section, Container, SectionHead } from "@/components/sx/section";
import { ShortQuoteForm, type ShortQuoteFormProps } from "@/components/short-quote-form";
import { Facade, Floors } from "./shared";
/* /diagnostic (lot 8) — page différenciée de /contact (décision n° 13 : gardée, 200). Elle reste la cible
   des liens générés par le panel (/diagnostic?service=…&utm_campaign=…), lus côté serveur.
   Moment signature : « trois situations qui s'éclairent ». Chaque carte montre une petite scène en DOM de
   la situation (désordre) ; au survol ou au focus, elle se range et sa fenêtre s'allume (transitions
   transform et opacity, aucune boucle). La note honnête « aucun audit automatique » est conservée. */
const SITUATIONS = [
  { id: "lisible", title: "Un site difficile à parcourir", text: "Les visiteurs ne trouvent pas ce que vous faites, ni comment vous joindre, surtout sur un téléphone.", href: "/refonte-site-internet", link: "Voir la refonte de site internet" },
  { id: "perdues", title: "Des demandes qui se perdent", text: "Des messages arrivent par plusieurs canaux, sans suivi : certains restent sans réponse.", href: "/creation-site-internet", link: "Voir la création de site avec suivi des demandes" },
  { id: "repetitif", title: "Des tâches qui se répètent", text: "Recopier les mêmes informations d’un outil à l’autre prend du temps chaque semaine.", href: "/automatisation-informatique", link: "Voir l’automatisation informatique" },
];
function Scene({ id }: { id: string }) {
  if (id === "lisible") return <span className="sc-sit-art sc-sit-art--lisible" aria-hidden="true"><i /><i /><i /><i /><b /></span>;
  if (id === "perdues") return <span className="sc-sit-art sc-sit-art--perdues" aria-hidden="true"><i /><i /><i /><b /></span>;
  return <span className="sc-sit-art sc-sit-art--repetitif" aria-hidden="true"><i /><i /><i /><b /></span>;
}
const EXCHANGE = [
  { title: "Votre point de départ", text: "Votre activité, votre site actuel et les outils que vous utilisez au quotidien." },
  { title: "Ce qui vous freine", text: "Une difficulté concrète plutôt qu’une liste de fonctionnalités : ce qui coince, et depuis quand." },
  { title: "Le résultat que vous visez", text: "Plus de demandes, moins de ressaisie, un outil plus simple : on fixe ce qui compte pour vous." },
  { title: "Ce que je vous propose ensuite", text: "Une piste claire, et un devis détaillé seulement si un projet a du sens. Sans engagement." },
];

export function DiagnosticPage({ form }: { form: ShortQuoteFormProps }) {
  return (
    <>
      <PageHero
        className="sc-hero"
        breadcrumbs={[{ name: "Faire le point", path: "/diagnostic" }]}
        title="Faire le point"
        tagline="sur votre site et vos outils"
        lead="Décrivez votre situation, je prépare un premier échange utile."
        actions={<><ButtonLink variant="cta" href="#demande" size="lg">Décrire ma situation</ButtonLink><PhoneLink compact="sm" /></>}
        proofs={["Sans engagement", "Aucun accès technique à fournir", "Un échange avec moi, Mohamed"]}
        backdrop={<><Glow tone="blue" size={640} top="-220px" right="-180px" duration={24} /><Skyline seed={9} signal depth={false} /><SignalCard className="sc-signal" meta="Faire le point · démonstration" right="6%" bottom="calc(var(--sx-skyline-h) + 40px)" /></>}
      />
      <Section labelledBy="sc-sit-titre" className="sc-sit-sec">
        <Container>
          <SectionHead id="sc-sit-titre" eyebrow="Ce que j’entends le plus souvent" title="Trois situations qui méritent un échange" text="Vous vous reconnaissez dans l’une d’elles ? Chacune mène à la prestation qui y répond, et toutes se règlent mieux après un échange." />
          <ul className="sc-sit" role="list">
            {SITUATIONS.map((s, i) => (
              <li key={s.id} className={`sc-sit-card sc-sit-card--${s.id} sc-lit`}>
                <div className="sc-sit-stage"><Scene id={s.id} /><Facade count={3} signal={i} className="sc-sit-facade" /></div>
                <h3 className="sc-sit-title">{s.title}</h3>
                <p>{s.text}</p>
                <CampaignLink href={s.href} className="sc-textlink">{s.link}</CampaignLink>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <Section tone="night" labelledBy="sc-ex-titre" className="sc-ex-sec">
        <Container className="sc-ex">
          <div className="sc-ex-head">
            <h2 id="sc-ex-titre" className="sx-h2">Ce que contient un premier échange</h2>
            <p className="sx-lead">Au téléphone, en visio ou en rendez-vous&#8239;: on parle de votre activité avant de parler technique.</p>
            <p className="sc-ex-note">Ce formulaire prépare un échange. Il ne lance aucun audit automatique, aucun scan ni aucune campagne.</p>
          </div>
          <Floors items={EXCHANGE} className="sc-floors--night" />
        </Container>
      </Section>
      <Section tone="surface" id="demande" labelledBy="sc-dem-titre" className="sc-dem-sec">
        <Container className="sc-dem">
          <div className="sc-dem-copy">
            <h2 id="sc-dem-titre" className="sx-h2">Décrivez votre situation</h2>
            <p className="sx-lead">Quelques lignes suffisent. Votre demande est enregistrée, je la lis moi-même et je vous recontacte pour fixer l’échange.</p>
            <p className="sc-dem-alt">Vous savez déjà ce qu’il vous faut&#8239;? Voir la <CampaignLink className="sc-textlink" href="/creation-site-internet">création de site internet</CampaignLink>, la <CampaignLink className="sc-textlink" href="/refonte-site-internet">refonte de site internet</CampaignLink> ou l’<CampaignLink className="sc-textlink" href="/automatisation-informatique">automatisation informatique</CampaignLink>.</p>
          </div>
          <div className="sc-dem-form"><ShortQuoteForm {...form} variant="page" headingLevel={3} /></div>
        </Container>
      </Section>
    </>
  );
}
