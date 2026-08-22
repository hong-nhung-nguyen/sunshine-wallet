import { allocateCents } from "./cents";
import {
  EQUITY_CELLS,
  computePriorityScore,
  type CapabilityClass,
  type FactorScores,
  type NeedTier,
} from "./priority-scheme";

/**
 * Layer 1A - equity pool allocation across the twelve priority cells.
 *
 * Two governance rules drive this module, both deliberate:
 *
 * 1. A household paid from the Solar Pool does NOT draw from the Equity Pool.
 *    The test is `receivesSolarPool` (enrolment), never solar ownership - a
 *    tenant with landlord-owned panels and no contributor payment keeps their
 *    equity credit.
 *
 * 2. The pool is not divided by one global per-point rate. It splits into
 *    twelve cell blocks by `tierWeight x capabilityWeight x claimantCount`,
 *    and only inside a cell do priority points divide the block. This protects
 *    a cohort's share against headcount swings in another cohort.
 *
 * Tiers and capability classes are recomputed here from the factor scores
 * rather than read from stored fields, so a re-scored household is always paid
 * out of the cell it actually belongs to.
 */

export interface EquityGroupPolicy {
  version: string;
  /** Relative claim of each need tier. Must be strictly decreasing. */
  tierWeights: Record<NeedTier, number>;
  /**
   * Relative claim of each capability class. Flat at 1 by default: capability
   * then changes a household's points inside its cell but never the size of
   * the cell's block, which is the strongest reading of "need must dominate
   * contribution". Raising a class tilts the pool toward capability and must
   * be re-checked against the Equity Floor assertions below.
   */
  capabilityWeights: Record<CapabilityClass, number>;
}

export const DEFAULT_EQUITY_GROUP_POLICY: EquityGroupPolicy = {
  version: "equity-groups-1.0.0",
  tierWeights: { critical: 4, high: 3, moderate: 2, standard: 1 },
  capabilityWeights: {
    individual_tank: 1,
    shared_or_other: 1,
    none: 1,
  },
};

export interface EquityHousehold {
  id: string;
  factors: FactorScores;
  /** True only while the household is paid from the Solar Pool this period. */
  receivesSolarPool: boolean;
}

export interface EquityCellAllocation {
  key: string;
  tier: NeedTier;
  capability: CapabilityClass;
  /** Members with priority points > 0. A zero-point household has no claim. */
  claimantCount: number;
  cellPoints: number;
  cellWeight: number;
  blockCents: number;
  /** Block divided by the cell's points. Differs per cell - that is the point. */
  centsPerPoint: number;
}

export interface EquityCredit {
  householdId: string;
  cellKey: string;
  tier: NeedTier;
  capability: CapabilityClass;
  priorityScore: number;
  amountCents: number;
}

export interface EquityAllocationResult {
  policy: EquityGroupPolicy;
  equityPoolCents: number;
  eligibleCount: number;
  excludedSolarCount: number;
  zeroPointCount: number;
  cells: EquityCellAllocation[];
  credits: EquityCredit[];
  /** Non-zero only when nobody can be paid; carries to the community reserve. */
  undistributedCents: number;
}

export function assertEquityGroupPolicy(policy: EquityGroupPolicy): void {
  const weights = [
    ...Object.values(policy.tierWeights),
    ...Object.values(policy.capabilityWeights),
  ];
  if (weights.some((weight) => !(weight > 0)))
    throw new Error(
      "Every tier and capability weight must be positive; a weight of 0 removes a cohort from the pool rather than deprioritising it",
    );
  const { critical, high, moderate, standard } = policy.tierWeights;
  if (!(critical > high && high > moderate && moderate > standard))
    throw new Error(
      "Tier weights must strictly decrease from critical to standard so need dominates contribution",
    );
}

export function allocateEquityPool(
  households: readonly EquityHousehold[],
  equityPoolCents: number,
  policy: EquityGroupPolicy = DEFAULT_EQUITY_GROUP_POLICY,
): EquityAllocationResult {
  if (!Number.isInteger(equityPoolCents) || equityPoolCents < 0)
    throw new Error("Equity pool must be a non-negative integer cent amount");
  assertEquityGroupPolicy(policy);

  const excludedSolarCount = households.filter(
    (household) => household.receivesSolarPool,
  ).length;

  const scored = households
    .filter((household) => !household.receivesSolarPool)
    .map((household) => ({
      id: household.id,
      ...computePriorityScore(household.factors),
    }));
  const claimants = scored.filter((entry) => entry.priorityScore > 0);

  const grouped = EQUITY_CELLS.map((cell) => {
    const members = claimants.filter((entry) => entry.cellKey === cell.key);
    return {
      ...cell,
      members,
      cellPoints: members.reduce((sum, entry) => sum + entry.priorityScore, 0),
      cellWeight:
        members.length === 0
          ? 0
          : policy.tierWeights[cell.tier] *
            policy.capabilityWeights[cell.capability] *
            members.length,
    };
  });

  const blocks = allocateCents(
    equityPoolCents,
    grouped.map((cell) => ({ id: cell.key, weight: cell.cellWeight })),
  );

  const credits: EquityCredit[] = [];
  const cells: EquityCellAllocation[] = grouped.map((cell) => {
    const blockCents = blocks.get(cell.key) ?? 0;
    const shares = allocateCents(
      blockCents,
      cell.members.map((entry) => ({
        id: entry.id,
        weight: entry.priorityScore,
      })),
    );
    for (const entry of cell.members)
      credits.push({
        householdId: entry.id,
        cellKey: cell.key,
        tier: cell.tier,
        capability: cell.capability,
        priorityScore: entry.priorityScore,
        amountCents: shares.get(entry.id) ?? 0,
      });
    return {
      key: cell.key,
      tier: cell.tier,
      capability: cell.capability,
      claimantCount: cell.members.length,
      cellPoints: cell.cellPoints,
      cellWeight: cell.cellWeight,
      blockCents,
      centsPerPoint: cell.cellPoints > 0 ? blockCents / cell.cellPoints : 0,
    };
  });

  const distributed = credits.reduce(
    (sum, credit) => sum + credit.amountCents,
    0,
  );

  return {
    policy,
    equityPoolCents,
    eligibleCount: scored.length,
    excludedSolarCount,
    zeroPointCount: scored.length - claimants.length,
    cells,
    credits,
    undistributedCents: equityPoolCents - distributed,
  };
}

export interface EquityFloorCheck {
  passed: boolean;
  explanation: string;
}

/**
 * The Equity Floor inversion assertion: the worst-off credit in the strongest
 * need cell must still beat the best credit in the weakest. Compares the whole
 * cells rather than two hand-picked archetypes. Vacuously true when either
 * cell is empty - report that rather than hiding the condition.
 */
export function checkInversion(
  result: EquityAllocationResult,
): EquityFloorCheck {
  const amountsIn = (tier: NeedTier, capability: CapabilityClass) =>
    result.credits
      .filter(
        (credit) => credit.tier === tier && credit.capability === capability,
      )
      .map((credit) => credit.amountCents);
  const critical = amountsIn("critical", "none");
  const standard = amountsIn("standard", "individual_tank");
  if (critical.length === 0 || standard.length === 0)
    return { passed: true, explanation: "PASS (cell empty)" };
  const worstCritical = Math.min(...critical);
  const bestStandard = Math.max(...standard);
  return {
    passed: worstCritical > bestStandard,
    explanation:
      worstCritical > bestStandard
        ? `critical/none floor ${worstCritical}c beats standard/individual_tank ceiling ${bestStandard}c`
        : `INVERTED: standard/individual_tank reaches ${bestStandard}c against a critical/none floor of ${worstCritical}c`,
  };
}

export function averageCreditByTier(
  result: EquityAllocationResult,
): Record<NeedTier, number> {
  const totals = {} as Record<NeedTier, { cents: number; count: number }>;
  for (const cell of EQUITY_CELLS)
    totals[cell.tier] ??= { cents: 0, count: 0 };
  for (const credit of result.credits) {
    totals[credit.tier].cents += credit.amountCents;
    totals[credit.tier].count += 1;
  }
  return Object.fromEntries(
    Object.entries(totals).map(([tier, { cents, count }]) => [
      tier,
      count > 0 ? cents / count : 0,
    ]),
  ) as Record<NeedTier, number>;
}

/**
 * Cell grouping makes a failure possible that a flat rate could not produce:
 * an unusual weight configuration or a lopsided roll inverting two adjacent
 * tiers. Tiers with no members are skipped rather than treated as zero.
 */
export function checkTierMonotonicity(
  result: EquityAllocationResult,
): EquityFloorCheck {
  const averages = averageCreditByTier(result);
  const populated = (["critical", "high", "moderate", "standard"] as const)
    .map((tier) => ({ tier, average: averages[tier] }))
    .filter(({ average }) => average > 0);
  for (let index = 1; index < populated.length; index += 1) {
    const above = populated[index - 1];
    const below = populated[index];
    if (below.average > above.average)
      return {
        passed: false,
        explanation: `INVERTED: ${below.tier} averages ${below.average.toFixed(2)}c against ${above.tier} at ${above.average.toFixed(2)}c`,
      };
  }
  return {
    passed: true,
    explanation: "average credit is non-increasing from critical to standard",
  };
}
