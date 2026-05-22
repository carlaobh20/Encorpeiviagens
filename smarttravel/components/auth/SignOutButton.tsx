"use client";
import { GradientButton } from "@/components/ui/GradientButton";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action="/auth/signout" method="post">
      <GradientButton variant="ghost" type="submit" className={className}>
        Sair da conta
      </GradientButton>
    </form>
  );
}
