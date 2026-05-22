import Link from "next/link";
import { RouteCard } from "@/components/dashboard/RouteCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireUser } from "@/lib/auth";
import type { MonitoredRoute } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MonitoramentosPage() {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("monitored_routes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const routes = (data ?? []) as MonitoredRoute[];
  const active = routes.filter((r) => r.is_active).length;

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Monitoramentos</h1>
      </div>
      <p className="text-muted text-sm font-medium mb-5">
        {routes.length === 0
          ? "Nenhuma rota cadastrada ainda."
          : `${active} rota${active === 1 ? "" : "s"} ativa${active === 1 ? "" : "s"} de ${routes.length}.`}
      </p>

      <Link href="/monitoramentos/nova">
        <GradientButton className="w-full mb-5">+ Nova rota monitorada</GradientButton>
      </Link>

      {routes.length === 0 ? (
        <EmptyState
          icon="🛰"
          title="Comece monitorando uma rota"
          description="Defina origem, destino, datas e o robô vai vigiar os preços em pontos."
        />
      ) : (
        routes.map((r) => <RouteCard key={r.id} route={r} />)
      )}
    </div>
  );
}
