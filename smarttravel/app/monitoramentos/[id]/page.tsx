import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard, PremiumCard } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { SearchNowButton } from "@/components/monitoramentos/SearchNowButton";
import { CABIN_LABELS, FREQUENCIES } from "@/lib/constants";
import { formatPoints, formatBRL, timeAgo } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { recommendationLabel } from "@/lib/smartscore";
import { deleteRoute, toggleRouteActive } from "../actions";
import type { FlightSearchResult, MonitoredRoute, Recommendation } from "@/lib/types";

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
  const lastSearch = results[0];

  const { data: lastRunData } = await supabase
    .from("provider_runs")
    .select("*")
    .eq("route_id", id)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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
            label="Meta de pontos"
            value={route.max_points ? `${formatPoints(route.max_points)} pts` : "sem limite"}
          />
          <Info label="Status" value={route.is_active ? "Ativa" : "Pausada"} />
        </div>
        {route.notes && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <span className="text-muted text-[11px] font-bold uppercase tracking-wider">Notas</span>
            <p className="text-[13px] mt-1 leading-relaxed">{route.notes}</p>
          </div>
        )}
      </GlassCard>

      <div className="mb-4">
        <SearchNowButton routeId={route.id} />
      </div>

      <PremiumCard className="mb-4">
        <h3 className="font-display font-bold text-sm mb-3">Última busca</h3>
        {lastSearch ? (
          <>
            <div className="flex items-end gap-3">
              <div>
                <p className="font-display text-3xl font-extrabold text-turq tracking-tight">
                  {formatPoints(lastSearch.points_price)}
                  <small className="text-sm text-muted ml-1">pts</small>
                </p>
                {lastSearch.cash_taxes > 0 && (
                  <p className="text-muted text-xs mt-0.5">+ {formatBRL(lastSearch.cash_taxes)} em taxas</p>
                )}
              </div>
              {lastSearch.smart_score != null && (
                <div className="ml-auto text-right">
                  <span className="font-display text-2xl font-extrabold text-tech">{lastSearch.smart_score}</span>
                  <p className="text-muted text-[10px] uppercase tracking-wider font-bold">Smart Score</p>
                </div>
              )}
            </div>
            {lastSearch.recommendation && (
              <p
                className={`mt-2 text-[13px] font-bold ${recColor(
                  lastSearch.recommendation as Recommendation,
                )}`}
              >
                {recommendationLabel(lastSearch.recommendation as Recommendation)}
              </p>
            )}
            {(lastSearch.flight_number || lastSearch.departure_time) && (
              <p className="text-muted text-xs mt-2">
                {lastSearch.flight_number} · {lastSearch.departure_time}
                {lastSearch.arrival_time ? ` → ${lastSearch.arrival_time}` : ""}
              </p>
            )}
            <p className="text-muted text-xs mt-2">
              Capturado {timeAgo(lastSearch.captured_at)}
              {lastRunData?.provider ? ` · provider ${lastRunData.provider}` : ""}
            </p>
            {lastSearch.booking_url && (
              <a
                href={lastSearch.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-turq text-[12.5px] font-bold mt-2"
              >
                Abrir no site da LATAM ↗
              </a>
            )}
          </>
        ) : (
          <p className="text-muted text-[13px] font-medium leading-relaxed">
            Ainda sem buscas. Clique em <b>Buscar agora</b> acima pra rodar a primeira busca automática.
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
          <GradientButton variant="ghost" className="w-full !text-[13px]">
            Ver histórico de preços ({results.length})
          </GradientButton>
        </Link>
      )}
    </div>
  );
}

function recColor(r: Recommendation): string {
  return {
    buy_now: "text-opp",
    good_deal: "text-tech",
    monitor: "text-amber-400",
    expensive: "text-danger",
  }[r];
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted text-[11px] font-bold uppercase tracking-wider">{label}</div>
      <div className="font-display font-bold text-sm mt-0.5">{value}</div>
    </div>
  );
}
