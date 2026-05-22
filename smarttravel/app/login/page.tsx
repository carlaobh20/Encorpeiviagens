import Link from "next/link";
import { GradientButton } from "@/components/ui/GradientButton";

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto min-h-screen flex flex-col justify-center px-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Bem-vindo de volta</h1>
      <p className="text-muted text-sm mt-2 mb-8">Entre para acessar seu radar de milhas.</p>
      <div className="space-y-3">
        <input type="email" placeholder="E-mail" className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-turq/50" />
        <input type="password" placeholder="Senha" className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3.5 text-sm outline-none focus:border-turq/50" />
        <GradientButton className="w-full">Entrar</GradientButton>
      </div>
      <p className="text-center text-muted text-sm mt-6">Não tem conta? <Link href="/register" className="text-turq font-semibold">Criar agora</Link></p>
    </div>
  );
}
