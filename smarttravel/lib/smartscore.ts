import type { Cabin, Recommendation } from "./types";

export interface SmartScoreInput {
  current: number;
  avg: number;
  lowest: number;
  maxPoints: number;
  cabin: Cabin;
  /** dias até a viagem; undefined ignora o critério */
  daysUntilDeparture?: number;
  /** quantos preços já temos? Score é menos confiável com poucos pontos */
  sampleSize?: number;
}

/**
 * Smart Score 0-100: quão boa é uma oportunidade.
 *
 * Pesos:
 *  - 40 pts: desconto vs média histórica
 *  - 25 pts: proximidade da mínima já registrada
 *  - 15 pts: cabe no orçamento (max_points)
 *  - 10 pts: bônus de cabine premium
 *  - 10 pts: proximidade da data (urgência baixa = mais valor)
 */
export function calculateSmartScore(input: SmartScoreInput): number {
  const { current, avg, lowest, maxPoints, cabin, daysUntilDeparture, sampleSize } = input;
  if (!current || current <= 0) return 0;

  // 1. Desconto vs média (40)
  const discount = avg > 0 ? (avg - current) / avg : 0;
  const discountScore = clamp(discount * 100, 0, 40);

  // 2. Proximidade da mínima (25)
  let lowScore = 0;
  if (lowest > 0 && avg > lowest) {
    const range = avg - lowest;
    const nearLow = clamp(1 - (current - lowest) / range, 0, 1);
    lowScore = nearLow * 25;
  } else if (lowest > 0 && current <= lowest) {
    lowScore = 25; // empatou ou bateu a mínima
  }

  // 3. Orçamento (15)
  let budgetScore = 0;
  if (maxPoints > 0) {
    if (current <= maxPoints * 0.8) budgetScore = 15;
    else if (current <= maxPoints) budgetScore = 10;
    else if (current <= maxPoints * 1.1) budgetScore = 4;
  }

  // 4. Cabine (10)
  const cabinBonus: Record<Cabin, number> = {
    economica: 2,
    premium_economy: 5,
    executiva: 9,
    primeira: 10,
  };

  // 5. Proximidade da data (10)
  let urgencyScore = 5;
  if (typeof daysUntilDeparture === "number") {
    if (daysUntilDeparture < 0) urgencyScore = 0;
    else if (daysUntilDeparture < 14) urgencyScore = 10; // viagem muito perto + preço bom = ótimo
    else if (daysUntilDeparture < 60) urgencyScore = 8;
    else if (daysUntilDeparture < 180) urgencyScore = 6;
    else urgencyScore = 4;
  }

  // Penalidade leve quando ainda há pouquíssimas leituras
  const reliability = typeof sampleSize === "number" && sampleSize < 2 ? 0.85 : 1;

  const total = (discountScore + lowScore + budgetScore + cabinBonus[cabin] + urgencyScore) * reliability;
  return Math.round(clamp(total, 0, 100));
}

/** Mantém compatibilidade com a função antiga */
export const smartScore = calculateSmartScore;

export function recommendationFromScore(score: number): Recommendation {
  if (score >= 85) return "buy_now";
  if (score >= 70) return "good_deal";
  if (score >= 50) return "monitor";
  return "expensive";
}

export function recommendationLabel(r: Recommendation): string {
  return {
    buy_now: "Comprar agora",
    good_deal: "Boa oportunidade",
    monitor: "Continuar monitorando",
    expensive: "Preço acima da média",
  }[r];
}

export function recommendationTone(r: Recommendation): "green" | "blue" | "amber" | "red" {
  return {
    buy_now: "green",
    good_deal: "blue",
    monitor: "amber",
    expensive: "red",
  }[r] as "green" | "blue" | "amber" | "red";
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
