import { NextResponse, type NextRequest } from "next/server";
import { createServer } from "@/lib/supabase-server";
import { runRouteSearch } from "@/lib/search-engine";
import type { MonitoredRoute } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { routeId?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body.routeId) return NextResponse.json({ error: "missing_routeId" }, { status: 400 });

  const { data: route } = await supabase
    .from("monitored_routes")
    .select("*")
    .eq("id", body.routeId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!route) return NextResponse.json({ error: "route_not_found" }, { status: 404 });

  const result = await runRouteSearch(supabase, route as MonitoredRoute);
  return NextResponse.json(result);
}
