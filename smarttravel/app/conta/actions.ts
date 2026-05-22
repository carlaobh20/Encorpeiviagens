"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function updateLatamBalance(formData: FormData) {
  const { supabase, user } = await requireUser();

  const balance = Number(formData.get("points_balance") ?? 0);
  if (Number.isNaN(balance) || balance < 0) {
    throw new Error("Informe um saldo válido em pontos.");
  }

  const { error } = await supabase
    .from("users_profile")
    .update({
      latam_points_balance: Math.floor(balance),
      points_updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/conta");
  revalidatePath("/dashboard");
}
