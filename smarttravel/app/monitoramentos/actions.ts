"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { validateRoute } from "@/lib/utils";
import type { Cabin } from "@/lib/types";

const VALID_FREQ = ["5m", "1h", "6h", "1d"];

export async function createRoute(formData: FormData) {
  const { supabase, user } = await requireUser();

  const origin = String(formData.get("origin") ?? "").trim().toUpperCase();
  const destination = String(formData.get("destination") ?? "").trim().toUpperCase();
  const departure_date = String(formData.get("departure_date") ?? "").trim();
  const return_date_raw = String(formData.get("return_date") ?? "").trim();
  const cabin = String(formData.get("cabin") ?? "economica") as Cabin;
  const passengers = Number(formData.get("passengers") ?? 1);
  const max_points_raw = String(formData.get("max_points") ?? "").trim();
  const monitor_frequency = String(formData.get("monitor_frequency") ?? "1h");
  const notes = String(formData.get("notes") ?? "").trim();

  const v = validateRoute({
    origin,
    destination,
    departure_date,
    return_date: return_date_raw || null,
    cabin,
    passengers,
    max_points: max_points_raw ? Number(max_points_raw) : null,
  });
  if (!v.ok) throw new Error(v.errors.join(" "));
  if (!VALID_FREQ.includes(monitor_frequency)) throw new Error("Frequência inválida.");

  const { error } = await supabase.from("monitored_routes").insert({
    user_id: user.id,
    provider: "latam_pass",
    origin,
    destination,
    departure_date,
    return_date: return_date_raw || null,
    cabin,
    passengers,
    max_points: max_points_raw ? Number(max_points_raw) : null,
    monitor_frequency,
    notes: notes || null,
    is_active: true,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/monitoramentos");
  revalidatePath("/dashboard");
  redirect("/monitoramentos");
}

export async function toggleRouteActive(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  const next = formData.get("next") === "true";
  const { error } = await supabase
    .from("monitored_routes")
    .update({ is_active: next })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/monitoramentos");
  revalidatePath("/dashboard");
}

export async function deleteRoute(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  const { error } = await supabase
    .from("monitored_routes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/monitoramentos");
  revalidatePath("/dashboard");
  redirect("/monitoramentos");
}
