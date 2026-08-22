/**
 * The partner boundary — shared contracts and the determinism kernel.
 *
 * Everything in `services/` is a mocked adapter: the seams are real, the
 * integrations are not. Two rules hold across all of them.
 *
 * 1. **Deterministic.** No `Math.random`, no `Date.now`. Partner behaviour —
 *    including refusals and missing data — is derived by hashing the inputs,
 *    so the same request always produces the same answer and a demo never
 *    changes underfoot.
 *
 * 2. **Privacy by omission.** No CRN, no program names, no documents. The
 *    eligibility contract carries yes/no assertions and coarse bands only.
 *    Medical and Life Support rebates map to `primary` so no health data
 *    enters the system at all.
 */

export type RebateBand = "primary" | "secondary" | "none";

export type AccountStatus =
  | "current"
  | "arrears"
  | "debt_recovery"
  | "disconnected";

export type OfferType = "standing" | "market" | "embedded";

export type VerificationSource = "retailer_confirmed" | "self_declared";

/**
 * What a partner retailer is willing to assert about a customer. Deliberately
 * narrow: enough to prefill Factors A, B, D and E, and nothing more.
 */
export interface EligibilityAssertions {
  source: string;
  issuedAt: string;
  rebateBand: RebateBand;
  eapaLast12m: boolean;
  accountStatus: AccountStatus;
  embeddedNetwork: boolean;
  offerType: OfferType;
  controlledLoad: boolean;
  verification: VerificationSource;
}

export interface TimeWindowIso {
  start: string;
  end: string;
}

/** FNV-1a over the joined parts. Stable across runs and platforms. */
export function hash32(...parts: (string | number)[]): number {
  let hash = 0x811c9dc5;
  const input = parts.join("|");
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Deterministic float in [0, 1) derived from the seed parts. */
export function unitOf(...parts: (string | number)[]): number {
  return hash32(...parts) / 0x100000000;
}

/** Deterministic integer in [min, max]. */
export function intBetween(
  min: number,
  max: number,
  ...parts: (string | number)[]
): number {
  if (max < min) throw new Error("max must be >= min");
  return min + Math.floor(unitOf(...parts) * (max - min + 1));
}

/** Deterministic number in [min, max), rounded to `places`. */
export function numberBetween(
  min: number,
  max: number,
  places: number,
  ...parts: (string | number)[]
): number {
  const factor = 10 ** places;
  return Math.round((min + unitOf(...parts) * (max - min)) * factor) / factor;
}

/** True with roughly the given probability, decided by the seed. */
export function chance(
  probability: number,
  ...parts: (string | number)[]
): boolean {
  return unitOf(...parts) < probability;
}

/** Half-hour intervals in a day. */
export const INTERVALS_PER_DAY = 48;

export function intervalLabel(index: number): string {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
}
