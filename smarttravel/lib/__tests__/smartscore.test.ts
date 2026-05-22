import { describe, expect, it } from "vitest";
import {
  calculateSmartScore,
  recommendationFromScore,
  recommendationLabel,
} from "../smartscore";

describe("calculateSmartScore", () => {
  it("retorna 0 quando current é 0", () => {
    expect(calculateSmartScore({ current: 0, avg: 100, lowest: 50, maxPoints: 100, cabin: "economica" })).toBe(0);
  });

  it("dá score alto pra preço bem abaixo da média e da mínima", () => {
    const s = calculateSmartScore({
      current: 30000,
      avg: 70000,
      lowest: 32000,
      maxPoints: 50000,
      cabin: "executiva",
      daysUntilDeparture: 30,
      sampleSize: 20,
    });
    expect(s).toBeGreaterThanOrEqual(85);
  });

  it("dá score baixo pra preço acima da média e do orçamento", () => {
    const s = calculateSmartScore({
      current: 100000,
      avg: 70000,
      lowest: 50000,
      maxPoints: 60000,
      cabin: "economica",
      daysUntilDeparture: 200,
      sampleSize: 20,
    });
    expect(s).toBeLessThan(40);
  });

  it("nunca passa de 100 nem fica negativo", () => {
    const high = calculateSmartScore({
      current: 1,
      avg: 100000,
      lowest: 1,
      maxPoints: 100000,
      cabin: "primeira",
      daysUntilDeparture: 10,
      sampleSize: 50,
    });
    expect(high).toBeLessThanOrEqual(100);
    expect(high).toBeGreaterThanOrEqual(0);
  });

  it("aplica penalidade de confiabilidade quando temos pouquíssimas leituras", () => {
    const params = {
      current: 30000,
      avg: 70000,
      lowest: 32000,
      maxPoints: 50000,
      cabin: "executiva" as const,
      daysUntilDeparture: 30,
    };
    const sFew = calculateSmartScore({ ...params, sampleSize: 1 });
    const sMany = calculateSmartScore({ ...params, sampleSize: 20 });
    expect(sFew).toBeLessThan(sMany);
  });
});

describe("recommendationFromScore", () => {
  it("90+ → buy_now", () => expect(recommendationFromScore(92)).toBe("buy_now"));
  it("75 → good_deal", () => expect(recommendationFromScore(75)).toBe("good_deal"));
  it("55 → monitor", () => expect(recommendationFromScore(55)).toBe("monitor"));
  it("20 → expensive", () => expect(recommendationFromScore(20)).toBe("expensive"));
});

describe("recommendationLabel", () => {
  it("traduz buy_now", () => expect(recommendationLabel("buy_now")).toBe("Comprar agora"));
  it("traduz expensive", () => expect(recommendationLabel("expensive")).toBe("Preço acima da média"));
});
