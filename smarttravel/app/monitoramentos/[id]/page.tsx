import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard, PremiumCard } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { CABIN_LABELS, FREQUENCIES } from "@/lib/constants";
import { formatPoints } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { deleteRoute, toggleRouteActive } from "../actions";
import type { FlightSearchResult, MonitoredRoute } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("monitored_routes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) notFound();
  const route = data as MonitoredRoute;

  const { data: resultsData } = await supabase
    .from("flight_search_results")
    .select("*")
    .eq("route_id", id)
    .order("captured_at", { ascending: false })
    .limit(20);
  const results = (resultsData ?? []) as FlightSearchResult[];
  const lastPrice = results[0]?.points_price;
  const freqLabel = FREQUENCIES.find((f) => f.value === route.monitor_frequency)?.label ?? route.monitor_frequency;

  return (
    <div className="pt-4">
      <Link href="/monitoramentos" className="text-muted text-sm font-semibold">
        ← Voltar
      </Link>

      <h1 className="font-display text-2xl font-extrabold tracking-tight mt-3">
        {route.origin} → {route.destination}
      </h1>
      <p className="text-muted text-sm font-medium mb-5">
        {CABIN_LABELS[route.cabin]} · {route.passengers} pax · {freqLabel}
      </p>

      <GlassCard className="mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Info label="Ida" value={new Date(route.departure_date).toLocaleDateString("pt-BR")} />
          <Info
            label="Volta"
            value={route.return_date ? new Date(route.return_date).toLocaleDateString("pt-BR") : "—"}
          />
          <Info
            label="Máx. pontos"
            value={route.max_points ? `${formatPoints(route.max_points)} pts` : "sem limite"}
          />
          <Info label="Status" value={route.is_active ? "Ativo" : "Pausado"} />
        </div>
      </GlassCard>

      <PremiumCard className="mb-4">
        <h3 className="font-display font-bold text-sm mb-2">Última varredura</h3>
        {lastPrice ? (
          <>
            <p className="font-display text-2xl font-extrabold text-turq">
              {formatPoints(lastPrice)} <span className="text-sm text-muted">pts</span>
            </p>
            <p className="text-muted text-xs mt-1">
              Capturado em {new Date(results[0].captured_at).toLocaleString("pt-BR")}
            </p>
          </>
        ) : (
          <p className="text-muted text-[13px] font-medium leading-relaxed">
            O robô ainda não fez uma varredura nesta rota. Assim que a primeira leitura sair, ela aparece
            aqui e no histórico.
          </p>
        )}
      </PremiumCard>

      <div className="flex gap-2 mt-6">
        <form action={toggleRouteActive} className="flex-1">
          <input type="hidden" name="id" value={route.id} />
          <input type="hidden" name="next" value={String(!route.is_active)} />
          <GradientButton variant="ghost" type="submit" className="w-full !text-[13px]">
            {route.is_active ? "Pausar" : "Ativar"}
          </GradientButton>
        </form>
        <form action={deleteRoute} className="flex-1">
          <input type="hidden" name="id" value={route.id} />
          <GradientButton variant="ghost" type="submit" className="w-full !text-[13px] !text-danger">
            Excluir rota
          </GradientButton>
        </form>
      </div>

      {results.length > 0 && (
        <Link href={`/historico?route=${route.id}`} className="block mt-3">
          <GradientButton className="w-full !text-[13px]">Ver histórico de preços</GradientButton>
        </Link>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted text-[11px] font-bold uppercase tracking-wider">{label}</div>
      <div className="font-display font-bold text-sm mt-0.5">{value}</div>
    </div>
  );
}
