import { describe, expect, it } from "vitest";
import { simulationInputs } from "@/lib/data/simulation-fixtures";
import { simulateEvent } from "./simulation";

describe("event simulation", () => {
  it("is deterministic and keeps planned and simulated energy separate", () => {
    const first = simulateEvent(simulationInputs);
    expect(first).toEqual(simulateEvent(simulationInputs));
    expect(first.plannedFlexEnergyKwh).toBe(18);
    expect(first.estimatedFlexEnergyKwh).toBe(16.5);
    expect(first.estimatedFlexEnergyKwh).toBeLessThanOrEqual(
      first.plannedFlexEnergyKwh,
    );
  });

  it("tracks baseline and observed demand separately", () => {
    const result = simulateEvent(simulationInputs);
    expect(result.baselineEnergyKwh).toBe(5.8);
    expect(result.observedEnergyKwh).toBe(22.3);
    expect(result.observedEnergyKwh).toBe(
      result.baselineEnergyKwh + result.estimatedFlexEnergyKwh,
    );
  });

  it("uses the fixed response factor for each resource", () => {
    const result = simulateEvent(simulationInputs);
    expect(
      result.dispatchResults.map(({ actualEnergyKwh }) => actualEnergyKwh),
    ).toEqual([8.4, 4.6, 3.5]);
    expect(result.dispatchResults.at(-1)?.status).toBe("partial");
  });

  it("rejects invalid response factors", () => {
    expect(() =>
      simulateEvent([{ ...simulationInputs[0], responseFactor: 1.1 }]),
    ).toThrow("Response factor must be between 0 and 1");
  });
});
