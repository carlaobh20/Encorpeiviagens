import type {
  AwardFlightResult,
  AwardSearchParams,
  FlightAwardProvider,
  ProviderRunDebug,
} from "./types";

/**
 * LatamApiProvider — busca via HTTP direto no BFF público da LATAM.
 *
 * Vantagens:
 *  - Roda em Vercel/serverless (sem Playwright).
 *  - Latência baixa (~1-3s vs 15-30s do browser).
 *  - Mais estável em CI/cron.
 *
 * Como funciona: a página pública da LATAM consome um BFF (`bff/air-offers`)
 * que retorna JSON com itinerários e preços (cash ou pontos). Esse endpoint é
 * público mas frequentemente sofre ajustes — se a estrutura mudar, ative o
 * modo debug e use /api/provider/probe pra inspecionar a resposta crua.
 *
 * Envs:
 *  - LATAM_API_BASE       (default: https://www.latamairlines.com)
 *  - LATAM_API_PATH       (default: /bff/air-offers/v2/offers/search)
 *  - LATAM_API_TIMEOUT_MS (default: 20000)
 *  - LATAM_DEBUG=true     loga payload bruto no console
 */
export const latamApiProvider: FlightAwardProvider = {
  name: "latam_api",
  label: "LATAM (API pública)",
  isProduction: false,

  async searchAwardFlights(params: AwardSearchParams) {
    const debug: ProviderRunDebug = {};
    const url = buildApiUrl(params);
    const timeout = Number(process.env.LATAM_API_TIMEOUT_MS ?? 20000);
    const debugMode = process.env.LATAM_DEBUG === "true";

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        method: "GET",
        headers: buildHeaders(),
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));

      if (!res.ok) {
        if (debugMode) console.warn(`[latamApi] HTTP ${res.status} em ${url}`);
        return {
          results: [],
          debug: { ...debug, htmlPath: null, screenshotPath: null },
        };
      }

      const json = (await res.json()) as unknown;
      if (debugMode) {
        console.log(`[latamApi] payload recebido (${JSON.stringify(json).length} bytes)`);
      }

      const results = parseLatamPayload(json, params);
      return { results, debug };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[latamApi] erro:", msg);
      return { results: [], debug };
    }
  },
};

function buildApiUrl(p: AwardSearchParams): string {
  const base = process.env.LATAM_API_BASE ?? "https://www.latamairlines.com";
  const path = process.env.LATAM_API_PATH ?? "/bff/air-offers/v2/offers/search";
  const u = new URL(path, base);
  u.searchParams.set("sort", "RECOMMENDED");
  u.searchParams.set("cabinType", mapCabin(p.cabin));
  u.searchParams.set("origin", p.origin);
  u.searchParams.set("destination", p.destination);
  u.searchParams.set("departure", p.departureDate);
  if (p.returnDate) u.searchParams.set("return", p.returnDate);
  u.searchParams.set("adult", String(p.passengers));
  u.searchParams.set("child", "0");
  u.searchParams.set("infant", "0");
  u.searchParams.set("redemption", "true");
  return u.toString();
}

function buildHeaders(): Record<string, string> {
  return {
    Accept: "application/json",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    "User-Agent":
      process.env.LATAM_API_USER_AGENT ??
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    "X-Latam-Application-Country": "BR",
    "X-Latam-Application-Lang": "pt",
    "X-Latam-Application-Name": "web-air-offers",
    "X-Latam-Client-Name": "web-air-offers",
    "X-Latam-Application-Oc": "br",
    "X-Latam-Track-Id": cryptoRandom(),
    Referer: "https://www.latamairlines.com/br/pt",
    Origin: "https://www.latamairlines.com",
  };
}

function mapCabin(c: AwardSearchParams["cabin"]): string {
  switch (c) {
    case "economica":
      return "ECONOMY";
    case "premium_economy":
      return "PREMIUM_ECONOMY";
    case "executiva":
      return "BUSINESS";
    case "primeira":
      return "FIRST";
    default:
      return "ECONOMY";
  }
}

/**
 * Parser tolerante. Tenta vários formatos conhecidos do BFF da LATAM.
 * Se nada bater, retorna [] (e o caller cai pro fallback ou retorna empty).
 */
function parseLatamPayload(json: unknown, params: AwardSearchParams): AwardFlightResult[] {
  if (!json || typeof json !== "object") return [];
  const data = json as Record<string, unknown>;

  // Tentativas: content / itineraries / flights / offers / data.flights ...
  const candidates: unknown[] = [
    data.content,
    data.itineraries,
    data.flights,
    data.offers,
    (data.data as Record<string, unknown> | undefined)?.flights,
    (data.data as Record<string, unknown> | undefined)?.itineraries,
  ];

  const list = candidates.find((c) => Array.isArray(c)) as unknown[] | undefined;
  if (!list || !Array.isArray(list)) return [];

  const results: AwardFlightResult[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    const r = extractFlight(item, params);
    if (r) results.push(r);
  }
  results.sort((a, b) => a.pointsPrice - b.pointsPrice);
  return results;
}

function extractFlight(
  item: Record<string, unknown>,
  params: AwardSearchParams,
): AwardFlightResult | null {
  // O BFF aninha "summary" / "price" / "brands" — tentamos cobrir variações.
  const price = pickPoints(item);
  if (!price || price < 1000) return null;

  const tax = pickTax(item);
  const flightNo = pickFlightNumber(item);
  const times = pickTimes(item);

  return {
    pointsPrice: price * params.passengers,
    cashTaxes: tax,
    airline: "LATAM",
    flightNumber: flightNo,
    departureTime: times.departure,
    arrivalTime: times.arrival,
    bookingUrl: buildBookingUrl(params),
    raw: item,
  };
}

function pickPoints(item: Record<string, unknown>): number | null {
  // Tenta caminhos comuns: brands[].price.amount, summary.price.amount, price.miles
  const tryPaths = [
    ["price", "miles"],
    ["price", "amount"],
    ["summary", "price", "amount"],
    ["fares", 0, "miles"],
    ["fares", 0, "price", "amount"],
    ["cheapestBrand", "price", "amount"],
  ];
  for (const path of tryPaths) {
    const v = deepGet(item, path);
    if (typeof v === "number" && v > 0) return Math.round(v);
  }
  // brands[]: pega o menor
  const brands = item.brands;
  if (Array.isArray(brands)) {
    const prices: number[] = [];
    for (const b of brands) {
      if (!b || typeof b !== "object") continue;
      const v = deepGet(b as Record<string, unknown>, ["price", "amount"]);
      if (typeof v === "number" && v > 0) prices.push(v);
    }
    if (prices.length) return Math.round(Math.min(...prices));
  }
  return null;
}

function pickTax(item: Record<string, unknown>): number {
  const tryPaths = [
    ["price", "taxAndFees"],
    ["summary", "price", "taxAndFees"],
    ["price", "totalTaxes"],
    ["fares", 0, "taxes"],
  ];
  for (const path of tryPaths) {
    const v = deepGet(item, path);
    if (typeof v === "number" && v >= 0) return Math.round(v * 100) / 100;
  }
  return 0;
}

function pickFlightNumber(item: Record<string, unknown>): string | null {
  const segments = (item.segments ?? item.flightSegments ?? deepGet(item, ["itinerary", "segments"])) as
    | unknown[]
    | undefined;
  if (!Array.isArray(segments) || segments.length === 0) return null;
  const first = segments[0] as Record<string, unknown> | undefined;
  if (!first) return null;
  const code =
    (first.flightCode as string | undefined) ??
    (first.flightNumber as string | undefined) ??
    deepGet(first, ["marketingFlight", "code"]);
  return typeof code === "string" ? code : null;
}

function pickTimes(item: Record<string, unknown>): { departure: string | null; arrival: string | null } {
  const segments = (item.segments ?? item.flightSegments ?? deepGet(item, ["itinerary", "segments"])) as
    | unknown[]
    | undefined;
  if (!Array.isArray(segments) || segments.length === 0) return { departure: null, arrival: null };
  const first = segments[0] as Record<string, unknown>;
  const last = segments[segments.length - 1] as Record<string, unknown>;
  const dep =
    (deepGet(first, ["departure", "time"]) as string | undefined) ??
    (deepGet(first, ["origin", "departure"]) as string | undefined) ??
    (first.departureTime as string | undefined);
  const arr =
    (deepGet(last, ["arrival", "time"]) as string | undefined) ??
    (deepGet(last, ["destination", "arrival"]) as string | undefined) ??
    (last.arrivalTime as string | undefined);
  return { departure: extractTime(dep), arrival: extractTime(arr) };
}

function extractTime(s: string | undefined): string | null {
  if (!s) return null;
  // Aceita ISO "2026-06-01T08:30:00" ou já formatado "08:30"
  const m = s.match(/(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : null;
}

function deepGet(obj: Record<string, unknown>, path: (string | number)[]): unknown {
  let cur: unknown = obj;
  for (const k of path) {
    if (cur == null) return undefined;
    if (typeof cur !== "object") return undefined;
    if (typeof k === "number") {
      if (!Array.isArray(cur)) return undefined;
      cur = cur[k];
    } else {
      cur = (cur as Record<string, unknown>)[k];
    }
  }
  return cur;
}

function buildBookingUrl(p: AwardSearchParams): string {
  const u = new URL("https://www.latamairlines.com/br/pt/oferta-voos");
  u.searchParams.set("origin", p.origin);
  u.searchParams.set("destination", p.destination);
  u.searchParams.set("outbound", `${p.departureDate}T00:00:00.000Z`);
  if (p.returnDate) u.searchParams.set("inbound", `${p.returnDate}T00:00:00.000Z`);
  u.searchParams.set("trip", p.returnDate ? "RT" : "OW");
  u.searchParams.set("adt", String(p.passengers));
  u.searchParams.set("chd", "0");
  u.searchParams.set("inf", "0");
  u.searchParams.set("cabin", p.cabin);
  u.searchParams.set("redemption", "true");
  return u.toString();
}

function cryptoRandom(): string {
  // UUID v4 simples sem dep nativa
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
