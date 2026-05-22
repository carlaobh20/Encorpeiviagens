export function Header({ name, date }: { name: string; date: string }) {
  return (
    <div className="flex items-center justify-between pt-3.5 pb-4">
      <div>
        <small className="text-muted text-[13px] font-semibold">{date}</small>
        <h1 className="font-display text-2xl font-extrabold leading-none mt-0.5 tracking-tight">Olá, {name} 👋</h1>
      </div>
      <div className="w-[46px] h-[46px] rounded-2xl bg-gradient-to-br from-ai to-tech grid place-items-center font-display font-extrabold text-lg relative shadow-[0_8px_24px_-8px_rgba(124,58,237,0.6)]">
        {name[0]}
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-opp border-[3px] border-card shadow-[0_0_10px_#22C55E]" />
      </div>
    </div>
  );
}

export function RobotBar({ routes, freq }: { routes: number; freq: string }) {
  return (
    <div className="flex gap-2.5 items-center px-3.5 py-2.5 mb-4 bg-gradient-to-br from-turq/10 to-tech/5 border border-turq/20 rounded-2xl backdrop-blur-xl">
      <span className="relative w-2.5 h-2.5 flex-none">
        <i className="absolute inset-0 rounded-full bg-turq shadow-[0_0_12px_#5EEAD4]" />
        <span className="absolute inset-0 rounded-full bg-turq animate-ring" />
      </span>
      <div className="text-xs">
        <b className="font-display text-[13.5px] font-bold block">Robô monitorando em tempo real</b>
        <span className="text-muted font-semibold">{routes} rotas ativas · varredura {freq}</span>
      </div>
      <span className="ml-auto font-mono text-[10.5px] font-bold text-turq px-2.5 py-1.5 rounded-lg bg-turq/10 border border-turq/30">⚡ IA ATIVA</span>
    </div>
  );
}
