import type { Cabin } from "./types";

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  cabin: Cabin;
  passengers: number;
  /** sessão criptografada do usuário, se conectado (null = busca como visitante) */
  encryptedSession?: string | null;
}

export interface SearchResult {
  pointsPrice: number;
  cashTaxes: number;
  flightNumber: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  bookingUrl: string;
  rawPayload: unknown;
}

/**
 * ⚠️ PONTO DE IMPLEMENTAÇÃO REAL DO SCRAPING DA LATAM ⚠️
 *
 * Esta função é onde o Playwright deve:
 *  1. Abrir a busca de passagens em pontos da LATAM
 *  2. Se houver `encryptedSession`, descriptografar e injetar os cookies (busca logada)
 *  3. Preencher origem/destino/data/cabine
 *  4. Capturar o preço em pontos retornado
 *
 * O site da LATAM MUDA com frequência: os seletores abaixo são placeholders.
 * Ajuste-os inspecionando o site atual. Mantido isolado aqui de propósito,
 * para que o resto do worker não dependa dos detalhes do scraping.
 *
 * ⚠️ AVISO LEGAL: automatizar acesso/scraping pode violar os Termos de Uso da
 * LATAM e gerar bloqueio de conta. Valide juridicamente antes de produção.
 */
export async function searchLatamPoints(params: SearchParams): Promise<SearchResult | null> {
  // ───────────────────────────────────────────────────────────────
  // IMPLEMENTAÇÃO REAL VAI AQUI. Exemplo de esqueleto com Playwright:
  //
  // import { chromium } from "playwright";
  // const browser = await chromium.launch({ headless: true });
  // const context = await browser.newContext();
  // if (params.encryptedSession) {
  //   const cookies = decryptSession(params.encryptedSession); // ver lib/crypto
  //   await context.addCookies(cookies);
  // }
  // const page = await context.newPage();
  // await page.goto("https://www.latamairlines.com/...busca...");
  // ... preencher formulário e ler o preço ...
  // await browser.close();
  // ───────────────────────────────────────────────────────────────

  // MOCK enquanto o scraping real não é implementado:
  console.log(`[latam] (mock) buscando ${params.origin}→${params.destination} ${params.cabin}`);
  return null;
}
