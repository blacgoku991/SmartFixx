import { Container, Section, SectionHead } from "@/components/sx/section";
import { Glow } from "@/components/sx/ambient";
import { Realisations } from "@/components/sx/realisations";
import { creation as c } from "@/lib/content/acquisition";
import { ChapterHead, Objections, Related, Steps } from "./shared";
import { Anatomy } from "./anatomy";
/* Sections de /creation-site-internet après le hero (serveur) : périmètre Inclus / En option / Défini au
   devis, planche annotée (moment signature), réalisations, déroulement, objections, liens contextuels.
   Le bandeau d'appel et le JSON-LD sont rendus par AcquisitionPage. */
export function CreationSections() {
  const s = c.scope;
  return (
    <>
      <Section id="perimetre" labelledBy="aq-perimetre-titre" className="aq-scope-section">
        <Container>
          <ChapterHead id="aq-perimetre-titre" eyebrow={s.eyebrow} title={s.title} text={s.text} />
          <div className="aq-scope">
            <div className="aq-scope-col aq-scope-col--in">
              <h3 className="aq-scope-title"><span className="aq-scope-key aq-scope-key--in" aria-hidden="true" />Inclus dans chaque site</h3>
              <ul className="aq-scope-list">{s.included.map((t) => <li key={t}><span className="aq-win aq-win--on" aria-hidden="true" />{t}</li>)}</ul>
            </div>
            <div className="aq-scope-col">
              <h3 className="aq-scope-title"><span className="aq-scope-key aq-scope-key--opt" aria-hidden="true" />En option</h3>
              <ul className="aq-scope-list">{s.options.map((t) => <li key={t}><span className="aq-win" aria-hidden="true" /><span className="aq-scope-item">{t}<span className="aq-tag">chiffrée au devis</span></span></li>)}</ul>
            </div>
            <div className="aq-scope-col">
              <h3 className="aq-scope-title"><span className="aq-scope-key aq-scope-key--quote" aria-hidden="true" />Défini au devis</h3>
              <ul className="aq-scope-list">{s.quote.map((t) => <li key={t}><span className="aq-win aq-win--dash" aria-hidden="true" />{t}</li>)}</ul>
            </div>
          </div>
          <p className="aq-scope-note">{s.note}</p>
        </Container>
      </Section>

      <Section id="anatomie" tone="night" labelledBy="aq-anatomie-titre" className="aq-anatomy" ambient={<><Glow tone="blue" size={760} top="-200px" left="-260px" duration={24} /><Glow tone="amber" size={420} bottom="-180px" right="-120px" alt duration={28} /></>}>
        <Container>
          <ChapterHead id="aq-anatomie-titre" eyebrow={c.anatomy.eyebrow} title={c.anatomy.title} text={c.anatomy.text} kinetic />
          <Anatomy marks={c.anatomy.marks} caption={c.anatomy.caption} description={c.anatomy.description} />
        </Container>
      </Section>

      <Section id="realisations" tone="surface" labelledBy="aq-realisations-titre">
        <Container>
          <SectionHead id="aq-realisations-titre" eyebrow="Réalisations" title="Ce que je construis, sans référence inventée" text="Le site que vous parcourez et le tableau de suivi où arrivent ses demandes : un exemple réel de mon travail, montré avec des données fictives." />
          <Realisations headingLevel={3} />
        </Container>
      </Section>

      <Steps id="aq-deroulement-titre" {...c.steps} />
      <Objections id="aq-questions-titre" {...c.faq} />
      <Related id="aq-liens-titre" {...c.related} />
    </>
  );
}
