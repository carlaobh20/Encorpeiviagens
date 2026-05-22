import { describe, expect, it } from "vitest";
import { discountPct, formatPoints, validateRoute } from "../utils";

describe("formatPoints", () => {
  it("formata 1000 como 1.000 (pt-BR)", () => {
    expect(formatPoints(1000)).toBe("1.000");
  });
  it("formata 1234567 com separadores", () => {
    expect(formatPoints(1234567)).toBe("1.234.567");
  });
});

describe("discountPct", () => {
  it("retorna 0 quando média é 0", () => expect(discountPct(100, 0)).toBe(0));
  it("calcula 50% de desconto", () => expect(discountPct(50, 100)).toBe(50));
  it("retorna negativo quando current > avg", () => expect(discountPct(120, 100)).toBe(-20));
});

describe("validateRoute", () => {
  it("aprova rota válida", () => {
    const v = validateRoute({
      origin: "GRU",
      destination: "MIA",
      departure_date: "2026-12-01",
      cabin: "economica",
      passengers: 1,
      max_points: 50000,
    });
    expect(v.ok).toBe(true);
    expect(v.errors).toHaveLength(0);
  });

  it("reprova origem inválida", () => {
    const v = validateRoute({
      origin: "GR",
      destination: "MIA",
      departure_date: "2026-12-01",
      cabin: "economica",
      passengers: 1,
    });
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toMatch(/Origem/);
  });

  it("reprova quando origem = destino", () => {
    const v = validateRoute({
      origin: "GRU",
      destination: "GRU",
      departure_date: "2026-12-01",
      cabin: "economica",
      passengers: 1,
    });
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toMatch(/iguais/);
  });

  it("reprova volta antes da ida", () => {
    const v = validateRoute({
      origin: "GRU",
      destination: "MIA",
      departure_date: "2026-12-01",
      return_date: "2026-11-01",
      cabin: "economica",
      passengers: 1,
    });
    expect(v.ok).toBe(false);
    expect(v.errors.join(" ")).toMatch(/Volta/);
  });

  it("reprova cabine inválida", () => {
    const v = validateRoute({
      origin: "GRU",
      destination: "MIA",
      departure_date: "2026-12-01",
      cabin: "ultra-premium",
      passengers: 1,
    });
    expect(v.ok).toBe(false);
  });
});
