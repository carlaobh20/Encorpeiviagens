import { Header, RobotBar } from "@/components/layout/Header";
import { PointsBalanceCard } from "@/components/dashboard/PointsBalanceCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { SmartScore } from "@/components/dashboard/SmartScore";
import { RouteCard } from "@/components/dashboard/RouteCard";
import { GlassCard } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { MOCK_ACCOUNT, MOCK_ROUTES, MOCK_USER } from "@/lib/mock-data";
import { smartScore } from "@/lib/smartscore";
import { formatPoints } from "@/lib/utils";

export default function DashboardPage() {
  const firstName = MOCK_USER.full_name.split(" ")[0];
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  const opp = MOCK_ROUTES[0];
  const score = smartScore({ current: opp.current_points!, avg: opp.avg_points!, lowest: opp.lowest_points!, maxPoints: opp.max_points, cabin: opp.cabin });
  const activeRoutes = MOCK_ROUTES.filter((r) => r.is_active);

  return (
    <div>
      <Header name={firstName} date={today.charAt(0).toUpperCase() + today.slice(1)} />
      <RobotBar routes={activeRoutes.length} freq="a cada 5 min" />
      <PointsBalanceCard points={MOCK_ACCOUNT.points_balance} lastSync={MOCK_ACCOUNT.last_sync_at} />

      <SectionLabel title="Oportunidade encontrada" action="Ver todas" />
      <GlassCard className="border-opp/30 bg-gradient-to-b from-opp/10 to-card/80 mb-4">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-bold text-opp bg-opp/15 border border-opp/30 px-2.5 py-1 rounded-lg">💎 ENCONTRAMOS OURO · RARO</span>
        <div className="flex items-center gap-3 my-3.5">
          <b className="font-display text-2xl font-extrabold tracking-tight">{opp.origin}</b>
          <span className="text-turq text-lg">✈</span>
          <b className="font-display text-2xl font-extrabold tracking-tight">{opp.destination}</b>
        </div>
        <div className="flex items-end gap-4">
          <span className="font-display text-3xl font-extrabold text-turq tracking-tight">{formatPoints(opp.current_points!)}<small className="text-[13px] text-muted ml-1 font-bold">pts</small></span>
          <span className="text-[13px] text-muted font-semibold line-through pb-1.5">{formatPoints(opp.avg_points!)} pts</span>
          <span className="ml-auto font-display text-[13px] font-extrabold text-opp bg-opp/15 px-2.5 py-1.5 rounded-xl mb-1">↓ 46%</span>
        </div>
        <GradientButton variant="opp" className="w-full mt-4">Ver detalhes da oportunidade</GradientButton>
      </GlassCard>

      <SectionLabel title="Seu radar de milhas" />
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="🛰" value={String(activeRoutes.length)} label="Rotas monitoradas" tone="blue" />
        <StatCard icon="🔔" value="7" label="Alertas esta semana" tone="amber" />
        <StatCard icon="💰" value="R$ 6.8k" label="Economia estimada" tone="green" />
        <StatCard icon="🎯" value="92" label="Smart Score médio" tone="violet" />
      </div>

      <SectionLabel title={`Smart Score · ${opp.origin} → ${opp.destination}`} />
      <SmartScore score={score} title={score >= 85 ? "Oportunidade rara" : "Boa oportunidade"}
        description="Preço 46% abaixo da média histórica, disponibilidade em executiva e tendência de alta nos próximos dias." />

      <SectionLabel title="Rotas monitoradas" action="Gerenciar" />
      {MOCK_ROUTES.map((r) => <RouteCard key={r.id} route={r} />)}

      <p className="text-center text-muted text-[11px] mt-5 leading-relaxed px-8">
        SmartTravel AI · dados ilustrativos<br />Seu radar de milhas está ligado.
      </p>
    </div>
  );
}

function SectionLabel({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between mt-6 mb-3 px-1">
      <h3 className="font-display text-[15px] font-bold tracking-tight">{title}</h3>
      {action && <a href="#" className="text-tech text-[12.5px] font-bold">{action}</a>}
    </div>
  );
}
