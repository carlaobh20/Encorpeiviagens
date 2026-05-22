"use client";
import { GlassCard } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { formatPoints, timeAgo } from "@/lib/utils";
import type { Alert } from "@/lib/types";

export function AlertCard({ alert }: { alert: Alert }) {
  const isRare = alert.type === "rare_opportunity" || alert.discount_percentage >= 45;
  return (
    <GlassCard className={`mb-3 ${isRare ? "border-opp/30 bg-gradient-to-b from-opp/10 to-card/80" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-display font-bold text-[15px] leading-tight">{alert.title}</h4>
        <span className="text-muted text-[11px] font-semibold flex-none">{timeAgo(alert.created_at)}</span>
      </div>
      <p className="text-muted text-[13px] font-medium mt-2 leading-relaxed">{alert.message}</p>
      <div className="flex items-center gap-3 mt-3">
        <span className="font-display text-2xl font-extrabold text-turq tracking-tight">{formatPoints(alert.points_price)}<small className="text-xs text-muted ml-1">pts</small></span>
        <span className="ml-auto font-display text-sm font-extrabold text-opp bg-opp/15 px-2.5 py-1.5 rounded-xl">↓ {alert.discount_percentage}%</span>
      </div>
      <div className="flex gap-2 mt-4">
        <GradientButton variant="opp" className="flex-1 !text-[13px]">Ver voo</GradientButton>
        <GradientButton variant="ghost" className="!text-[13px]">Salvar</GradientButton>
        <GradientButton variant="ghost" className="!text-[13px]">Ignorar</GradientButton>
      </div>
    </GlassCard>
  );
}
