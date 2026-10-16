/* Panel (lot 6) : pastilles d'état des campagnes et des envois (point + texte, jamais la couleur seule).
   Classes sx-chip du socle (contrastes vérifiés) ; pn-chip--danger pour les échecs. L'ambre (signal) reste
   réservé aux nouvelles demandes. */
const RUN: Record<string, string> = { draft: "sx-chip", running: "sx-chip sx-chip--accent", paused: "sx-chip sx-chip--violet", completed: "sx-chip sx-chip--success", cancelled: "sx-chip" };
const TARGET: Record<string, string> = { queued: "sx-chip", leased: "sx-chip sx-chip--accent", sending: "sx-chip sx-chip--accent", accepted: "sx-chip sx-chip--success", failed: "sx-chip pn-chip--danger", unknown: "sx-chip sx-chip--violet", excluded: "sx-chip", cancelled: "sx-chip", closed: "sx-chip" };
export const runChip = (status: string) => `${RUN[status] || "sx-chip"} pn-chip`;
export const targetChip = (status: string) => `${TARGET[status] || "sx-chip"} pn-chip`;
