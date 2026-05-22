import { NextResponse, type NextRequest } from "next/server";
import { createServer } from "@/lib/supabase-server";
import { getAwardProvider, getProviderName } from "@/lib/providers";
import type { Cabin } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Dispara uma busca no provider atual SEM persistir nada no banco.
 * Útil pra inspecionar o que o LATAM (api/browser) tá devolvendo.
 *
 * POST /api/provider/probe
 * Body: { origin, destination, departureDate, returnDate?, cabin?, passengers? }
 */
export async function POST(request: NextRequest) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string | null;
    cabin?: Cabin;
    passengers?: number;
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { origin, destination, departureDate } = body;
  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: "missing_fields", required: ["origin", "destination", "departureDate"] },
      { status: 400 },
    );
  }

  const provider = await getAwardProvider();
  const started = Date.now();
  const { results, debug } = await provider.searchAwardFlights({
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    departureDate,
    returnDate: body.returnDate ?? null,
    cabin: (body.cabin ?? "economica") as Cabin,
    passengers: Math.max(1, Math.min(9, body.passengers ?? 1)),
  });
  const elapsedMs = Date.now() - started;

  return NextResponse.json({
    provider: getProviderName(),
    elapsedMs,
    count: results.length,
    cheapest: results[0] ?? null,
    results,
    debug: debug ?? null,
  });
}
