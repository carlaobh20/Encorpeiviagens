import { createServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

/**
 * Busca o usuário autenticado. Se não houver sessão, redireciona para /login.
 * Use em Server Components / Route Handlers.
 */
export async function requireUser() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}
