import type { Cabin } from "./types";

export const CABIN_LABELS: Record<Cabin, string> = {
  economica: "Econômica",
  premium_economy: "Premium Economy",
  executiva: "Executiva",
  primeira: "Primeira Classe",
};

export const FREQUENCIES = [
  { value: "5m", label: "A cada 5 minutos" },
  { value: "1h", label: "A cada hora" },
  { value: "6h", label: "A cada 6 horas" },
  { value: "1d", label: "Diário" },
];

export const ALERT_RULES = {
  PRICE_DROP_PCT: 30,
  BELOW_AVG_PCT: 20,
  RARE_SCORE: 85,
};
