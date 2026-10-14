import { Container, Section, SectionHead } from "@/components/sx/section";
import { Glow } from "@/components/sx/ambient";
import { Realisations } from "@/components/sx/realisations";
import { refonte as r } from "@/lib/content/acquisition";
import { ChapterHead, Objections, Related, RichText, Steps } from "./shared";
import { BeforeAfter } from "./before-after";
/* Sections de /refonte-site-internet après le hero (serveur) : comparateur avant/après (moment
   signature, seul composant client), ce que je reprends avec la planche « URL conservée / redirection
   308 », ce que je change, déroulement, réalisations, objections, liens contextuels. */
export function RefonteSections() {
  const k = r.compare;
  return (
    <>
      <Section id="avant-apres" labelledBy="aq-avant-apres-titre" className="aq-compare">
        <Container>
          <ChapterHead id="aq-avant-apres-titre" eyebrow={k.eyebrow} title={k.title} text={k.text} />
          <BeforeAfter caption={k.caption} description={k.description} />
          <div className="aq-diff">
            <div className="aq-diff-col aq-diff-col--old">
              <h3 className="aq-diff-title">Avant : trois problèmes</h3>
              <ol className="aq-diff-list">{k.before.map((b, i) => <li key={b.title}><span className="aq-diff-num" aria-hidden="true">{i + 1}</span><span><strong>{b.title}</strong> {b.text}</span></li>)}</ol>
            </div>
            <div className="aq-diff-col aq-diff-col--new">
              <h3 className="aq-diff-title">Après : ce qui change</h3>
              <ul className="aq-diff-list">{k.after.map((a) => <li key={a.title}><span className="aq-win aq-win--on" aria-hidden="true" /><span><strong>{a.title}</strong> {a.text}</span></li>)}</ul>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="ce-que-je-reprends" tone="night" labelledBy="aq-reprends-titre" className="aq-keep" ambient={<><Glow tone="blue" size={720} top="-220px" right="-240px" duration={26} /><Glow tone="amber" size={380} bottom="-160px" left="-120px" alt duration={30} /></>}>
        <Container className="aq-keep-grid">
          <div>
            <ChapterHead id="aq-reprends-titre" eyebrow={r.keep.eyebrow} title={r.keep.title} kinetic />
            <p className="aq-head-text aq-keep-intro"><RichText parts={r.keep.text} /></p>
            <ol className="aq-keep-list">
              {r.keep.items.map((it, i) => (
                <li key={it.title}><span className="aq-keep-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><div><h3 className="aq-keep-title">{it.title}</h3><p>{it.text}</p></div></li>
              ))}
            </ol>
          </div>
          <figure className="aq-urls sx-sheen" data-sx-ambient="">
            <figcaption className="aq-urls-head"><span className="aq-urls-title">{r.urls.title}</span><span className="aq-urls-label">{r.urls.caption}</span><span className="sr-only">{r.urls.description}</span></figcaption>
            <div className="aq-urls-legend" aria-hidden="true"><span>Ancienne adresse</span><span>Nouvelle adresse</span></div>
            <ul className="aq-urls-list">
              {r.urls.rows.map((u) => (
                <li className={u.kind === "308" ? "aq-url aq-url--moved" : "aq-url"} key={u.from}>
                  <code className="aq-url-from">{u.from}</code>
                  <span className="aq-url-arrow">{u.kind === "308" ? <><span aria-hidden="true">→</span> <b>308</b><span className="sr-only"> redirection permanente vers</span></> : <><b>=</b><span className="sr-only"> adresse conservée :</span></>}</span>
                  <code className="aq-url-to">{u.to}</code>
                  <span className={u.kind === "308" ? "aq-url-tag aq-url-tag--moved" : "aq-url-tag"} aria-hidden="true">{u.kind === "308" ? "Redirigée" : "Conservée"}</span>
                </li>
              ))}
            </ul>
          </figure>
        </Container>
      </Section>

      <Section id="ce-que-je-change" tone="surface" labelledBy="aq-change-titre">
        <Container>
          <ChapterHead id="aq-change-titre" eyebrow={r.change.eyebrow} title={r.change.title} text={r.change.text} />
          <ul className="aq-change">
            {r.change.items.map((it, i) => (
              <li className="aq-change-card" key={it.title} data-idx={String(i + 1).padStart(2, "0")}>
                <span className="aq-change-win" aria-hidden="true"><i /><i /><i /><i /></span>
                <h3 className="aq-change-title">{it.title}</h3>
                <p>{it.text}</p>
                
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Steps id="aq-deroulement-titre" {...r.steps} />

      <Section id="realisations" tone="surface" labelledBy="aq-realisations-titre">
        <Container>
          <SectionHead id="aq-realisations-titre" eyebrow="Réalisations" title="Ce que je construis, sans référence inventée" text="Le site que vous parcourez et le tableau de suivi où arrivent ses demandes : un exemple réel de mon travail, montré avec des données fictives." />
          <Realisations headingLevel={3} />
        </Container>
      </Section>

      <Objections id="aq-questions-titre" {...r.faq} />
      <Related id="aq-liens-titre" {...r.related} />
    </>
  );
}
