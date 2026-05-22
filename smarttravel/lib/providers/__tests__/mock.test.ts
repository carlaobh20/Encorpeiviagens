import { describe, expect, it } from "vitest";
import { mockProvider } from "../mock";

describe("mockProvider", () => {
  it("tem identidade", () => {
    expect(mockProvider.name).toBe("mock");
    expect(mockProvider.isProduction).toBe(false);
  });

  it("sempre retorna pelo menos 1 voo", async () => {
    const { results } = await mockProvider.searchAwardFlights({
      origin: "GRU",
      destination: "MIA",
      departureDate: "2026-12-01",
      cabin: "executiva",
      passengers: 1,
    });
    expect(results.length).toBeGreaterThan(0);
  });

  it("retorna determinístico pra mesmos parâmetros", async () => {
    const p = {
      origin: "GRU",
      destination: "LIS",
      departureDate: "2026-12-01",
      cabin: "economica" as const,
      passengers: 1,
    };
    const a = await mockProvider.searchAwardFlights(p);
    const b = await mockProvider.searchAwardFlights(p);
    expect(a.results.map((r) => r.pointsPrice)).toEqual(b.results.map((r) => r.pointsPrice));
  });

  it("resultados vêm ordenados do mais barato pro mais caro", async () => {
    const { results } = await mockProvider.searchAwardFlights({
      origin: "GRU",
      destination: "MAD",
      departureDate: "2026-12-01",
      cabin: "executiva",
      passengers: 1,
    });
    for (let i = 1; i < results.length; i++) {
      expect(results[i].pointsPrice).toBeGreaterThanOrEqual(results[i - 1].pointsPrice);
    }
  });

  it("multiplica pelo número de passageiros", async () => {
    const p1 = await mockProvider.searchAwardFlights({
      origin: "GRU",
      destination: "MIA",
      departureDate: "2026-12-01",
      cabin: "economica",
      passengers: 1,
    });
    const p2 = await mockProvider.searchAwardFlights({
      origin: "GRU",
      destination: "MIA",
      departureDate: "2026-12-01",
      cabin: "economica",
      passengers: 2,
    });
    expect(p2.results[0].pointsPrice).toBe(p1.results[0].pointsPrice * 2);
  });

  it("preços variam com a cabine (premium é mais caro)", async () => {
    const eco = await mockProvider.searchAwardFlights({
      origin: "GRU",
      destination: "MIA",
      departureDate: "2026-12-01",
      cabin: "economica",
      passengers: 1,
    });
    const exec = await mockProvider.searchAwardFlights({
      origin: "GRU",
      destination: "MIA",
      departureDate: "2026-12-01",
      cabin: "executiva",
      passengers: 1,
    });
    expect(exec.results[0].pointsPrice).toBeGreaterThan(eco.results[0].pointsPrice);
  });
});
