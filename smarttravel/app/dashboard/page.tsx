import Link from "next/link";
import { Header, RobotBar } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { RouteCard } from "@/components/dashboard/RouteCard";
import { GlassCard } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ManualBalanceCard } from "@/components/dashboard/ManualBalanceCard";
import { requireUser } from "@/lib/auth";
import { formatPoints } from "@/lib/utils";
import { recommendationLabel } from "@/lib/smartscore";
import { getProviderName } from "@/lib/providers";
import type {
  Alert,
  FlightSearchResult,
  MonitoredRoute,
  Recommendation,
  UserProfile,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const providerName = getProviderName();

  const [profileRes, routesRes, alertsRes, latestRes] = await Promise.all([
    supabase.from("users_profile").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("monitored_routes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "ignored")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("flight_search_results")
      .select("*")
      .eq("user_id", user.id)
      .order("captured_at", { ascending: false })
      .limit(20),
  ]);

  const profile = profileRes.data as UserProfile | null;
  const routes = (routesRes.data ?? []) as MonitoredRoute[];
  const alerts = (alertsRes.data ?? []) as Alert[];
  const latest = (latestRes.data ?? []) as FlightSearchResult[];

  const fullName = profile?.full_name || user.email?.split("@")[0] || "Viajante";
  const firstName = fullName.split(" ")[0];
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const activeRoutes = routes.filter((r) => r.is_active);
  const newAlerts = alerts.filter((a) => a.status === "new");

  // Melhor oportunidade = busca com maior smart_score
  const best = latest
    .filter((r) => r.smart_score != null)
    .sort((a, b) => (b.smart_score ?? 0) - (a.smart_score ?? 0))[0];
  const bestRoute = best ? routes.find((r) => r.id === best.route_id) : null;

  return (
    <div>
      <Header
        name={firstName}
        date={today.charAt(0).toUpperCase() + today.slice(1)}
      />
      <RobotBar
        routes={activeRoutes.length}
        freq={`provider: ${providerName}`}
      />

      <ManualBalanceCard profile={profile} />

      {routes.length === 0 ? (
        <EmptyState
          icon="🛫"
          title="Sem rotas monitoradas"
          description="Cadastre sua primeira rota e o robô busca preços em pontos automaticamente."
          action={
            <Link href="/monitoramentos/nova">
              <GradientButton>+ Criar primeira rota</GradientButton>
            </Link>
          }
        />
      ) : (
        <>
          {best && bestRoute && (
            <>
              <SectionLabel title="Melhor oportunidade" action="Ver rota" actionHref={`/monitoramentos/${bestRoute.id}`} />
              <GlassCard className="border-opp/30 bg-gradient-to-b from-opp/10 to-card/80 mb-4">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-bold text-opp bg-opp/15 border border-opp/30 px-2.5 py-1 rounded-lg">
                  💎 Smart Score {best.smart_score}
                </span>
                <div className="flex items-center gap-3 my-3.5">
                  <b className="font-display text-2xl font-extrabold tracking-tight">{best.origin}</b>
                  <span className="text-turq text-lg">✈</span>
                  <b className="font-display text-2xl font-extrabold tracking-tight">{best.destination}</b>
                </div>
                <div className="flex items-end gap-4">
                  <span className="font-display text-3xl font-extrabold text-turq tracking-tight">
                    {formatPoints(best.points_price)}
                    <small className="text-[13px] text-muted ml-1 font-bold">pts</small>
                  </span>
                  {best.recommendation && (
                    <span className="ml-auto font-display text-[13px] font-extrabold text-opp bg-opp/15 px-2.5 py-1.5 rounded-xl mb-1">
                      {recommendationLabel(best.recommendation as Recommendation)}
                    </span>
                  )}
                </div>
                <Link href={`/monitoramentos/${bestRoute.id}`}>
                  <GradientButton variant="opp" className="w-full mt-4">
                    Ver detalhes da oportunidade
                  </GradientButton>
                </Link>
              </GlassCard>
            </>
          )}

          <SectionLabel title="Seu radar de milhas" />
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon="🛰" value={String(activeRoutes.length)} label="Rotas ativas" tone="blue" />
            <StatCard icon="🔔" value={String(newAlerts.length)} label="Alertas novos" tone="amber" />
            <StatCard icon="📊" value={String(latest.length)} label="Buscas recentes" tone="green" />
            <StatCard
              icon="🎯"
              value={best?.smart_score != null ? String(best.smart_score) : "—"}
              label="Melhor Score"
              tone="violet"
            />
          </div>

          <SectionLabel title="Rotas monitoradas" action="Gerenciar" actionHref="/monitoramentos" />
          {routes.slice(0, 4).map((r) => (
            <RouteCard key={r.id} route={r} />
          ))}

          {newAlerts.length > 0 && (
            <>
              <SectionLabel title="Alertas recentes" action="Ver todos" actionHref="/alertas" />
              <GlassCard className="border-opp/30 bg-gradient-to-b from-opp/10 to-card/80">
                <p className="font-display font-bold text-[15px]">{newAlerts[0].title}</p>
                <p className="text-muted text-[13px] mt-1.5 leading-relaxed">{newAlerts[0].message}</p>
                <Link href="/alertas">
                  <GradientButton variant="opp" className="w-full mt-4">
                    Ver detalhes
                  </GradientButton>
                </Link>
              </GlassCard>
            </>
          )}
        </>
      )}

      <p className="text-center text-muted text-[11px] mt-8 leading-relaxed px-8">
        SmartTravel AI · seu radar de milhas
      </p>
    </div>
  );
}

function SectionLabel({
  title,
  action,
  actionHref,
}: {
  title: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex items-center justify-between mt-6 mb-3 px-1">
      <h3 className="font-display text-[15px] font-bold tracking-tight">{title}</h3>
      {action && actionHref && (
        <Link href={actionHref} className="text-tech text-[12.5px] font-bold">
          {action}
        </Link>
      )}
    </div>
  );
}
