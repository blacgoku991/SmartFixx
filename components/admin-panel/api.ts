/* Panel (lot 6) : client d'API partagé par le tableau de bord, les campagnes, les emails et le shell.
   Il ne change ni les URL, ni les méthodes, ni les corps : il passe par lib/fetch-json (JSON protégé,
   jamais « Failed to fetch » ni « Unexpected token » à l'écran) et ajoute deux règles du panel :
   - session perdue (401, ou 403 « Accès administrateur requis. ») : retour à la connexion, onglet conservé ;
   - un 403 « Origine non autorisée. » n'est PAS une session perdue : son message est affiché tel quel. */
import { frenchError, getJson, postJson, type JsonResult } from "@/lib/fetch-json";

export type PanelTab = "overview" | "requests" | "analytics" | "acquisition" | "emails" | "campaigns";

/* Base de connexion : « /admin/login?retour= » sur le VPS, « /admin?tab= » sur la variante Sites (la page
   /admin y affiche la connexion ChatGPT). Réglée par AdminWorkspace, qui seul sait quelle variante tourne. */
let loginBase = "/admin?tab=";
let currentTab: PanelTab = "overview";
export function configurePanel(options: { loginBase?: string; tab?: PanelTab }) {
  if (options.loginBase) loginBase = options.loginBase;
  if (options.tab) currentTab = options.tab;
}

const ORIGIN_REFUSED = "Origine non autorisée.";
const serverError = (data: unknown) => (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string" ? (data as { error: string }).error : "");

/* Vrai si la réponse signale une session expirée ; déclenche alors le retour à la connexion. */
export function sessionLost(result: JsonResult<unknown>, tab: PanelTab = currentTab): boolean {
  if (result.ok || result.kind !== "http") return false;
  const lost = result.status === 401 || (result.status === 403 && serverError(result.data) !== ORIGIN_REFUSED);
  if (lost && typeof window !== "undefined") window.location.assign(loginBase + encodeURIComponent(tab));
  return lost;
}

/* Message français d'un échec. Les messages JSON du panel sont déjà rédigés en français par l'API (409,
   400, 503…) : ils sont repris. Réseau coupé, HTML de passerelle ou statut nu : message du panel (le
   repli « appelez Mohamed » de frenchError vise les visiteurs, pas le propriétaire). */
export function panelMessage(result: JsonResult<unknown>): string {
  if (result.ok) return "";
  const server = serverError(result.data);
  if (result.kind === "http" && server) return server === ORIGIN_REFUSED ? "Action refusée par le contrôle d’origine. Ouvrez le panel depuis https://smartfixx.fr puis réessayez." : server;
  if (result.kind === "network") return "Connexion impossible. Vérifiez votre connexion internet puis réessayez.";
  if (result.kind === "invalid-json") return "Le serveur a renvoyé une réponse inattendue. Réessayez dans un instant.";
  if (result.status === 502 || result.status === 504) return `Le serveur ne répond pas (erreur ${result.status}). Réessayez dans un instant.`;
  return frenchError(result.kind, result.status, result.data).split(" Vous pouvez aussi")[0];
}

/* Erreur levée par panelApi : le message est déjà prêt à afficher. */
export class PanelError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

/* GET sans corps (cache: no-store), ou POST JSON avec le corps tel quel ; méthode explicite pour PATCH.
   Lève une PanelError en français ; en cas de session perdue, redirige puis lève quand même. */
export async function panelApi<T>(url: string, body?: unknown, method: "POST" | "PATCH" = "POST", signal?: AbortSignal): Promise<T> {
  const result = body === undefined ? await getJson<T>(url, { signal }) : await postJson<T>(url, body, { method, signal });
  if (result.ok) return result.data;
  if (sessionLost(result)) throw new PanelError("Session expirée. Reconnexion…", result.status);
  throw new PanelError(panelMessage(result), result.status);
}

export const errorText = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);
