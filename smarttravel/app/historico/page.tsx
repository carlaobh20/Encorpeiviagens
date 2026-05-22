import Link from "next/link";
import { PriceChart } from "@/components/charts/PriceChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { requireUser } from "@/lib/auth";
import { formatPoints } from "@/lib/utils";
import type { FlightSearchResult, MonitoredRoute, PricePoint } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ route?: string }>;
}) {
  const { route: routeId } = await searchParams;
  const { supabase, user } = await requireUser();

  // Se rota não veio no querystring, pega a mais recente.
  let route: MonitoredRoute | null = null;
  if (routeId) {
    const { data } = await supabase
      .from("monitored_routes")
      .select("*")
      .eq("id", routeId)
      .eq("user_id", user.id)
      .maybeSingle();
    route = data as MonitoredRoute | null;
  } else {
    const { data } = await supabase
      .from("monitored_routes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    route = data as MonitoredRoute | null;
  }

  if (!route) {
    return (
      <div className="pt-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1">Histórico</h1>
        <p className="text-muted text-sm font-medium mb-5">Evolução de preços em pontos.</p>
        <EmptyState
          icon="📊"
          title="Sem rotas para mostrar"
          description="Crie uma rota e o histórico de preços começa a ser registrado a cada varredura."
          action={
            <Link href="/monitoramentos/nova">
              <GradientButton>+ Criar primeira rota</GradientButton>
            </Link>
          }
        />
      </div>
    );
  }

  const { data: resultsData } = await supabase
    .from("flight_search_results")
    .select("*")
    .eq("route_id", route.id)
    .order("captured_at", { ascending: true });
  const results = (resultsData ?? []) as FlightSearchResult[];

  const chartData: PricePoint[] = results.map((r) => ({
    date: new Date(r.captured_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    points: r.points_price,
  }));

  const prices = results.map((r) => r.points_price);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;
  const avg = prices.length ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length) : 0;

  return (
    <div className="pt-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1">Histórico</h1>
      <p className="text-muted text-sm font-medium mb-5">
        Evolução de preço em pontos · {route.origin} → {route.destination}
      </p>

      {results.length === 0 ? (
        <EmptyState
          icon="⏳"
          title="Aguardando primeira varredura"
          description="Assim que o robô fizer a primeira leitura nessa rota, o histórico aparece aqui."
        />
      ) : (
        <>
          <PriceChart data={chartData} />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <StatCard icon="📉" value={formatPoints(min)} label="Menor preço" tone="green" />
            <StatCard icon="📊" value={formatPoints(avg)} label="Média do período" tone="blue" />
            <StatCard icon="📈" value={formatPoints(max)} label="Maior preço" tone="amber" />
            <StatCard icon="💎" value={String(results.length)} label="Leituras" tone="violet" />
          </div>
        </>
      )}
    </div>
  );
}
