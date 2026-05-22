import Link from "next/link";
import { Header, RobotBar } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { RouteCard } from "@/components/dashboard/RouteCard";
import { GlassCard } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoyaltyBalanceCard } from "@/components/dashboard/LoyaltyBalanceCard";
import { requireUser } from "@/lib/auth";
import type { Alert, LoyaltyAccount, MonitoredRoute, UserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();

  const [profileRes, loyaltyRes, routesRes, alertsRes] = await Promise.all([
    supabase.from("users_profile").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("loyalty_accounts").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("monitored_routes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("alerts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
  ]);

  const profile = profileRes.data as UserProfile | null;
  const loyalty = loyaltyRes.data as LoyaltyAccount | null;
  const routes = (routesRes.data ?? []) as MonitoredRoute[];
  const alerts = (alertsRes.data ?? []) as Alert[];

  const fullName = profile?.full_name || user.email?.split("@")[0] || "Viajante";
  const firstName = fullName.split(" ")[0];
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

  const activeRoutes = routes.filter((r) => r.is_active);
  const newAlerts = alerts.filter((a) => a.status === "new");

  return (
    <div>
      <Header name={firstName} date={today.charAt(0).toUpperCase() + today.slice(1)} />
      <RobotBar
        routes={activeRoutes.length}
        freq={activeRoutes.length ? "monitorando" : "aguardando rotas"}
      />

      <LoyaltyBalanceCard loyalty={loyalty} />

      {routes.length === 0 ? (
        <EmptyState
          icon="🛫"
          title="Sem rotas monitoradas"
          description="Cadastre sua primeira rota e o robô começa a vigiar os preços em pontos pra você."
          action={
            <Link href="/monitoramentos/nova">
              <GradientButton>+ Criar primeira rota</GradientButton>
            </Link>
          }
        />
      ) : (
        <>
          <SectionLabel title="Seu radar de milhas" />
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon="🛰" value={String(activeRoutes.length)} label="Rotas ativas" tone="blue" />
            <StatCard icon="🔔" value={String(newAlerts.length)} label="Alertas novos" tone="amber" />
            <StatCard icon="📊" value={String(routes.length)} label="Rotas no total" tone="green" />
            <StatCard icon="💎" value={String(alerts.length)} label="Oportunidades" tone="violet" />
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

function SectionLabel({ title, action, actionHref }: { title: string; action?: string; actionHref?: string }) {
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
