"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import type { AlertStatus } from "@/lib/types";

export async function setAlertStatus(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as AlertStatus;
  if (!["new", "saved", "ignored"].includes(status)) throw new Error("status inválido");
  const { error } = await supabase
    .from("alerts")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/alertas");
  revalidatePath("/dashboard");
}
