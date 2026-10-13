/* Client JSON défensif, partagé par le formulaire, CampaignFlow et le panel.
   Ne lève jamais : réseau coupé, réponse HTML (502 de Nginx), JSON invalide ou statut d'erreur sont
   tous rendus comme un résultat typé. Plus jamais « Failed to fetch » ni « Unexpected token » à l'écran. */
import { SITE_IDENTITY } from "./site-identity";

export type FetchKind = "network" | "http" | "invalid-json";
export type JsonResult<T> =
  | { ok: true; status: number; data: T; kind?: undefined }
  | { ok: false; status: number; data: unknown; kind: FetchKind };

async function request<T>(url: string, init: RequestInit): Promise<JsonResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, { credentials: "same-origin", ...init, headers: { Accept: "application/json", ...(init.headers || {}) } });
  } catch {
    return { ok: false, status: 0, data: null, kind: "network" };
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, status: res.status, data, kind: "http" };
  if (data === null) return { ok: false, status: res.status, data: null, kind: "invalid-json" };
  return { ok: true, status: res.status, data: data as T };
}

/* Envoi JSON. La charge utile est passée telle quelle : à l'appelant de la construire explicitement. */
export function postJson<T = unknown>(url: string, body: unknown, init: RequestInit = {}): Promise<JsonResult<T>> {
  return request<T>(url, { method: "POST", ...init, headers: { "Content-Type": "application/json", ...(init.headers || {}) }, body: JSON.stringify(body) });
}

export function getJson<T = unknown>(url: string, init: RequestInit = {}): Promise<JsonResult<T>> {
  return request<T>(url, { method: "GET", cache: "no-store", ...init });
}

/* Message français pour un échec, avec repli téléphone et email. Un message « error » renvoyé par le
   serveur en 400 ou 429 est repris tel quel (il est déjà rédigé en français côté API). */
export function frenchError(kind: FetchKind, status: number, data?: unknown): string {
  const fallback = `Vous pouvez aussi m'appeler au ${SITE_IDENTITY.PHONE_DISPLAY} ou écrire à ${SITE_IDENTITY.EMAIL}.`;
  const serverMessage = data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string" ? (data as { error: string }).error : "";
  if (kind === "network") return `Connexion impossible. Vérifiez votre connexion internet puis réessayez. ${fallback}`;
  if (kind === "invalid-json") return `Le service a renvoyé une réponse inattendue. Réessayez dans un instant. ${fallback}`;
  if ((status === 400 || status === 429) && serverMessage) return serverMessage;
  if (status === 400) return "Vérifiez les champs signalés.";
  if (status === 401 || status === 403) return `La demande n'a pas pu être vérifiée. Rechargez la page puis réessayez. ${fallback}`;
  if (status === 429) return `Plusieurs demandes ont déjà été reçues. Réessayez dans une heure. ${fallback}`;
  return `Le service est momentanément indisponible (erreur ${status}). Réessayez dans un instant. ${fallback}`;
}
