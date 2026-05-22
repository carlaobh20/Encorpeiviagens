import { GlassCard, PremiumCard } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { requireUser } from "@/lib/auth";
import { formatPoints, timeAgo } from "@/lib/utils";
import type { LoyaltyAccount } from "@/lib/types";
import { deleteLoyaltyAccount, disconnectLoyaltyAccount, saveLoyaltyAccount } from "./actions";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("loyalty_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const loyalty = data as LoyaltyAccount | null;
  const connected = loyalty?.session_status === "connected";

  return (
    <div className="pt-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1">Conta LATAM Pass</h1>
      <p className="text-muted text-sm font-medium mb-5">
        Informe seu e-mail e saldo da LATAM Pass. Por enquanto a sincronização é manual — você atualiza
        quando quiser.
      </p>

      <GlassCard glow="violet" className="mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl grid place-items-center font-display font-extrabold bg-gradient-to-br from-[#E1318E] to-ai">
            LA
          </div>
          <div className="flex-1">
            <b className="font-display font-bold">LATAM Pass</b>
            <p className={`text-xs font-semibold ${connected ? "text-opp" : "text-muted"}`}>
              {connected
                ? `Conectada · saldo ${formatPoints(loyalty!.points_balance)} pts`
                : "Não conectada"}
            </p>
          </div>
        </div>

        {connected && loyalty?.last_sync_at && (
          <p className="text-muted text-xs mb-3">Atualizado {timeAgo(loyalty.last_sync_at)}</p>
        )}

        <form action={saveLoyaltyAccount} className="space-y-3">
          <Field
            label="E-mail da conta LATAM"
            name="account_email"
            type="email"
            placeholder="seunome@email.com"
            defaultValue={loyalty?.account_email ?? ""}
            required
          />
          <Field
            label="Saldo atual de pontos"
            name="points_balance"
            type="number"
            min={0}
            placeholder="128430"
            defaultValue={loyalty?.points_balance ?? ""}
            required
          />
          <GradientButton type="submit" className="w-full">
            {connected ? "Atualizar saldo" : "Conectar LATAM"}
          </GradientButton>
        </form>

        {connected && (
          <div className="flex gap-2 mt-3">
            <form action={disconnectLoyaltyAccount} className="flex-1">
              <GradientButton variant="ghost" type="submit" className="w-full !text-[13px]">
                Desconectar
              </GradientButton>
            </form>
            <form action={deleteLoyaltyAccount} className="flex-1">
              <GradientButton variant="ghost" type="submit" className="w-full !text-[13px] !text-danger">
                Apagar dados
              </GradientButton>
            </form>
          </div>
        )}
      </GlassCard>

      <PremiumCard className="mb-4">
        <h3 className="font-display font-bold text-sm mb-2">🔒 Sua segurança</h3>
        <ul className="text-muted text-[13px] font-medium space-y-1.5 leading-relaxed">
          <li>· Não pedimos a senha da LATAM</li>
          <li>· Você informa o saldo manualmente quando quiser</li>
          <li>· O monitoramento de preços não precisa da sua conta</li>
        </ul>
      </PremiumCard>

      <SignOutButton className="w-full" />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-muted text-xs font-bold uppercase tracking-wider mb-1.5 block px-1">{label}</span>
      <input
        name={name}
        type={type}
        className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3 text-sm outline-none focus:border-turq/50"
        {...rest}
      />
    </label>
  );
}
