"use client";
import { GlassCard } from "@/components/ui/Card";
import { formatPoints } from "@/lib/utils";
import type { PricePoint } from "@/lib/types";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function PriceChart({ data, title = "Histórico de preço em pontos" }: { data: PricePoint[]; title?: string }) {
  const values = data.map((d) => d.points);
  const min = Math.min(...values), max = Math.max(...values);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  return (
    <GlassCard>
      <h3 className="font-display font-bold text-[15px] mb-1">{title}</h3>
      <div className="flex gap-4 text-xs font-semibold mb-4">
        <span className="text-opp">Mín {formatPoints(min)}</span>
        <span className="text-muted">Média {formatPoints(avg)}</span>
        <span className="text-danger">Máx {formatPoints(max)}</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ left: -18, right: 6, top: 4 }}>
          <defs>
            <linearGradient id="pc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5EEAD4" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#5EEAD4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip contentStyle={{ background: "#18213A", border: "1px solid rgba(148,163,184,.2)", borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: "#94A3B8" }} formatter={(v: number) => [`${formatPoints(v)} pts`, "Preço"]} />
          <Area type="monotone" dataKey="points" stroke="#5EEAD4" strokeWidth={2.5} fill="url(#pc)" />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
