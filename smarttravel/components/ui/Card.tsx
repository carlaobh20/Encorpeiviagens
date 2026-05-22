import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function GlassCard({ children, className, glow }: { children: ReactNode; className?: string; glow?: "violet" | "turq" | "none" }) {
  return (
    <div
      className={cn(
        "rounded-xl2 border border-white/10 bg-gradient-to-b from-card to-card/70 p-5 backdrop-blur-xl relative overflow-hidden",
        glow === "violet" && "shadow-[0_24px_60px_-36px_rgba(124,58,237,0.7)]",
        glow === "turq" && "shadow-[0_24px_60px_-36px_rgba(94,234,212,0.6)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PremiumCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl2 border border-white/10 bg-card2 p-5 relative overflow-hidden", className)}>
      {children}
    </div>
  );
}
