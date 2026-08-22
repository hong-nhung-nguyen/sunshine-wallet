/**
 * Priority scheme — Factors A-E into a score, a tier, and an equity cell.
 *
 * The rule that governs this module, and the one most easily broken:
 *
 *   priority_score = need_score + contrib_score
 *
 * but `need_tier` is derived from `need_score` (Factors A-D) ALONE, and
 * `capability_class` from `contrib_score` (Factor E) alone. The sum is computed
 * in parallel and never feeds the tier. Passing `priority_score` into
 * `deriveNeedTier` would let fifteen capability points promote a household into
 * a larger equity block, which inverts the whole scheme.
 *
 * The cell (tier x capability) sizes the block a household's group draws from
 * the equity pool; the score divides that block. Two households in the same
 * tier but different capability cells receive, on average, the same credit.
 */

export type NeedTier = "critical" | "high" | "moderate" | "standard";

export type CapabilityClass = "individual_tank" | "shared_or_other" | "none";

/** Highest need first — also the block-weight order. */
export const NEED_TIERS: readonly NeedTier[] = [
  "critical",
  "high",
  "moderate",
  "standard",
];

export const CAPABILITY_CLASSES: readonly CapabilityClass[] = [
  "individual_tank",
  "shared_or_other",
  "none",
];

export const MAX_NEED_SCORE = 85;
export const MAX_CONTRIB_SCORE = 15;
export const MAX_PRIORITY_SCORE = MAX_NEED_SCORE + MAX_CONTRIB_SCORE;

/** Factor A - access barrier / disadvantage, 0-35. */
export const FACTOR_A_POINTS = {
  acute_hardship: 35,
  eapa_last_12m: 25,
  missed_bill: 12,
  none: 0,
} as const;

/** Factor B - income and concession status, 0-25. */
export const FACTOR_B_POINTS = {
  low_income_or_concession: 25,
  family_or_seniors_rebate: 18,
  below_median_no_rebate: 10,
  none: 0,
} as const;

/** Factor C - tenure and structural lock-out, 0-15. */
export const FACTOR_C_POINTS = {
  renter: 15,
  owner_apartment: 8,
  owner_detached_no_solar: 3,
  owner_with_solar: 0,
} as const;

/** Factor D - billing arrangement, 0-10. Has no zero-point answer. */
export const FACTOR_D_POINTS = {
  embedded_network: 10,
  standing_offer: 6,
  market_offer: 3,
} as const;

/** Factor E - physical contribution capability, 0-15. */
export const FACTOR_E_POINTS = {
  individual_tank: 15,
  shared_tank: 8,
  other_controllable_load: 4,
  none: 0,
} as const;

export type FactorAAnswer = keyof typeof FACTOR_A_POINTS;
export type FactorBAnswer = keyof typeof FACTOR_B_POINTS;
export type FactorCAnswer = keyof typeof FACTOR_C_POINTS;
export type FactorDAnswer = keyof typeof FACTOR_D_POINTS;
export type FactorEAnswer = keyof typeof FACTOR_E_POINTS;

export interface FactorAnswers {
  factorA: FactorAAnswer;
  factorB: FactorBAnswer;
  factorC: FactorCAnswer;
  factorD: FactorDAnswer;
  factorE: FactorEAnswer;
}

export interface FactorScores {
  factorA: number;
  factorB: number;
  factorC: number;
  factorD: number;
  factorE: number;
}

export interface PriorityScore {
  needScore: number;
  contribScore: number;
  priorityScore: number;
  needTier: NeedTier;
  capabilityClass: CapabilityClass;
  cellKey: string;
}

const FACTOR_MAXIMA: FactorScores = {
  factorA: 35,
  factorB: 25,
  factorC: 15,
  factorD: 10,
  factorE: 15,
};

/** Rank for tier comparisons. Lower is higher need. */
const TIER_RANK: Record<NeedTier, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  standard: 3,
};

export function scoreAnswers(answers: FactorAnswers): FactorScores {
  return {
    factorA: FACTOR_A_POINTS[answers.factorA],
    factorB: FACTOR_B_POINTS[answers.factorB],
    factorC: FACTOR_C_POINTS[answers.factorC],
    factorD: FACTOR_D_POINTS[answers.factorD],
    factorE: FACTOR_E_POINTS[answers.factorE],
  };
}

/**
 * Need tier from Factors A-D only. Never pass a total priority score here.
 */
export function deriveNeedTier(needScore: number): NeedTier {
  if (needScore >= 60) return "critical";
  if (needScore >= 40) return "high";
  if (needScore >= 20) return "moderate";
  return "standard";
}

/**
 * Factor E has four answer levels but the priority matrix has three capability
 * columns, so `other_controllable_load` (4 points) shares the middle class with
 * the shared tank (8 points). Their points still differ inside the cell, so the
 * fold changes grouping only - it never alters a score.
 */
export function classifyCapability(contribScore: number): CapabilityClass {
  if (contribScore >= FACTOR_E_POINTS.individual_tank) return "individual_tank";
  if (contribScore > 0) return "shared_or_other";
  return "none";
}

export function cellKey(tier: NeedTier, capability: CapabilityClass): string {
  return `${tier}:${capability}`;
}

/** The twelve cells in canonical order: tier-major, capability-minor. */
export const EQUITY_CELLS: readonly {
  tier: NeedTier;
  capability: CapabilityClass;
  key: string;
}[] = NEED_TIERS.flatMap((tier) =>
  CAPABILITY_CLASSES.map((capability) => ({
    tier,
    capability,
    key: cellKey(tier, capability),
  })),
);

export function assertFactorScores(factors: FactorScores): void {
  for (const [factor, maximum] of Object.entries(FACTOR_MAXIMA) as [
    keyof FactorScores,
    number,
  ][]) {
    const value = factors[factor];
    if (!Number.isInteger(value) || value < 0 || value > maximum)
      throw new Error(
        `${factor} must be an integer between 0 and ${maximum}, received ${value}`,
      );
  }
}

export function computePriorityScore(factors: FactorScores): PriorityScore {
  assertFactorScores(factors);
  const needScore =
    factors.factorA + factors.factorB + factors.factorC + factors.factorD;
  const contribScore = factors.factorE;
  const needTier = deriveNeedTier(needScore);
  const capabilityClass = classifyCapability(contribScore);
  return {
    needScore,
    contribScore,
    priorityScore: needScore + contribScore,
    needTier,
    capabilityClass,
    cellKey: cellKey(needTier, capabilityClass),
  };
}

/**
 * Physical-channel enrolment gate. Reads the raw contribution score, not the
 * capability class: an `other_controllable_load` household (E=4) sits in
 * `shared_or_other` for allocation but falls below this gate. The two
 * thresholds are deliberately different and must not be collapsed.
 */
export function isPhysicalChannelEligible(
  needTier: NeedTier,
  contribScore: number,
): boolean {
  return TIER_RANK[needTier] <= TIER_RANK.moderate && contribScore >= 8;
}
