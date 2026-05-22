import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Retorna o cliente do Gemini. Lê GEMINI_API_KEY da env.
 * Usar SÓ em server actions / route handlers (nunca no client).
 */
export function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY não configurada. Adicione no painel da Vercel (Settings → Environment Variables) e faça redeploy.",
    );
  }
  return new GoogleGenerativeAI(key);
}
