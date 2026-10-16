"use client";
/* Panel (lot 6) : Acquisition & SEO. Générateur inchangé : /diagnostic, ou /contact pour l'emailing,
   avec service et utm_campaign validé (/^[a-zA-Z0-9_-]{1,80}$/). Aucun appel serveur. La phrase
   d'hébergement vient d'admin-workspace.tsx (remplacée par vps/prepare.py). */
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, Link2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { serviceLabels } from "@/lib/services";
import { SITE_URL } from "@/lib/seo";

const SEO_DONE = ["Pages dédiées à chaque expertise", "Pages Asnières-sur-Seine, Île-de-France et France", "Titres, descriptions et URL canoniques", "Sitemap et liens entre les pages", "Données structurées d’entreprise et de services", "Administration exclue de l’indexation"];

export function Acquisition({ hostingNote }: { hostingNote: string }) {
  const [service, setService] = useState("refonte"), [campaign, setCampaign] = useState("refonte_idf_01"), [copied, setCopied] = useState(false), [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const valid = /^[a-zA-Z0-9_-]{1,80}$/.test(campaign);
  const link = `${SITE_URL}/${service === "emailing" ? "contact" : "diagnostic"}?${new URLSearchParams({ service, utm_campaign: campaign })}`;
  async function copy() {
    setError("");
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
      field.current?.select();
      setError("La copie automatique est indisponible. Le lien est sélectionné : copiez-le avec Ctrl + C (ou ⌘ + C).");
    }
  }
  return (
    <div className="pn-screen">
      <header className="pn-head">
        <div className="pn-head-text">
          <p className="pn-eyebrow">Acquisition & SEO</p>
          <h1 className="pn-title">Préparez votre acquisition.</h1>
          <p className="pn-lead">Un lien identifié pour chaque campagne, et les priorités de référencement à portée de main.</p>
        </div>
      </header>

      <section className="pn-card pn-builder" aria-labelledby="pn-builder-title">
        <div className="pn-card-head">
          <span className="pn-icon-tile" aria-hidden="true"><Link2 size={22} /></span>
          <div>
            <h2 id="pn-builder-title" className="pn-h2">Un lien pour chaque campagne</h2>
            <p className="pn-muted">Utilisez-le dans votre email ou votre annonce. Le nom de campagne est enregistré si la personne envoie le formulaire.</p>
          </div>
        </div>
        <div className="pn-fields pn-fields--2">
          <div className="pn-field">
            <label htmlFor="link-service">Offre présentée</label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger id="link-service" className="pn-select"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(serviceLabels).map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="pn-field">
            <label htmlFor="link-campaign">Nom de campagne</label>
            <input id="link-campaign" className="pn-input" value={campaign} onChange={e => { setCampaign(e.target.value); setCopied(false); }} maxLength={80} aria-invalid={!valid} aria-describedby="link-campaign-help" placeholder="refonte_idf_01" spellCheck={false} autoCapitalize="none" />
            <small id="link-campaign-help" className={valid ? "pn-help" : "pn-help pn-help--error"}>{valid ? "Lettres, chiffres, tirets ou underscores (80 au plus)." : "Utilisez 1 à 80 lettres, chiffres, tirets ou underscores."}</small>
          </div>
        </div>
        <div className="pn-copy-row">
          <input ref={field} className="pn-input pn-input--mono" aria-label="Lien de campagne" readOnly value={valid ? link : ""} onFocus={e => e.currentTarget.select()} />
          <button type="button" className={`pn-btn ${copied ? "pn-btn--success" : "pn-btn--primary"}`} disabled={!valid} onClick={() => void copy()}>
            {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}{copied ? "Lien copié" : "Copier le lien"}
          </button>
        </div>
        <p className="pn-sr" role="status" aria-live="polite">{copied ? "Lien copié dans le presse-papiers." : ""}</p>
        {error ? <p className="pn-alert pn-alert--warning" role="alert">{error}</p> : null}
        <p className="pn-small">N’insérez aucune donnée personnelle dans le nom. Une navigation vers un autre parcours peut perdre ce code. Ce bouton prépare un lien ; il n’envoie aucun email.</p>
      </section>

      <div className="pn-grid-2">
        <section className="pn-card" aria-labelledby="pn-seo-title">
          <p className="pn-kicker">Intégré au site</p>
          <h2 id="pn-seo-title" className="pn-h2">Le socle de référencement</h2>
          <ul className="pn-checklist">{SEO_DONE.map(t => <li key={t}><span className="pn-lit" aria-hidden="true" />{t}</li>)}</ul>
          <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="pn-link">Ouvrir le sitemap <ArrowUpRight size={16} aria-hidden="true" /></a>
        </section>
        <section className="pn-card" aria-labelledby="pn-domain-title">
          <p className="pn-kicker">À raccorder pour aller plus loin</p>
          <h2 id="pn-domain-title" className="pn-h2">Votre domaine et Google</h2>
          <p>{hostingNote}</p>
          <p className="pn-muted">Les positions Google et les clics issus de la recherche ne sont pas connectés à cet espace. Search Console permettra de les observer après vérification du domaine.</p>
          <a href="https://search.google.com/search-console/about" target="_blank" rel="noreferrer" className="pn-btn pn-btn--ghost">Ouvrir Search Console <ArrowUpRight size={16} aria-hidden="true" /></a>
        </section>
      </div>

      <section className="pn-card pn-advice" aria-labelledby="pn-advice-title">
        <p className="pn-kicker">Pour améliorer la conversion</p>
        <h2 id="pn-advice-title" className="pn-h2">La preuve fait la différence.</h2>
        <p>Ajoutez vos réalisations autorisées, des exemples avant/après et des retours clients authentiques. Affinez votre message selon les demandes reçues et les objections rencontrées. Les statistiques aident à décider ; elles ne garantissent ni une position Google ni une vente.</p>
      </section>
    </div>
  );
}
