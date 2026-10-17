"use client";
/* Panel — onglet Demandes (lot 5). Présentation seule : appels et corps inchangés (GET /api/admin/requests
   avec q, status, service, page ; GET du détail ; PATCH {status, notes, revision} avec contrôle de révision
   et garde window.confirm des modifications non enregistrées). Client défensif lib/fetch-json : session perdue
   (401, ou 403 « Accès administrateur requis. ») → /admin/login?retour=requests, sauf si le volet contient des
   modifications non enregistrées : la note reste alors à l'écran, une copie est gardée dans l'onglet et la
   reconnexion s'ouvre dans un nouvel onglet. Un 403 « Origine non autorisée. » n'est pas une session perdue :
   son message est affiché. Styles rq- dans app/admin/admin.css, jetons --sx- uniquement. */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, RefreshCw, Phone, Mail, Copy, Check, X, ExternalLink, ChevronLeft, ChevronRight, ShieldCheck, Save, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./ui/sheet";
import { StateLoading, StateEmpty, StateError } from "./sx/states";
import { statuses, type RequestStatus } from "@/lib/admin-policy";
import { serviceLabels, type ServiceId } from "@/lib/services";
import { budgets, timelines } from "@/lib/legacy-request-labels";
import { formatEuro, formatNumber, plans } from "@/lib/offers";
import { getJson, postJson, frenchError, type JsonResult } from "@/lib/fetch-json";
import { displayPhone } from "@/lib/phone";

type Quote = { service: ServiceId; city: string; budget: keyof typeof budgets; timeline: keyof typeof timelines; campaign: string; website_url: string; id: string; reference: string; created_at: number; name: string; company: string; email: string; phone?: string | null; activity?: string; message?: string; audience: string; data_source: string; volume: number; plan: string; quoted_amount_euros: number | null; status: RequestStatus; notes?: string; revision?: number; updated_at?: number; contact_consent?: number };
type QuoteEvent = { created_at: number; from_status: RequestStatus; to_status: RequestStatus; notes_changed: number };
type Pending = { oldestId: string; oldestReference: string; oldestAt: number; stale: number } | null;
type Listing = { requests: Quote[]; total: number; counts: { status: RequestStatus; total: number }[]; page: number; pageSize: number; pending?: Pending };

/* Libellés des statuts (API inchangée : new, in_progress, quoted, won, archived), au féminin : « une demande ». */
const STATUS: Record<RequestStatus, { label: string; filter: string; chip: string; pill: string }> = {
  new: { label: "Nouvelle", filter: "Nouvelles", chip: "rq-status rq-status--signal", pill: "rq-pill rq-pill--signal" },
  in_progress: { label: "En cours", filter: "En cours", chip: "rq-status rq-status--accent", pill: "rq-pill rq-pill--accent" },
  quoted: { label: "Devis envoyé", filter: "Devis envoyé", chip: "rq-status rq-status--violet", pill: "rq-pill rq-pill--violet" },
  won: { label: "Gagnée", filter: "Gagnées", chip: "rq-status rq-status--success", pill: "rq-pill rq-pill--success" },
  archived: { label: "Archivée", filter: "Archivées", chip: "rq-status rq-status--neutral", pill: "rq-pill" },
};
const NEEDS: { id: string; label: string }[] = [{ id: "all", label: "Tous les besoins" }, ...Object.entries(serviceLabels).map(([id, label]) => ({ id, label }))];
const date = (value: number) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" }).format(value);
const shortDate = (value: number) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).format(value);
const planName = (value: string) => plans.find(p => p.id === value)?.name || value;
const needLabel = (q: Quote) => q.service === "emailing" ? (q.volume ? `Emailing · ${planName(q.plan)}` : "Prospection emailing") : serviceLabels[q.service] || q.service;
/* Titre de secours : entreprise, sinon activité, sinon nom. */
const titleOf = (q: Quote) => (q.company || "").trim() || (q.activity || "").trim() || q.name;
const subOf = (q: Quote) => [q.activity, q.company].map(s => (s || "").trim()).filter(Boolean).filter(s => s !== titleOf(q))[0] || "";
const isNew = (q: Quote) => q.status === "new";
const ageHours = (q: Quote) => (Date.now() - q.created_at) / 3600000;
const mailtoOf = (q: Quote) => `mailto:${encodeURIComponent(q.email)}?subject=${encodeURIComponent(`Votre demande SmartFixx ${q.reference}`)}`;
const telOf = (q: Quote) => `tel:${(q.phone || "").replace(/[^\d+]/g, "")}`;

function StatusPill({ status }: { status: RequestStatus }) {
  const s = STATUS[status] || STATUS.new;
  return <span className={s.chip}><span className="rq-dot" aria-hidden="true" />{s.label}</span>;
}

const LOGIN_URL = "/admin/login?retour=requests";
/* Session absente ou expirée : 401, ou 403 « Accès administrateur requis. » (getAdmin). Les autres 403
   (« Origine non autorisée. », page HTML d'un proxy) ne renvoient pas vers la connexion : leur message
   est affiché comme toute autre erreur. */
function isSessionLost(result: JsonResult<unknown>) {
  if (result.ok || result.kind !== "http") return false;
  if (result.status === 401) return true;
  const data = result.data as { error?: unknown } | null;
  return result.status === 403 && !!data && typeof data.error === "string" && /administrateur requis/i.test(data.error);
}
/* Session perdue : renvoi vers la connexion, sauf si une modification du volet n'est pas enregistrée
   (la saisie reste alors à l'écran et le volet affiche comment se reconnecter). */
function leaveIfSessionLost(result: JsonResult<unknown>, dirty: boolean, onKeep: (value: boolean) => void) {
  if (!isSessionLost(result)) return false;
  if (dirty) onKeep(true); else window.location.assign(LOGIN_URL);
  return true;
}
/* Copie de secours d'une modification non enregistrée, propre à l'onglet (sessionStorage) : restaurée à la
   réouverture de la demande si sa révision n'a pas changé. Stockage indisponible : simplement ignorée. */
type Draft = { status: RequestStatus; notes: string; revision?: number };
const draftKey = (id: string) => `rq-draft-${id}`;
function keepDraft(id: string, draft: Draft) { try { window.sessionStorage.setItem(draftKey(id), JSON.stringify(draft)); } catch {} }
function dropDraft(id: string | null) { if (!id) return; try { window.sessionStorage.removeItem(draftKey(id)); } catch {} }
function readDraft(id: string): Draft | null {
  try {
    const raw = window.sessionStorage.getItem(draftKey(id)); if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Draft>;
    return value && typeof value.notes === "string" && statuses.includes(value.status as RequestStatus) ? { status: value.status as RequestStatus, notes: value.notes.slice(0, 4000), revision: value.revision } : null;
  } catch { return null; }
}
/* Les messages JSON de l'API du panel sont rédigés en français (409 « Cette demande a changé… », 503…) :
   ils sont repris ; sinon (réseau, HTML de passerelle) frenchError. */
const messageOf = (result: JsonResult<unknown>) => {
  if (result.ok) return "";
  const data = result.data as { error?: unknown } | null;
  if (result.kind === "http" && data && typeof data.error === "string" && data.error) return data.error;
  return frenchError(result.kind, result.status, result.data);
};

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" className="rq-copy" onClick={() => { void navigator.clipboard?.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }).catch(() => {}); }} aria-label={copied ? `${label} copié` : `Copier ${label}`}>
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}<span>{copied ? "Copié" : "Copier"}</span>
    </button>
  );
}

export function AdminDashboard({ name }: { name: string }) {
  const [data, setData] = useState<Listing | null>(null);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [search, setSearch] = useState(""), [query, setQuery] = useState(""), [status, setStatus] = useState("all"), [page, setPage] = useState(1), [tick, setTick] = useState(0);
  /* Chargement dérivé de la clé de requête (aucun setState synchrone dans un effet) : la liste est « en
     cours » tant que la dernière réponse reçue ne correspond pas aux filtres affichés. */
  const listKey = `${query}|${status}|${serviceFilter}|${page}|${tick}`;
  const [loaded, setLoaded] = useState<{ key: string; error: string } | null>(null);
  const loading = loaded?.key !== listKey;
  const error = loaded && loaded.key === listKey ? loaded.error : "";
  const [selected, setSelected] = useState<string | null>(null), [detail, setDetail] = useState<Quote | null>(null), [events, setEvents] = useState<QuoteEvent[]>([]), [detailError, setDetailError] = useState(""), [detailTick, setDetailTick] = useState(0);
  const [editStatus, setEditStatus] = useState<RequestStatus>("new"), [notes, setNotes] = useState(""), [saving, setSaving] = useState(false), [notice, setNotice] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false), [draftRestored, setDraftRestored] = useState(false);
  const activeId = useRef<string | null>(null);
  const dirtyRef = useRef(false);
  const detailLoading = !!selected && !detail && !detailError;

  useEffect(() => { const timeout = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300); return () => clearTimeout(timeout); }, [search]);
  useEffect(() => {
    const controller = new AbortController(); const key = listKey;
    void getJson<Listing>(`/api/admin/requests?${new URLSearchParams({ q: query, status, service: serviceFilter, page: String(page) })}`, { signal: controller.signal }).then(result => {
      if (controller.signal.aborted) return;
      if (result.ok) { setData(result.data); setLoaded({ key, error: "" }); }
      else if (!leaveIfSessionLost(result, dirtyRef.current, setSessionExpired)) setLoaded({ key, error: messageOf(result) });
    });
    return () => controller.abort();
  }, [listKey, query, status, serviceFilter, page]);

  /* Ouverture et fermeture du volet : l'état du détail est remis à zéro ici, puis l'effet charge. */
  const resetDetailState = () => { setNotice(""); setDetailError(""); setSessionExpired(false); setDraftRestored(false); };
  const openRequest = (id: string) => { activeId.current = id; setSelected(id); setDetail(null); setEvents([]); resetDetailState(); };
  /* Fermer ou recharger n'arrive qu'après confirmation si le volet est modifié : la copie de secours est abandonnée. */
  const closeRequest = () => { dropDraft(activeId.current); activeId.current = null; setSelected(null); setDetail(null); setEvents([]); resetDetailState(); };
  const reloadDetail = () => { dropDraft(activeId.current); resetDetailState(); setDetailTick(v => v + 1); };
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController(); const id = selected;
    void getJson<{ request: Quote; events: QuoteEvent[] }>(`/api/admin/requests/${id}`, { signal: controller.signal }).then(result => {
      if (controller.signal.aborted || activeId.current !== id) return;
      if (result.ok) {
        const request = result.data.request, draft = readDraft(id);
        const restore = !!draft && draft.revision === request.revision && (draft.status !== request.status || draft.notes !== (request.notes || ""));
        if (draft && !restore) dropDraft(id);
        setDetail(request); setEvents(result.data.events);
        setEditStatus(restore ? draft!.status : request.status); setNotes(restore ? draft!.notes : request.notes || ""); setDraftRestored(restore);
      }
      else if (!leaveIfSessionLost(result, dirtyRef.current, setSessionExpired)) setDetailError(messageOf(result));
    });
    return () => controller.abort();
  }, [selected, detailTick]);

  async function save() {
    if (!detail || saving) return; const id = detail.id; setSaving(true); setDetailError(""); setNotice(""); setSessionExpired(false);
    const result = await postJson<{ revision: number; updatedAt: number }>(`/api/admin/requests/${id}`, { status: editStatus, notes, revision: detail.revision }, { method: "PATCH" });
    if (result.ok) {
      dropDraft(id);
      if (activeId.current === id) { setDraftRestored(false); setDetail({ ...detail, status: editStatus, notes, revision: result.data.revision, updated_at: result.data.updatedAt }); setEvents(previous => [{ created_at: result.data.updatedAt, from_status: detail.status, to_status: editStatus, notes_changed: Number(notes !== (detail.notes || "")) }, ...previous]); setNotice("Modifications enregistrées."); }
      setTick(v => v + 1);
    } else if (isSessionLost(result)) {
      /* Le bouton n'est actif que si le volet est modifié : on ne quitte jamais la page ici. */
      keepDraft(id, { status: editStatus, notes, revision: detail.revision });
      if (activeId.current === id) setSessionExpired(true);
    } else if (activeId.current === id) setDetailError(messageOf(result));
    setSaving(false);
  }

  const count = (s: RequestStatus) => data?.counts.find(c => c.status === s)?.total || 0;
  const total = data?.counts.reduce((a, b) => a + b.total, 0) || 0;
  const dirty = !!detail && (editStatus !== detail.status || notes !== (detail.notes || ""));
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);
  const filtered = !!query || status !== "all" || serviceFilter !== "all";
  const fresh = count("new"), stale = data?.pending?.stale || 0;
  const clearFilters = () => { setSearch(""); setQuery(""); setStatus("all"); setServiceFilter("all"); setPage(1); };
  const first = name.trim().split(/\s+/)[0] || "Mohamed";

  return (
    <div className="rq">
      <header className="rq-head">
        <div className="rq-head-text">
          <p className="rq-hello">Bonjour {first}.</p>
          <h1 className="rq-title">Vos demandes</h1>
        </div>
        <button type="button" className="rq-btn rq-btn--ghost rq-refresh" onClick={() => setTick(v => v + 1)} disabled={loading} aria-label="Actualiser les demandes">
          <RefreshCw aria-hidden="true" className={loading ? "rq-spin" : undefined} /><span>Actualiser</span>
        </button>
      </header>

      <section className={`rq-todo${fresh ? " rq-todo--on" : ""}`} aria-labelledby="rq-todo-title">
        <span className="rq-todo-window" aria-hidden="true" />
        <div className="rq-todo-text">
          <h2 id="rq-todo-title" className="rq-todo-title">À traiter <span className="rq-count">{data ? formatNumber(fresh) : "–"}</span></h2>
          <p>{!data ? "Chargement des demandes…" : fresh ? <>{fresh > 1 ? `${formatNumber(fresh)} nouvelles demandes` : "1 nouvelle demande"}{stale ? <>, dont <strong>{stale > 1 ? `${formatNumber(stale)} reçues il y a plus de 48 h` : "1 reçue il y a plus de 48 h"}</strong></> : null}.</> : "Aucune nouvelle demande pour le moment."}</p>
        </div>
        {data?.pending ? <button type="button" className="rq-btn rq-btn--signal" onClick={() => openRequest(data.pending!.oldestId)}>Ouvrir la plus ancienne<ArrowRight aria-hidden="true" /></button> : null}
      </section>

      <div className="rq-filters">
        <label className="rq-search">
          <Search aria-hidden="true" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, activité, email, téléphone, référence…" aria-label="Rechercher une demande" maxLength={100} />
        </label>
        <div className="rq-pills" role="group" aria-label="Filtrer par statut">
          <button type="button" className="rq-pill" aria-pressed={status === "all"} onClick={() => { setStatus("all"); setPage(1); }}>Toutes <span className="rq-pill-n">{data ? formatNumber(total) : "–"}</span></button>
          {statuses.map(s => <button type="button" key={s} className={STATUS[s].pill} aria-pressed={status === s} onClick={() => { setStatus(s); setPage(1); }}><span className="rq-dot" aria-hidden="true" />{STATUS[s].filter} <span className="rq-pill-n">{data ? formatNumber(count(s)) : "–"}</span></button>)}
        </div>
        <div className="rq-pills" role="group" aria-label="Filtrer par besoin">
          {NEEDS.map(n => <button type="button" key={n.id} className="rq-pill" aria-pressed={serviceFilter === n.id} onClick={() => { setServiceFilter(n.id); setPage(1); }}>{n.label}</button>)}
        </div>
      </div>

      <section className="rq-inbox" aria-labelledby="rq-inbox-title" aria-busy={loading || undefined}>
        <h2 id="rq-inbox-title" className="sr-only">Liste des demandes</h2>
        {error ? <StateError message={error} onRetry={() => setTick(v => v + 1)} /> : null}
        {loading && !data ? <StateLoading rows={5} rowHeight={64} label="Chargement des demandes…" /> : data?.requests.length ? (
          <>
            <div className="rq-table-wrap">
              <table className="rq-table">
                <caption className="sr-only">Demandes, de la plus récente à la plus ancienne</caption>
                <thead><tr><th scope="col">Contact</th><th scope="col">Besoin</th><th scope="col">Statut</th><th scope="col">Reçue le</th><th scope="col">Campagne</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {data.requests.map(q => (
                    <tr key={q.id} className={isNew(q) ? "rq-row rq-row--new" : "rq-row"} onClick={e => { if (!(e.target as HTMLElement).closest("a,button")) openRequest(q.id); }}>
                      <td><button type="button" className="rq-open" onClick={() => openRequest(q.id)}><span className="rq-avatar" aria-hidden="true">{(titleOf(q).slice(0, 1) || "?").toUpperCase()}</span><span className="rq-contact"><strong>{titleOf(q)}</strong><small>{q.name !== titleOf(q) ? q.name : subOf(q) || "—"}</small></span></button></td>
                      <td><span className="rq-need">{needLabel(q)}</span>{q.website_url ? <small className="rq-sub">Site indiqué</small> : null}</td>
                      <td><StatusPill status={q.status} />{isNew(q) && ageHours(q) > 48 ? <small className="rq-late">+ de 48 h</small> : null}</td>
                      <td><span className="rq-date">{shortDate(q.created_at)}</span><small className="rq-sub rq-ref">{q.reference}</small></td>
                      <td><span className="rq-campaign">{q.campaign || "site"}</span></td>
                      <td>
                        <div className="rq-row-actions">
                          {q.phone ? <a className="rq-icon-btn" href={telOf(q)} aria-label={`Appeler ${q.name}`}><Phone aria-hidden="true" /></a> : <span className="rq-icon-slot" aria-hidden="true" />}
                          {q.email ? <a className="rq-icon-btn" href={mailtoOf(q)} aria-label={`Écrire à ${q.name}`}><Mail aria-hidden="true" /></a> : <span className="rq-icon-slot" aria-hidden="true" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="rq-cards">
              {data.requests.map(q => (
                <li key={q.id}>
                  <button type="button" className={isNew(q) ? "rq-card rq-card--new" : "rq-card"} onClick={() => openRequest(q.id)}>
                    <span className="rq-card-top"><StatusPill status={q.status} /><span className="rq-date">{shortDate(q.created_at)}</span></span>
                    <strong className="rq-card-title">{titleOf(q)}</strong>
                    <span className="rq-card-sub">{[q.name !== titleOf(q) ? q.name : "", needLabel(q)].filter(Boolean).join(" · ")}</span>
                    <span className="rq-card-foot"><span className="rq-ref">{q.reference}</span>{isNew(q) && ageHours(q) > 48 ? <span className="rq-late">+ de 48 h</span> : null}<span className="rq-card-go" aria-hidden="true"><ChevronRight /></span></span>
                  </button>
                </li>
              ))}
            </ul>
            <nav className="rq-pagination" aria-label="Pages de demandes">
              <span>{formatNumber(data.total)} demande{data.total > 1 ? "s" : ""} · page {page} sur {Math.max(1, Math.ceil(data.total / 20))}</span>
              <div>
                <button type="button" className="rq-icon-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1 || loading} aria-label="Page précédente"><ChevronLeft aria-hidden="true" /></button>
                <button type="button" className="rq-icon-btn" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total || loading} aria-label="Page suivante"><ChevronRight aria-hidden="true" /></button>
              </div>
            </nav>
          </>
        ) : !error && data ? (
          filtered
            ? <StateEmpty title="Aucune demande correspondante." text="Essayez un autre terme, ou affichez toutes les demandes." action={<button type="button" className="rq-btn rq-btn--primary" onClick={clearFilters}>Effacer les filtres</button>} />
            : <StateEmpty title="La prochaine conversation commence ici." text="Les demandes envoyées depuis le formulaire du site apparaîtront ici, dès leur enregistrement." action={<Link href="/contact" className="rq-btn rq-btn--primary">Voir le formulaire<ArrowRight aria-hidden="true" /></Link>} />
        ) : null}
      </section>
      <p className="rq-note"><ShieldCheck aria-hidden="true" /> Visible uniquement par vous. Les montants des anciennes demandes emailing sont des estimations internes, pas du chiffre d’affaires.</p>

      <Sheet open={!!selected} onOpenChange={open => { if (!open && !saving) { if (dirty && !window.confirm("Quitter sans enregistrer les modifications ?")) return; closeRequest(); } }}>
        <SheetContent className="rq-sheet" showCloseButton={false}>
          <div className="rq-sheet-sticky">
            <div className="rq-sheet-head">
              <div className="rq-sheet-heading">
                <SheetTitle className="rq-sheet-title">{detail ? titleOf(detail) : "Détail de la demande"}</SheetTitle>
                <SheetDescription className="rq-sheet-desc">{detail ? <><span className="rq-ref">{detail.reference}</span> · Reçue le {date(detail.created_at)}</> : "Coordonnées, projet et suivi."}</SheetDescription>
              </div>
              <button type="button" className="rq-btn rq-btn--ghost rq-close" onClick={() => { if (saving) return; if (dirty && !window.confirm("Quitter sans enregistrer les modifications ?")) return; closeRequest(); }}><X aria-hidden="true" />Fermer</button>
            </div>
            {detail ? (
              <div className="rq-actions">
                <div className="rq-actions-contact">
                  {detail.phone ? <a className="rq-btn rq-btn--signal" href={telOf(detail)}><Phone aria-hidden="true" />Appeler</a> : null}
                  {detail.email ? <a className="rq-btn rq-btn--ghost" href={mailtoOf(detail)}><Mail aria-hidden="true" />Écrire</a> : null}
                </div>
                <div className="rq-actions-follow">
                  <label className="sr-only" htmlFor="detail-status">Statut</label>
                  <select id="detail-status" className="rq-select" value={editStatus} disabled={saving} onChange={e => setEditStatus(e.target.value as RequestStatus)}>
                    {statuses.map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}
                  </select>
                  <button type="button" className="rq-btn rq-btn--primary" disabled={saving || !dirty} onClick={save}>{saving ? <RefreshCw aria-hidden="true" className="rq-spin" /> : <Save aria-hidden="true" />}{saving ? "Enregistrement…" : <span>Enregistrer<span className="rq-wide"> le suivi</span></span>}</button>
                </div>
                {sessionExpired ? <p className="rq-expired-bar" role="alert"><strong>Session expirée : rien n’a été enregistré.</strong> Votre note reste à l’écran. <a className="rq-link" href={LOGIN_URL} target="_blank" rel="noopener">Se reconnecter<span className="sr-only"> dans un nouvel onglet</span><ExternalLink aria-hidden="true" /></a></p> : null}
                <div className="rq-actions-live" role="status" aria-live="polite">{notice ? <p className="rq-notice"><Check aria-hidden="true" />{notice}</p> : draftRestored && dirty ? <p className="rq-draft">Modification non enregistrée restaurée. Vérifiez-la puis enregistrez.</p> : null}</div>
              </div>
            ) : null}
          </div>

          <div className="rq-sheet-body">
            {sessionExpired ? (
              <div className="rq-expired">
                <p><strong>Votre session a expiré : rien n’a été enregistré.</strong> Votre note reste à l’écran et une copie est gardée dans cet onglet.</p>
                <p>Reconnectez-vous dans un nouvel onglet, revenez ici, puis cliquez de nouveau sur « Enregistrer le suivi ».</p>
                <a className="rq-btn rq-btn--primary" href={LOGIN_URL} target="_blank" rel="noopener">Se reconnecter<span className="rq-wide"> dans un nouvel onglet</span><ExternalLink aria-hidden="true" /></a>
              </div>
            ) : null}
            {detailError ? <StateError message={detailError} retryLabel="Recharger" onRetry={() => { if (selected && (!dirty || window.confirm("Recharger et abandonner les modifications locales ?"))) reloadDetail(); }} /> : null}
            {detailLoading && !detail ? <StateLoading rows={4} rowHeight={56} label="Chargement de la demande…" /> : detail ? (
              <>
                <section className="rq-block" aria-labelledby="rq-contact-title">
                  <h3 id="rq-contact-title" className="rq-block-title">Coordonnées</h3>
                  <dl className="rq-facts">
                    <div><dt>Nom</dt><dd>{detail.name}</dd></div>
                    {detail.phone ? <div><dt>Téléphone</dt><dd className="rq-fact-row"><a href={telOf(detail)} className="rq-link rq-tabular">{displayPhone(detail.phone)}</a><CopyButton value={detail.phone} label="le téléphone" /></dd></div> : null}
                    {detail.email ? <div><dt>Email</dt><dd className="rq-fact-row"><a href={mailtoOf(detail)} className="rq-link">{detail.email}</a><CopyButton value={detail.email} label="l’email" /></dd></div> : null}
                    {detail.activity ? <div><dt>Activité</dt><dd>{detail.activity}</dd></div> : null}
                    {detail.company ? <div><dt>Entreprise</dt><dd>{detail.company}</dd></div> : null}
                    {detail.website_url ? <div><dt>Site indiqué</dt><dd><a href={detail.website_url} target="_blank" rel="noopener noreferrer" className="rq-link">{detail.website_url.replace(/^https?:\/\//, "")}<ExternalLink aria-hidden="true" /></a></dd></div> : null}
                  </dl>
                </section>

                <section className="rq-block" aria-labelledby="rq-project-title">
                  <h3 id="rq-project-title" className="rq-block-title">Projet</h3>
                  <dl className="rq-facts rq-facts--grid">
                    <div><dt>Besoin</dt><dd>{serviceLabels[detail.service] || detail.service}</dd></div>
                    <div><dt>Campagne déclarée</dt><dd className="rq-campaign">{detail.campaign || "site"}</dd></div>
                    {detail.service === "emailing" ? <>
                      <div><dt>Formule</dt><dd>{detail.volume ? planName(detail.plan) : "À définir"}</dd></div>
                      <div><dt>Quota total</dt><dd>{detail.volume ? `${formatNumber(detail.volume)} emails` : "À préciser"}</dd></div>
                      <div><dt>Audience et données</dt><dd>{detail.audience.toUpperCase()} · {detail.volume ? (detail.data_source === "client" ? "Fichier client" : "Data à fournir") : "Données à préciser"}</dd></div>
                    </> : <>
                      {detail.city ? <div><dt>Ville</dt><dd>{detail.city}</dd></div> : null}
                      {detail.budget && detail.budget !== "a_definir" ? <div><dt>Budget envisagé</dt><dd>{budgets[detail.budget] || detail.budget}</dd></div> : null}
                      {detail.timeline && detail.timeline !== "flexible" ? <div><dt>Calendrier souhaité</dt><dd>{timelines[detail.timeline] || detail.timeline}</dd></div> : null}
                    </>}
                    {detail.quoted_amount_euros !== null && detail.quoted_amount_euros !== undefined ? <div><dt>Estimation interne</dt><dd>{formatEuro(detail.quoted_amount_euros)} HT</dd></div> : null}
                  </dl>
                </section>

                <section className="rq-block" aria-labelledby="rq-message-title">
                  <h3 id="rq-message-title" className="rq-block-title">Son message</h3>
                  {detail.message ? <p className="rq-message">{detail.message}</p> : <p className="rq-muted">Pas de message (formulaire court).</p>}
                </section>

                <section className="rq-block" aria-labelledby="rq-notes-title">
                  <h3 id="rq-notes-title" className="rq-block-title">Notes internes</h3>
                  <label htmlFor="admin-notes" className="rq-label">Visibles uniquement ici</label>
                  <textarea id="admin-notes" className="rq-textarea" rows={5} placeholder="Besoin précisé, prochain échange, points à confirmer…" maxLength={4000} value={notes} disabled={saving} onChange={e => setNotes(e.target.value)} />
                  <p className="rq-counter"><span className="rq-tabular">{formatNumber(notes.length)}</span> / 4 000</p>
                </section>

                {events.length > 0 ? (
                  <section className="rq-block" aria-labelledby="rq-history-title">
                    <h3 id="rq-history-title" className="rq-block-title">Historique récent</h3>
                    <ol className="rq-history">
                      {events.map((e, i) => <li key={`${e.created_at}-${i}`}><span className="rq-date">{date(e.created_at)}</span><span>{e.from_status !== e.to_status ? `${STATUS[e.from_status]?.label || e.from_status} → ${STATUS[e.to_status]?.label || e.to_status}` : "Suivi actualisé"}{e.notes_changed ? " · Note modifiée" : ""}</span></li>)}
                    </ol>
                  </section>
                ) : null}
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
