import { describe, expect, it } from "vitest";
import { EQUITY_CELLS, computePriorityScore } from "@/lib/engine/priority-scheme";
import { allocateEquityPool } from "@/lib/engine/equity-allocation";
import { householdRoll, rollSummary } from "./households";

describe("the Dapto East roll", () => {
  it("is deterministic across imports", () => {
    expect(householdRoll.map((h) => h.id)).toEqual(
      householdRoll.map((h) => h.id),
    );
    expect(new Set(householdRoll.map((h) => h.id)).size).toBe(
      householdRoll.length,
    );
  });

  it("splits 90 contributors from the equity-eligible remainder", () => {
    expect(rollSummary.contributors).toBe(91); // 90 + the needy contributor
    expect(rollSummary.equityEligible).toBe(rollSummary.total - 91);
  });

  it("populates every one of the twelve cells", () => {
    const occupied = new Set(
      householdRoll
        .filter((h) => !h.receivesSolarPool)
        .map((h) => computePriorityScore(h.factors).cellKey),
    );
    for (const cell of EQUITY_CELLS) expect(occupied).toContain(cell.key);
  });

  it("keeps the landlord-panels household on the equity roll", () => {
    const result = allocateEquityPool([...householdRoll], 261_600);
    const credit = result.credits.find(
      (c) => c.householdId === "hh_edge_landlord_panels",
    );
    expect(credit?.amountCents).toBeGreaterThan(0);
    expect(credit?.tier).toBe("critical");
  });

  it("pays the needy contributor from the solar pool only", () => {
    const result = allocateEquityPool([...householdRoll], 261_600);
    expect(
      result.credits.find(
        (c) => c.householdId === "hh_edge_needy_contributor",
      ),
    ).toBeUndefined();
  });

  it("gives the zero-point household no claim", () => {
    const result = allocateEquityPool([...householdRoll], 261_600);
    expect(
      result.credits.find((c) => c.householdId === "hh_edge_zero_point"),
    ).toBeUndefined();
    expect(result.zeroPointCount).toBe(1);
  });

  it("closes the pool exactly against the real roll", () => {
    const result = allocateEquityPool([...householdRoll], 261_600);
    const total = result.credits.reduce((s, c) => s + c.amountCents, 0);
    expect(total).toBe(261_600);
    expect(result.undistributedCents).toBe(0);
  });
});
