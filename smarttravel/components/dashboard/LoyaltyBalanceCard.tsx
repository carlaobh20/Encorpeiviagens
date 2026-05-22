import Link from "next/link";
import { GlassCard } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { formatPoints, timeAgo } from "@/lib/utils";
import type { LoyaltyAccount } from "@/lib/types";

export function LoyaltyBalanceCard({ loyalty }: { loyalty: LoyaltyAccount | null }) {
  const connected = loyalty?.session_status === "connected";

  return (
    <GlassCard className="mb-4">
      <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.3),transparent_70%)] blur-sm" />
      <div className="flex items-center gap-2.5 relative">
        <div className="w-9 h-9 rounded-xl grid place-items-center font-display font-extrabold text-xs bg-gradient-to-br from-[#E1318E] to-ai shadow-[0_6px_18px_-6px_rgba(225,49,142,0.6)]">
          LA
        </div>
        <div>
          <div className="font-display text-sm font-bold">LATAM Pass</div>
          <div className="text-muted text-xs font-semibold flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? "bg-opp shadow-[0_0_8px_#22C55E]" : "bg-muted/50"
              }`}
            />
            {connected
              ? `Sincronizado ${loyalty?.last_sync_at ? timeAgo(loyalty.last_sync_at) : "—"}`
              : "Conta não conectada"}
          </div>
        </div>
      </div>

      {connected ? (
        <>
          <div className="font-display font-extrabold text-[44px] leading-none tracking-tighter my-3.5 bg-gradient-to-br from-white to-muted bg-clip-text text-transparent">
            {formatPoints(loyalty!.points_balance)}
            <span className="text-lg text-muted ml-1.5">pts</span>
          </div>
          <div className="text-muted text-xs font-semibold">Saldo informado por você</div>
        </>
      ) : (
        <>
          <div className="font-display font-extrabold text-[28px] leading-tight mt-3 text-muted">
            Sem saldo configurado
          </div>
          <p className="text-muted text-xs font-medium mt-2 leading-relaxed">
            Conecte sua conta LATAM Pass pra ver seu saldo e receber alertas personalizados.
          </p>
          <Link href="/conta">
            <GradientButton className="w-full mt-4 !text-[13px]">Conectar LATAM</GradientButton>
          </Link>
        </>
      )}
    </GlassCard>
  );
}
