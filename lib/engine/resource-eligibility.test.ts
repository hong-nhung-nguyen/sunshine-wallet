import { describe, expect, it } from "vitest";
import type { FlexibleResource } from "@/lib/types";
import {
  evaluateResourceEligibility,
  filterEligibleResources,
  type ResourceEligibilityContext,
} from "./resource-eligibility";

const resource: FlexibleResource = {
  id: "resource_test",
  participantId: "resident_test",
  resourceType: "hot_water",
  name: "Test hot water",
  locationId: "sunshine_cell_01",
  capacityKw: 3.6,
  maxShiftEnergyKwh: 7.2,
  dispatchable: true,
  status: "available",
  createdAt: "2026-08-22T09:00:00+10:00",
};
const context: ResourceEligibilityContext = {
  eventId: "event_001",
  sunshineCellId: "sunshine_cell_01",
  consentStatus: "accepted",
  availableForWindow: true,
  comfortSafe: true,
  safetySafe: true,
  confidence: 0.94,
  checkedAt: "2026-08-22T09:30:00+10:00",
};

describe("resource eligibility", () => {
  it("accepts a compatible, available and safe resource deterministically", () => {
    expect(evaluateResourceEligibility(resource, context)).toEqual(
      evaluateResourceEligibility(resource, context),
    );
    expect(evaluateResourceEligibility(resource, context).eligible).toBe(true);
  });

  it.each([
    [
      "wrong cell",
      resource,
      { ...context, sunshineCellId: "sunshine_cell_02" },
      "WRONG_SUNSHINE_CELL",
    ],
    [
      "unavailable",
      { ...resource, status: "offline" as const },
      context,
      "UNAVAILABLE",
    ],
    [
      "incompatible",
      { ...resource, resourceType: "solar_export" as const },
      context,
      "INCOMPATIBLE",
    ],
    [
      "paused consent",
      resource,
      { ...context, consentStatus: "paused" as const },
      "NO_CONSENT",
    ],
    [
      "unsafe",
      resource,
      { ...context, safetySafe: false },
      "SAFETY_CONSTRAINT",
    ],
    [
      "comfort constrained",
      resource,
      { ...context, comfortSafe: false },
      "COMFORT_CONSTRAINT",
    ],
  ])(
    "rejects %s with a machine-readable reason",
    (_name, candidate, candidateContext, code) => {
      const result = evaluateResourceEligibility(candidate, candidateContext);
      expect(result.eligible).toBe(false);
      expect(result.rejectionCodes).toContain(code);
    },
  );

  it("filters rejected resources from the eligible result", () => {
    const unsafe = { ...resource, id: "resource_unsafe" };
    const result = filterEligibleResources([resource, unsafe], {
      resource_test: context,
      resource_unsafe: { ...context, safetySafe: false },
    });
    expect(result.eligibleResources.map(({ id }) => id)).toEqual([
      "resource_test",
    ]);
  });
});
