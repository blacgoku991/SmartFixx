import "./local.css";
import { ButtonLink, Container, CtaBand, Glow, PageHero, PhoneLink, Section, SectionHead, Skyline } from "@/components/sx";
import CampaignLink from "@/components/campaign-link";
import { Commune, LocalLinks, LocalServiceJsonLd } from "@/components/location-page";
import { COMMUNE_DEPARTMENT, ILE_DE_FRANCE_ZONE } from "@/lib/locations";
/* /agence-web-ile-de-france — page des communes desservies (lot 4), cible des redirections 308 des anciennes
   pages de villes et de départements (lot 7). Elle NOMME en texte réel les 13 communes et les 4 départements
   de lib/locations.ts (liste à valider avant la mise en ligne). Moment signature : la ligne des communes,
   deux rangées de noms qui glissent en sens contraire au défilement (translateX lié au défilement, aucune
   lecture automatique ; rangées repliées en grille statique en mouvement réduit). */
const PATH = "/agence-web-ile-de-france";
const { communes, departments } = ILE_DE_FRANCE_ZONE;
function listFr(items: string[]) {
  return items.map((c, i) => (
    <span key={c}>
      <Commune>{c}</Commune>
      {i < items.length - 2 ? ", " : i === items.length - 2 ? " et " : ""}
    </span>
  ));
}
const GROUPS: { code: string; name: string; note: string; communes: string[] }[] = [
  { code: "92", name: "Hauts-de-Seine", note: "Mon département : la plupart des rendez-vous sur place se font ici.", communes: communes.filter((c) => COMMUNE_DEPARTMENT[c] === "92") },
  { code: "75", name: "Paris", note: "Rendez-vous sur place ou en visio, selon le projet et l’arrondissement.", communes: [] },
  { code: "93", name: "Seine-Saint-Denis", note: "Juste au nord de Clichy, sur la rive droite de la Seine.", communes: communes.filter((c) => COMMUNE_DEPARTMENT[c] === "93") },
  { code: "95", name: "Val-d’Oise", note: "De l’autre côté de la Seine, au nord de Colombes.", communes: communes.filter((c) => COMMUNE_DEPARTMENT[c] === "95") },
];
/* Rangées décoratives (aria-hidden) : les communes, dans deux ordres, répétées pour couvrir la largeur. */
const ROW_A = communes.slice(0, 7);
const ROW_B = communes.slice(7).concat(departments);
function BandRow({ items, dir }: { items: string[]; dir: "a" | "b" }) {
  const seq = [...items, ...items];
  return (
    <div className={`lc-band-row lc-band-row--${dir}`}>
      {seq.map((c, i) => (
        <span key={i} className={["lc-band-name", i % 2 ? "lc-band-name--line" : "", i >= items.length ? "lc-band-dup" : ""].filter(Boolean).join(" ")}>{c}<i className="lc-band-win" /></span>
      ))}
    </div>
  );
}
export function IleDeFrancePage() {
  return (
    <>
      <LocalServiceJsonLd
        name="Création et refonte de site internet"
        description="Création et refonte de sites internet pour les artisans, commerces, professions libérales et PME d’Île-de-France, depuis Asnières-sur-Seine, par Mohamed (SmartFixx)."
        path={PATH}
        areaServed={[{ "@type": "AdministrativeArea", name: "Île-de-France" }, ...departments.map((d) => ({ "@type": "AdministrativeArea" as const, name: d }))]}
      />
      <PageHero
        className="lc-hero lc-hero--idf"
        breadcrumbs={[{ name: "Île-de-France", path: PATH }]}
        title={<>Création et refonte de sites internet en <Commune>Île-de-France</Commune></>}
        tagline={<>depuis <Commune>Asnières-sur-Seine</Commune>, des Hauts-de-Seine à Paris</>}
        lead="Artisans, commerces, professions libérales et PME : des sites clairs, lisibles sur mobile, reliés à un tableau de suivi des demandes."
        actions={<><ButtonLink href="/contact?service=creation" size="lg">Parler de mon projet</ButtonLink><PhoneLink compact="sm" /></>}
        proofs={["Rendez-vous sur place dans les communes citées", "Visio pour les points d’étape", "Le même interlocuteur du devis à la mise en ligne"]}
        backdrop={<><Glow tone="blue" size={720} top="-300px" left="-260px" /><Glow tone="blue" alt size={540} top="-120px" right="-180px" duration={30} /><Skyline seed={7} /></>}
      />

      <Section id="communes" labelledBy="communes-titre" className="lc-zone-section">
        <Container>
          <SectionHead eyebrow="Zone d’intervention" id="communes-titre" title="Communes où j’interviens" />
          <p className="lc-zone-text">
            Je travaille depuis <Commune>Asnières-sur-Seine</Commune> et j’interviens dans les communes suivantes : {listFr(communes)}.
            Plus largement, je me déplace dans quatre départements : {listFr(departments)}.
          </p>
        </Container>
        <div className="lc-band" aria-hidden="true">
          <BandRow items={ROW_A} dir="a" />
          <BandRow items={ROW_B} dir="b" />
        </div>
        <Container>
          <ul className="lc-depts sx-reveal" aria-label="Communes par département">
            {GROUPS.map((g) => (
              <li key={g.code} className={g.code === "92" ? "lc-dept lc-dept--home" : "lc-dept"}>
                <span className="lc-dept-code sx-tabular" aria-hidden="true">{g.code}</span>
                <h3>{g.name} <span className="sr-only">({g.code})</span></h3>
                <p>{g.note}</p>
                {g.communes.length ? <ul className="lc-dept-communes">{g.communes.map((c) => <li key={c}><Commune>{c}</Commune></li>)}</ul> : null}
              </li>
            ))}
          </ul>
          <p className="lc-zone-note">Votre commune n’est pas citée ? Appelez-moi quand même : selon le projet, on se voit sur place ou on avance en visio. Pour <Commune>Asnières-sur-Seine</Commune> et ses voisines, voyez <CampaignLink href="/creation-site-internet-asnieres-sur-seine">la création de site à Asnières-sur-Seine</CampaignLink>.</p>
        </Container>
      </Section>

      <Section tone="surface" id="modalites" labelledBy="modalites-titre" className="lc-ways-section">
        <Container>
          <SectionHead eyebrow="Modalités" id="modalites-titre" title="D’une commune à l’autre, trois façons de travailler" />
          <div className="lc-ways">
            <article className="lc-way">
              <h3>Sur place</h3>
              <p>Pour un premier rendez-vous, je viens dans les communes citées ci-dessus, chez vous ou à votre local. Pour Paris et le reste de la région, on en convient selon le projet.</p>
            </article>
            <article className="lc-way">
              <h3>En visio</h3>
              <p>La plupart des points d’étape se font en visio : maquette commentée en direct, écran partagé, décisions consignées dans un document que vous conservez.</p>
            </article>
            <article className="lc-way">
              <h3>Au téléphone</h3>
              <p>Pour une question rapide, vous appelez directement la personne qui conçoit et construit votre site, sans passer par un standard ni un chef de projet.</p>
            </article>
          </div>
        </Container>
      </Section>

      <Section tone="night" id="local" labelledBy="local-titre" className="lc-why-section" ambient={<Glow tone="blue" alt size={620} bottom="-260px" right="-200px" duration={34} />}>
        <Container size="narrow">
          <SectionHead eyebrow="Pourquoi un interlocuteur local" id="local-titre" title="Quelqu’un d’ici, qui vient quand c’est utile" />
          <div className="sx-prose lc-prose">
            <p>Travailler avec quelqu’un de la région, c’est pouvoir se voir quand une décision se prend mieux autour d’une table, sans organiser une journée de déplacement. C’est aussi un regard de voisin sur votre zone : quelles communes citer, comment présenter vos déplacements, quelles questions vos clients se posent avant d’appeler.</p>
            <p>Je ne crée pas une fausse adresse par ville et je ne multiplie pas les pages presque identiques. Votre site dit où vous intervenez vraiment : c’est plus honnête pour vos clients, et c’est ce que les moteurs de recherche attendent d’une entreprise locale. Personne ne peut garantir une position dans Google ; on peut en revanche poser des bases propres.</p>
          </div>
        </Container>
      </Section>

      <LocalLinks
        id="voir-aussi"
        eyebrow="Voir aussi"
        title="Selon votre projet et votre commune"
        items={[
          { href: "/creation-site-internet-asnieres-sur-seine", label: "Création de site à Asnières-sur-Seine", text: "Rendez-vous, communes voisines et questions locales." },
          { href: "/agence-web-france", label: "Création de site à distance, partout en France", text: "Quand vous êtes loin de l’Île-de-France." },
          { href: "/creation-site-internet", label: "Création de site internet vitrine", text: "Contenu, étapes et ce que le devis précise." },
          { href: "/refonte-site-internet", label: "Refonte de site internet", text: "Moderniser l’existant sans perdre ce qui fonctionne." },
        ]}
      />
      <CtaBand
        id="idf-cta"
        title="Un site à créer ou à refaire en Île-de-France ?"
        text="Dites-moi votre activité et votre commune : je vous recontacte pour un premier échange, sur place, en visio ou au téléphone."
        primaryHref="/contact?service=creation"
        primaryLabel="Parler de mon projet"
      />
    </>
  );
}
