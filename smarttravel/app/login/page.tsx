"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/ui/GradientButton";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
        router.push("/dashboard");
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
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="E-mail"
          className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-turq/50" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha"
          className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-turq/50" />
        <GradientButton className="w-full" onClick={handleLogin} disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </GradientButton>
      </div>
      {msg && <p className="text-sm mt-4 text-center text-danger">{msg}</p>}
      <p className="text-center text-muted text-sm mt-6">Não tem conta? <Link href="/register" className="text-turq font-semibold">Criar agora</Link></p>
    </div>
  );
}

function traduzErro(msg: string): string {
  if (msg.includes("Invalid login")) return "E-mail ou senha incorretos.";
  if (msg.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar (veja sua caixa de entrada).";
  return msg;
}
