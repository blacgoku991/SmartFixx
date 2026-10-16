"use client";
/* Panel (lot 6) : shell. Rail de 232 px (≥ 1024), réduit à 72 px avec infobulles (768-1023), barre du haut
   de 56 px et barre basse de 64 px + zone de sécurité sur mobile. L'onglet est reflété dans ?tab=
   (history.replaceState : pas d'aller-retour serveur à chaque clic), la liste latérale est verticale et le
   contenu est dans un <main id="contenu"> (le lien d'évitement du layout y mène). html.sx-admin, posé et
   retiré ici, place le ThemeControl du layout dans l'emplacement réservé de la barre du haut.
   Seul l'onglet ouvert est monté : les sondages (5 s Campagnes, 60 s Emails) ne tournent qu'à l'écran. */
import { useEffect, useLayoutEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { Tabs as TabsPrimitive } from "radix-ui";
import { ArrowUpRight, ChartNoAxesCombined, Inbox, LogOut, Menu, Radio, Search, ShieldCheck, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../ui/sheet";
import { AdminDashboard } from "../admin-dashboard";
import { AdminAnalytics } from "../admin-analytics";
import { AdminCampaigns } from "../admin-campaigns";
import { AdminEmailCampaigns } from "../admin-email-campaigns";
import { Acquisition } from "./acquisition";
import { configurePanel, sessionLost, type PanelTab } from "./api";
import { getJson } from "@/lib/fetch-json";
import { fmt } from "./format";

type View = "overview" | "requests" | "campaigns" | "emails" | "acquisition";
export type Inbox = { fresh: number; stale: number; oldestId: string | null } | null;
type Listing = { counts: { status: string; total: number }[]; pending?: { oldestId: string; stale: number } | null };

const NAV: { id: View; label: string; short: string; icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }> }[] = [
  { id: "requests", label: "Demandes", short: "Demandes", icon: Inbox },
  { id: "overview", label: "Tableau de bord", short: "Tableau de bord", icon: ChartNoAxesCombined },
  { id: "campaigns", label: "Campagnes", short: "Campagnes", icon: Radio },
  { id: "emails", label: "Désinscriptions & emails", short: "STOP", icon: ShieldCheck },
  { id: "acquisition", label: "Acquisition & SEO", short: "Acquisition", icon: Search },
];
const viewOf = (tab: string): View => (tab === "analytics" ? "overview" : (["overview", "requests", "campaigns", "emails", "acquisition"].includes(tab) ? tab : "overview") as View);

export function PanelShell({ name, initialTab, signoutHref, hostingNote, vps }: { name: string; initialTab: string; signoutHref: string; hostingNote: string; vps: boolean }) {
  const [tab, setTab] = useState<string>(initialTab);
  const [prevInitial, setPrevInitial] = useState(initialTab);
  /* Retour ou avance du navigateur vers une autre URL ?tab= : la page serveur renvoie un nouvel initialTab. */
  if (prevInitial !== initialTab) { setPrevInitial(initialTab); setTab(initialTab); }
  const view = viewOf(tab);
  const [more, setMore] = useState(false);
  const [inbox, setInbox] = useState<Inbox>(null);
  const first = (name || "Mohamed").trim().split(/\s+/)[0] || "Mohamed";
  /* Avant les effets des écrans (qui lancent leurs requêtes) : base de connexion et onglet de retour. */
  useLayoutEffect(() => { configurePanel({ loginBase: vps ? "/admin/login?retour=" : "/admin?tab=", tab: tab as PanelTab }); }, [vps, tab]);

  /* html.sx-admin : ThemeControl dans la barre du haut, plus jamais flottant sur le contenu. */
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("sx-admin");
    return () => html.classList.remove("sx-admin");
  }, []);

  /* ?tab= reflété dans l'URL, sans rechargement ni aller-retour serveur. */
  function go(next: string, anchor?: string) {
    setTab(next);
    setMore(false);
    try { window.history.replaceState(window.history.state, "", `/admin?tab=${next}${anchor ? `#${anchor}` : ""}`); } catch {}
    requestAnimationFrame(() => {
      const target = anchor ? document.getElementById(anchor) : null;
      if (target) target.scrollIntoView({ block: "start" });
      else window.scrollTo({ top: 0 });
    });
  }
  /* ?tab=analytics : Tableau de bord, ancré sur « Mesures détaillées ». */
  useEffect(() => {
    if (initialTab === "analytics") requestAnimationFrame(() => document.getElementById("mesures-detaillees")?.scrollIntoView({ block: "start" }));
  }, [initialTab]);

  /* Compteur ambre des nouvelles demandes (lecture seule, même liste que l'onglet Demandes), relu à chaque
     changement d'onglet, jamais en sondage. */
  useEffect(() => {
    const controller = new AbortController();
    void getJson<Listing>(`/api/admin/requests?${new URLSearchParams({ q: "", status: "all", service: "all", page: "1" })}`, { signal: controller.signal }).then(result => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        const fresh = result.data.counts?.find(c => c.status === "new")?.total || 0;
        setInbox({ fresh, stale: result.data.pending?.stale || 0, oldestId: result.data.pending?.oldestId || null });
      } else sessionLost(result, view);
    });
    return () => controller.abort();
  }, [view]);

  const current = NAV.find(n => n.id === view) || NAV[1];
  const badge = inbox && inbox.fresh > 0 ? <span className="pn-badge"><span aria-hidden="true">{inbox.fresh > 99 ? "99+" : fmt(inbox.fresh)}</span><span className="pn-sr">{`, ${fmt(inbox.fresh)} ${inbox.fresh > 1 ? "nouvelles" : "nouvelle"}`}</span></span> : null;

  return (
    <div className="pn-app">
      <TabsPrimitive.Root value={view} onValueChange={v => go(v)} orientation="vertical" className="pn-layout">
        <aside className="pn-rail" aria-label="Menu de l’administration">
          <Link className="pn-brand" href="/" aria-label="SmartFixx Administration, voir le site">
            <img src="/smartfixx-logo.webp" width="36" height="36" alt="" />
            <span className="pn-brand-text"><span>SmartFixx</span><small>Administration</small></span>
          </Link>
          <TabsPrimitive.List className="pn-nav" aria-label="Sections de l’administration">
            {NAV.map(item => (
              <TabsPrimitive.Trigger key={item.id} value={item.id} className="pn-nav-item">
                <item.icon size={20} aria-hidden={true} />
                <span className="pn-nav-label">{item.label}</span>
                {item.id === "requests" ? badge : null}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>
          <div className="pn-rail-foot">
            <Link className="pn-nav-item pn-nav-link" href="/" target="_blank" rel="noreferrer"><ArrowUpRight size={20} aria-hidden="true" /><span className="pn-nav-label">Voir le site</span></Link>
            <div className="pn-owner"><span className="pn-avatar" aria-hidden="true">{first.slice(0, 1).toUpperCase()}</span><span className="pn-owner-text"><span>{first}</span><small>Propriétaire</small></span></div>
            <a className="pn-nav-item pn-nav-link" href={signoutHref} target="_top"><LogOut size={20} aria-hidden="true" /><span className="pn-nav-label">Se déconnecter</span></a>
          </div>
        </aside>

        <div className="pn-canvas">
          <header className="pn-topbar">
            <Link className="pn-topbar-brand" href="/" aria-label="SmartFixx, voir le site"><img src="/smartfixx-logo.webp" width="32" height="32" alt="" /></Link>
            <p className="pn-crumb"><span className="pn-crumb-root">Administration</span><span className="pn-crumb-sep" aria-hidden="true">/</span><span className="pn-crumb-here">{current.label}</span></p>
            <span className="pn-theme-slot" aria-hidden="true" />
          </header>
          <main id="contenu" className="pn-main" tabIndex={-1}>
            <TabsPrimitive.Content value="overview" className="pn-panel"><AdminAnalytics inbox={inbox} onInbox={() => go("requests")} /></TabsPrimitive.Content>
            <TabsPrimitive.Content value="requests" className="pn-panel"><AdminDashboard name={name} /></TabsPrimitive.Content>
            <TabsPrimitive.Content value="campaigns" className="pn-panel"><AdminCampaigns onFollowup={() => go("emails", "stop")} onInbox={() => go("requests")} /></TabsPrimitive.Content>
            <TabsPrimitive.Content value="emails" className="pn-panel"><AdminEmailCampaigns onInbox={() => go("requests")} onCampaigns={() => go("campaigns")} /></TabsPrimitive.Content>
            <TabsPrimitive.Content value="acquisition" className="pn-panel"><Acquisition hostingNote={hostingNote} /></TabsPrimitive.Content>
          </main>
        </div>
      </TabsPrimitive.Root>

      <nav className="pn-bottom" aria-label="Navigation du panel">
        {(["requests", "campaigns", "emails"] as View[]).map(id => {
          const item = NAV.find(n => n.id === id)!;
          return (
            <button key={id} type="button" className="pn-bottom-item" aria-current={view === id ? "page" : undefined} onClick={() => go(id, id === "emails" ? "stop" : undefined)}>
              <span className="pn-bottom-icon"><item.icon size={22} aria-hidden={true} />{id === "requests" ? badge : null}</span>
              <span>{item.short}</span>
            </button>
          );
        })}
        <button type="button" className="pn-bottom-item" aria-current={view === "overview" || view === "acquisition" ? "page" : undefined} aria-haspopup="dialog" aria-expanded={more} onClick={() => setMore(true)}>
          <span className="pn-bottom-icon"><Menu size={22} aria-hidden="true" /></span>
          <span>Plus</span>
        </button>
      </nav>

      <Sheet open={more} onOpenChange={setMore}>
        <SheetContent side="bottom" showCloseButton={false} className="pn-more">
          <div className="pn-sheet-head">
            <SheetTitle className="pn-sheet-title">Plus</SheetTitle>
            <button type="button" className="pn-close" onClick={() => setMore(false)}><X size={18} aria-hidden="true" /><span>Fermer</span></button>
          </div>
          <SheetDescription className="pn-sr">Autres sections du panel, site et déconnexion.</SheetDescription>
          <ul className="pn-more-list">
            <li><button type="button" className="pn-more-item" aria-current={view === "overview" ? "page" : undefined} onClick={() => go("overview")}><ChartNoAxesCombined size={20} aria-hidden="true" />Tableau de bord</button></li>
            <li><button type="button" className="pn-more-item" aria-current={view === "acquisition" ? "page" : undefined} onClick={() => go("acquisition")}><Search size={20} aria-hidden="true" />Acquisition & SEO</button></li>
            <li><Link className="pn-more-item" href="/" target="_blank" rel="noreferrer"><ArrowUpRight size={20} aria-hidden="true" />Voir le site</Link></li>
            <li><a className="pn-more-item" href={signoutHref} target="_top"><LogOut size={20} aria-hidden="true" />Se déconnecter</a></li>
          </ul>
          <p className="pn-more-note"><span className="pn-avatar" aria-hidden="true">{first.slice(0, 1).toUpperCase()}</span>{first} · Propriétaire. Le choix clair ou sombre est en haut à droite.</p>
        </SheetContent>
      </Sheet>
    </div>
  );
}
