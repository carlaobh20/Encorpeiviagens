import { ReactNode } from "react";
export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-white/5 grid place-items-center text-3xl mb-4">{icon}</div>
      <h3 className="font-display font-bold text-lg">{title}</h3>
      <p className="text-muted text-sm mt-2 max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
