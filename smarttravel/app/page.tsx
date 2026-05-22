import Link from "next/link";
import { GradientButton } from "@/components/ui/GradientButton";
import { GlassCard } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <div className="py-10">
      {/* Hero */}
      <div className="text-center relative">
        <div className="absolute inset-x-0 -top-10 h-64 bg-[radial-gradient(circle,rgba(124,58,237,0.25),transparent_70%)] blur-2xl -z-10" />
        <span className="font-mono text-[11px] font-bold text-turq bg-turq/10 border border-turq/30 px-3 py-1.5 rounded-full">⚡ POWERED BY AI</span>
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight mt-6">
          Encontre passagens em milhas <span className="bg-gradient-to-r from-turq to-tech bg-clip-text text-transparent">antes de todo mundo.</span>
        </h1>
        <p className="text-muted text-[15px] font-medium mt-4 leading-relaxed">
          O SmartTravel AI monitora oportunidades em pontos, detecta quedas raras e envia alertas automáticos para você viajar melhor.
        </p>
        <div className="flex flex-col gap-3 mt-7">
          <Link href="/register"><GradientButton className="w-full">Começar agora</GradientButton></Link>
          <Link href="/dashboard"><GradientButton variant="ghost" className="w-full">Ver demonstração</GradientButton></Link>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-14 space-y-3">
        <h2 className="font-display text-xl font-extrabold mb-4 text-center">Como funciona</h2>
        {[
          { i: "🎯", t: "Você escolhe a rota", d: "Defina origem, destino, cabine e o máximo de pontos que aceita pagar." },
          { i: "🛰", t: "O robô vigia 24/7", d: "Varremos os preços em pontos continuamente e guardamos o histórico." },
          { i: "🔥", t: "Você recebe o alerta", d: "Quando aparece uma queda rara, avisamos na hora por push, Telegram ou e-mail." },
        ].map((s) => (
          <GlassCard key={s.t} className="flex gap-4 items-start">
            <span className="text-2xl">{s.i}</span>
            <div><b className="font-display font-bold">{s.t}</b><p className="text-muted text-sm mt-1">{s.d}</p></div>
          </GlassCard>
        ))}
      </div>

      {/* Pricing */}
      <div className="mt-14">
        <h2 className="font-display text-xl font-extrabold mb-4 text-center">Planos</h2>
        <div className="space-y-3">
          <PlanCard name="Free" price="R$ 0" features={["2 rotas monitoradas", "Alertas por e-mail", "Atualização diária"]} />
          <PlanCard name="Pro" price="R$ 29/mês" highlight features={["20 rotas", "Alertas em tempo real", "Telegram", "Histórico completo", "Smart Score"]} />
          <PlanCard name="Premium" price="R$ 79/mês" features={["Rotas ilimitadas", "IA preditiva", "Múltiplos programas", "Alertas prioritários", "Oportunidades raras"]} />
        </div>
      </div>

      <p className="text-center text-muted text-xs mt-12">SmartTravel AI · seu radar de milhas</p>
    </div>
  );
}

function PlanCard({ name, price, features, highlight }: { name: string; price: string; features: string[]; highlight?: boolean }) {
  return (
    <GlassCard glow={highlight ? "turq" : "none"} className={highlight ? "border-turq/40" : ""}>
      <div className="flex items-baseline justify-between">
        <b className="font-display text-lg font-extrabold">{name}</b>
        <span className="font-display font-bold text-turq">{price}</span>
      </div>
      {highlight && <span className="text-[10px] font-mono font-bold text-turq">MAIS POPULAR</span>}
      <ul className="text-muted text-sm mt-3 space-y-1.5">{features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
    </GlassCard>
  );
}
