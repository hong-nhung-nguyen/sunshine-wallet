import { describe, expect, it } from "vitest";
import {
  optimisationCandidates,
  optimisationConstraints,
} from "@/lib/data/optimisation-candidates";
import { optimiseDispatchPlan } from "./optimiser";

describe("dispatch optimiser", () => {
  it("is deterministic and meets the target without exceeding max power", () => {
    const first = optimiseDispatchPlan(
      optimisationCandidates,
      optimisationConstraints,
    );
    const second = optimiseDispatchPlan(
      optimisationCandidates,
      optimisationConstraints,
    );
    expect(first).toEqual(second);
    expect(first.status).toBe("optimised");
    expect(first.totalPlannedEnergyKwh).toBe(
      optimisationConstraints.targetFlexEnergyKwh,
    );
    expect(first.totalPlannedPowerKw).toBeLessThanOrEqual(
      optimisationConstraints.maxPowerKw,
    );
  });

  it("partially schedules the final resource instead of exceeding the target", () => {
    const result = optimiseDispatchPlan(
      optimisationCandidates,
      optimisationConstraints,
    );
    const lastPlan = result.dispatchPlans.at(-1);
    const lastCandidate = result.rankedCandidates.find(
      ({ resourceId }) => resourceId === lastPlan?.resourceId,
    );
    expect(lastPlan).toBeDefined();
    expect(lastPlan!.plannedEnergyKwh).toBeLessThan(
      lastCandidate!.maxShiftEnergyKwh,
    );
    expect(result.totalPlannedEnergyKwh).toBe(18);
  });

  it("reports insufficient flexibility without manufacturing energy", () => {
    const result = optimiseDispatchPlan(optimisationCandidates.slice(0, 1), {
      ...optimisationConstraints,
      targetFlexEnergyKwh: 12,
    });
    expect(result.status).toBe("insufficient_flexibility");
    expect(result.totalPlannedEnergyKwh).toBe(4.8);
    expect(result.shortfallEnergyKwh).toBe(7.2);
  });

  it("never selects an ineligible resource", () => {
    const result = optimiseDispatchPlan(
      optimisationCandidates,
      optimisationConstraints,
    );
    expect(
      result.dispatchPlans.some(({ resourceId }) =>
        result.excludedResourceIds.includes(resourceId),
      ),
    ).toBe(false);
  });
});
