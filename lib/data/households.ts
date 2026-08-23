import type { EquityHousehold } from "@/lib/engine/equity-allocation";
import {
  computePriorityScore,
  type CapabilityClass,
  type FactorScores,
  type NeedTier,
} from "@/lib/engine/priority-scheme";

/**
 * The Dapto East roll — 300 participants, deterministic, no randomness.
 *
 * 90 are enrolled solar contributors. Equity eligibility remains independent,
 * so verified service never cancels need-based support. The equity-eligible
 * demonstration households populate all twelve priority cells. Every cell has
 * members, because a cell left empty is a block-allocation path never exercised
 * before the demo.
 */

export interface RollHousehold extends EquityHousehold {
  label: string;
  /** Owns panels. A physical fact — it does NOT decide which pool pays. */
  hasSolar: boolean;
}

interface CellPlan {
  tier: NeedTier;
  capability: CapabilityClass;
  count: number;
  /** Base Factors A-D for this tier; members vary around it deterministically. */
  base: Omit<FactorScores, "factorE">;
  factorE: number;
}

/** Small deterministic spread so within-cell division is not a no-op. */
const SPREAD = [0, 2, -1, 1, -2];

const TIER_BASE: Record<NeedTier, Omit<FactorScores, "factorE">> = {
  // Apartment renter, embedded network, EAPA — need 75
  critical: { factorA: 25, factorB: 25, factorC: 15, factorD: 10 },
  // Private renter, low income rebate, standing offer — need 46
  high: { factorA: 0, factorB: 25, factorC: 15, factorD: 6 },
  // Missed a bill, below median, owner-occupier detached — need 31
  moderate: { factorA: 12, factorB: 10, factorC: 3, factorD: 6 },
  // No hardship indicators, market offer — need 9
  standard: { factorA: 0, factorB: 0, factorC: 3, factorD: 6 },
};

const CAPABILITY_FACTOR_E: Record<CapabilityClass, number> = {
  individual_tank: 15,
  shared_or_other: 8,
  none: 0,
};

/** Headcounts per cell, modelled for the Dapto East demonstration. */
const CELL_COUNTS: Record<NeedTier, Record<CapabilityClass, number>> = {
  critical: { individual_tank: 14, shared_or_other: 10, none: 18 },
  high: { individual_tank: 22, shared_or_other: 16, none: 26 },
  moderate: { individual_tank: 25, shared_or_other: 18, none: 22 },
  standard: { individual_tank: 14, shared_or_other: 11, none: 14 },
};

const cellPlans: CellPlan[] = (Object.keys(CELL_COUNTS) as NeedTier[]).flatMap(
  (tier) =>
    (Object.keys(CELL_COUNTS[tier]) as CapabilityClass[]).map((capability) => ({
      tier,
      capability,
      count: CELL_COUNTS[tier][capability],
      base: TIER_BASE[tier],
      factorE: CAPABILITY_FACTOR_E[capability],
    })),
);

/**
 * Vary Factor A within the tier's band so members of a cell hold different
 * priority scores, without letting the variation cross a tier boundary.
 */
function memberFactors(plan: CellPlan, index: number): FactorScores {
  const drift = SPREAD[index % SPREAD.length];
  const factorA = Math.max(0, Math.min(35, plan.base.factorA + drift));
  return { ...plan.base, factorA, factorE: plan.factorE };
}

function buildEquityRoll(): RollHousehold[] {
  const households: RollHousehold[] = [];
  for (const plan of cellPlans)
    for (let index = 0; index < plan.count; index += 1) {
      const factors = memberFactors(plan, index);
      households.push({
        id: `hh_${plan.tier}_${plan.capability}_${String(index).padStart(2, "0")}`,
        label: `${plan.tier} · ${plan.capability}`,
        factors,
        hasSolar: false,
        equityEligible: true,
        receivesSolarPool:
          plan.tier === "critical" &&
          plan.capability === "individual_tank" &&
          [0, 3, 6].includes(index),
      });
    }
  return households;
}

function buildContributorRoll(): RollHousehold[] {
  // Owner-occupier, rooftop solar, storage tank, no hardship indicators.
  const factors: FactorScores = {
    factorA: 0,
    factorB: 0,
    factorC: 0,
    factorD: 3,
    factorE: 15,
  };
  return Array.from({ length: 90 }, (_, index) => ({
    id: `hh_contributor_${String(index).padStart(2, "0")}`,
    label: "solar contributor",
    factors,
    hasSolar: true,
    equityEligible: false,
    receivesSolarPool: true,
  }));
}

/**
 * Edge cases the spec calls out (§11). Each is a ten-second demo moment and
 * each is a code path that would otherwise never run.
 */
export const edgeCaseHouseholds: readonly RollHousehold[] = [
  {
    // Landlord-owned panels, no contributor payment. An implementation that
    // gates equity eligibility on ownership drops this household from BOTH
    // pools. It must stay on the equity roll.
    id: "hh_edge_landlord_panels",
    label: "social housing · landlord-owned panels",
    factors: { factorA: 25, factorB: 25, factorC: 15, factorD: 10, factorE: 0 },
    hasSolar: true,
    equityEligible: true,
    receivesSolarPool: false,
  },
  {
    // High need AND an enrolled contributor. Receives independently calculated
    // Equity and Contributor credits when verified contribution exists.
    id: "hh_edge_needy_contributor",
    label: "critical need · enrolled contributor",
    factors: {
      factorA: 25,
      factorB: 25,
      factorC: 15,
      factorD: 10,
      factorE: 15,
    },
    hasSolar: true,
    equityEligible: true,
    receivesSolarPool: true,
  },
  {
    // Every factor at its floor. Priority score 0 — no claim, no cell weight.
    // Factor D has no zero-point answer, so this is the true minimum.
    id: "hh_edge_zero_point",
    label: "no hardship · no capability",
    factors: { factorA: 0, factorB: 0, factorC: 0, factorD: 0, factorE: 0 },
    hasSolar: false,
    equityEligible: true,
    receivesSolarPool: false,
  },
  {
    // E=4 sits in shared_or_other for allocation but below the physical
    // channel enrolment gate of 8. The two thresholds differ deliberately.
    id: "hh_edge_other_load",
    label: "moderate need · EV charger only",
    factors: { factorA: 12, factorB: 10, factorC: 3, factorD: 6, factorE: 4 },
    hasSolar: false,
    equityEligible: true,
    receivesSolarPool: false,
  },
];

export const equityRoll: readonly RollHousehold[] = buildEquityRoll();
export const contributorRoll: readonly RollHousehold[] = buildContributorRoll();

/** The full roll the settlement runs against. */
export const householdRoll: readonly RollHousehold[] = [
  ...equityRoll,
  ...contributorRoll,
  ...edgeCaseHouseholds,
];

export const rollSummary = {
  total: householdRoll.length,
  contributors: householdRoll.filter((h) => h.receivesSolarPool).length,
  equityEligible: householdRoll.filter((h) => h.equityEligible).length,
  ownsSolar: householdRoll.filter((h) => h.hasSolar).length,
  claimants: householdRoll.filter(
    (h) => h.equityEligible && computePriorityScore(h.factors).needScore > 0,
  ).length,
};
