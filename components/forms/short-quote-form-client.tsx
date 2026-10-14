"use client";
/* Formulaire court (lot 5) : type de projet, nom, activité, email OU téléphone, site actuel facultatif.
   Réellement connecté à POST /api/devis : le succès n'apparaît qu'après un 201 portant une référence
   SF-XXXXXXXX, donc après l'écriture en base. Champs natifs uniquement (ni Radix Select ni Radix Checkbox).
   Validation identique à celle du serveur (lib/phone.ts, lib/project-options.ts). Une seule instance par
   page : les ids project-* sont uniques. */
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Phone, Mail, AlertCircle, LockKeyhole } from "lucide-react";
import { postJson, frenchError } from "@/lib/fetch-json";
import { normalizePhone } from "@/lib/phone";
import { cleanCampaign, projectKinds, otherNeeds, extraNeeds, completeWebsiteUrl, isWebsiteUrl, fieldMessages, CONTACT_REQUIRED, type ProjectKind, type OtherNeed } from "@/lib/project-options";
import { SITE_IDENTITY, telHref, mailHref } from "@/lib/site-identity";

export type ShortQuoteFormProps = {
  defaultService?: "creation" | "refonte" | "autre";
  otherService?: OtherNeed;
  campaign?: string;
  variant?: "inline" | "page";
  headingLevel?: 2 | 3;
};
type FieldKey = "service" | "other" | "name" | "activity" | "email" | "phone" | "websiteUrl" | "requestedServices" | "message" | "consent";
type Errors = Partial<Record<FieldKey, string>>;
/* Ordre du DOM : le focus va au premier champ en erreur dans cet ordre. */
const ORDER: FieldKey[] = ["service", "other", "name", "activity", "email", "phone", "websiteUrl", "requestedServices", "message", "consent"];
const IDS: Record<FieldKey, string> = { service: "project-service-creation", other: "project-other", name: "project-name", activity: "project-activity", email: "project-email", phone: "project-phone", websiteUrl: "project-website-url", requestedServices: "project-extra-0", message: "project-message", consent: "project-consent" };
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/;
const REFERENCE_RE = /^SF-[0-9A-F]{8}$/;
const HEADINGS: Record<ProjectKind, { title: string; text: string }> = {
  creation: { title: "Demandez votre devis", text: "Création de site professionnel : quatre informations suffisent pour que je vous recontacte." },
  refonte: { title: "Présentez votre projet de refonte", text: "Indiquez votre site actuel : je pars de ce qui fonctionne déjà, puis je vous recontacte." },
  autre: { title: "Parlez-moi de votre besoin", text: "Quatre informations suffisent pour que je vous recontacte et que l’on fasse le point." },
};

type Values = { kind: ProjectKind; other: OtherNeed; name: string; activity: string; email: string; phone: string; websiteUrl: string; message: string; extras: string[]; consent: boolean; trap: string };

function validate(v: Values): Errors {
  const e: Errors = {};
  const name = v.name.trim(), activity = v.activity.trim(), email = v.email.trim(), phone = v.phone.trim(), site = v.websiteUrl.trim();
  if (name.length < 2 || name.length > 100) e.name = fieldMessages.name;
  if (activity.length < 2) e.activity = "Indiquez votre activité, par exemple plombier ou restaurant.";
  else if (activity.length > 120) e.activity = fieldMessages.activity;
  if (email && (email.length > 254 || !EMAIL_RE.test(email))) e.email = fieldMessages.email;
  if (phone && (phone.length > 30 || !normalizePhone(phone))) e.phone = fieldMessages.phone;
  if (!email && !phone) e.email = CONTACT_REQUIRED;
  if (site && !isWebsiteUrl(completeWebsiteUrl(site))) e.websiteUrl = fieldMessages.websiteUrl;
  if (v.message.trim().length > 3000) e.message = fieldMessages.message;
  if (!v.consent) e.consent = fieldMessages.consent;
  return e;
}

/* Campagne : celle fournie par la page, sinon lue dans l'adresse au moment de l'envoi (les pages statiques
   restent statiques, sans effet ni useSearchParams). */
function currentCampaign(campaign?: string) {
  if (campaign) return cleanCampaign(campaign);
  try { return cleanCampaign(new URLSearchParams(window.location.search).get("utm_campaign")); } catch { return "site"; }
}

export function ShortQuoteFormClient({ defaultService, otherService, campaign, variant = "inline", headingLevel = 2 }: ShortQuoteFormProps) {
  const initialKind: ProjectKind = defaultService ?? (otherService ? "autre" : "creation");
  const [v, setV] = useState<Values>({ kind: initialKind, other: otherService ?? "conseil", name: "", activity: "", email: "", phone: "", websiteUrl: "", message: "", extras: [], consent: false, trap: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [general, setGeneral] = useState("");
  const [summary, setSummary] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const sending = useRef(false);
  const uid = useId();
  const headingId = `project-form-title${uid.replace(/:/g, "")}`;

  useEffect(() => { if (done) successRef.current?.focus(); }, [done]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setV(prev => ({ ...prev, [key]: value }));
    const field = (key === "kind" ? "service" : key === "extras" ? "requestedServices" : key) as FieldKey;
    if (errors[field] || (field === "phone" && errors.email === CONTACT_REQUIRED)) setErrors(prev => { const next = { ...prev }; delete next[field]; if (field === "phone" && next.email === CONTACT_REQUIRED) delete next.email; return next; });
  };

  function showErrors(next: Errors) {
    setErrors(next);
    const keys = ORDER.filter(k => next[k]);
    setSummary(keys.length ? (keys.length === 1 ? "1 champ à corriger." : `${keys.length} champs à corriger.`) : "");
    const first = keys[0];
    if (!first) return;
    if (first === "message") setMessageOpen(true);
    if (first === "requestedServices") setExtrasOpen(true);
    requestAnimationFrame(() => {
      const el = document.getElementById(first === "service" ? `project-service-${v.kind}` : IDS[first]);
      el?.focus();
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    setGeneral("");
    const local = validate(v);
    if (Object.keys(local).length) { showErrors(local); return; }
    setErrors({}); setSummary("");
    const service = v.kind === "autre" ? v.other : v.kind;
    /* Charge utile construite explicitement : chaînes trimées, "" pour un champ vide, jamais null. */
    const payload = {
      service,
      name: v.name.trim(),
      activity: v.activity.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      websiteUrl: v.websiteUrl.trim(),
      message: v.message.trim(),
      requestedServices: v.extras.filter(s => s !== service),
      consent: true as const,
      website: v.trap,
      campaign: currentCampaign(campaign),
    };
    sending.current = true; setPending(true);
    const result = await postJson<{ reference?: unknown }>("/api/devis", payload);
    sending.current = false; setPending(false);
    const reference = result.ok && result.data && typeof result.data.reference === "string" ? result.data.reference : "";
    if (result.ok && REFERENCE_RE.test(reference)) {
      setDone({ reference });
      try { document.documentElement.setAttribute("data-sx-signal-on", ""); } catch { /* sans effet */ }
      window.dispatchEvent(new CustomEvent("smartfixx-lead", { detail: { reference, service } }));
      return;
    }
    if (result.ok) { setGeneral(frenchError("invalid-json", result.status)); return; }
    const data = result.data as { fields?: Record<string, string> } | null;
    if (result.status === 400 && data && data.fields && typeof data.fields === "object") {
      const next: Errors = {};
      for (const [key, message] of Object.entries(data.fields)) {
        const field = (key === "service" ? "service" : key) as FieldKey;
        if (ORDER.includes(field) && typeof message === "string") next[field] = message;
      }
      if (Object.keys(next).length) { showErrors(next); return; }
    }
    setGeneral(frenchError(result.kind, result.status, result.data));
  }

  const H = (headingLevel === 3 ? "h3" : "h2") as "h2" | "h3";
  const cls = `fm fm--${variant}`;

  if (done) {
    return (
      <div className={`${cls} fm-success`} role="status">
        <svg className="fm-check" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <rect className="fm-check-window" x="6" y="6" width="52" height="52" rx="12" />
          <path className="fm-check-mark" d="M20 33.5 28.5 42 45 23" pathLength={1} />
        </svg>
        <H ref={successRef} tabIndex={-1} className="fm-success-title">J’ai bien reçu votre demande.</H>
        <p className="fm-success-ref">Référence : <span className="fm-ref">{done.reference}</span></p>
        <p className="fm-success-text">Je vous recontacte par téléphone ou par email.</p>
        <p className="fm-success-text">Une précision à ajouter ? Appelez-moi directement :</p>
        <div className="fm-success-actions">
          <a className="fm-contact" href={telHref}><Phone aria-hidden="true" /> <span className="fm-tabular">{SITE_IDENTITY.PHONE_DISPLAY}</span></a>
          <a className="fm-contact" href={mailHref}><Mail aria-hidden="true" /> <span>{SITE_IDENTITY.EMAIL}</span></a>
        </div>
      </div>
    );
  }

  const heading = HEADINGS[initialKind];
  const describe = (key: FieldKey, hint?: string) => [hint, errors[key] ? `${IDS[key]}-error` : ""].filter(Boolean).join(" ") || undefined;
  const err = (key: FieldKey): ReactNode => errors[key] ? <p className="fm-error" id={`${IDS[key]}-error`}><AlertCircle aria-hidden="true" />{errors[key]}</p> : null;
  const sitePreview = v.websiteUrl.trim() && !errors.websiteUrl ? completeWebsiteUrl(v.websiteUrl) : "";
  const extraChoices = extraNeeds.filter(n => n.id !== (v.kind === "autre" ? v.other : v.kind));

  return (
    <form ref={formRef} className={`${cls} project-form`} onSubmit={submit} noValidate aria-labelledby={headingId} aria-busy={pending || undefined}>
      <div className="fm-head">
        <H id={headingId} className="fm-title">{heading.title}</H>
        <p className="fm-intro">{heading.text}</p>
      </div>

      <fieldset className="fm-group">
        <legend className="fm-label">Votre projet</legend>
        <div className="fm-kinds">
          {projectKinds.map(k => (
            <label key={k.id} className="fm-kind" htmlFor={`project-service-${k.id}`}>
              <input type="radio" id={`project-service-${k.id}`} name="service" value={k.id} checked={v.kind === k.id} onChange={() => set("kind", k.id)} />
              <span className="fm-kind-window" aria-hidden="true" />
              <span className="fm-kind-text"><strong>{k.label}</strong><small>{k.hint}</small></span>
            </label>
          ))}
        </div>
        {err("service")}
        {v.kind === "autre" ? (
          <div className="fm-field fm-field--other">
            <label className="fm-label" htmlFor="project-other">Quel besoin ?</label>
            <select id="project-other" name="otherService" className="fm-input fm-select" value={v.other} onChange={e => set("other", e.target.value as OtherNeed)}>
              {otherNeeds.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </div>
        ) : null}
        <Link className="fm-aside-link" href="/contact?service=emailing" onClick={e => { const c = currentCampaign(campaign); if (c !== "site") { e.preventDefault(); window.location.assign(`/contact?service=emailing&utm_campaign=${encodeURIComponent(c)}`); } }}>Prospection emailing : configurer une campagne</Link>
      </fieldset>

      <div className="fm-field">
        <label className="fm-label" htmlFor="project-name">Votre nom</label>
        <input id="project-name" name="name" className="fm-input" autoComplete="name" maxLength={100} aria-required="true" aria-invalid={errors.name ? true : undefined} aria-describedby={describe("name")} value={v.name} onChange={e => set("name", e.target.value)} />
        {err("name")}
      </div>

      <div className="fm-field">
        <label className="fm-label" htmlFor="project-activity">Votre activité</label>
        <input id="project-activity" name="activity" className="fm-input" maxLength={120} aria-required="true" aria-invalid={errors.activity ? true : undefined} aria-describedby={describe("activity", "project-activity-hint")} value={v.activity} onChange={e => set("activity", e.target.value)} />
        <p className="fm-hint" id="project-activity-hint">Par exemple : plombier, restaurant, cabinet d’avocats.</p>
        {err("activity")}
      </div>

      <fieldset className="fm-group fm-reach">
        <legend className="fm-label">Comment vous recontacter ? <span className="fm-legend-note">L’un des deux suffit</span></legend>
        <div className="fm-reach-grid">
          <div className="fm-field">
            <label className="fm-label fm-label--sub" htmlFor="project-email">Email</label>
            <input id="project-email" type="email" name="email" className="fm-input" autoComplete="email" maxLength={254} aria-invalid={errors.email ? true : undefined} aria-describedby={describe("email")} value={v.email} onChange={e => set("email", e.target.value)} />
            {err("email")}
          </div>
          <span className="fm-or" aria-hidden="true">ou</span>
          <div className="fm-field">
            <label className="fm-label fm-label--sub" htmlFor="project-phone">Téléphone</label>
            <input id="project-phone" type="tel" inputMode="tel" name="phone" className="fm-input fm-tabular" autoComplete="tel" maxLength={30} aria-invalid={errors.phone ? true : undefined} aria-describedby={describe("phone")} value={v.phone} onChange={e => set("phone", e.target.value)} />
            {err("phone")}
          </div>
        </div>
      </fieldset>

      <div className={`fm-field${v.kind === "refonte" ? " fm-field--featured" : ""}`}>
        <label className="fm-label" htmlFor="project-website-url">{v.kind === "refonte" ? "Votre site actuel" : "Site actuel"} <span className="fm-optional">(facultatif)</span></label>
        <input id="project-website-url" type="text" inputMode="url" name="websiteUrl" className="fm-input" autoComplete="url" autoCapitalize="none" spellCheck={false} maxLength={500} placeholder={"ex.\u202F: monsite.fr"}aria-invalid={errors.websiteUrl ? true : undefined} aria-describedby={describe("websiteUrl", "project-website-url-hint")} value={v.websiteUrl} onChange={e => set("websiteUrl", e.target.value)} />
        <p className="fm-hint" id="project-website-url-hint">{sitePreview ? <>Adresse enregistrée : <span className="fm-url">{sitePreview}</span></> : v.kind === "refonte" ? "Je regarde ce qui fonctionne déjà avant de proposer quoi que ce soit." : "Si vous avez déjà un site, indiquez son adresse."}</p>
        {err("websiteUrl")}
      </div>

      <details className="fm-more" open={extrasOpen} onToggle={e => setExtrasOpen((e.currentTarget as HTMLDetailsElement).open)}>
        <summary>Votre projet touche aussi… <span className="fm-optional">(facultatif)</span></summary>
        <fieldset className="fm-group fm-extras">
          <legend className="sr-only">Votre projet touche aussi</legend>
          {extraChoices.map((n, i) => (
            <label key={n.id} className="fm-check-row" htmlFor={`project-extra-${i}`}>
              <input type="checkbox" id={`project-extra-${i}`} name="requestedServices" value={n.id} checked={v.extras.includes(n.id)} onChange={e => set("extras", e.target.checked ? [...new Set([...v.extras, n.id])] : v.extras.filter(s => s !== n.id))} />
              <span>{n.label}</span>
            </label>
          ))}
          {err("requestedServices")}
        </fieldset>
      </details>

      <details className="fm-more" open={messageOpen} onToggle={e => setMessageOpen((e.currentTarget as HTMLDetailsElement).open)}>
        <summary>Ajouter un message <span className="fm-optional">(facultatif)</span></summary>
        <div className="fm-field">
          <label className="fm-label fm-label--sub" htmlFor="project-message">Votre message</label>
          <textarea id="project-message" name="message" className="fm-input fm-textarea" rows={4} maxLength={3000} aria-invalid={errors.message ? true : undefined} aria-describedby={describe("message", "project-message-count")} value={v.message} onChange={e => set("message", e.target.value)} />
          <p className="fm-hint fm-count" id="project-message-count"><span className="fm-tabular">{v.message.length}</span> / 3 000 caractères. Pas de mot de passe ni de donnée confidentielle.</p>
          {err("message")}
        </div>
      </details>

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="project-trap">Ne pas remplir</label>
        <input id="project-trap" name="website" tabIndex={-1} autoComplete="off" value={v.trap} onChange={e => setV(prev => ({ ...prev, trap: e.target.value }))} />
      </div>

      <div className="fm-field fm-consent">
        <div className="fm-check-row fm-check-row--consent">
          <input type="checkbox" id="project-consent" name="consent" aria-required="true" aria-invalid={errors.consent ? true : undefined} aria-describedby={describe("consent")} checked={v.consent} onChange={e => set("consent", e.target.checked)} />
          <label htmlFor="project-consent">J’accepte que Mohamed (SmartFixx) utilise ces informations pour me recontacter au sujet de ma demande.</label>
        </div>
        <Link className="fm-aside-link" href="/confidentialite">Comment mes données sont utilisées</Link>
        {err("consent")}
      </div>

      <div className="fm-live" aria-live="polite" role="status">{summary ? <p className="fm-summary"><AlertCircle aria-hidden="true" />{summary}</p> : null}</div>
      {general ? <div className="fm-general" role="alert"><AlertCircle aria-hidden="true" /><p>{general} Vos informations restent dans le formulaire.</p></div> : null}

      <button type="submit" className="sx-btn sx-btn--cta sx-btn--lg fm-submit" disabled={pending} aria-busy={pending || undefined}>
        {pending ? <><span className="fm-spinner" aria-hidden="true" /><span>Enregistrement…</span></> : <><span>Envoyer ma demande</span><ArrowRight className="sx-btn-icon" aria-hidden="true" /></>}
      </button>
      <p className="fm-foot"><LockKeyhole aria-hidden="true" /><span>Votre demande est enregistrée dans mon espace de suivi, puis je vous recontacte. Ou appelez-moi au <a href={telHref} className="fm-tabular">{SITE_IDENTITY.PHONE_DISPLAY}</a>.</span></p>
    </form>
  );
}
