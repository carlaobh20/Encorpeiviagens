import { describe, expect, it } from "vitest";
import { evaluateAlerts } from "../alert-rules";

const baseRoute = {
  origin: "GRU",
  destination: "MIA",
  cabin: "executiva" as const,
  max_points: 60000,
};

describe("evaluateAlerts", () => {
  it("retorna oportunidade rara quando smartScore >= 85", () => {
    const a = evaluateAlerts({
      route: baseRoute,
      currentPrice: 30000,
      avgPrice: 70000,
      lowestPrice: 30000,
      smartScore: 90,
      previousCount: 10,
    });
    expect(a?.type).toBe("rare_opportunity");
  });

  it("retorna lowest_ever quando bate a mínima e há histórico", () => {
    const a = evaluateAlerts({
      route: baseRoute,
      currentPrice: 20000,
      avgPrice: 40000,
      lowestPrice: 25000,
      smartScore: 70,
      previousCount: 5,
    });
    expect(a?.type).toBe("lowest_ever");
  });

  it("ignora lowest_ever sem histórico suficiente", () => {
    const a = evaluateAlerts({
      route: baseRoute,
      currentPrice: 20000,
      avgPrice: 40000,
      lowestPrice: 25000,
      smartScore: 70,
      previousCount: 0,
    });
    expect(a?.type).not.toBe("lowest_ever");
  });

  it("retorna meta atingida quando preço <= max_points", () => {
    const a = evaluateAlerts({
      route: baseRoute,
      currentPrice: 50000,
      avgPrice: 60000,
      lowestPrice: 45000,
      smartScore: 60,
      previousCount: 5,
    });
    expect(a?.type).toBe("target_reached");
  });

  it("retorna price_drop quando desconto >= 30% e meta não foi batida", () => {
    const a = evaluateAlerts({
      route: { ...baseRoute, max_points: 40000 }, // meta abaixo do preço atual
      currentPrice: 50000,
      avgPrice: 80000,
      lowestPrice: 40000,
      smartScore: 60,
      previousCount: 5,
    });
    expect(a?.type).toBe("price_drop");
  });

  it("retorna null quando preço sem destaque e sem meta batida", () => {
    const a = evaluateAlerts({
      route: { ...baseRoute, max_points: 30000 },
      currentPrice: 70000,
      avgPrice: 72000,
      lowestPrice: 60000,
      smartScore: 40,
      previousCount: 10,
    });
    expect(a).toBeNull();
  });
});
