import type { Alert } from "./types";

/** Monta a mensagem de alerta no formato premium do SmartTravel */
export function buildAlertMessage(a: { origin: string; destination: string; cabin: string; points: number; avg: number; discount: number }): string {
  return [
    "🔥 SmartTravel encontrou uma oportunidade:",
    `${a.origin} → ${a.destination}`,
    `${a.cabin}`,
    `${a.points.toLocaleString("pt-BR")} pontos`,
    `${a.discount}% abaixo da média (normal: ${a.avg.toLocaleString("pt-BR")})`,
    "Clique para ver.",
  ].join("\n");
}

/** Envia alerta via Telegram Bot API */
export async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[alerts] TELEGRAM_BOT_TOKEN/CHAT_ID não configurados — pulando envio.");
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    return res.ok;
  } catch (e) {
    console.error("[alerts] falha ao enviar Telegram:", e);
    return false;
  }
}
