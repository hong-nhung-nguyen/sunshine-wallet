import { describe, expect, it } from "vitest";
import { attributionInput } from "@/lib/data/attribution-fixtures";
import { attributeVerifiedResponse } from "./attribution";

describe("contributor attribution", () => {
  it("is deterministic and produces shares that sum to one", () => {
    const result = attributeVerifiedResponse(attributionInput);
    expect(result).toEqual(attributeVerifiedResponse(attributionInput));
    expect(
      result.contributorAttributions.reduce(
        (sum, item) => sum + item.shareOfVerifiedResponse,
        0,
      ),
    ).toBeCloseTo(1);
  });

  it("caps attributed energy at the verified outcome", () => {
    const result = attributeVerifiedResponse({
      ...attributionInput,
      verifiedFlexEnergyKwh: 10,
    });
    expect(result.attributableEnergyKwh).toBe(10);
    expect(
      result.contributorAttributions.reduce(
        (sum, item) => sum + item.attributedEnergyKwh,
        0,
      ),
    ).toBeCloseTo(10, 2);
  });

  it("does not allocate money before settlement", () => {
    const result = attributeVerifiedResponse(attributionInput);
    expect(
      result.contributorAttributions.every(
        (item) => item.rewardAmount === 0 && item.equityCreditAmount === 0,
      ),
    ).toBe(true);
  });

  it("handles zero qualifying contribution", () => {
    const result = attributeVerifiedResponse({
      ...attributionInput,
      contributions: attributionInput.contributions.map((item) => ({
        ...item,
        qualifyingEnergyKwh: 0,
      })),
    });
    expect(result.contributorAttributions).toEqual([]);
    expect(result.attributableEnergyKwh).toBe(0);
  });
});
