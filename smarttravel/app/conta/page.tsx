import { GlassCard, PremiumCard } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { requireUser } from "@/lib/auth";
import { formatPoints, timeAgo } from "@/lib/utils";
import { getProviderName } from "@/lib/providers";
import type { UserProfile } from "@/lib/types";
import { updateLatamBalance } from "./actions";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const { supabase, user } = await requireUser();
  const providerName = getProviderName();

  const { data: profileData } = await supabase
    .from("users_profile")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const profile = profileData as UserProfile | null;

  const providerLabel: Record<string, string> = {
    mock: "Mock (modo demonstração)",
    latam_web: "LATAM (busca pública via Playwright)",
    manual: "Entrada manual",
  };

  return (
    <div className="pt-4">
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1">Conta</h1>
      <p className="text-muted text-sm font-medium mb-5">{user.email}</p>

      <GlassCard glow="violet" className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl grid place-items-center font-display font-extrabold bg-gradient-to-br from-[#E1318E] to-ai">
            LA
          </div>
          <div className="flex-1">
            <b className="font-display font-bold">LATAM Pass</b>
            <p className="text-muted text-xs font-semibold">Login automático em desenvolvimento</p>
          </div>
        </div>

        <ul className="text-muted text-[12.5px] font-medium space-y-1.5 leading-relaxed mb-4">
          <li>· Busca pública de pontos: <span className="text-opp font-bold">ativa</span></li>
          <li>· Login LATAM automático: em fase 2</li>
          <li>· Sessão logada será adicionada depois</li>
        </ul>

        <div className="pt-3 border-t border-white/10">
          <span className="text-muted text-[11px] font-bold uppercase tracking-wider">Saldo manual (opcional)</span>
          <p className="text-[12.5px] text-muted leading-relaxed mt-1 mb-3">
            Informe seu saldo aqui pra ver no dashboard. É só pra você acompanhar — não afeta a busca.
          </p>
          {profile?.points_updated_at && (
            <p className="text-muted text-xs mb-2">
              Atualizado {timeAgo(profile.points_updated_at)} ·{" "}
              {formatPoints(profile.latam_points_balance || 0)} pts
            </p>
          )}
          <form action={updateLatamBalance} className="flex gap-2">
            <input
              name="points_balance"
              type="number"
              min={0}
              placeholder="128430"
              defaultValue={profile?.latam_points_balance ?? ""}
              className="flex-1 rounded-2xl bg-card2 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-turq/50"
            />
            <GradientButton type="submit" className="!text-[13px]">
              Salvar
            </GradientButton>
          </form>
        </div>
      </GlassCard>

      <PremiumCard className="mb-4">
        <h3 className="font-display font-bold text-sm mb-2">🛰  Provider de busca</h3>
        <p className="text-[13px] font-medium leading-relaxed">
          <span className="font-bold text-turq">{providerLabel[providerName] ?? providerName}</span>
        </p>
        <p className="text-muted text-[12.5px] mt-2 leading-relaxed">
          {providerName === "mock"
            ? "Esta versão usa dados simulados pra demonstrar a análise. Altere a env AWARD_PROVIDER pra latam_web quando o scraping estiver afinado."
            : providerName === "latam_web"
              ? "Buscando direto no site público da LATAM via Playwright. Em iteração ativa."
              : "Resultados informados manualmente pelo usuário."}
        </p>
      </PremiumCard>

      <PremiumCard className="mb-4">
        <h3 className="font-display font-bold text-sm mb-2">🔒 Privacidade</h3>
        <ul className="text-muted text-[13px] font-medium space-y-1.5 leading-relaxed">
          <li>· Não pedimos a senha da sua conta LATAM</li>
          <li>· Você pode apagar seus dados quando quiser</li>
          <li>· O monitoramento de preços não precisa do seu login</li>
        </ul>
      </PremiumCard>

      <SignOutButton className="w-full" />
    </div>
  );
}
