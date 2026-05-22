import { NextResponse } from "next/server";
import { getProviderName } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET() {
  const name = getProviderName();
  const labels: Record<string, string> = {
    mock: "Mock (demonstração)",
    latam: "LATAM (auto: api → browser)",
    latam_api: "LATAM (API pública)",
    latam_web: "LATAM (browser via Playwright)",
    manual: "Entrada manual",
  };
  return NextResponse.json({
    name,
    label: labels[name] ?? name,
    isProduction: name === "manual",
    config: {
      latamMode: process.env.LATAM_MODE ?? "api",
      apiBase: process.env.LATAM_API_BASE ?? "https://www.latamairlines.com",
      apiPath: process.env.LATAM_API_PATH ?? "/bff/air-offers/v2/offers/search",
      headless: process.env.LATAM_HEADLESS ?? "true",
      debug: process.env.LATAM_DEBUG === "true",
    },
  });
}
