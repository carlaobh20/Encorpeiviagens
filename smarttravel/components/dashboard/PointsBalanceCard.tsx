"use client";
import { GlassCard } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { formatPoints, timeAgo } from "@/lib/utils";
import { useState } from "react";

export function PointsBalanceCard({ points, lastSync }: { points: number; lastSync: string | null }) {
  const [syncing, setSyncing] = useState(false);
  return (
    <GlassCard className="mb-4">
      <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.3),transparent_70%)] blur-sm" />
      <div className="flex items-center gap-2.5 relative">
        <div className="w-9 h-9 rounded-xl grid place-items-center font-display font-extrabold text-xs bg-gradient-to-br from-[#E1318E] to-ai shadow-[0_6px_18px_-6px_rgba(225,49,142,0.6)]">LA</div>
        <div>
          <div className="font-display text-sm font-bold">LATAM Pass</div>
          <div className="text-muted text-xs font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-opp shadow-[0_0_8px_#22C55E]" />
            Sincronizado {lastSync ? timeAgo(lastSync) : "—"}
          </div>
        </div>
      </div>
      <div className="font-display font-extrabold text-[44px] leading-none tracking-tighter my-3.5 bg-gradient-to-br from-white to-muted bg-clip-text text-transparent">
        {formatPoints(points)}<span className="text-lg text-muted ml-1.5">pts</span>
      </div>
      <div className="text-muted text-xs font-semibold">≈ R$ 4.235 em valor de resgate estimado</div>
      <GradientButton variant="opp" className="absolute bottom-4 right-4 !py-2 !px-3.5 !text-xs"
        onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 1100); }}>
        {syncing ? "Atualizando…" : "↻ Atualizar"}
      </GradientButton>
    </GlassCard>
  );
}
