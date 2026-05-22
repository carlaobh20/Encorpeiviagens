import type { FlightAwardProvider } from "./types";
import { mockProvider } from "./mock";
import { manualProvider } from "./manual";

export type ProviderName = "mock" | "latam_web" | "manual";

/**
 * Retorna o provider configurado via env AWARD_PROVIDER.
 * O LatamWebProvider é carregado dinamicamente porque depende do Playwright
 * (que não pode ser empacotado em ambientes sem browser, ex: Vercel serverless).
 */
export async function getAwardProvider(): Promise<FlightAwardProvider> {
  const name = (process.env.AWARD_PROVIDER ?? "mock") as ProviderName;
  if (name === "mock") return mockProvider;
  if (name === "manual") return manualProvider;
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

export { mockProvider, manualProvider };
export type { FlightAwardProvider } from "./types";
