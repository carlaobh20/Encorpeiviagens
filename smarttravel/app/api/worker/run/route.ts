import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSb } from "@supabase/supabase-js";
import { runRouteSearch } from "@/lib/search-engine";
import type { MonitoredRoute } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Roda o worker em todas as rotas ativas.
 *
 * Protegido por header `x-worker-secret` que deve bater com a env WORKER_SECRET.
 * Use isso em cron jobs (Vercel Cron, Railway, EasyCron, etc.).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.WORKER_SECRET;
  if (secret && request.headers.get("x-worker-secret") !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });
  }
  const admin = createSb(url, serviceKey, { auth: { persistSession: false } });

  const { data: routes, error } = await admin
    .from("monitored_routes")
    .select("*")
    .eq("is_active", true);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const summary: Array<{ route_id: string; status: string; price: number | null; alert: boolean }> = [];
  for (const r of (routes ?? []) as MonitoredRoute[]) {
    const out = await runRouteSearch(admin, r);
    summary.push({
      route_id: r.id,
      status: out.status,
      price: out.bestPrice,
      alert: Boolean(out.alertCreated),
    });
  }

  return NextResponse.json({ ran: summary.length, summary });
}
