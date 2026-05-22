"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GradientButton } from "@/components/ui/GradientButton";
import { createClient } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Mostra mensagem se o usuário veio de um link de e-mail expirado.
  useEffect(() => {
    if (searchParams.get("error") === "callback") {
      setMsg("O link de confirmação expirou. Tente fazer login ou solicite um novo.");
    }
    if (searchParams.get("registered") === "1") {
      setMsg("Conta criada! Verifique seu e-mail para confirmar e depois entre.");
    }
  }, [searchParams]);

  async function handleLogin() {
    setMsg(null);
    if (!email || !password) {
      setMsg("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMsg(traduzErro(error.message));
      } else {
        // refresh força os Server Components a re-renderizarem com a sessão nova.
        router.refresh();
        router.push(redirectTo);
      }
    } catch {
      setMsg("Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen flex flex-col justify-center px-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Bem-vindo de volta</h1>
      <p className="text-muted text-sm mt-2 mb-8">Entre para acessar seu radar de milhas.</p>
      <div className="space-y-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          type="email"
          autoComplete="email"
          placeholder="E-mail"
          className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-turq/50"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          type="password"
          autoComplete="current-password"
          placeholder="Senha"
          className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-turq/50"
        />
        <GradientButton className="w-full" onClick={handleLogin} disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </GradientButton>
      </div>
      {msg && <p className="text-sm mt-4 text-center text-danger">{msg}</p>}
      <p className="text-center text-muted text-sm mt-6">
        Não tem conta? <Link href="/register" className="text-turq font-semibold">Criar agora</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function traduzErro(msg: string): string {
  if (msg.includes("Invalid login")) return "E-mail ou senha incorretos.";
  if (msg.includes("Email not confirmed")) {
    return "Confirme seu e-mail antes de entrar (veja sua caixa de entrada e spam).";
  }
  if (msg.toLowerCase().includes("rate limit")) return "Muitas tentativas. Aguarde um minuto.";
  return msg;
}
