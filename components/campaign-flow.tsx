"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, LoaderCircle, Mail, PencilLine } from "lucide-react";
import CampaignLink from "@/components/campaign-link";
import { plans, volumes, formatNumber, type PlanId } from "@/lib/offers";
import { cleanCampaign } from "@/lib/project-options";
import { campaignHref, type CampaignConfig } from "@/lib/campaign-config";
import { postJson, frenchError } from "@/lib/fetch-json";
/* Parcours emailing (lot 8) : formules sur /tarifs (kind="pricing") et demande de devis sur
   /contact?service=emailing (kind="contact"). Styles : components/secondary/secondary.css (sc-cf-…),
   chargée par les pages du lot (composants serveur).
   - AUCUN montant affiché : ni quotePrice côté client, ni formatEuro, ni « HT », ni badge, ni
     caractéristique de lib/offers.ts. Le prix reste calculé par le serveur (/api/devis) comme estimation
     interne visible dans le panel. Seuls s'affichent le nom de la formule, le volume, l'audience et la source.
   - Offres non confirmées masquées : l'audience B2C et la source « data incluse » ne sont plus proposées.
     Un ancien lien qui les porte reste accepté (la charge utile les transmet telles quelles), et l'écran
     l'annonce honnêtement comme « à préciser au devis ».
   - Charge utile STRICTEMENT inchangée : name, company, email, phone, message, website, consent, audience,
     source, volume, plan, service "emailing", campaign.
   - Envoi par lib/fetch-json : jamais d'exception, messages français ; succès UNIQUEMENT sur un 201 portant
     une référence SF-XXXXXXXX (la demande est alors en base, visible dans le panel). En cas d'échec, la
     saisie reste dans le formulaire. Contrôles natifs (select, case à cocher) : ni Radix ni JS superflu. */
const REFERENCE_RE = /^SF-[0-9A-F]{8}$/;
const audienceLabel = (c: CampaignConfig) => (c.audience === "b2b" ? "Professionnels (B2B)" : "À préciser au devis");
const sourceLabel = (c: CampaignConfig) => (c.source === "client" ? "Votre fichier de contacts" : "À étudier ensemble au devis");

/* Tour de fenêtres d'un volume : plus le volume est grand, plus la tour est haute et allumée (décor). */
const TOWER: Record<number, number> = { 5000: 2, 10000: 4, 25000: 7, 50000: 10 };
function Tower({ volume }: { volume: number }) {
  const n = TOWER[volume] ?? 4;
  return <span className="sc-vol-tower" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < n ? "sc-vol-w is-on" : "sc-vol-w"} />)}</span>;
}

export function CampaignFlow({ kind, initial }: { kind: "pricing" | "contact"; initial: CampaignConfig }) {
  return kind === "pricing" ? <Pricing initial={initial} /> : <ContactForm initial={initial} />;
}

function Pricing({ initial }: { initial: CampaignConfig }) {
  const [volume, setVolume] = useState(initial.volume);
  const config: CampaignConfig = { ...initial, volume };
  return (
    <div className="sc-cf sc-cf--pricing">
      <fieldset className="sc-vol">
        <legend className="sc-cf-legend"><span className="sc-cf-step" aria-hidden="true">1</span>Volume d’envois</legend>
        <p className="sc-cf-hint">Le volume compte tous les emails envoyés, relances comprises.</p>
        <div className="sc-vol-grid">
          {volumes.map((v) => (
            <label className="sc-vol-opt" key={v}>
              <input className="sc-vol-input" type="radio" name="volume" value={v} checked={volume === v} onChange={() => setVolume(v)} />
              <span className="sc-vol-box">
                <Tower volume={v} />
                <span className="sc-vol-num sx-tabular">{formatNumber(v)}</span>
                <span className="sc-vol-unit">envois</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="sc-cf-plans-head">
        <p className="sc-cf-legend"><span className="sc-cf-step" aria-hidden="true">2</span>Formule</p>
        <p className="sc-cf-hint" aria-live="polite">{formatNumber(volume)} envois · {audienceLabel(config)} · {sourceLabel(config)}</p>
      </div>
      <ul className="sc-plans" role="list">
        {plans.map((p, i) => (
          <li className="sc-plan sc-lit" key={p.id}>
            <span className="sc-plan-level" aria-hidden="true">{[0, 1, 2].map((k) => <i key={k} className={k <= i ? "sc-w sc-w--signal" : "sc-w"} />)}</span>
            <h3 className="sc-plan-name">{p.name}</h3>
            <dl className="sc-plan-facts">
              <div><dt>Volume</dt><dd className="sx-tabular">{formatNumber(volume)} envois</dd></div>
              <div><dt>Audience</dt><dd>{audienceLabel(config)}</dd></div>
              <div><dt>Contacts</dt><dd>{sourceLabel(config)}</dd></div>
            </dl>
            <p className="sc-plan-note">Contenu et prix détaillés dans le devis.</p>
            <a className="sx-btn sx-btn--primary sc-plan-btn" href={campaignHref("/contact", { ...config, plan: p.id })} data-analytics="contact" data-service="emailing"><span>Demander un devis {p.name}</span><ArrowRight className="sx-btn-icon" aria-hidden="true" /></a>
          </li>
        ))}
      </ul>
      <p className="sc-cf-more">Plus de 50 000 envois ou un besoin particulier&#8239;? <a className="sc-textlink" href={campaignHref("/contact", { ...config, plan: "performance" })} data-analytics="contact" data-service="emailing">Décrivez-le-moi</a></p>
    </div>
  );
}

type Field = "name" | "company" | "email" | "message" | "consent";
const FIELD_ORDER: Field[] = ["name", "company", "email", "message", "consent"];
function validate(data: FormData, consent: boolean): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {};
  const v = (k: string) => String(data.get(k) ?? "").trim();
  if (v("name").length < 2) e.name = "Indiquez votre nom (2 caractères au moins).";
  if (v("company").length < 2) e.company = "Indiquez le nom de votre entreprise.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) e.email = "Indiquez une adresse email valide, par exemple vous@entreprise.fr.";
  if (v("message").length < 15) e.message = "Décrivez votre activité et votre objectif en une ou deux phrases (15 caractères au moins).";
  if (!consent) e.consent = "Cochez la case pour que je puisse vous recontacter au sujet de cette demande.";
  return e;
}

function ContactForm({ initial }: { initial: CampaignConfig }) {
  const [plan, setPlan] = useState<PlanId>(initial.plan);
  const [volume, setVolume] = useState(initial.volume);
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [general, setGeneral] = useState("");
  const [reference, setReference] = useState("");
  const sending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const config: CampaignConfig = { ...initial, plan, volume };
  useEffect(() => { if (reference) doneRef.current?.focus(); }, [reference]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const data = new FormData(event.currentTarget);
    const local = validate(data, consent);
    setGeneral("");
    if (Object.keys(local).length) {
      setErrors(local);
      const first = FIELD_ORDER.find((f) => local[f]);
      formRef.current?.querySelector<HTMLElement>(`#cf-${first}`)?.focus();
      return;
    }
    setErrors({});
    const text = (k: string) => String(data.get(k) ?? "");
    sending.current = true; setPending(true);
    const result = await postJson<{ reference?: unknown }>("/api/devis", { name: text("name"), company: text("company"), email: text("email"), phone: text("phone"), message: text("message"), website: text("website"), consent, audience: initial.audience, source: initial.source, volume, plan, service: "emailing", campaign: cleanCampaign(initial.campaign) });
    sending.current = false; setPending(false);
    const ref = result.ok && result.data && typeof result.data.reference === "string" ? result.data.reference : "";
    if (result.ok && result.status === 201 && REFERENCE_RE.test(ref)) {
      setReference(ref);
      try { document.documentElement.setAttribute("data-sx-signal-on", ""); } catch { /* sans effet */ }
      window.dispatchEvent(new CustomEvent("smartfixx-lead", { detail: { reference: ref, service: "emailing" } }));
      return;
    }
    setGeneral(result.ok ? frenchError("invalid-json", result.status) : frenchError(result.kind, result.status, result.data));
  }

  const describedBy = (f: Field, extra?: string) => [errors[f] ? `cf-${f}-erreur` : "", extra ?? ""].filter(Boolean).join(" ") || undefined;
  const err = (f: Field) => (errors[f] ? <p className="sc-cf-error" id={`cf-${f}-erreur`}>{errors[f]}</p> : null);

  if (reference) return (
    <div className="sc-cf sc-cf--contact sc-cf-done" role="status">
      <span className="sc-cf-done-win" aria-hidden="true"><Check /></span>
      <h2 className="sc-cf-title" ref={doneRef} tabIndex={-1}>Votre demande est enregistrée.</h2>
      <p>Elle porte la référence <strong className="sx-ref">{reference}</strong>. Je la lis moi-même et je reviens vers vous pour en parler.</p>
      <p className="sc-cf-muted">Aucun paiement ni envoi de campagne n’a été déclenché.</p>
      <p className="sc-cf-sign">Mohamed — SmartFixx</p>
      <button type="button" className="sx-btn sx-btn--ghost" onClick={() => { setReference(""); setConsent(false); }}><span>Préparer une autre demande</span></button>
    </div>
  );

  return (
    <div className="sc-cf sc-cf--contact contact-form-card">
      <form ref={formRef} className="sc-cf-form" onSubmit={submit} noValidate aria-labelledby="cf-titre">
        <div className="sc-cf-head">
          <h2 className="sc-cf-title" id="cf-titre">Votre campagne</h2>
          <p className="sc-cf-muted">Je lis chaque demande moi-même. Les champs marqués * sont obligatoires.</p>
        </div>
        <div className="sc-cf-ticket">
          <div className="sc-cf-field">
            <label htmlFor="cf-plan">Formule</label>
            <select id="cf-plan" value={plan} onChange={(e) => setPlan(e.target.value as PlanId)}>{plans.map((p) => <option value={p.id} key={p.id}>{p.name}</option>)}</select>
          </div>
          <div className="sc-cf-field">
            <label htmlFor="cf-volume">Volume d’envois</label>
            <select id="cf-volume" value={volume} onChange={(e) => setVolume(Number(e.target.value))}>{volumes.map((v) => <option value={v} key={v}>{formatNumber(v)} envois</option>)}</select>
          </div>
          <p className="sc-cf-ticket-facts"><span>Audience&#8239;: {audienceLabel(config)}</span><span>Contacts&#8239;: {sourceLabel(config)}</span></p>
          <a className="sc-textlink sc-cf-edit" href={campaignHref("/tarifs", config)}><PencilLine aria-hidden="true" />Voir les formules</a>
        </div>
        <div className="sc-cf-grid">
          <div className="sc-cf-field">
            <label htmlFor="cf-name">Votre nom *</label>
            <input id="cf-name" name="name" autoComplete="name" maxLength={100} aria-invalid={errors.name ? true : undefined} aria-describedby={describedBy("name")} />
            {err("name")}
          </div>
          <div className="sc-cf-field">
            <label htmlFor="cf-company">Votre entreprise *</label>
            <input id="cf-company" name="company" autoComplete="organization" maxLength={150} aria-invalid={errors.company ? true : undefined} aria-describedby={describedBy("company")} />
            {err("company")}
          </div>
          <div className="sc-cf-field">
            <label htmlFor="cf-email">Email professionnel *</label>
            <input id="cf-email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={254} aria-invalid={errors.email ? true : undefined} aria-describedby={describedBy("email")} />
            {err("email")}
          </div>
          <div className="sc-cf-field">
            <label htmlFor="cf-phone">Téléphone <span className="sc-cf-opt">(facultatif)</span></label>
            <input id="cf-phone" name="phone" type="tel" autoComplete="tel" maxLength={30} />
          </div>
        </div>
        <div className="sc-cf-field">
          <label htmlFor="cf-message">Votre activité et votre objectif *</label>
          <textarea id="cf-message" name="message" rows={4} maxLength={3000} aria-invalid={errors.message ? true : undefined} aria-describedby={describedBy("message", "cf-message-aide")} />
          <p className="sc-cf-help" id="cf-message-aide">Ce que vous proposez, qui vous souhaitez toucher, dans quelle zone, et d’où viennent vos contacts.</p>
          {err("message")}
        </div>
        <div className="honeypot" aria-hidden="true"><label htmlFor="cf-website">Ne pas remplir</label><input id="cf-website" name="website" tabIndex={-1} autoComplete="off" /></div>
        <div className="sc-cf-consent">
          <input id="cf-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={errors.consent ? true : undefined} aria-describedby={describedBy("consent")} />
          <label htmlFor="cf-consent">J’accepte d’être recontacté au sujet de cette demande. <CampaignLink href="/confidentialite">Comment j’utilise vos données</CampaignLink>.</label>
        </div>
        {err("consent")}
        {general ? <p className="sc-cf-alert" role="alert">{general} Vos informations restent dans le formulaire.</p> : null}
        <button type="submit" className="sx-btn sx-btn--cta sx-btn--lg sc-cf-submit" disabled={pending} aria-busy={pending || undefined}>
          {pending ? <><LoaderCircle className="sx-btn-icon spin" aria-hidden="true" /><span>Enregistrement…</span></> : <><span>Envoyer ma demande</span><ArrowRight className="sx-btn-icon" aria-hidden="true" /></>}
        </button>
        <p className="sc-cf-foot"><Mail aria-hidden="true" />Aucun paiement ni envoi de campagne n’est déclenché par cette demande. <span className="sc-cf-sign">Mohamed — SmartFixx</span></p>
      </form>
    </div>
  );
}
