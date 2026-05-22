import { PriceChart } from "@/components/charts/PriceChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { MOCK_PRICE_HISTORY } from "@/lib/mock-data";

export default function HistoricoPage() {
  return (
    <div className="pt-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1">Histórico</h1>
      <p className="text-muted text-sm font-medium mb-5">Evolução de preço em pontos · GRU → MIA</p>
      <PriceChart data={MOCK_PRICE_HISTORY} />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <StatCard icon="📉" value="35.2k" label="Menor preço" tone="green" />
        <StatCard icon="📊" value="62k" label="Média do período" tone="blue" />
        <StatCard icon="📈" value="74k" label="Maior preço" tone="amber" />
        <StatCard icon="💎" value="3" label="Oportunidades detectadas" tone="violet" />
      </div>
    </div>
  );
}
