export type Audience = "b2b" | "b2c";
export type DataSource = "client" | "included";
export type PlanId = "essentiel" | "acceleration" | "performance";
export const volumes = [5000, 10000, 25000, 50000] as const;
export const plans = [
  { id: "essentiel" as const, name: "Essentiel", tagline: "Votre première campagne, bien lancée.", prices: [290, 490, 990, 1590], features: ["Audit et nettoyage de votre fichier", "Rédaction d’un email personnalisé", "Paramétrage et envoi de la campagne", "Gestion des désinscriptions", "Bilan de campagne détaillé"] },
  { id: "acceleration" as const, name: "Accélération", tagline: "Testez, optimisez, créez des opportunités.", prices: [590, 990, 1690, 2690], features: ["Tout ce qui est inclus dans Essentiel", "2 variantes de message à tester", "Une relance dans votre quota", "Segmentation de votre audience", "Analyse des réponses et recommandations", "Un interlocuteur dédié"] },
  { id: "performance" as const, name: "Performance", tagline: "Un objectif clair. Un suivi rapproché.", prices: [990, 1490, 2490, 3990], features: ["Tout ce qui est inclus dans Accélération", "Stratégie et messages par segment", "Qualification des réponses positives", "Points de suivi pendant la campagne", "Objectif de contacts intéressés au devis", "Garantie d’optimisation encadrée"] },
];
export function quotePrice(planId: PlanId, volume: number, source: DataSource, audience: Audience): number | null {
  const index = volumes.indexOf(volume as typeof volumes[number]);
  const plan = plans.find(p => p.id === planId);
  if (index < 0 || !plan) return null;
  if (source === "included" && audience === "b2c") return null;
  return plan.prices[index] + (source === "included" ? [200, 300, 600, 1000][index] : 0);
}
export const formatNumber = (value: number) => new Intl.NumberFormat("fr-FR").format(value);
export const formatEuro = (value: number) => `${formatNumber(value)} €`;
