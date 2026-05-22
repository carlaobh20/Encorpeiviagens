import type { SupabaseClient } from "@supabase/supabase-js";
import { evaluateAlerts } from "./alert-rules";
import { getAwardProvider, getProviderName } from "./providers";
import { calculateSmartScore, recommendationFromScore } from "./smartscore";
import type { Alert, FlightSearchResult, MonitoredRoute } from "./types";
import { daysUntil, discountPct } from "./utils";

export interface RunRouteOutput {
  runId: string;
  status: "success" | "failed" | "empty";
  resultsCount: number;
  bestPrice: number | null;
  alertCreated: Alert | null;
  errorMessage?: string | null;
  debugScreenshotPath?: string | null;
}

/**
 * Executa uma rota: chama provider, salva resultados, recalcula stats,
 * cria alertas se preciso e registra um provider_run.
 *
 * Usa qualquer SupabaseClient (cliente normal com user_id, ou admin no worker).
 */
export async function runRouteSearch(
  db: SupabaseClient,
  route: MonitoredRoute,
): Promise<RunRouteOutput> {
  const providerName = getProviderName();

  // 1. abre provider_run
  const { data: runRow } = await db
    .from("provider_runs")
    .insert({
      user_id: route.user_id,
      route_id: route.id,
      provider: providerName,
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();
  const runId = runRow?.id as string;

  try {
    const provider = await getAwardProvider();
    const { results, debug } = await provider.searchAwardFlights({
      origin: route.origin,
      destination: route.destination,
      departureDate: route.departure_date,
      returnDate: route.return_date,
      cabin: route.cabin,
      passengers: route.passengers,
    });

    if (results.length === 0) {
      await db
        .from("provider_runs")
        .update({
          status: "empty",
          finished_at: new Date().toISOString(),
          results_count: 0,
          debug_screenshot_path: debug?.screenshotPath ?? null,
        })
        .eq("id", runId);
      return { runId, status: "empty", resultsCount: 0, bestPrice: null, alertCreated: null };
    }

    // 2. busca histórico anterior pra estatísticas
    const { data: previous } = await db
      .from("flight_search_results")
      .select("points_price")
      .eq("route_id", route.id)
      .order("captured_at", { ascending: false })
      .limit(60);

    const previousPrices = (previous ?? []).map((r) => r.points_price as number);

    const cheapest = results[0]; // mock já ordena; provider real é responsável por ordenar
    const newPrice = cheapest.pointsPrice;

    const allPrices = [...previousPrices, newPrice];
    const avg = Math.round(allPrices.reduce((s, p) => s + p, 0) / allPrices.length);
    const lowest = Math.min(...allPrices);
    const dDays = route.departure_date ? daysUntil(route.departure_date) : undefined;
    const score = calculateSmartScore({
      current: newPrice,
      avg,
      lowest,
      maxPoints: route.max_points,
      cabin: route.cabin,
      daysUntilDeparture: dDays,
      sampleSize: allPrices.length,
    });
    const recommendation = recommendationFromScore(score);

    // 3. salva resultados (todos os voos retornados, com Smart Score só no mais barato)
    const capturedAt = new Date().toISOString();
    const rowsToInsert = results.map((r, idx) => ({
      route_id: route.id,
      user_id: route.user_id,
      provider: providerName,
      origin: route.origin,
      destination: route.destination,
      departure_date: route.departure_date,
      return_date: route.return_date,
      cabin: route.cabin,
      passengers: route.passengers,
      points_price: r.pointsPrice,
      cash_taxes: r.cashTaxes,
      flight_number: r.flightNumber,
      departure_time: r.departureTime,
      arrival_time: r.arrivalTime,
      airline: r.airline,
      booking_url: r.bookingUrl,
      raw_payload: r.raw ?? null,
      smart_score: idx === 0 ? score : null,
      recommendation: idx === 0 ? recommendation : null,
      captured_at: capturedAt,
    }));

    const { data: inserted } = await db
      .from("flight_search_results")
      .insert(rowsToInsert)
      .select();

    const cheapestRow = inserted?.[0] as FlightSearchResult | undefined;

    // 4. avalia alerta
    let alertCreated: Alert | null = null;
    const candidate = evaluateAlerts({
      route,
      currentPrice: newPrice,
      avgPrice: avg,
      lowestPrice: previousPrices.length ? Math.min(...previousPrices) : newPrice,
      smartScore: score,
      previousCount: previousPrices.length,
    });

    if (candidate) {
      const discount = discountPct(newPrice, avg);
      const { data: alertRow } = await db
        .from("alerts")
        .insert({
          user_id: route.user_id,
          route_id: route.id,
          result_id: cheapestRow?.id ?? null,
          type: candidate.type,
          title: candidate.title,
          message: candidate.message,
          points_price: newPrice,
          threshold_points: route.max_points || null,
          discount_percentage: candidate.discount_percentage,
          smart_score: score,
          status: "new",
        })
        .select()
        .single();
      alertCreated = (alertRow as Alert) ?? null;
    }

    await db
      .from("provider_runs")
      .update({
        status: "success",
        finished_at: new Date().toISOString(),
        results_count: results.length,
        debug_screenshot_path: debug?.screenshotPath ?? null,
      })
      .eq("id", runId);

    return {
      runId,
      status: "success",
      resultsCount: results.length,
      bestPrice: newPrice,
      alertCreated,
      debugScreenshotPath: debug?.screenshotPath ?? null,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await db
      .from("provider_runs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error_message: msg,
      })
      .eq("id", runId);
    return {
      runId,
      status: "failed",
      resultsCount: 0,
      bestPrice: null,
      alertCreated: null,
      errorMessage: msg,
    };
  }
}
