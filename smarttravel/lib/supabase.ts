import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Cliente para uso no browser (client components) */
export function createClient() {
  return createBrowserClient(url, anon);
}

/** Cliente para uso no servidor (server components / route handlers) */
export async function createServer() {
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as never));
        } catch {
          // chamado em Server Component sem permissão de escrita — ok ignorar
        }
      },
    },
  });
}

/** Cliente admin (service role) — APENAS no servidor / worker. Bypassa RLS. */
export function createAdmin() {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
