import type {
  AwardFlightResult,
  AwardSearchParams,
  FlightAwardProvider,
  ProviderRunDebug,
} from "./types";
import { latamApiProvider } from "./latam-api";

/**
 * LatamProvider — orquestra modo API (HTTP direto) e Browser (Playwright).
 *
 * Env LATAM_MODE:
 *  - "api"     → só HTTP. Funciona em Vercel. Default.
 *  - "browser" → só Playwright. Precisa Chromium instalado.
 *  - "auto"    → tenta API primeiro; se vier vazio, cai pro browser.
 */
export const latamProvider: FlightAwardProvider = {
  name: "latam",
  label: "LATAM (auto)",
  isProduction: false,

  async searchAwardFlights(params: AwardSearchParams) {
    const mode = (process.env.LATAM_MODE ?? "api").toLowerCase();

    if (mode === "browser") {
      return runBrowser(params);
    }

    const apiOut = await latamApiProvider.searchAwardFlights(params);
    if (mode === "api") return apiOut;

    // auto: se API vazia, tenta browser
    if (apiOut.results.length === 0) {
      const browserOut = await runBrowser(params);
      if (browserOut.results.length > 0) return browserOut;
    }
    return apiOut;
  },
};

async function runBrowser(
  params: AwardSearchParams,
): Promise<{ results: AwardFlightResult[]; debug?: ProviderRunDebug }> {
  try {
    const mod = await import("./latam-web");
    return mod.latamWebProvider.searchAwardFlights(params);
  } catch (err) {
    console.warn("[latamProvider] browser indisponível:", err);
    return { results: [] };
  }
}
