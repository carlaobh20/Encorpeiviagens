import type { AwardFlightResult, AwardSearchParams, FlightAwardProvider } from "./types";

/**
 * MockProvider — sempre funciona, sempre retorna 1-3 resultados realistas.
 * Determinístico por (rota+data) — útil pra testes e demo.
 */
export const mockProvider: FlightAwardProvider = {
  name: "mock",
  label: "Mock (demonstração)",
  isProduction: false,

  async searchAwardFlights(params: AwardSearchParams) {
    const seed = stringSeed(`${params.origin}-${params.destination}-${params.departureDate}-${params.cabin}`);
    const rng = mulberry32(seed);

    const baseByCabin: Record<string, number> = {
      economica: 18000,
      premium_economy: 35000,
      executiva: 80000,
      primeira: 180000,
    };
    const base = baseByCabin[params.cabin] ?? 20000;

    const distanceFactor = 1 + (stringSeed(params.destination) % 50) / 100; // 1.0 - 1.5
    const targetMid = Math.round(base * distanceFactor);

    // Variação aleatória ±35% da média da rota
    const variation = 0.35;
    const count = 1 + Math.floor(rng() * 3);
    const results: AwardFlightResult[] = [];
    for (let i = 0; i < count; i++) {
      const drift = (rng() - 0.5) * 2 * variation;
      const price = Math.round(targetMid * (1 + drift)) * params.passengers;
      const flightCode = ["LA", "JJ", "LU"][Math.floor(rng() * 3)] + (3000 + Math.floor(rng() * 800));
      const taxes = 80 + Math.round(rng() * 350);
      const hour = 6 + Math.floor(rng() * 16);
      const min = ["00", "15", "30", "45"][Math.floor(rng() * 4)];
      const dur = 2 + Math.floor(rng() * 11);
      results.push({
        pointsPrice: price,
        cashTaxes: taxes,
        airline: "LATAM",
        flightNumber: flightCode,
        departureTime: `${pad(hour)}:${min}`,
        arrivalTime: `${pad((hour + dur) % 24)}:${min}`,
        bookingUrl: `https://www.latamairlines.com/br/pt/oferta-voos?inbound=&outbound=${params.departureDate}&origin=${params.origin}&destination=${params.destination}&adt=${params.passengers}&chd=0&inf=0&trip=OW&cabin=${params.cabin}&redemption=true`,
        raw: { mock: true, seed, drift, params },
      });
    }
    // Ordena do menor preço pro maior
    results.sort((a, b) => a.pointsPrice - b.pointsPrice);
    return { results };
  },

  async getAccountBalance() {
    return 128430;
  },
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function stringSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function mulberry32(seed: number) {
  let t = seed;
  return function () {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
