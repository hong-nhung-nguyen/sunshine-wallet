import { describe, expect, it } from "vitest";
import { lowConfidenceWindowCandidates } from "@/lib/data/event-window-candidates";
import { runSunshineEvent } from "./run-sunshine-event";

describe("complete Sunshine event", () => {
  it("carries one canonical energy value through verification, attribution and settlement", () => {
    const result = runSunshineEvent();
    expect(result).toEqual(runSunshineEvent());
    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result.optimisation.totalPlannedEnergyKwh).toBe(18);
    expect(result.simulation.estimatedFlexEnergyKwh).toBe(16.5);
    expect(result.verification.record.verifiedFlexEnergyKwh).toBe(16.5);
    expect(result.attribution.attributableEnergyKwh).toBe(16.5);
    expect(result.settlement.status).toBe("calculated");
    if (result.settlement.status === "calculated") {
      expect(result.settlement.totalValueCents).toBe(1320);
      expect(result.settlement.equityPoolCents).toBe(858);
    }
  });

  it("returns no event before dispatch when forecast confidence is too low", () => {
    expect(runSunshineEvent(lowConfidenceWindowCandidates).status).toBe(
      "no_event",
    );
  });
});
