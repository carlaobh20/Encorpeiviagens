import type { FlightAwardProvider } from "./types";
import { mockProvider } from "./mock";
import { manualProvider } from "./manual";
import { latamApiProvider } from "./latam-api";
import { latamProvider } from "./latam";

export type ProviderName = "mock" | "latam" | "latam_api" | "latam_web" | "manual";

/**
 * Retorna o provider configurado via env AWARD_PROVIDER.
 *
 *  - "mock"      → demo (default em dev)
 *  - "manual"    → fallback, nunca retorna voos
 *  - "latam_api" → HTTP direto no BFF da LATAM (roda em Vercel)
 *  - "latam_web" → Playwright (precisa Chromium, não roda em Vercel)
 *  - "latam"     → orquestrador: api → browser (config via LATAM_MODE)
 */
export async function getAwardProvider(): Promise<FlightAwardProvider> {
  const name = (process.env.AWARD_PROVIDER ?? "mock") as ProviderName;
  if (name === "mock") return mockProvider;
  if (name === "manual") return manualProvider;
  if (name === "latam_api") return latamApiProvider;
  if (name === "latam") return latamProvider;
  if (name === "latam_web") {
    try {
      const mod = await import("./latam-web");
      return mod.latamWebProvider;
    } catch (e) {
      console.warn("[providers] latam_web indisponível, caindo pra mock:", e);
      return mockProvider;
    }
  }
  return mockProvider;
}

export function getProviderName(): ProviderName {
  return (process.env.AWARD_PROVIDER ?? "mock") as ProviderName;
}

export { mockProvider, manualProvider, latamApiProvider, latamProvider };
export type { FlightAwardProvider } from "./types";
