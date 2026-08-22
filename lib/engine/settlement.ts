import type { Provenance, Settlement } from "@/lib/types";

export interface SettlementPolicy {
  version: string;
  effectiveDate: string;
  equityFloorBps: number;
  equityShareBps: number;
  contributorShareBps: number;
  reserveShareBps: number;
}

export interface SettlementInput {
  eventId: string;
  verificationRecordId: string;
  verificationGatePassed: boolean;
  verifiedFlexEnergyKwh: number;
  valueRateCentsPerKwh: number;
  policy: SettlementPolicy;
  createdAt: string;
}

export type SettlementRejectionCode =
  | "VERIFICATION_GATE_FAILED"
  | "INVALID_POOL_TOTAL"
  | "EQUITY_FLOOR_VIOLATION"
  | "INVALID_VALUE_INPUT";

export type SettlementCalculation =
  | {
      status: "calculated";
      settlement: Settlement;
      totalValueCents: number;
      contributorPoolCents: number;
      equityPoolCents: number;
      reservePoolCents: number;
      effectiveEquityPercent: number;
      policy: SettlementPolicy;
      formula: string;
      provenance: Provenance;
    }
  | {
      status: "blocked";
      settlement: null;
      rejectionCodes: SettlementRejectionCode[];
      reasons: string[];
      policy: SettlementPolicy;
    };

const TOTAL_BASIS_POINTS = 10_000;

function allocatePools(totalValueCents: number, policy: SettlementPolicy) {
  const entries = [
    { key: "equity" as const, bps: policy.equityShareBps },
    { key: "contributor" as const, bps: policy.contributorShareBps },
    { key: "reserve" as const, bps: policy.reserveShareBps },
  ].map((entry) => {
    const exact = (totalValueCents * entry.bps) / TOTAL_BASIS_POINTS;
    return {
      ...entry,
      cents: Math.floor(exact),
      remainder: exact - Math.floor(exact),
    };
  });
  const remaining =
    totalValueCents - entries.reduce((total, entry) => total + entry.cents, 0);
  const order = [...entries].sort(
    (left, right) =>
      right.remainder - left.remainder || left.key.localeCompare(right.key),
  );
  for (let index = 0; index < remaining; index += 1)
    order[index % order.length].cents += 1;
  return Object.fromEntries(
    entries.map(({ key, cents }) => [key, cents]),
  ) as Record<"equity" | "contributor" | "reserve", number>;
}

export function calculateSettlement(
  input: SettlementInput,
): SettlementCalculation {
  const rejectionCodes: SettlementRejectionCode[] = [];
  const reasons: string[] = [];
  const poolTotalBps =
    input.policy.equityShareBps +
    input.policy.contributorShareBps +
    input.policy.reserveShareBps;
  if (!input.verificationGatePassed) {
    rejectionCodes.push("VERIFICATION_GATE_FAILED");
    reasons.push("Measurement and verification confidence gate has not passed");
  }
  if (poolTotalBps !== TOTAL_BASIS_POINTS) {
    rejectionCodes.push("INVALID_POOL_TOTAL");
    reasons.push(`Policy shares total ${poolTotalBps / 100}% instead of 100%`);
  }
  if (input.policy.equityShareBps < input.policy.equityFloorBps) {
    rejectionCodes.push("EQUITY_FLOOR_VIOLATION");
    reasons.push(
      `Equity share ${input.policy.equityShareBps / 100}% is below the ${input.policy.equityFloorBps / 100}% floor`,
    );
  }
  if (
    input.verifiedFlexEnergyKwh < 0 ||
    !Number.isInteger(input.valueRateCentsPerKwh) ||
    input.valueRateCentsPerKwh < 0
  ) {
    rejectionCodes.push("INVALID_VALUE_INPUT");
    reasons.push(
      "Verified energy and prototype rate must be non-negative; rate must use integer cents",
    );
  }
  if (rejectionCodes.length > 0)
    return {
      status: "blocked",
      settlement: null,
      rejectionCodes,
      reasons,
      policy: input.policy,
    };

  const totalValueCents = Math.round(
    input.verifiedFlexEnergyKwh * input.valueRateCentsPerKwh,
  );
  const pools = allocatePools(totalValueCents, input.policy);
  const provenance: Provenance = {
    source: "operator_review",
    notes:
      "Calculated with Council-approved demo policy and prototype value rate; not a real tariff",
  };
  const settlement: Settlement = {
    id: `settlement_${input.eventId}`,
    eventId: input.eventId,
    verificationRecordId: input.verificationRecordId,
    verifiedFlexEnergyKwh: input.verifiedFlexEnergyKwh,
    totalValue: totalValueCents / 100,
    contributorRewards: pools.contributor / 100,
    equityCredit: pools.equity / 100,
    equityFloorApplied: true,
    status: "calculated",
    createdAt: input.createdAt,
    provenance,
  };

  return {
    status: "calculated",
    settlement,
    totalValueCents,
    contributorPoolCents: pools.contributor,
    equityPoolCents: pools.equity,
    reservePoolCents: pools.reserve,
    effectiveEquityPercent: input.policy.equityShareBps / 100,
    policy: input.policy,
    formula: `${input.verifiedFlexEnergyKwh} kWh × $${(input.valueRateCentsPerKwh / 100).toFixed(2)} per verified kWh`,
    provenance,
  };
}
