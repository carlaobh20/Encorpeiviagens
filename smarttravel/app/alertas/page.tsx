import { AlertCard } from "@/components/dashboard/AlertCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireUser } from "@/lib/auth";
import type { Alert } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AlertasPage() {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "ignored")
    .order("created_at", { ascending: false });

  const alerts = (data ?? []) as Alert[];

  return (
    <div className="pt-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1">Alertas</h1>
      <p className="text-muted text-sm font-medium mb-5">Oportunidades que o robô encontrou pra você.</p>
      {alerts.length ? (
        alerts.map((a) => <AlertCard key={a.id} alert={a} />)
      ) : (
        <EmptyState
          icon="🔔"
          title="Nenhum alerta ainda"
          description="Quando o robô achar uma oportunidade nas suas rotas, ela aparece aqui."
        />
      )}
    </div>
  );
}
