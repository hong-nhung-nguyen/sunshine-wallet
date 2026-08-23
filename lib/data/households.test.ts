import { describe, expect, it } from "vitest";
import {
  EQUITY_CELLS,
  computePriorityScore,
} from "@/lib/engine/priority-scheme";
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

  it("tracks contributor enrolment independently from equity eligibility", () => {
    expect(rollSummary.contributors).toBe(94); // 90 + four need-eligible contributors
    expect(rollSummary.equityEligible).toBe(214);
  });

  it("populates every one of the twelve cells", () => {
    const occupied = new Set(
      householdRoll
        .filter((h) => h.equityEligible)
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

  it("keeps the needy contributor eligible for an equity credit", () => {
    const result = allocateEquityPool([...householdRoll], 261_600);
    const credit = result.credits.find(
      (c) => c.householdId === "hh_edge_needy_contributor",
    );
    expect(credit?.amountCents).toBeGreaterThan(0);
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
