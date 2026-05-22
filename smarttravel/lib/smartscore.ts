import type { Cabin } from "./types";

/**
 * Smart Score 0-100: quão boa é uma oportunidade.
 * Combina desconto vs média, raridade da cabine e folga vs alvo do usuário.
 */
export function smartScore(params: {
  current: number;
  avg: number;
  lowest: number;
  maxPoints: number;
  cabin: Cabin;
}): number {
  const { current, avg, lowest, maxPoints, cabin } = params;

  // 1. Desconto vs média (até 50 pts)
  const discount = avg > 0 ? (avg - current) / avg : 0;
  const discountScore = Math.max(0, Math.min(50, discount * 100));

  // 2. Proximidade da mínima histórica (até 25 pts)
  const range = avg - lowest;
  const nearLow = range > 0 ? Math.max(0, 1 - (current - lowest) / range) : 0;
  const lowScore = nearLow * 25;

  // 3. Dentro do orçamento do usuário (até 15 pts)
  const budgetScore = maxPoints > 0 && current <= maxPoints ? 15 : 0;

  // 4. Bônus de cabine premium rara (até 10 pts)
  const cabinBonus: Record<Cabin, number> = {
    economica: 2, premium_economy: 5, executiva: 9, primeira: 10,
  };

  const total = discountScore + lowScore + budgetScore + cabinBonus[cabin];
  return Math.round(Math.max(0, Math.min(100, total)));
}
