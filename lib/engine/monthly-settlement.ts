import { allocateCents } from "./cents";
import {
  DEFAULT_EQUITY_GROUP_POLICY,
  allocateEquityPool,
  averageCreditByTier,
  checkInversion,
  checkTierMonotonicity,
  assertEquityGroupPolicy,
  type EquityAllocationResult,
  type EquityFloorCheck,
  type EquityGroupPolicy,
  type EquityHousehold,
} from "./equity-allocation";
import type { NeedTier } from "./priority-scheme";

/**
 * Monthly settlement — one pot, three pools, two branches.
 *
 * The branches compensate different things. Layer 1A uses Council-approved
 * need eligibility; Layer 1B uses verified contribution. An eligible household
 * may receive both from the already-fixed pools without double-counting value.
 *
 * Structural policy errors block the settlement outright. The Equity Floor
 * assertions do not — they are *reported* here and enforced at the point a
 * policy is changed (see `validateGovernancePolicy`). A roll that happens to
 * invert should surface loudly, not silently withhold everyone's money.
 */

export interface GovernancePolicy {
  version: string;
  effectiveDate: string;
  equityShareBps: number;
  contributorShareBps: number;
  reserveShareBps: number;
  /** The Equity Floor. Equity share may rise above it, never below. */
  minimumEquityBps: number;
  groups: EquityGroupPolicy;
}

export const TOTAL_BASIS_POINTS = 10_000;

export const DEFAULT_GOVERNANCE_POLICY: GovernancePolicy = {
  version: "governance-3.0.0",
  effectiveDate: "2026-08-01",
  equityShareBps: 6_000,
  contributorShareBps: 3_500,
  reserveShareBps: 500,
  minimumEquityBps: 6_000,
  groups: DEFAULT_EQUITY_GROUP_POLICY,
};

export interface MonthlySettlementInput {
  period: string;
  /** Σ verified value for the period, in integer cents. */
  potCents: number;
  households: readonly EquityHousehold[];
  /** Optional verified contribution weight by Solar Pool household. */
  contributorWeights?: Readonly<Record<string, number>>;
  policy: GovernancePolicy;
  createdAt: string;
}

export type SettlementRejectionCode =
  | "INVALID_POOL_TOTAL"
  | "EQUITY_FLOOR_VIOLATION"
  | "INVALID_VALUE_INPUT"
  | "INVALID_GROUP_WEIGHTS";

export interface SettlementCredit {
  householdId: string;
  branch: "1A" | "1B";
  amountCents: number;
  /** 1A only — the cell whose block this credit came out of. */
  cellKey?: string;
  /** 1A only — frozen Need Score used to divide the cell block. */
  equityScore?: number;
}

export interface EquityFloorReport {
  inversion: EquityFloorCheck;
  monotonicity: EquityFloorCheck;
  passed: boolean;
  averageCreditByTier: Record<NeedTier, number>;
}

export type MonthlySettlement =
  | {
      status: "settled";
      period: string;
      policy: GovernancePolicy;
      potCents: number;
      equityPoolCents: number;
      contributorPoolCents: number;
      reserveCents: number;
      /** Undistributable pool money folded into the reserve. */
      carriedCents: number;
      contributorCount: number;
      contributorShareCents: number;
      equityRollCount: number;
      credits: SettlementCredit[];
      allocation: EquityAllocationResult;
      floor: EquityFloorReport;
      createdAt: string;
    }
  | {
      status: "blocked";
      policy: GovernancePolicy;
      rejectionCodes: SettlementRejectionCode[];
      reasons: string[];
    };

export interface PolicyValidation {
  valid: boolean;
  rejectionCodes: SettlementRejectionCode[];
  reasons: string[];
}

/**
 * Structural validation of a governance policy, independent of any roll.
 * The governance UI calls this before it will accept an edit.
 */
export function validateGovernancePolicy(
  policy: GovernancePolicy,
): PolicyValidation {
  const rejectionCodes: SettlementRejectionCode[] = [];
  const reasons: string[] = [];

  const total =
    policy.equityShareBps + policy.contributorShareBps + policy.reserveShareBps;
  if (total !== TOTAL_BASIS_POINTS) {
    rejectionCodes.push("INVALID_POOL_TOTAL");
    reasons.push(
      `Pool shares total ${(total / 100).toFixed(2)}% instead of 100%`,
    );
  }
  if (policy.equityShareBps < policy.minimumEquityBps) {
    rejectionCodes.push("EQUITY_FLOOR_VIOLATION");
    reasons.push(
      `Equity share ${policy.equityShareBps / 100}% is below the ${policy.minimumEquityBps / 100}% Equity Floor`,
    );
  }
  if (
    [
      policy.equityShareBps,
      policy.contributorShareBps,
      policy.reserveShareBps,
    ].some((bps) => !Number.isInteger(bps) || bps < 0)
  ) {
    rejectionCodes.push("INVALID_POOL_TOTAL");
    reasons.push("Pool shares must be non-negative whole basis points");
  }
  try {
    assertEquityGroupPolicy(policy.groups);
  } catch (error) {
    rejectionCodes.push("INVALID_GROUP_WEIGHTS");
    reasons.push((error as Error).message);
  }

  return { valid: rejectionCodes.length === 0, rejectionCodes, reasons };
}

export function settleMonth(input: MonthlySettlementInput): MonthlySettlement {
  const validation = validateGovernancePolicy(input.policy);
  const rejectionCodes = [...validation.rejectionCodes];
  const reasons = [...validation.reasons];

  if (!Number.isInteger(input.potCents) || input.potCents < 0) {
    rejectionCodes.push("INVALID_VALUE_INPUT");
    reasons.push("The pot must be a non-negative whole number of cents");
  }
  if (rejectionCodes.length > 0)
    return {
      status: "blocked",
      policy: input.policy,
      rejectionCodes,
      reasons,
    };

  // 1. Split the pot. Largest remainder, so the three pools close exactly.
  const pools = allocateCents(input.potCents, [
    { id: "equity", weight: input.policy.equityShareBps },
    { id: "contributor", weight: input.policy.contributorShareBps },
    { id: "reserve", weight: input.policy.reserveShareBps },
  ]);
  const equityPoolCents = pools.get("equity") ?? 0;
  const contributorPoolCents = pools.get("contributor") ?? 0;
  const baseReserveCents = pools.get("reserve") ?? 0;

  const credits: SettlementCredit[] = [];

  // 2. Layer 1B — verified contribution divides the Contributor Pool.
  const contributors = input.households.filter(
    (household) => household.receivesSolarPool,
  );
  const contributorShares = allocateCents(
    contributors.length > 0 ? contributorPoolCents : 0,
    contributors.map((household) => ({
      id: household.id,
      weight: input.contributorWeights
        ? (input.contributorWeights[household.id] ?? 0)
        : 1,
    })),
  );
  for (const household of contributors)
    credits.push({
      householdId: household.id,
      branch: "1B",
      amountCents: contributorShares.get(household.id) ?? 0,
    });
  const distributedContributorCents = credits.reduce(
    (sum, credit) => sum + credit.amountCents,
    0,
  );

  // 3. Layer 1A — need-only allocation over the equity-eligible roll.
  const allocation = allocateEquityPool(
    input.households,
    equityPoolCents,
    input.policy.groups,
  );
  for (const credit of allocation.credits)
    credits.push({
      householdId: credit.householdId,
      branch: "1A",
      amountCents: credit.amountCents,
      cellKey: credit.cellKey,
      equityScore: credit.equityScore,
    });

  // 4. Pool exclusivity — no household may appear on both rolls.
  // Both branches may credit one household because their fixed pools compensate
  // different things: need and a separately verified energy service.
  const carriedCents =
    allocation.undistributedCents +
    (contributorPoolCents - distributedContributorCents);

  const inversion = checkInversion(allocation);
  const monotonicity = checkTierMonotonicity(allocation);

  return {
    status: "settled",
    period: input.period,
    policy: input.policy,
    potCents: input.potCents,
    equityPoolCents,
    contributorPoolCents,
    reserveCents: baseReserveCents + carriedCents,
    carriedCents,
    contributorCount: contributors.length,
    contributorShareCents:
      contributors.length > 0
        ? Math.floor(contributorPoolCents / contributors.length)
        : 0,
    equityRollCount: allocation.eligibleCount,
    credits,
    allocation,
    floor: {
      inversion,
      monotonicity,
      passed: inversion.passed && monotonicity.passed,
      averageCreditByTier: averageCreditByTier(allocation),
    },
    createdAt: input.createdAt,
  };
}

/** Every cent of the pot must land in a credit or the reserve. */
export function settlementClosesExactly(
  settlement: MonthlySettlement,
): boolean {
  if (settlement.status !== "settled") return false;
  const credited = settlement.credits.reduce(
    (sum, credit) => sum + credit.amountCents,
    0,
  );
  return credited + settlement.reserveCents === settlement.potCents;
}
