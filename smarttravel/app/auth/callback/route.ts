import { NextResponse, type NextRequest } from "next/server";
import { createServer } from "@/lib/supabase-server";

// Recebe o link clicado no e-mail de confirmação do Supabase.
// O Supabase manda um ?code=... que trocamos por uma sessão.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  if (code) {
    const supabase = await createServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Algo deu errado (link expirado, code inválido) → volta pro login.
  return NextResponse.redirect(`${origin}/login?error=callback`);
}
