import {
  chance,
  hash32,
  type EligibilityAssertions,
  type OfferType,
  type RebateBand,
} from "./contracts";
import {
  FACTOR_A_POINTS,
  FACTOR_B_POINTS,
  FACTOR_D_POINTS,
  FACTOR_E_POINTS,
  type FactorAAnswer,
  type FactorBAnswer,
  type FactorDAnswer,
  type FactorEAnswer,
} from "@/lib/engine/priority-scheme";

/**
 * adapter:eligibility — the government concession check.
 *
 * Yes/no assertions and coarse bands only. **Never store which program.**
 * Medical and Life Support rebates map to `primary`, so no health information
 * enters the system; life-support status is handled separately as a scheduling
 * exclusion and is never a scoring input.
 */

const REBATE_BANDS: RebateBand[] = ["primary", "secondary", "none"];
const OFFER_TYPES: OfferType[] = ["standing", "market", "embedded"];

export function checkRebateStatus(
  customerRef: string,
): EligibilityAssertions | null {
  if (!customerRef.trim()) return null;
  const seed = customerRef.trim().toUpperCase();

  // One lookup in six is unavailable. A failed lookup is NOT a zero score —
  // the caller falls through to self-declaration.
  if (chance(0.166, "available", seed)) return null;

  const offerType = OFFER_TYPES[hash32("offer", seed) % OFFER_TYPES.length];
  return {
    source: "eligibility:service-nsw",
    issuedAt: "2026-08-14",
    rebateBand: REBATE_BANDS[hash32("band", seed) % REBATE_BANDS.length],
    eapaLast12m: chance(0.28, "eapa", seed),
    accountStatus: chance(0.15, "status", seed) ? "arrears" : "current",
    embeddedNetwork: offerType === "embedded",
    offerType,
    controlledLoad: chance(0.5, "cl", seed),
    verification: "retailer_confirmed",
  };
}

export interface PrefilledFactors {
  factorA: FactorAAnswer;
  factorB: FactorBAnswer;
  factorD: FactorDAnswer;
  factorE: FactorEAnswer;
  /** Factor C — tenure — has no assertion. It must always be asked. */
  mustAsk: "factorC";
  verification: EligibilityAssertions["verification"];
  points: { factorA: number; factorB: number; factorD: number; factorE: number };
}

/**
 * Map assertions onto Factors A, B, D and E. Factor C is never derivable —
 * no partner asserts tenure — so Flow B still has one question to ask.
 */
export function prefillFactors(
  assertions: EligibilityAssertions,
): PrefilledFactors {
  const factorA: FactorAAnswer =
    assertions.accountStatus === "disconnected" ||
    assertions.accountStatus === "debt_recovery"
      ? "acute_hardship"
      : assertions.eapaLast12m
        ? "eapa_last_12m"
        : assertions.accountStatus === "arrears"
          ? "missed_bill"
          : "none";

  const factorB: FactorBAnswer =
    assertions.rebateBand === "primary"
      ? "low_income_or_concession"
      : assertions.rebateBand === "secondary"
        ? "family_or_seniors_rebate"
        : "none";

  const factorD: FactorDAnswer = assertions.embeddedNetwork
    ? "embedded_network"
    : assertions.offerType === "standing"
      ? "standing_offer"
      : "market_offer";

  const factorE: FactorEAnswer = assertions.controlledLoad
    ? "individual_tank"
    : "none";

  return {
    factorA,
    factorB,
    factorD,
    factorE,
    mustAsk: "factorC",
    verification: assertions.verification,
    points: {
      factorA: FACTOR_A_POINTS[factorA],
      factorB: FACTOR_B_POINTS[factorB],
      factorD: FACTOR_D_POINTS[factorD],
      factorE: FACTOR_E_POINTS[factorE],
    },
  };
}
