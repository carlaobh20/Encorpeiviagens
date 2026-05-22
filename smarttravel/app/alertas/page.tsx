import { AlertCard } from "@/components/dashboard/AlertCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_ALERTS } from "@/lib/mock-data";

export default function AlertasPage() {
  return (
    <div className="pt-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1">Alertas</h1>
      <p className="text-muted text-sm font-medium mb-5">Oportunidades que o robô encontrou pra você.</p>
      {MOCK_ALERTS.length ? MOCK_ALERTS.map((a) => <AlertCard key={a.id} alert={a} />)
        : <EmptyState icon="🔔" title="Nenhum alerta ainda" description="Quando o robô achar uma oportunidade, ela aparece aqui." />}
    </div>
  );
}
