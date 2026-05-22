import Link from "next/link";
import { GlassCard } from "@/components/ui/Card";
import { CABIN_LABELS } from "@/lib/constants";
import { discountPct, formatPoints } from "@/lib/utils";
import type { MonitoredRoute } from "@/lib/types";

export function RouteCard({ route }: { route: MonitoredRoute }) {
  const hasData = route.current_points != null && route.avg_points != null && route.avg_points > 0;
  const current = route.current_points ?? 0;
  const avg = route.avg_points ?? 0;
  const disc = hasData ? discountPct(current, avg) : 0;
  const dotColor = !route.is_active
    ? "#94A3B8"
    : !hasData
      ? "#64748B"
      : disc >= 30
        ? "#22C55E"
        : disc > 0
          ? "#38BDF8"
          : "#F59E0B";

  return (
    <Link href={`/monitoramentos/${route.id}`} className="block">
      <GlassCard className="flex items-center gap-3.5 p-4 mb-2.5">
        <span
          className="w-2 h-2 rounded-full flex-none"
          style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
        />
        <div className="flex-1 min-w-0">
          <b className="font-display text-[15px] font-bold">
            {route.origin} → {route.destination}
          </b>
          <p className="text-muted text-[11.5px] font-semibold mt-0.5">
            {CABIN_LABELS[route.cabin]} ·{" "}
            {new Date(route.departure_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} ·{" "}
            {route.is_active ? "ativo" : "pausado"}
          </p>
        </div>
        <div className="text-right">
          {hasData ? (
            <>
              <b className="font-display text-[15px] font-extrabold block">{formatPoints(current)} pts</b>
              <div className={`text-[11.5px] font-bold ${disc >= 0 ? "text-opp" : "text-danger"}`}>
                {disc >= 0 ? "↓" : "↑"} {Math.abs(disc)}% vs média
              </div>
            </>
          ) : (
            <span className="text-muted text-[11.5px] font-semibold">aguardando dados</span>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}
