import { GlassCard } from "@/components/ui/Card";
export function SmartScore({ score, title, description }: { score: number; title: string; description: string }) {
  const circ = 2 * Math.PI * 44;
  const offset = circ - (score / 100) * circ;
  return (
    <GlassCard glow="violet">
      <div className="flex items-center gap-5">
        <div className="relative w-[104px] h-[104px] flex-none">
          <svg width="104" height="104" viewBox="0 0 104 104" className="-rotate-90">
            <circle cx="52" cy="52" r="44" stroke="rgba(148,163,184,.15)" strokeWidth="9" fill="none" />
            <circle cx="52" cy="52" r="44" stroke="url(#ss)" strokeWidth="9" fill="none" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset} />
            <defs><linearGradient id="ss" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5EEAD4" /><stop offset="1" stopColor="#7C3AED" />
            </linearGradient></defs>
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <b className="font-display text-3xl font-extrabold tracking-tight">{score}</b>
            <small className="block text-muted text-[10px] font-bold -mt-0.5">/ 100</small>
          </div>
        </div>
        <div>
          <h4 className="font-display font-extrabold text-base">{title}</h4>
          <p className="text-muted text-xs font-semibold mt-1 leading-relaxed">{description}</p>
          {score >= 85 && (
            <span className="inline-block mt-2.5 font-mono text-[10.5px] font-bold text-warn bg-warn/10 border border-warn/30 px-2.5 py-1 rounded-lg">
              RESGATE AGORA
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
