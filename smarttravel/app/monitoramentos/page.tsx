import { RouteCard } from "@/components/dashboard/RouteCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { MOCK_ROUTES } from "@/lib/mock-data";

export default function MonitoramentosPage() {
  return (
    <div className="pt-4">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Monitoramentos</h1>
      </div>
      <p className="text-muted text-sm font-medium mb-5">{MOCK_ROUTES.filter(r => r.is_active).length} rotas ativas sendo vigiadas.</p>
      <GradientButton className="w-full mb-5">+ Nova rota monitorada</GradientButton>
      {MOCK_ROUTES.map((r) => <RouteCard key={r.id} route={r} />)}
    </div>
  );
}
