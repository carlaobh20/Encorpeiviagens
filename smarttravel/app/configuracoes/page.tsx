import { PremiumCard } from "@/components/ui/Card";

export default function ConfiguracoesPage() {
  const groups = [
    { title: "Notificações", items: ["Push", "Telegram", "E-mail"] },
    { title: "Robô", items: ["Frequência de varredura", "Programas de fidelidade"] },
    { title: "Privacidade", items: ["Desconectar LATAM", "Apagar minha conta"] },
  ];
  return (
    <div className="pt-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-5">Configurações</h1>
      {groups.map((g) => (
        <div key={g.title} className="mb-4">
          <h3 className="font-display text-xs font-bold text-muted uppercase tracking-wider mb-2 px-1">{g.title}</h3>
          <PremiumCard className="!p-0 divide-y divide-white/5">
            {g.items.map((it) => (
              <div key={it} className="px-4 py-3.5 flex items-center justify-between text-sm font-semibold">
                {it}<span className="text-muted">›</span>
              </div>
            ))}
          </PremiumCard>
        </div>
      ))}
    </div>
  );
}
