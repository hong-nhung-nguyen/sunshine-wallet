import { allocateCents } from "./cents";
import {
  EQUITY_CELLS,
  NEED_TIERS,
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
 * 1. Equity eligibility is independent of verified contribution. A household
 *    may receive need-based support and a separately calculated payment for a
 *    verified service without counting either pool twice.
 *
 * 2. The pool splits into four Need Tier blocks by `tierWeight x claimantCount`.
 *    One tier rate then pays every household in that tier by Need Score. The
 *    twelve capability cells remain reporting views and never set money rates.
 *
 * Tiers and capability classes are recomputed here from the factor scores
 * rather than read from stored fields, so a re-scored household is always paid
 * out of the cell it actually belongs to.
 */

export interface EquityGroupPolicy {
  version: string;
  /** Relative claim of each need tier. Must be strictly decreasing. */
  tierWeights: Record<NeedTier, number>;
}

export const DEFAULT_EQUITY_GROUP_POLICY: EquityGroupPolicy = {
  version: "equity-groups-3.0.0",
  tierWeights: { critical: 4, high: 3, moderate: 2, standard: 1 },
};

export interface EquityHousehold {
  id: string;
  factors: FactorScores;
  /** Council-approved eligibility for need-based support this period. */
  equityEligible: boolean;
  /** Enrolled to receive verified Contributor rewards this period. */
  receivesSolarPool: boolean;
}

export interface EquityCellAllocation {
  key: string;
  tier: NeedTier;
  capability: CapabilityClass;
  /** Members with need points > 0. A zero-point household has no claim. */
  claimantCount: number;
  cellPoints: number;
  cellWeight: number;
  blockCents: number;
  /** Tier block divided by tier points. Identical across a tier's three cells. */
  centsPerPoint: number;
}

export interface EquityCredit {
  householdId: string;
  cellKey: string;
  tier: NeedTier;
  capability: CapabilityClass;
  equityScore: number;
  amountCents: number;
}

export interface EquityAllocationResult {
  policy: EquityGroupPolicy;
  equityPoolCents: number;
  eligibleCount: number;
  ineligibleCount: number;
  zeroPointCount: number;
  cells: EquityCellAllocation[];
  credits: EquityCredit[];
  /** Non-zero only when nobody can be paid; carries to the community reserve. */
  undistributedCents: number;
}

export function assertEquityGroupPolicy(policy: EquityGroupPolicy): void {
  const weights = Object.values(policy.tierWeights);
  if (weights.some((weight) => !(weight > 0)))
    throw new Error(
      "Every tier weight must be positive; a weight of 0 removes a cohort from the pool rather than deprioritising it",
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

  const ineligibleCount = households.filter(
    (household) => !household.equityEligible,
  ).length;

  const scored = households
    .filter((household) => household.equityEligible)
    .map((household) => {
      const score = computePriorityScore(household.factors);
      return { id: household.id, ...score, equityScore: score.needScore };
    });
  const claimants = scored.filter((entry) => entry.equityScore > 0);

  const tierGroups = NEED_TIERS.map((tier) => {
    const members = claimants.filter((entry) => entry.needTier === tier);
    return {
      tier,
      members,
      points: members.reduce((sum, entry) => sum + entry.equityScore, 0),
      weight: policy.tierWeights[tier] * members.length,
    };
  });
  const tierBlocks = allocateCents(
    equityPoolCents,
    tierGroups.map(({ tier, weight }) => ({ id: tier, weight })),
  );

  const credits: EquityCredit[] = [];
  for (const group of tierGroups) {
    const blockCents = tierBlocks.get(group.tier) ?? 0;
    const shares = allocateCents(
      blockCents,
      group.members.map((entry) => ({
        id: entry.id,
        weight: entry.equityScore,
      })),
    );
    for (const entry of group.members)
      credits.push({
        householdId: entry.id,
        cellKey: entry.cellKey,
        tier: entry.needTier,
        capability: entry.capabilityClass,
        equityScore: entry.equityScore,
        amountCents: shares.get(entry.id) ?? 0,
      });
  }

  const creditByHousehold = new Map(
    credits.map((credit) => [credit.householdId, credit.amountCents]),
  );
  const cells: EquityCellAllocation[] = EQUITY_CELLS.map((cell) => {
    const members = claimants.filter((entry) => entry.cellKey === cell.key);
    const tier = tierGroups.find((group) => group.tier === cell.tier);
    const tierBlockCents = tierBlocks.get(cell.tier) ?? 0;
    const cellPoints = members.reduce(
      (sum, entry) => sum + entry.equityScore,
      0,
    );
    return {
      key: cell.key,
      tier: cell.tier,
      capability: cell.capability,
      claimantCount: members.length,
      cellPoints,
      cellWeight: policy.tierWeights[cell.tier] * members.length,
      blockCents: members.reduce(
        (sum, entry) => sum + (creditByHousehold.get(entry.id) ?? 0),
        0,
      ),
      centsPerPoint: tier && tier.points > 0 ? tierBlockCents / tier.points : 0,
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
    ineligibleCount,
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
  for (const cell of EQUITY_CELLS) totals[cell.tier] ??= { cents: 0, count: 0 };
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
