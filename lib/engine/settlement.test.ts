import { describe, expect, it } from "vitest";
import { settlementInput } from "@/lib/data/settlement-fixtures";
import { calculateSettlement } from "./settlement";

describe("settlement and Equity Floor", () => {
  it("calculates deterministic program value and reconciles integer-cent pools", () => {
    const first = calculateSettlement(settlementInput);
    expect(first).toEqual(calculateSettlement(settlementInput));
    expect(first.status).toBe("calculated");
    if (first.status === "calculated") {
      expect(first.totalValueCents).toBe(18183);
      expect(
        first.contributorPoolCents +
          first.equityPoolCents +
          first.reservePoolCents,
      ).toBe(first.totalValueCents);
    }
  });

  it("blocks settlement before verification passes", () => {
    const result = calculateSettlement({
      ...settlementInput,
      verificationGatePassed: false,
    });
    expect(result.status).toBe("blocked");
    if (result.status === "blocked")
      expect(result.rejectionCodes).toContain("VERIFICATION_GATE_FAILED");
  });

  it("rejects pool shares that do not total 100 percent", () => {
    const result = calculateSettlement({
      ...settlementInput,
      policy: { ...settlementInput.policy, reserveShareBps: 400 },
    });
    expect(result.status).toBe("blocked");
    if (result.status === "blocked")
      expect(result.rejectionCodes).toContain("INVALID_POOL_TOTAL");
  });

  it("rejects an Equity Pool below the Council floor", () => {
    const result = calculateSettlement({
      ...settlementInput,
      policy: {
        ...settlementInput.policy,
        equityShareBps: 1500,
        contributorShareBps: 8000,
      },
    });
    expect(result.status).toBe("blocked");
    if (result.status === "blocked")
      expect(result.rejectionCodes).toContain("EQUITY_FLOOR_VIOLATION");
  });

  it("keeps contributor rewards separate from Equity Dividends", () => {
    const result = calculateSettlement(settlementInput);
    if (result.status !== "calculated")
      throw new Error("Expected calculated settlement");
    expect(result.settlement.contributorRewards).toBe(
      result.contributorPoolCents / 100,
    );
    expect(result.settlement.equityCredit).toBe(result.equityPoolCents / 100);
    expect(result.settlement.contributorRewards).not.toBe(
      result.settlement.equityCredit,
    );
  });
});
