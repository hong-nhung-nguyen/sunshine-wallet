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
      detail?.households.every((household) => household.priorityScore > 0),
    ).toBe(true);
  });

  it("rejects an unknown cell", () => {
    expect(getEquityCellDetail("unknown:cell")).toBeNull();
  });
});
