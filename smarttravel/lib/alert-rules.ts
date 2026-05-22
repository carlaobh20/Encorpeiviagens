import type { AlertType, MonitoredRoute } from "./types";
import { CABIN_LABELS } from "./constants";
import { formatPoints } from "./utils";

export interface AlertCandidate {
  type: AlertType;
  title: string;
  message: string;
  discount_percentage: number;
}

export interface EvaluateInput {
  route: Pick<MonitoredRoute, "origin" | "destination" | "cabin" | "max_points">;
  currentPrice: number;
  avgPrice: number;
  lowestPrice: number;
  /** smart score do novo preço (0-100) */
  smartScore: number;
  /** quantos resultados anteriores existiam (exclui o que acabou de ser inserido) */
  previousCount: number;
}

/**
 * Avalia se um novo preço deve gerar alerta(s).
 * Pode gerar mais de um (ex: bater meta E ser o menor de todos).
 * Em qualquer caso, retorna no máximo 1 alerta — o de maior prioridade.
 */
export function evaluateAlerts(input: EvaluateInput): AlertCandidate | null {
  const { route, currentPrice, avgPrice, lowestPrice, smartScore, previousCount } = input;
  const discount = avgPrice > 0 ? Math.round(((avgPrice - currentPrice) / avgPrice) * 100) : 0;
  const target = route.max_points || 0;
  const rotaTxt = `${route.origin} → ${route.destination}`;
  const cab = CABIN_LABELS[route.cabin];

  // 1. Smart Score >= 85 → oportunidade rara (mais alta prioridade)
  if (smartScore >= 85) {
    return {
      type: "rare_opportunity",
      title: "🔥 Oportunidade rara",
      message: `${rotaTxt} em ${cab} por ${formatPoints(currentPrice)} pts — Smart Score ${smartScore}/100. Recomendação: comprar agora.`,
      discount_percentage: Math.max(0, discount),
    };
  }

  // 2. Menor preço histórico (precisa de pelo menos 2 leituras anteriores pra fazer sentido)
  if (previousCount >= 2 && currentPrice < lowestPrice) {
    return {
      type: "lowest_ever",
      title: "💎 Menor preço registrado",
      message: `${rotaTxt}: ${formatPoints(currentPrice)} pts é o menor preço já visto nesta rota.`,
      discount_percentage: Math.max(0, discount),
    };
  }

  // 3. Meta atingida
  if (target > 0 && currentPrice <= target) {
    return {
      type: "target_reached",
      title: "🎯 Meta atingida",
      message: `${rotaTxt} por ${formatPoints(currentPrice)} pts — abaixo da sua meta de ${formatPoints(target)} pts.`,
      discount_percentage: Math.max(0, discount),
    };
  }

  // 4. Queda forte vs média (>= 30%)
  if (previousCount >= 2 && discount >= 30) {
    return {
      type: "price_drop",
      title: "📉 Queda forte detectada",
      message: `${rotaTxt}: ${formatPoints(currentPrice)} pts (${discount}% abaixo da média de ${formatPoints(avgPrice)}).`,
      discount_percentage: discount,
    };
  }

  // 5. Abaixo da média (>= 20%)
  if (previousCount >= 2 && discount >= 20) {
    return {
      type: "below_average",
      title: "📊 Preço abaixo da média",
      message: `${rotaTxt}: ${formatPoints(currentPrice)} pts (${discount}% abaixo da média).`,
      discount_percentage: discount,
    };
  }

  return null;
}
