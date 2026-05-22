"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/ui/GradientButton";
import { formatPoints } from "@/lib/utils";

export function SearchNowButton({ routeId }: { routeId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  async function handleClick() {
    setMsg(null);
    try {
      const res = await fetch("/api/search/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "search_failed");

      if (data.status === "success" && data.bestPrice) {
        setMsg({
          tone: "ok",
          text: `Encontrou ${data.resultsCount} voo(s). Melhor preço: ${formatPoints(data.bestPrice)} pts${
            data.alertCreated ? " · alerta gerado 🔔" : ""
          }`,
        });
      } else if (data.status === "empty") {
        setMsg({
          tone: "err",
          text: "Provider rodou mas não retornou voos. Tente outra data ou rota.",
        });
      } else {
        setMsg({
          tone: "err",
          text: `Falhou: ${data.errorMessage ?? "erro desconhecido"}`,
        });
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setMsg({ tone: "err", text: e instanceof Error ? e.message : "Erro ao buscar." });
    }
  }

  return (
    <div>
      <GradientButton onClick={handleClick} disabled={pending} className="w-full">
        {pending ? "Buscando..." : "🛰  Buscar agora"}
      </GradientButton>
      {msg && (
        <p className={`text-xs mt-2 text-center ${msg.tone === "ok" ? "text-opp" : "text-danger"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
