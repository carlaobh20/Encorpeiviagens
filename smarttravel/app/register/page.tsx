"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/ui/GradientButton";
import { createClient } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "ok"; text: string } | null>(null);

  async function handleRegister() {
    setMsg(null);
    if (!name || !email || !password) {
      setMsg({ type: "error", text: "Preencha todos os campos." });
      return;
    }
    if (password.length < 6) {
      setMsg({ type: "error", text: "A senha precisa ter pelo menos 6 caracteres." });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        setMsg({ type: "error", text: traduzErro(error.message) });
      } else if (data.user) {
        setMsg({ type: "ok", text: "Conta criada! Verifique seu e-mail para confirmar, depois faça login." });
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch {
      setMsg({ type: "error", text: "Algo deu errado. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen flex flex-col justify-center px-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Crie sua conta</h1>
      <p className="text-muted text-sm mt-2 mb-8">Comece a caçar oportunidades em minutos.</p>
      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo"
          className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-turq/50" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="E-mail"
          className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-turq/50" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha (mín. 6 caracteres)"
          className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-turq/50" />
        <GradientButton className="w-full" onClick={handleRegister} disabled={loading}>
          {loading ? "Criando…" : "Criar conta"}
        </GradientButton>
      </div>
      {msg && (
        <p className={`text-sm mt-4 text-center ${msg.type === "error" ? "text-danger" : "text-opp"}`}>{msg.text}</p>
      )}
      <p className="text-center text-muted text-sm mt-6">Já tem conta? <Link href="/login" className="text-turq font-semibold">Entrar</Link></p>
    </div>
  );
}

function traduzErro(msg: string): string {
  if (msg.includes("already registered")) return "Esse e-mail já está cadastrado.";
  if (msg.includes("valid email")) return "Digite um e-mail válido.";
  return msg;
}
