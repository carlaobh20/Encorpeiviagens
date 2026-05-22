"use server";
import { SchemaType } from "@google/generative-ai";
import { getGemini } from "@/lib/gemini";

export type ParsedRoute = {
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string;
  cabin: "economica" | "premium_economy" | "executiva" | "primeira";
  passengers: number;
  max_points: number;
  notes: string;
};

const ROUTE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    origin: {
      type: SchemaType.STRING,
      description: "Código IATA de 3 letras do aeroporto de origem (ex: GRU, GIG, BSB).",
    },
    destination: {
      type: SchemaType.STRING,
      description: "Código IATA de 3 letras do aeroporto de destino.",
    },
    departure_date: {
      type: SchemaType.STRING,
      description: "Data de ida no formato YYYY-MM-DD.",
    },
    return_date: {
      type: SchemaType.STRING,
      description: "Data de volta YYYY-MM-DD, ou string vazia se só ida.",
    },
    cabin: {
      type: SchemaType.STRING,
      enum: ["economica", "premium_economy", "executiva", "primeira"],
      format: "enum",
    },
    passengers: {
      type: SchemaType.INTEGER,
      description: "Número de passageiros (1 se não mencionado).",
    },
    max_points: {
      type: SchemaType.INTEGER,
      description: "Máximo de pontos por passageiro. Use 0 se não mencionado.",
    },
    notes: {
      type: SchemaType.STRING,
      description: "Resumo curto em português do que foi entendido.",
    },
  },
  required: ["origin", "destination", "departure_date", "cabin", "passengers", "max_points", "notes"],
};

export async function parseRouteFromText(text: string): Promise<ParsedRoute> {
  const clean = (text ?? "").trim();
  if (clean.length < 5) {
    throw new Error("Descreva sua viagem em pelo menos uma frase.");
  }

  const genAI = getGemini();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responseSchema: ROUTE_SCHEMA as any,
      temperature: 0.2,
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const prompt = `Você é um assistente que extrai informações de viagem de texto livre em português brasileiro e devolve JSON estruturado.

Hoje é ${today}.

Regras:
- Use sempre códigos IATA de 3 letras MAIÚSCULAS. Exemplos: São Paulo→GRU, Rio de Janeiro→GIG, Brasília→BSB, Belo Horizonte→CNF, Porto Alegre→POA, Salvador→SSA, Madrid→MAD, Paris→CDG, Lisboa→LIS, Miami→MIA, Nova York→JFK, Londres→LHR, Roma→FCO, Buenos Aires→EZE, Santiago→SCL.
- Datas SEMPRE no formato YYYY-MM-DD. Se a data for vaga (ex: "julho", "meio do ano"), use uma data plausível NO FUTURO em relação a hoje (${today}).
- Se não houver volta, return_date = "".
- Se passageiros não mencionado, use 1.
- Se cabine não mencionada, use "economica".
- max_points é POR PASSAGEIRO. "200k cada" = 200000. "300mil total para 2 pessoas" = 150000 por pessoa. Se não mencionado, use 0.
- notes: frase curta em português dizendo o que você entendeu (ex: "GRU→MAD ida 2026-07-15 volta 2026-07-30, executiva, 2 pax, até 200000 pts cada").

Texto do usuário:
"""
${clean}
"""`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const parsed = JSON.parse(raw) as ParsedRoute;

    parsed.origin = (parsed.origin || "").toUpperCase().slice(0, 3);
    parsed.destination = (parsed.destination || "").toUpperCase().slice(0, 3);
    parsed.passengers = Math.max(1, Math.min(9, Number(parsed.passengers) || 1));
    parsed.max_points = Math.max(0, Number(parsed.max_points) || 0);
    return parsed;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("API_KEY") || msg.includes("API key")) {
      throw new Error("API key do Gemini inválida ou não configurada na Vercel.");
    }
    if (msg.includes("quota") || msg.includes("rate")) {
      throw new Error("Limite gratuito do Gemini atingido. Tente em 1 minuto.");
    }
    throw new Error("Não consegui interpretar o texto. Tente reescrever de outra forma.");
  }
}
