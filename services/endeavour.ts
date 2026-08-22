import {
  INTERVALS_PER_DAY,
  chance,
  hash32,
  intervalLabel,
  numberBetween,
  type TimeWindowIso,
} from "./contracts";

/**
 * adapter:endeavour — the network operator's battery assets.
 *
 * The council's Dispatch Planner decides the plan and asks this adapter to
 * execute it. The partner may cap the request or refuse it outright; it never
 * chooses *which households* participate, because selection is the Rotation
 * Queue's job and sits on the council side of the boundary.
 */

export interface BatteryDispatchPlan {
  /** Absorb surplus — typically 11:00-14:00. */
  chargeKw: number;
  chargeWindow: TimeWindowIso;
  /** Release into the evening peak — typically 17:00-20:00. */
  dischargeKw: number;
  dischargeWindow: TimeWindowIso;
}

export type DispatchRefusal =
  | "ASSET_OFFLINE"
  | "COMMITTED_ELSEWHERE"
  | "OUTSIDE_OPERATING_ENVELOPE";

export interface BatteryDispatchResponse {
  assetId: string;
  accepted: boolean;
  /** What the partner will actually deliver, kW. Zero when refused. */
  cappedKw: number;
  refusal?: DispatchRefusal;
  explanation: string;
}

export interface BatteryInterval {
  at: string;
  /** Positive while charging, negative while discharging. */
  kw: number;
}

export interface BatteryTelemetry {
  assetId: string;
  date: string;
  chargedKwh: number;
  dischargedKwh: number;
  intervals: BatteryInterval[];
  /**
   * The portion of discharge backed by a documented operating limit. The
   * verification engine may claim this plus a modelled lower bound, and must
   * discard the balance — a figure that cannot be defended never enters the
   * pot.
   */
  documentedLimitKwh: number;
}

const REFUSALS: DispatchRefusal[] = [
  "ASSET_OFFLINE",
  "COMMITTED_ELSEWHERE",
  "OUTSIDE_OPERATING_ENVELOPE",
];

export function requestBatteryDispatch(
  assetId: string,
  plan: BatteryDispatchPlan,
): BatteryDispatchResponse {
  const seed = [assetId, plan.chargeWindow.start, plan.dischargeWindow.start];

  if (plan.chargeKw <= 0 || plan.dischargeKw <= 0)
    return {
      assetId,
      accepted: false,
      cappedKw: 0,
      refusal: "OUTSIDE_OPERATING_ENVELOPE",
      explanation: "Charge and discharge power must both be positive",
    };

  // One asset in eight is unavailable on any given day.
  if (chance(0.125, "refuse", ...seed)) {
    const refusal = REFUSALS[hash32("which", ...seed) % REFUSALS.length];
    return {
      assetId,
      accepted: false,
      cappedKw: 0,
      refusal,
      explanation:
        refusal === "COMMITTED_ELSEWHERE"
          ? "Asset is committed to another program for this window"
          : refusal === "ASSET_OFFLINE"
            ? "Asset did not acknowledge the dispatch request"
            : "Requested power sits outside the agreed operating envelope",
    };
  }

  // Otherwise the partner accepts, sometimes capped below the request.
  const requested = Math.max(plan.chargeKw, plan.dischargeKw);
  const capFactor = numberBetween(0.7, 1, 3, "cap", ...seed);
  const cappedKw = Math.round(requested * capFactor * 10) / 10;
  return {
    assetId,
    accepted: true,
    cappedKw,
    explanation:
      cappedKw < requested
        ? `Accepted, capped to ${cappedKw} kW of the ${requested} kW requested`
        : `Accepted in full at ${cappedKw} kW`,
  };
}

export function fetchTelemetry(
  assetId: string,
  date: string,
): BatteryTelemetry {
  const intervals: BatteryInterval[] = [];
  let chargedKwh = 0;
  let dischargedKwh = 0;

  for (let index = 0; index < INTERVALS_PER_DAY; index += 1) {
    const hour = index / 2;
    let kw = 0;
    if (hour >= 11 && hour < 14)
      kw = numberBetween(18, 30, 2, assetId, date, "charge", index);
    else if (hour >= 17 && hour < 20)
      kw = -numberBetween(16, 28, 2, assetId, date, "discharge", index);

    if (kw > 0) chargedKwh += kw / 2;
    if (kw < 0) dischargedKwh += -kw / 2;
    intervals.push({ at: intervalLabel(index), kw });
  }

  chargedKwh = Math.round(chargedKwh * 100) / 100;
  dischargedKwh = Math.round(dischargedKwh * 100) / 100;

  return {
    assetId,
    date,
    chargedKwh,
    dischargedKwh,
    intervals,
    // Roughly two thirds of discharge is covered by a documented limit; the
    // remainder has to be modelled and lower-bounded before it can be claimed.
    documentedLimitKwh:
      Math.round(
        dischargedKwh * numberBetween(0.55, 0.75, 3, assetId, date, "doc") * 100,
      ) / 100,
  };
}
