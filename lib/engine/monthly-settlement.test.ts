import { describe, expect, it } from "vitest";
import { householdRoll } from "@/lib/data/households";
import {
  DEFAULT_GOVERNANCE_POLICY,
  settleMonth,
  settlementClosesExactly,
  validateGovernancePolicy,
  type GovernancePolicy,
  type MonthlySettlementInput,
} from "./monthly-settlement";

const POT = 436_000; // $4,360.00

const input = (overrides: Partial<MonthlySettlementInput> = {}) => ({
  period: "2026-08",
  potCents: POT,
  households: [...householdRoll],
  policy: DEFAULT_GOVERNANCE_POLICY,
  createdAt: "2026-09-01T00:00:00+10:00",
  ...overrides,
});

const policy = (overrides: Partial<GovernancePolicy>): GovernancePolicy => ({
  ...DEFAULT_GOVERNANCE_POLICY,
  ...overrides,
});

const settled = (overrides: Partial<MonthlySettlementInput> = {}) => {
  const result = settleMonth(input(overrides));
  if (result.status !== "settled")
    throw new Error(`expected settled, got ${result.reasons.join("; ")}`);
  return result;
};

describe("pool split", () => {
  it("splits the pot 60/35/5 and closes exactly", () => {
    const result = settled();
    expect(result.equityPoolCents).toBe(261_600);
    expect(result.contributorPoolCents).toBe(152_600);
    expect(
      result.equityPoolCents +
        result.contributorPoolCents +
        (result.reserveCents - result.carriedCents),
    ).toBe(POT);
    expect(settlementClosesExactly(result)).toBe(true);
  });

  it("is deterministic", () => {
    expect(settleMonth(input())).toEqual(settleMonth(input()));
  });
});

describe("the two branches", () => {
  it("settles 1B first and removes contributors from the equity roll", () => {
    const result = settled();
    const contributorIds = new Set(
      result.credits
        .filter((credit) => credit.branch === "1B")
        .map((credit) => credit.householdId),
    );
    const equityIds = new Set(
      result.credits
        .filter((credit) => credit.branch === "1A")
        .map((credit) => credit.householdId),
    );
    expect(contributorIds.size).toBe(result.contributorCount);
    for (const id of contributorIds) expect(equityIds.has(id)).toBe(false);
  });

  it("pays every contributor the same flat share", () => {
    const result = settled();
    const amounts = result.credits
      .filter((credit) => credit.branch === "1B")
      .map((credit) => credit.amountCents);
    // Largest remainder can separate two contributors by a single cent.
    expect(Math.max(...amounts) - Math.min(...amounts)).toBeLessThanOrEqual(1);
  });

  it("freezes the priority score onto each 1A credit", () => {
    const equityCredit = settled().credits.find(
      (credit) => credit.branch === "1A",
    );
    expect(equityCredit?.priorityScore).toBeGreaterThan(0);
    expect(equityCredit?.cellKey).toContain(":");
  });

  it("keeps the landlord-panels tenant on the equity roll", () => {
    const credit = settled().credits.find(
      (c) => c.householdId === "hh_edge_landlord_panels",
    );
    expect(credit?.branch).toBe("1A");
  });

  it("pays the high-need contributor from 1B only", () => {
    const rows = settled().credits.filter(
      (c) => c.householdId === "hh_edge_needy_contributor",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].branch).toBe("1B");
  });
});

describe("carry", () => {
  it("carries the solar pool to the reserve when nobody is enrolled", () => {
    const result = settled({
      households: householdRoll.filter((h) => !h.receivesSolarPool),
    });
    expect(result.contributorCount).toBe(0);
    expect(result.carriedCents).toBe(result.contributorPoolCents);
    expect(settlementClosesExactly(result)).toBe(true);
  });

  it("carries the equity pool when nobody is eligible", () => {
    const result = settled({
      households: householdRoll.filter((h) => h.receivesSolarPool),
    });
    expect(result.equityRollCount).toBe(0);
    expect(result.carriedCents).toBe(result.equityPoolCents);
    expect(settlementClosesExactly(result)).toBe(true);
  });

  it("settles a zero pot without dividing by zero", () => {
    const result = settled({ potCents: 0 });
    expect(result.reserveCents).toBe(0);
    expect(settlementClosesExactly(result)).toBe(true);
  });
});

describe("governance policy validation", () => {
  it("accepts the default policy", () => {
    expect(validateGovernancePolicy(DEFAULT_GOVERNANCE_POLICY).valid).toBe(
      true,
    );
  });

  it("refuses an equity share below the floor", () => {
    const check = validateGovernancePolicy(
      policy({
        equityShareBps: 5_000,
        contributorShareBps: 4_500,
        reserveShareBps: 500,
      }),
    );
    expect(check.valid).toBe(false);
    expect(check.rejectionCodes).toContain("EQUITY_FLOOR_VIOLATION");
  });

  it("refuses shares that do not total 100 percent", () => {
    const check = validateGovernancePolicy(
      policy({ equityShareBps: 7_000, contributorShareBps: 3_500 }),
    );
    expect(check.valid).toBe(false);
    expect(check.rejectionCodes).toContain("INVALID_POOL_TOTAL");
  });

  it("refuses tier weights that do not strictly decrease", () => {
    const check = validateGovernancePolicy(
      policy({
        groups: {
          ...DEFAULT_GOVERNANCE_POLICY.groups,
          tierWeights: { critical: 1, high: 3, moderate: 2, standard: 1 },
        },
      }),
    );
    expect(check.valid).toBe(false);
    expect(check.rejectionCodes).toContain("INVALID_GROUP_WEIGHTS");
  });

  it("blocks a settlement run under an invalid policy", () => {
    const result = settleMonth(
      input({ policy: policy({ equityShareBps: 1_000 }) }),
    );
    expect(result.status).toBe("blocked");
    if (result.status === "blocked")
      expect(result.reasons.join(" ")).toMatch(/Equity Floor|100%/);
  });

  it("rejects a non-integer pot", () => {
    expect(settleMonth(input({ potCents: 10.5 })).status).toBe("blocked");
  });
});

describe("Equity Floor reporting", () => {
  it("reports both assertions passing on the real roll", () => {
    const result = settled();
    expect(result.floor.passed).toBe(true);
    expect(result.floor.inversion.passed).toBe(true);
    expect(result.floor.monotonicity.passed).toBe(true);
  });

  it("reports rather than blocks when a tilted weight inverts the roll", () => {
    // Governance refuses such an edit; a settlement still pays and shows FAIL,
    // because withholding everyone's money is the wrong failure mode here.
    const result = settled({
      policy: policy({
        groups: {
          ...DEFAULT_GOVERNANCE_POLICY.groups,
          capabilityWeights: {
            individual_tank: 60,
            shared_or_other: 1,
            none: 1,
          },
        },
      }),
    });
    expect(result.floor.passed).toBe(false);
    expect(settlementClosesExactly(result)).toBe(true);
  });

  it("raises the equity pool when governance votes above the floor", () => {
    const richer = settled({
      policy: policy({
        equityShareBps: 7_000,
        contributorShareBps: 2_500,
        reserveShareBps: 500,
      }),
    });
    expect(richer.equityPoolCents).toBeGreaterThan(
      settled().equityPoolCents,
    );
    expect(settlementClosesExactly(richer)).toBe(true);
  });
});
