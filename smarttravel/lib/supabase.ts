import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Cliente para uso no browser (client components) */
export function createClient() {
  return createBrowserClient(url, anon);
}

/** Cliente admin (service role) — APENAS no worker/servidor. Bypassa RLS. */
export function createAdmin() {
  const { createClient: createSb } = require("@supabase/supabase-js");
  return createSb(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
