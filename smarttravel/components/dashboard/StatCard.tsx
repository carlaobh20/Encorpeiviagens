import { GlassCard } from "@/components/ui/Card";
export function StatCard({ icon, value, label, tone = "blue" }: { icon: string; value: string; label: string; tone?: "blue" | "amber" | "violet" | "green" }) {
  const tones: Record<string, string> = {
    blue: "bg-tech/15 text-tech", amber: "bg-warn/15 text-warn",
    violet: "bg-ai/20 text-[#A78BFA]", green: "bg-opp/15 text-opp",
  };
  return (
    <GlassCard className="p-4">
      <div className={`w-9 h-9 rounded-xl grid place-items-center text-lg mb-3 ${tones[tone]}`}>{icon}</div>
      <div className="font-display font-extrabold text-2xl tracking-tight">{value}</div>
      <div className="text-muted text-xs font-semibold mt-0.5">{label}</div>
    </GlassCard>
  );
}
