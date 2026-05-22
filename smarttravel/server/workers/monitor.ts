/**
 * SmartTravel AI — Worker de monitoramento
 *
 * Roda separado do app (Railway / Render / Fly.io / cron).
 * Fluxo:
 *   1. Busca rotas ativas no Supabase
 *   2. Para cada rota, pesquisa preço em pontos na LATAM (logado se houver sessão)
 *   3. Salva o resultado no histórico
 *   4. Compara com max_points e média histórica
 *   5. Gera alerta se bater alguma regra
 *   6. Envia o alerta via Telegram
 *
 * Rodar localmente:  npm run worker
 */
import { createAdmin } from "../../lib/supabase";
import { searchLatamPoints } from "../../lib/latam";
import { decryptSession } from "../../lib/crypto";
import { buildAlertMessage, sendTelegram } from "../../lib/alerts";
import { smartScore } from "../../lib/smartscore";
import { discountPct } from "../../lib/utils";
import { ALERT_RULES, CABIN_LABELS } from "../../lib/constants";
import type { MonitoredRoute, LoyaltyAccount } from "../../lib/types";

async function run() {
  console.log("🛰  SmartTravel worker iniciado:", new Date().toISOString());
  const db = createAdmin();

  // 1. rotas ativas
  const { data: routes, error } = await db.from("monitored_routes").select("*").eq("is_active", true);
  if (error) { console.error("Erro ao buscar rotas:", error.message); return; }
  console.log(`Encontradas ${routes?.length ?? 0} rotas ativas.`);

  for (const route of (routes ?? []) as MonitoredRoute[]) {
    try {
      // sessão LATAM do usuário (se conectado)
      const { data: acc } = await db.from("loyalty_accounts")
        .select("*").eq("user_id", route.user_id).eq("provider", "latam_pass").maybeSingle();
      const account = acc as LoyaltyAccount | null;
      let session: string | null = null;
      if (account?.encrypted_session) {
        try { session = decryptSession(account.encrypted_session); } catch { session = null; }
      }

      // 2. pesquisar preço
      const result = await searchLatamPoints({
        origin: route.origin, destination: route.destination,
        departureDate: route.departure_date, cabin: route.cabin,
        passengers: route.passengers, encryptedSession: session,
      });
      if (!result) { console.log(`  ${route.origin}→${route.destination}: sem resultado (scraping não implementado).`); continue; }

      // 3. salvar histórico
      await db.from("flight_search_results").insert({
        route_id: route.id, user_id: route.user_id, provider: "latam_pass",
        origin: route.origin, destination: route.destination, departure_date: route.departure_date,
        cabin: route.cabin, points_price: result.pointsPrice, cash_taxes: result.cashTaxes,
        flight_number: result.flightNumber, airline: result.airline,
        booking_url: result.bookingUrl, raw_payload: result.rawPayload, captured_at: new Date().toISOString(),
      });

      // 4. média histórica
      const { data: hist } = await db.from("flight_search_results")
        .select("points_price").eq("route_id", route.id).order("captured_at", { ascending: false }).limit(30);
      const prices = (hist ?? []).map((h: { points_price: number }) => h.points_price);
      const avg = prices.length ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : result.pointsPrice;
      const lowest = prices.length ? Math.min(...prices) : result.pointsPrice;
      const discount = discountPct(result.pointsPrice, avg);
      const score = smartScore({ current: result.pointsPrice, avg, lowest, maxPoints: route.max_points, cabin: route.cabin });

      // 5. regras de alerta
      const hitTarget = result.pointsPrice <= route.max_points;
      const bigDrop = discount >= ALERT_RULES.PRICE_DROP_PCT;
      const belowAvg = discount >= ALERT_RULES.BELOW_AVG_PCT;
      const isRare = score >= ALERT_RULES.RARE_SCORE;

      if (hitTarget || bigDrop || belowAvg || isRare) {
        const type = isRare ? "rare_opportunity" : bigDrop ? "price_drop" : belowAvg ? "below_average" : "target_reached";
        const title = isRare ? "🔥 Oportunidade rara encontrada" : "📉 Preço caiu";

        await db.from("alerts").insert({
          user_id: route.user_id, route_id: route.id, type, title,
          message: `${route.origin} → ${route.destination} por ${result.pointsPrice} pts`,
          points_price: result.pointsPrice, threshold_points: route.max_points,
          discount_percentage: discount, status: "new", created_at: new Date().toISOString(),
        });

        // 6. Telegram
        await sendTelegram(buildAlertMessage({
          origin: route.origin, destination: route.destination,
          cabin: CABIN_LABELS[route.cabin], points: result.pointsPrice, avg, discount,
        }));
        console.log(`  ✅ Alerta gerado para ${route.origin}→${route.destination} (score ${score}).`);
      }
    } catch (e) {
      console.error(`  Erro na rota ${route.id}:`, e);
    }
  }
  console.log("✔️  Worker finalizado.");
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
