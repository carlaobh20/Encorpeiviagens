import { NextResponse } from "next/server";
import { getProviderName } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET() {
  const name = getProviderName();
  const labels: Record<string, string> = {
    mock: "Mock (demonstração)",
    latam_web: "LATAM (busca pública via Playwright)",
    manual: "Entrada manual",
  };
  return NextResponse.json({
    name,
    label: labels[name] ?? name,
    isProduction: name === "manual",
    debug: {
      headless: process.env.LATAM_HEADLESS,
      debugEnabled: process.env.LATAM_DEBUG,
    },
  });
}
