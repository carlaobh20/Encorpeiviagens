"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "opp" | "ghost";
}

export function GradientButton({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "rounded-2xl font-display font-bold text-sm px-5 py-3 transition-transform active:scale-95 disabled:opacity-50",
        variant === "primary" && "text-white bg-gradient-to-br from-ai to-tech shadow-[0_14px_30px_-12px_rgba(124,58,237,0.7)]",
        variant === "opp" && "text-[#04140A] bg-gradient-to-br from-opp to-turq shadow-[0_14px_30px_-12px_rgba(34,197,94,0.6)]",
        variant === "ghost" && "text-ink bg-white/5 border border-white/10 hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
