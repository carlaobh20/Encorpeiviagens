import Link from "next/link";
import { GlassCard } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { formatPoints, timeAgo } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

export function ManualBalanceCard({ profile }: { profile: UserProfile | null }) {
  const balance = profile?.latam_points_balance ?? 0;
  const updatedAt = profile?.points_updated_at ?? null;
  const hasBalance = balance > 0;

  return (
    <GlassCard className="mb-4">
      <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.3),transparent_70%)] blur-sm" />
      <div className="flex items-center gap-2.5 relative">
        <div className="w-9 h-9 rounded-xl grid place-items-center font-display font-extrabold text-xs bg-gradient-to-br from-[#E1318E] to-ai shadow-[0_6px_18px_-6px_rgba(225,49,142,0.6)]">
          LA
        </div>
        <div>
          <div className="font-display text-sm font-bold">LATAM Pass</div>
          <div className="text-muted text-xs font-semibold">
            {hasBalance ? `Saldo informado ${updatedAt ? timeAgo(updatedAt) : "—"}` : "Saldo não informado"}
          </div>
        </div>
      </div>

      {hasBalance ? (
        <>
          <div className="font-display font-extrabold text-[44px] leading-none tracking-tighter my-3.5 bg-gradient-to-br from-white to-muted bg-clip-text text-transparent">
            {formatPoints(balance)}
            <span className="text-lg text-muted ml-1.5">pts</span>
          </div>
          <Link href="/conta">
            <span className="text-tech text-[12.5px] font-bold">Atualizar saldo</span>
          </Link>
        </>
      ) : (
        <>
          <p className="text-muted text-[13px] font-medium mt-3 leading-relaxed">
            Informe seu saldo manualmente em <b>Conta</b> pra acompanhar aqui. O monitoramento de
            preços funciona independente disso.
          </p>
          <Link href="/conta">
            <GradientButton variant="ghost" className="w-full mt-3 !text-[13px]">
              Ir para Conta
            </GradientButton>
          </Link>
        </>
      )}
    </GlassCard>
  );
}
