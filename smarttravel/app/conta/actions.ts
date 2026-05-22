"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function saveLoyaltyAccount(formData: FormData) {
  const { supabase, user } = await requireUser();

  const account_email = String(formData.get("account_email") ?? "").trim();
  const points_balance = Number(formData.get("points_balance") ?? 0);

  if (!account_email) throw new Error("Informe o e-mail da conta LATAM.");
  if (Number.isNaN(points_balance) || points_balance < 0) throw new Error("Saldo inválido.");

  const { data: existing } = await supabase
    .from("loyalty_accounts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const payload = {
    user_id: user.id,
    provider: "latam_pass" as const,
    account_email,
    points_balance,
    session_status: "connected" as const,
    last_sync_at: new Date().toISOString(),
  };

  const { error } = existing
    ? await supabase.from("loyalty_accounts").update(payload).eq("id", existing.id)
    : await supabase.from("loyalty_accounts").insert(payload);

  if (error) throw new Error(error.message);
  revalidatePath("/conta");
  revalidatePath("/dashboard");
}

export async function disconnectLoyaltyAccount() {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("loyalty_accounts")
    .update({ session_status: "disconnected" })
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/conta");
  revalidatePath("/dashboard");
}

export async function deleteLoyaltyAccount() {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("loyalty_accounts").delete().eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/conta");
  revalidatePath("/dashboard");
}
