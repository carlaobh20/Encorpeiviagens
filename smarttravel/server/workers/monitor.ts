/**
 * SmartTravel AI — Worker de monitoramento (provider-based)
 *
 * Roda separado do app (Railway / Render / Fly.io / cron job).
 * Por padrão usa MockProvider; configure AWARD_PROVIDER=latam_web pra usar Playwright.
 *
 * Fluxo:
 *   1. Busca rotas ativas no Supabase
 *   2. Para cada rota, executa o provider via lib/search-engine
 *   3. Salva resultados, calcula Smart Score e gera alertas
 *   4. Registra provider_run com status/erro/debug
 *
 * Rodar localmente:  npm run worker
 */
import { createClient as createSb, type SupabaseClient } from "@supabase/supabase-js";
import { runRouteSearch } from "../../lib/search-engine";
import { getProviderName } from "../../lib/providers";
import type { MonitoredRoute } from "../../lib/types";

async function run() {
  console.log("🛰  SmartTravel worker iniciado:", new Date().toISOString());
  console.log("   provider:", getProviderName());

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no ambiente.");
    process.exit(1);
  }
  const db: SupabaseClient = createSb(url, key, { auth: { persistSession: false } });

  const { data: routes, error } = await db.from("monitored_routes").select("*").eq("is_active", true);
  if (error) {
    console.error("Erro ao buscar rotas:", error.message);
    return;
  }
  const list = (routes ?? []) as MonitoredRoute[];
  console.log(`Encontradas ${list.length} rotas ativas.`);

  let success = 0;
  let failed = 0;
  let withAlert = 0;

  for (const route of list) {
    const out = await runRouteSearch(db, route);
    if (out.status === "success") {
      success++;
      console.log(
        `  ✅ ${route.origin}→${route.destination}: ${out.resultsCount} voo(s), melhor ${out.bestPrice} pts${
          out.alertCreated ? " · ALERTA 🔔" : ""
        }`,
      );
      if (out.alertCreated) withAlert++;
    } else if (out.status === "empty") {
      console.log(`  ⚪ ${route.origin}→${route.destination}: sem resultado (provider vazio).`);
    } else {
      failed++;
      console.log(`  ❌ ${route.origin}→${route.destination}: ${out.errorMessage}`);
    }
  }

  console.log(`✔️  Worker finalizado: ${success} ok, ${failed} falhas, ${withAlert} alertas.`);
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
