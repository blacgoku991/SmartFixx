"use client";
/* Panel (lot 6) : Tableau de bord, fusion de l'ancienne Vue d'ensemble et des Statistiques (?tab=analytics
   s'ouvre ici, ancré sur « Mesures détaillées »). Appel inchangé : GET /api/admin/analytics?days=7|30|90.
   Ordre : demandes à traiter, indicateurs de la période, courbe (recharts chargé par import() différé,
   place de 240 px réservée), suivi commercial, mesures détaillées. Une erreur garde l'en-tête et les
   blocs déjà chargés. Aucun compteur animé. */
import { useEffect, useRef, useState, type ComponentType } from "react";
import { ArrowRight, ArrowUpRight, Eye, FileInput, Info, MousePointer2, RefreshCw, Send } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { StateError } from "./sx/states";
import { serviceLabels, type ServiceId } from "@/lib/services";
import type { RequestStatus } from "@/lib/admin-policy";
import { panelApi, errorText } from "./admin-panel/api";
import { fmt, plural } from "./admin-panel/format";
import type { Inbox } from "./admin-panel/shell";
import type { ChartPoint } from "./admin-panel/activity-chart";

type Report = { days: number; startDay: string; today: string; generatedAt: number; activity: { day: string; event: string; total: number }[]; pages: { path: string; views: number; contacts: number }[]; interests: { service: string; total: number }[]; projects: { service: ServiceId; status: RequestStatus; total: number }[]; dailyProjects: { day: string; total: number }[]; campaigns: { campaign: string; total: number; won: number }[]; awaiting48h: { total: number }; firstAction: { hours: number | null; total: number } };

/* Statuts au féminin, comme l'onglet Demandes (API inchangée). Pastille point + texte, jamais la couleur seule. */
const STATUS: { id: RequestStatus; label: string; chip: string }[] = [
  { id: "new", label: "Nouvelles", chip: "sx-chip sx-chip--signal" },
  { id: "in_progress", label: "En cours", chip: "sx-chip sx-chip--accent" },
  { id: "quoted", label: "Devis envoyé", chip: "sx-chip sx-chip--violet" },
  { id: "won", label: "Gagnées", chip: "sx-chip sx-chip--success" },
  { id: "archived", label: "Archivées", chip: "sx-chip" },
];
const WINDOWS = 12;

let chartModule: Promise<{ default: ComponentType<{ data: ChartPoint[] }> }> | null = null;
const loadChart = () => (chartModule ??= import("./admin-panel/activity-chart"));

export function AdminAnalytics({ inbox, onInbox }: { inbox: Inbox; onInbox: () => void }) {
  const [days, setDays] = useState("30"), [tick, setTick] = useState(0);
  const key = `${days}|${tick}`;
  const [report, setReport] = useState<Report | null>(null);
  const [loaded, setLoaded] = useState<{ key: string; error: string } | null>(null);
  const loading = loaded?.key !== key;
  const error = loaded?.key === key ? loaded.error : "";
  const [Chart, setChart] = useState<ComponentType<{ data: ChartPoint[] }> | null>(null);

  useEffect(() => {
    const controller = new AbortController(), current = key;
    panelApi<Report>(`/api/admin/analytics?days=${days}`, undefined, "POST", controller.signal)
      .then(data => { if (!controller.signal.aborted) { setReport(data); setLoaded({ key: current, error: "" }); } })
      .catch(e => { if (!controller.signal.aborted) setLoaded({ key: current, error: errorText(e, "Les statistiques sont momentanément indisponibles.") }); });
    return () => controller.abort();
  }, [key, days]);

  /* La courbe (recharts, ≈ 100 Ko gzip) n'est chargée que lorsque sa carte approche de l'écran, puis au
     repos du fil principal : hors du chemin critique, et pas sur mobile tant qu'on ne défile pas. */
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    const el = chartRef.current;
    const start = () => void loadChart().then(m => { if (alive) setChart(() => m.default); }).catch(() => {});
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const later = () => { if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 2000 }); else setTimeout(start, 400); };
    if (!el || !("IntersectionObserver" in window)) { later(); return () => { alive = false; }; }
    const io = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { io.disconnect(); later(); } }, { rootMargin: "120px 0px" });
    io.observe(el);
    return () => { alive = false; io.disconnect(); };
  }, []);

  /* Libellés des pages (titres des services, villes et conseils) : chargés seulement s'il y a des pages à
     nommer, pour garder ces contenus éditoriaux hors du JS initial du panel. */
  const [label, setLabel] = useState<((path: string) => string) | null>(null);
  const needLabels = !!report?.pages.length;
  useEffect(() => {
    if (!needLabels || label) return;
    let alive = true;
    void import("@/lib/analytics-config").then(m => { if (alive) setLabel(() => m.pageLabel); }).catch(() => {});
    return () => { alive = false; };
  }, [needLabels, label]);

  const sum = (event: string) => report?.activity.filter(x => x.event === event).reduce((s, x) => s + x.total, 0) || 0;
  const total = report?.projects.reduce((s, x) => s + x.total, 0) || 0;
  const won = report?.projects.filter(x => x.status === "won").reduce((s, x) => s + x.total, 0) || 0;
  const byStatus = (status: RequestStatus) => report?.projects.filter(x => x.status === status).reduce((s, x) => s + x.total, 0) || 0;
  const timeline: ChartPoint[] = report ? Array.from({ length: report.days }, (_, i) => {
    const day = new Date(new Date(`${report.startDay}T00:00:00Z`).getTime() + i * 86400000).toISOString().slice(0, 10);
    return { day: day.slice(8) + "/" + day.slice(5, 7), views: report.activity.filter(x => x.day === day && x.event === "view").reduce((s, x) => s + x.total, 0), leads: report.dailyProjects.find(x => x.day === day)?.total || 0 };
  }) : [];
  const show = (n: number) => (report ? fmt(n) : null);
  const busy = loading && !report;
  const fresh = inbox?.fresh ?? null, stale48 = report?.awaiting48h.total ?? inbox?.stale ?? null;
  const lit = Math.min(WINDOWS, fresh || 0);

  const metrics: { label: string; value: number; icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>; note: string }[] = [
    { label: "Pages consultées", value: sum("view"), icon: Eye, note: "Vues mesurées avec accord" },
    { label: "Clics vers le contact", value: sum("contact"), icon: MousePointer2, note: "Actions mesurées avec accord" },
    { label: "Débuts de formulaire", value: sum("form_start"), icon: FileInput, note: "Premiers champs remplis, avec accord" },
    { label: "Demandes enregistrées mesurées", value: sum("lead"), icon: Send, note: "Formulaires enregistrés par des visiteurs ayant accepté la mesure" },
  ];

  return (
    <div className="pn-screen" aria-busy={busy || undefined}>
      <header className="pn-head">
        <div className="pn-head-text">
          <p className="pn-eyebrow">Tableau de bord</p>
          <h1 className="pn-title">Votre activité, en clair.</h1>
          <p className="pn-lead">Les demandes à traiter d’abord, puis ce que mesure le site.</p>
        </div>
        <div className="pn-controls">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="pn-select" aria-label="Période des statistiques"><SelectValue /></SelectTrigger>
            <SelectContent>{["7", "30", "90"].map(d => <SelectItem key={d} value={d}>{d} derniers jours</SelectItem>)}</SelectContent>
          </Select>
          <button type="button" className="pn-btn pn-btn--ghost" onClick={() => setTick(x => x + 1)} disabled={loading}>
            <RefreshCw size={18} aria-hidden="true" className={loading ? "pn-spin" : undefined} /><span>Actualiser</span>
          </button>
        </div>
      </header>

      {error ? <StateError message={report ? `${error} Les dernières données reçues restent affichées.` : error} onRetry={() => setTick(x => x + 1)} /> : null}

      <section className={`pn-todo${fresh ? " pn-todo--on" : ""}`} aria-labelledby="pn-todo-title">
        <div className="pn-todo-city" aria-hidden="true">
          {Array.from({ length: WINDOWS }, (_, i) => <span key={i} className={i < lit ? "pn-win pn-win--on" : "pn-win"} />)}
        </div>
        <div className="pn-todo-text">
          <h2 id="pn-todo-title" className="pn-h2">À traiter <span className="pn-count">{fresh === null ? "–" : fmt(fresh)}</span></h2>
          <p>{fresh === null ? "Lecture des demandes…" : fresh ? <>{fresh > 1 ? `${fmt(fresh)} nouvelles demandes attendent` : "1 nouvelle demande attend"} un premier suivi{stale48 ? <>, dont <strong>{stale48 > 1 ? `${fmt(stale48)} depuis plus de 48 h` : "1 depuis plus de 48 h"}</strong></> : null}.</> : "Aucune nouvelle demande en attente. Chaque fenêtre s’allumera à l’arrivée d’une demande."}</p>
        </div>
        <button type="button" onClick={onInbox} className={`pn-btn ${fresh ? "pn-btn--signal" : "pn-btn--ghost"}`}>Ouvrir les demandes <ArrowRight size={18} aria-hidden="true" /></button>
      </section>

      <section aria-labelledby="pn-kpi-title">
        <div className="pn-section-head">
          <h2 id="pn-kpi-title" className="pn-h2">Sur les {days} derniers jours</h2>
          <p className="pn-muted">Mesures du site, uniquement pour les visiteurs ayant accepté la mesure d’audience.</p>
        </div>
        <div className="pn-metrics">
          {metrics.map(m => (
            <article key={m.label} className="pn-metric">
              <div className="pn-metric-top"><span>{m.label}</span><m.icon size={18} aria-hidden={true} /></div>
              <strong className="pn-metric-value">{show(m.value) ?? <span className="pn-skel" aria-hidden="true" />}</strong>
              <small>{m.note}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="pn-card pn-chart-card" aria-labelledby="pn-chart-title">
        <div className="pn-card-head pn-card-head--split">
          <h2 id="pn-chart-title" className="pn-h2">L’activité de votre site</h2>
          <p className="pn-legend"><span><i className="pn-legend-views" aria-hidden="true" />Vues mesurées</span><span><i className="pn-legend-leads" aria-hidden="true" />Demandes enregistrées</span></p>
        </div>
        <div ref={chartRef} className="pn-chart" role="img" aria-label={report ? `Évolution sur ${report.days} jours : ${sum("view")} pages consultées avec accord, ${total} demandes enregistrées.` : "Graphique en cours de chargement"}>
          {report && Chart ? <Chart data={timeline} /> : <span className="pn-chart-wait" aria-hidden="true" />}
        </div>
        <p className="pn-chart-foot"><span>{report ? `${report.startDay} → ${report.today} · UTC` : " "}</span><span>{report && sum("view") === 0 ? "La courbe se remplira avec les premières visites acceptant la mesure." : "Les vues ne correspondent pas à des visiteurs uniques."}</span></p>
      </section>

      <div className="pn-grid-2">
        <section className="pn-card" aria-labelledby="pn-followup-title">
          <p className="pn-kicker">Du premier message au projet</p>
          <h2 id="pn-followup-title" className="pn-h2">Le suivi commercial</h2>
          <div className="pn-figures">
            <div><span>Demandes reçues</span><strong>{show(total) ?? "–"}</strong><small>Toutes les demandes enregistrées sur la période, avec ou sans mesure</small></div>
            <div><span>Projets gagnés</span><strong>{show(won) ?? "–"}</strong><small>{report && total ? `${Math.round(won / total * 100)} % des demandes de la période` : "Statut renseigné dans l’onglet Demandes"}</small></div>
          </div>
          <ul className="pn-status-list">{STATUS.map(s => <li key={s.id}><span className={s.chip}>{s.label}</span><strong>{show(byStatus(s.id)) ?? "–"}</strong></li>)}</ul>
          <p className="pn-small">Premier suivi enregistré : {report?.firstAction.hours != null ? `${report.firstAction.hours.toFixed(1).replace(".", ",")} h en moyenne (${report.firstAction.total} ${plural(report.firstAction.total, "demande", "demandes")})` : "pas encore de données"}. Nouvelles demandes depuis plus de 48 h, toutes périodes : {stale48 === null ? "–" : fmt(stale48)}.</p>
        </section>
        <section className="pn-card" aria-labelledby="pn-needs-title">
          <p className="pn-kicker">Ce que l’on vous demande</p>
          <h2 id="pn-needs-title" className="pn-h2">Les besoins exprimés</h2>
          <ul className="pn-bars">{Object.entries(serviceLabels).map(([id, label]) => {
            const n = report?.projects.filter(x => x.service === id).reduce((s, x) => s + x.total, 0) || 0;
            return <li key={id}><div><span>{label}</span><strong>{show(n) ?? "–"}</strong></div><span className="pn-track" aria-hidden="true"><span style={{ transform: `scaleX(${total ? n / total : 0})` }} /></span></li>;
          })}</ul>
        </section>
      </div>

      <section id="mesures-detaillees" className="pn-detail" aria-labelledby="pn-detail-title">
        <div className="pn-section-head">
          <h2 id="pn-detail-title" className="pn-h2">Mesures détaillées</h2>
          <p className="pn-muted">Pages d’entrée, choix d’expertise et campagnes déclarées, sur la même période.</p>
        </div>
        <div className="pn-card">
          <h3 className="pn-h3">Les choix mesurés</h3>
          <p className="pn-muted">Clics sur les expertises dans l’explorateur et les liens du site, avec accord.</p>
          <div className="pn-interests">{Object.entries(serviceLabels).filter(([id]) => id !== "conseil").map(([id, label]) => <div key={id}><span>{label}</span><strong>{show(report?.interests.find(i => i.service === id)?.total || 0) ?? "–"}</strong></div>)}</div>
        </div>
        <div className="pn-grid-2">
          <section className="pn-card" aria-labelledby="pn-pages-title">
            <h3 id="pn-pages-title" className="pn-h3">Pages consultées</h3>
            {report?.pages.length ? (
              <div className="pn-table-wrap"><table className="pn-table"><thead><tr><th scope="col">Page</th><th scope="col">Vues</th><th scope="col">Vers contact</th></tr></thead>
                <tbody>{report.pages.map(p => <tr key={p.path}><td><a href={p.path} target="_blank" rel="noreferrer" className="pn-link">{label ? label(p.path) : p.path}</a></td><td>{fmt(p.views)}</td><td>{fmt(p.contacts)}</td></tr>)}</tbody></table></div>
            ) : <p className="pn-empty">{busy ? "Chargement…" : "Les premières pages mesurées apparaîtront ici."}</p>}
          </section>
          <section className="pn-card" aria-labelledby="pn-camps-title">
            <h3 id="pn-camps-title" className="pn-h3">Vos campagnes</h3>
            {report?.campaigns.length ? (
              <div className="pn-table-wrap"><table className="pn-table"><thead><tr><th scope="col">Campagne</th><th scope="col">Demandes</th><th scope="col">Gagnées</th></tr></thead>
                <tbody>{report.campaigns.map(c => <tr key={c.campaign}><td>{c.campaign === "site" ? "Site / non renseignée" : c.campaign}</td><td>{fmt(c.total)}</td><td>{fmt(c.won)}</td></tr>)}</tbody></table></div>
            ) : <p className="pn-empty">{busy ? "Chargement…" : "Les demandes venues de vos liens identifiés apparaîtront ici."}</p>}
          </section>
        </div>
      </section>

      <aside className="pn-explainer"><Info size={18} aria-hidden="true" /><p>Les vues, clics, débuts de formulaire et demandes mesurées concernent uniquement les visiteurs ayant accepté la mesure. Toutes les demandes enregistrées sont comptées à part, dans le suivi commercial : ces volumes ne forment pas un entonnoir individuel. Les campagnes proviennent du code présent dans le lien soumis. Les désinscriptions et les emails préparés sont dans « Désinscriptions & emails », les envois SMTP dans « Campagnes ». Les positions Google et le chiffre d’affaires ne sont pas connectés. <a className="pn-link" href="/sitemap.xml" target="_blank" rel="noreferrer">Sitemap <ArrowUpRight size={14} aria-hidden="true" /></a></p></aside>
      {report ? <p className="pn-updated">Mis à jour à {new Date(report.generatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" })} · Les rapports ne contiennent aucune donnée de démonstration.</p> : null}
    </div>
  );
}
