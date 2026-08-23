import { describe, expect, it } from "vitest";
import { getEquityCellDetail } from "./equity-cell-details";

describe("equity cell detail data", () => {
  it("lists every claimant and reconciles credits to the cell block", () => {
    const detail = getEquityCellDetail("critical:individual_tank");

    expect(detail).not.toBeNull();
    expect(detail?.households).toHaveLength(detail?.claimantCount ?? 0);
    expect(
      detail?.households.reduce(
        (sum, household) => sum + household.creditCents,
        0,
      ),
    ).toBe(detail?.blockCents);
    expect(
      detail?.households.every((household) => household.equityScore > 0),
    ).toBe(true);
  });

  it("rejects an unknown cell", () => {
    expect(getEquityCellDetail("unknown:cell")).toBeNull();
  });

  it("shows separate credits when a high-need household also contributes", () => {
    const detail = getEquityCellDetail("critical:individual_tank");
    const dualCredit = detail?.households.find(
      ({ contributorRewardCents }) => contributorRewardCents > 0,
    );

    expect(dualCredit?.creditCents).toBeGreaterThan(0);
    expect(dualCredit?.contributorRewardCents).toBeGreaterThan(0);
    expect(dualCredit?.totalCreditCents).toBe(
      (dualCredit?.creditCents ?? 0) +
        (dualCredit?.contributorRewardCents ?? 0),
    );
  });

  it("shows several successful dispatches in the example cell", () => {
    const detail = getEquityCellDetail("critical:individual_tank");
    const verified = detail?.households.filter(
      ({ energyStatus }) => energyStatus === "verified",
    );

    expect(verified?.length).toBeGreaterThanOrEqual(4);
    expect(
      verified?.every(
        ({ contributorRewardCents }) => contributorRewardCents > 0,
      ),
    ).toBe(true);
  });

  it("includes useful operational states without paying unverified dispatch", () => {
    const detail = getEquityCellDetail("critical:individual_tank");
    const statuses = new Set(
      detail?.households.map(({ energyStatus }) => energyStatus),
    );

    expect(statuses).toContain("verified");
    expect(statuses).toContain("dispatched_pending_verification");
    expect(statuses).toContain("verification_failed");
    expect(
      detail?.households
        .filter(({ energyStatus }) => energyStatus !== "verified")
        .every(({ contributorRewardCents }) => contributorRewardCents === 0),
    ).toBe(true);
  });
});
