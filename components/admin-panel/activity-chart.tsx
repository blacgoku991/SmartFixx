"use client";
/* Panel (lot 6) : courbe des vues et des demandes, chargée par import() différé depuis le tableau de bord
   (recharts n'entre pas dans le JS initial du panel). Couleurs aux jetons --sx- (attributs SVG en var()),
   aucune animation (isAnimationActive=false). */
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type ChartPoint = { day: string; views: number; leads: number };

export default function ActivityChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="pn-views-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--sx-accent)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--sx-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--sx-line)" strokeDasharray="3 5" vertical={false} />
        <XAxis dataKey="day" stroke="var(--sx-text-muted)" tickLine={false} axisLine={false} minTickGap={28} tick={{ fontSize: 12, fill: "var(--sx-text-muted)" }} />
        <YAxis stroke="var(--sx-text-muted)" tickLine={false} axisLine={false} allowDecimals={false} width={40} tick={{ fontSize: 12, fill: "var(--sx-text-muted)" }} />
        <Tooltip contentStyle={{ background: "var(--sx-surface-2)", border: "1px solid var(--sx-line-strong)", borderRadius: 12, color: "var(--sx-text)" }} labelStyle={{ color: "var(--sx-text-muted)" }} itemStyle={{ color: "var(--sx-text)" }} />
        <Area type="monotone" dataKey="views" name="Vues mesurées" stroke="var(--sx-accent)" strokeWidth={2.5} fill="url(#pn-views-fill)" isAnimationActive={false} />
        <Area type="monotone" dataKey="leads" name="Demandes enregistrées" stroke="var(--chart-2)" strokeWidth={2} fill="none" isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
