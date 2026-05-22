import { GlassCard, PremiumCard } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { MOCK_ACCOUNT } from "@/lib/mock-data";
import { formatPoints, timeAgo } from "@/lib/utils";

export default function ContaPage() {
  const connected = MOCK_ACCOUNT.session_status === "connected";
  return (
    <div className="pt-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1">Conta LATAM Pass</h1>
      <p className="text-muted text-sm font-medium mb-5">Conecte para buscar disponibilidade logada e saldo real.</p>

      <GlassCard glow="violet" className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl grid place-items-center font-display font-extrabold bg-gradient-to-br from-[#E1318E] to-ai">LA</div>
          <div className="flex-1">
            <b className="font-display font-bold">LATAM Pass</b>
            <p className={`text-xs font-semibold ${connected ? "text-opp" : "text-muted"}`}>
              {connected ? `Conta conectada · saldo ${formatPoints(MOCK_ACCOUNT.points_balance)} pts` : "Não conectada"}
            </p>
          </div>
        </div>
        {connected ? (
          <>
            <p className="text-muted text-xs mt-3">Sincronizado {timeAgo(MOCK_ACCOUNT.last_sync_at!)}</p>
            <div className="flex gap-2 mt-4">
              <GradientButton variant="ghost" className="flex-1 !text-[13px]">Desconectar</GradientButton>
              <GradientButton variant="ghost" className="flex-1 !text-[13px]">Apagar dados</GradientButton>
            </div>
          </>
        ) : (
          <GradientButton className="w-full mt-4">Conectar LATAM</GradientButton>
        )}
      </GlassCard>

      <PremiumCard className="mb-4">
        <h3 className="font-display font-bold text-sm mb-2">🔒 Sua segurança</h3>
        <ul className="text-muted text-[13px] font-medium space-y-1.5 leading-relaxed">
          <li>· Nunca armazenamos sua senha da LATAM</li>
          <li>· Login é feito por você; salvamos só a sessão criptografada</li>
          <li>· Você pode desconectar e apagar os dados quando quiser</li>
        </ul>
      </PremiumCard>

      <PremiumCard>
        <h3 className="font-display font-bold text-sm mb-1">Prefere não conectar?</h3>
        <p className="text-muted text-[13px] font-medium leading-relaxed">Você pode usar o SmartTravel monitorando rotas como visitante, sem login. Conectar a conta libera saldo real e alertas personalizados.</p>
      </PremiumCard>
    </div>
  );
}
