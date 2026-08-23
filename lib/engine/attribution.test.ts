import { describe, expect, it } from "vitest";
import { attributionInput } from "@/lib/data/attribution-fixtures";
import { attributeVerifiedResponse } from "./attribution";

describe("contributor attribution", () => {
  it("produces deterministic shares that sum to one", () => {
    const first = attributeVerifiedResponse(attributionInput);
    expect(first).toEqual(attributeVerifiedResponse(attributionInput));
    expect(
      first.contributorAttributions.reduce(
        (total, item) => total + item.shareOfVerifiedResponse,
        0,
      ),
    ).toBeCloseTo(1);
  });

  it("caps attributed energy at verified flexibility", () => {
    const result = attributeVerifiedResponse({
      ...attributionInput,
      verifiedFlexEnergyKwh: 10,
    });
    expect(result.attributableEnergyKwh).toBe(10);
    expect(
      result.contributorAttributions.reduce(
        (total, item) => total + item.attributedEnergyKwh,
        0,
      ),
    ).toBeCloseTo(10, 2);
  });

  it("reconciles contributor rewards and equity credits in integer cents", () => {
    const result = attributeVerifiedResponse(attributionInput);
    expect(result.allocatedContributorCents).toBe(
      attributionInput.contributorPoolCents,
    );
    expect(result.allocatedEquityCents).toBe(attributionInput.equityPoolCents);
    expect(
      result.equityAllocations.map(({ creditCents }) => creditCents),
    ).toEqual([1693, 1129]);
  });

  it("keeps contributor rewards separate from equity credits", () => {
    const result = attributeVerifiedResponse(attributionInput);
    expect(
      result.contributorAttributions.every(
        ({ equityCreditAmount }) => equityCreditAmount === 0,
      ),
    ).toBe(true);
    expect(
      result.equityAllocations.every(({ creditAmount }) => creditAmount > 0),
    ).toBe(true);
  });

  it("handles zero qualifying contribution without allocating contributor rewards", () => {
    const result = attributeVerifiedResponse({
      ...attributionInput,
      contributions: attributionInput.contributions.map((item) => ({
        ...item,
        qualifyingEnergyKwh: 0,
      })),
    });
    expect(result.contributorAttributions).toEqual([]);
    expect(result.attributableEnergyKwh).toBe(0);
    expect(result.unallocatedContributorCents).toBe(
      attributionInput.contributorPoolCents,
    );
  });
});
