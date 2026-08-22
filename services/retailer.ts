import {
  chance,
  hash32,
  intBetween,
  type EligibilityAssertions,
  type OfferType,
  type RebateBand,
  type TimeWindowIso,
} from "./contracts";

/**
 * adapter:retailer — the customer's electricity retailer.
 *
 * Three jobs: switch controlled load into the surplus window, assert what it
 * knows about a customer's eligibility, and apply a credit to a bill. Only
 * some retailers are partners; the rest fall through to self-declaration,
 * which must never score a household zero.
 */

export const PARTNER_RETAILERS = [
  "Acme Energy",
  "Illawarra Power",
  "Coastline Electric",
] as const;

export const NON_PARTNER_RETAILERS = [
  "Nimbus Energy",
  "Southgrid Retail",
] as const;

export type LoadSwitchRefusal =
  | "METER_NOT_FOUND"
  | "NO_CONTROLLED_LOAD"
  | "CUSTOMER_OPTED_OUT"
  | "SWITCH_WINDOW_CONFLICT";

export interface LoadSwitchResponse {
  accepted: string[];
  rejected: { meterId: string; reason: LoadSwitchRefusal }[];
}

export interface NmiResolution {
  nmi: string;
  address: string;
  retailer: string;
  /** False means no eligibility lookup — fall through to self-declaration. */
  partner: boolean;
}

export interface CreditReceipt {
  ok: boolean;
  reference: string;
  amountCents: number;
}

const REFUSALS: LoadSwitchRefusal[] = [
  "METER_NOT_FOUND",
  "NO_CONTROLLED_LOAD",
  "CUSTOMER_OPTED_OUT",
  "SWITCH_WINDOW_CONFLICT",
];

const STREETS = [
  "Bong Bong Road",
  "Prince Edward Drive",
  "Fowlers Road",
  "Byamee Street",
  "Marshall Street",
];

export function requestLoadSwitch(
  meterIds: readonly string[],
  window: TimeWindowIso,
): LoadSwitchResponse {
  const accepted: string[] = [];
  const rejected: { meterId: string; reason: LoadSwitchRefusal }[] = [];

  for (const meterId of meterIds) {
    const seed = [meterId, window.start] as const;
    // Roughly one meter in eleven cannot be switched on a given day.
    if (chance(0.09, "switch", ...seed))
      rejected.push({
        meterId,
        reason: REFUSALS[hash32("why", ...seed) % REFUSALS.length],
      });
    else accepted.push(meterId);
  }

  return { accepted, rejected };
}

/** NMIs are 10-11 characters. Anything else is a typo, not a lookup miss. */
export function isValidNmi(nmi: string): boolean {
  return /^[A-Za-z0-9]{10,11}$/.test(nmi.trim());
}

export function resolveNmi(nmi: string): NmiResolution | null {
  const trimmed = nmi.trim().toUpperCase();
  if (!isValidNmi(trimmed)) return null;

  // Two in five NMIs sit with a retailer that is not a program partner.
  const partner = !chance(0.4, "partner", trimmed);
  const pool = partner ? PARTNER_RETAILERS : NON_PARTNER_RETAILERS;
  return {
    nmi: trimmed,
    address: `${intBetween(1, 180, "street-no", trimmed)} ${
      STREETS[hash32("street", trimmed) % STREETS.length]
    }, Dapto NSW 2530`,
    retailer: pool[hash32("retailer", trimmed) % pool.length],
    partner,
  };
}

const REBATE_BANDS: RebateBand[] = ["primary", "secondary", "none"];
const OFFER_TYPES: OfferType[] = ["standing", "market", "embedded"];

/**
 * Returns null when the retailer is not a partner. A null here is NOT a zero
 * score — the caller must fall through to self-declaration and record
 * `verification: "self_declared"`.
 */
export function fetchEligibility(nmi: string): EligibilityAssertions | null {
  const resolution = resolveNmi(nmi);
  if (!resolution || !resolution.partner) return null;

  const seed = resolution.nmi;
  const offerType = OFFER_TYPES[hash32("offer", seed) % OFFER_TYPES.length];
  return {
    source: `retailer:${resolution.retailer.toLowerCase().replace(/\s+/g, "-")}`,
    issuedAt: "2026-08-14",
    rebateBand: REBATE_BANDS[hash32("rebate", seed) % REBATE_BANDS.length],
    eapaLast12m: chance(0.3, "eapa", seed),
    accountStatus: chance(0.2, "arrears", seed) ? "arrears" : "current",
    embeddedNetwork: offerType === "embedded",
    offerType,
    controlledLoad: chance(0.55, "controlled", seed),
    verification: "retailer_confirmed",
  };
}

export function applyCredit(
  accountRef: string,
  amountCents: number,
): CreditReceipt {
  if (!Number.isInteger(amountCents) || amountCents < 0)
    return { ok: false, reference: "", amountCents: 0 };
  return {
    ok: true,
    reference: `CR-${hash32("credit", accountRef, amountCents)
      .toString(16)
      .toUpperCase()
      .padStart(8, "0")}`,
    amountCents,
  };
}
