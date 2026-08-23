import { describe, expect, it } from "vitest";
import {
  DEFAULT_EQUITY_GROUP_POLICY,
  allocateEquityPool,
  averageCreditByTier,
  checkInversion,
  checkTierMonotonicity,
  type EquityHousehold,
} from "./equity-allocation";
import type { FactorScores } from "./priority-scheme";

/** Build factors that land on a chosen need score with a chosen Factor E. */
const household = (
  id: string,
  needScore: number,
  factorE: number,
  receivesSolarPool = false,
  equityEligible = true,
): EquityHousehold => {
  const factorA = Math.min(35, needScore);
  const factorB = Math.min(25, Math.max(0, needScore - 35));
  const factorC = Math.min(15, Math.max(0, needScore - 60));
  const factorD = Math.min(10, Math.max(0, needScore - 75));
  const factors: FactorScores = {
    factorA,
    factorB,
    factorC,
    factorD,
    factorE,
  };
  return { id, factors, receivesSolarPool, equityEligible };
};

/** One household in each of the twelve cells, plus a solar contributor. */
const roll: EquityHousehold[] = [
  household("critical-tank", 70, 15),
  household("critical-shared", 70, 8),
  household("critical-none", 70, 0),
  household("high-tank", 50, 15),
  household("high-shared", 50, 8),
  household("high-none", 50, 0),
  household("moderate-tank", 30, 15),
  household("moderate-shared", 30, 8),
  household("moderate-none", 30, 0),
  household("standard-tank", 10, 15),
  household("standard-shared", 10, 8),
  household("standard-none", 10, 0),
  household("maria-solar", 3, 15, true, false),
];

const POOL = 261_600;

const creditFor = (result: ReturnType<typeof allocateEquityPool>, id: string) =>
  result.credits.find((credit) => credit.householdId === id)?.amountCents;

const blockFor = (result: ReturnType<typeof allocateEquityPool>, key: string) =>
  result.cells.find((cell) => cell.key === key)?.blockCents ?? 0;

describe("independent eligibility", () => {
  it("pays nothing from the equity pool to an ineligible household", () => {
    const result = allocateEquityPool(roll, POOL);
    expect(result.ineligibleCount).toBe(1);
    expect(result.eligibleCount).toBe(12);
    expect(creditFor(result, "maria-solar")).toBeUndefined();
  });

  it("keeps an equity-eligible household even when it is also a contributor", () => {
    const tenant = household("verified-and-high-need", 70, 15, true, true);
    const result = allocateEquityPool([...roll, tenant], POOL);
    expect(creditFor(result, "verified-and-high-need")).toBeGreaterThan(0);
  });
});

describe("closure", () => {
  it("distributes every cent and is deterministic", () => {
    const result = allocateEquityPool(roll, POOL);
    const distributed = result.credits.reduce(
      (sum, credit) => sum + credit.amountCents,
      0,
    );
    expect(distributed).toBe(POOL);
    expect(result.undistributedCents).toBe(0);
    expect(result).toEqual(allocateEquityPool(roll, POOL));
  });

  it("closes the twelve cell blocks against the pool", () => {
    const result = allocateEquityPool(roll, POOL);
    const blocks = result.cells.reduce((sum, cell) => sum + cell.blockCents, 0);
    expect(blocks).toBe(POOL);
    expect(result.cells).toHaveLength(12);
  });

  it("carries the pool forward when nobody is eligible", () => {
    const result = allocateEquityPool(
      [household("solar-only", 40, 15, true, false)],
      12_345,
    );
    expect(result.credits).toHaveLength(0);
    expect(result.undistributedCents).toBe(12_345);
  });
});

describe("block sizing", () => {
  it("scales blocks by tier weight, not by one global rate", () => {
    const result = allocateEquityPool(roll, POOL);
    expect(blockFor(result, "critical:none")).toBeGreaterThan(
      blockFor(result, "high:none"),
    );
    expect(blockFor(result, "high:none")).toBeGreaterThan(
      blockFor(result, "moderate:none"),
    );
    expect(blockFor(result, "moderate:none")).toBeGreaterThan(
      blockFor(result, "standard:none"),
    );
  });

  it("gives equivalent capability views the same block within a tier", () => {
    const result = allocateEquityPool(roll, POOL);
    // Equal weights; only the single largest-remainder cent may separate them.
    expect(
      Math.abs(
        blockFor(result, "critical:individual_tank") -
          blockFor(result, "critical:none"),
      ),
    ).toBeLessThanOrEqual(1);
  });

  it("gives a zero-point household no claim and no cell weight", () => {
    const result = allocateEquityPool(
      [household("zero", 0, 0), household("critical", 70, 0)],
      50_000,
    );
    expect(result.zeroPointCount).toBe(1);
    expect(creditFor(result, "zero")).toBeUndefined();
    expect(creditFor(result, "critical")).toBe(50_000);
  });
});

describe("division within a cell", () => {
  it("divides a tier block in proportion to Need Score", () => {
    const result = allocateEquityPool(
      [household("a", 70, 0), household("b", 80, 0)],
      100_000,
    );
    const a = creditFor(result, "a") ?? 0;
    const b = creditFor(result, "b") ?? 0;
    expect(b).toBeGreaterThan(a);
    expect(b / a).toBeCloseTo(80 / 70, 2);
  });

  it("does not increase an Equity credit merely because a device exists", () => {
    // The headline consequence from backend-flow.md §2: standard/individual_tank
    // on 25 points and standard/none on 10 points draw equal-sized blocks, so
    // the cell with fewer points converts each point into more money.
    const result = allocateEquityPool(
      [household("best-device", 10, 15), household("no-device", 10, 0)],
      10_000,
    );
    const best = creditFor(result, "best-device") ?? 0;
    const none = creditFor(result, "no-device") ?? 0;
    expect(Math.abs(best - none)).toBeLessThanOrEqual(1);
    // ...and the rate is inverted against capability.
    const bestRate =
      result.cells.find((cell) => cell.key === "standard:individual_tank")
        ?.centsPerPoint ?? 0;
    const noneRate =
      result.cells.find((cell) => cell.key === "standard:none")
        ?.centsPerPoint ?? 0;
    expect(noneRate).toBe(bestRate);
  });

  it("pays higher need more across different capability cells in one tier", () => {
    const result = allocateEquityPool(
      [
        household("higher-need-no-device", 58, 0),
        household("lower-need-tank", 42, 15),
      ],
      10_000,
    );

    expect(creditFor(result, "higher-need-no-device")).toBeGreaterThan(
      creditFor(result, "lower-need-tank") ?? 0,
    );
    const rates = result.cells
      .filter(({ tier, claimantCount }) => tier === "high" && claimantCount > 0)
      .map(({ centsPerPoint }) => centsPerPoint);
    expect(new Set(rates).size).toBe(1);
  });
});

describe("Equity Floor assertions", () => {
  it("passes the inversion check on a balanced roll", () => {
    const result = allocateEquityPool(roll, POOL);
    expect(checkInversion(result).passed).toBe(true);
    expect(checkTierMonotonicity(result).passed).toBe(true);
  });

  it("holds vacuously when a comparison cell is empty", () => {
    const check = checkInversion(
      allocateEquityPool([household("only-critical", 70, 0)], 10_000),
    );
    expect(check.passed).toBe(true);
    expect(check.explanation).toContain("cell empty");
  });

  it("reports average credit falling from critical to standard", () => {
    const averages = averageCreditByTier(allocateEquityPool(roll, POOL));
    expect(averages.critical).toBeGreaterThan(averages.high);
    expect(averages.high).toBeGreaterThan(averages.moderate);
    expect(averages.moderate).toBeGreaterThan(averages.standard);
  });
});

describe("governance policy validation", () => {
  it("rejects a zero tier weight, which would remove a cohort entirely", () => {
    expect(() =>
      allocateEquityPool(roll, POOL, {
        ...DEFAULT_EQUITY_GROUP_POLICY,
        tierWeights: { critical: 4, high: 3, moderate: 2, standard: 0 },
      }),
    ).toThrow();
  });

  it("rejects tier weights that do not strictly decrease", () => {
    expect(() =>
      allocateEquityPool(roll, POOL, {
        ...DEFAULT_EQUITY_GROUP_POLICY,
        tierWeights: { critical: 2, high: 3, moderate: 2, standard: 1 },
      }),
    ).toThrow();
  });

  it("rejects a non-integer or negative pool", () => {
    expect(() => allocateEquityPool(roll, 100.5)).toThrow();
    expect(() => allocateEquityPool(roll, -1)).toThrow();
  });
});
