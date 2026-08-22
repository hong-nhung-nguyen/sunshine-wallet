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
  contributorShares: readonly {
    participantId: string;
    resourceId: string;
    share: number;
  }[];
  equityRecipients: readonly {
    participantId: string;
    weight: number;
    reason: string;
  }[];
  createdAt: string;
}

export interface FinancialAllocation {
  participantId: string;
  resourceId?: string;
  cents: number;
  reason: string;
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
      contributorAllocations: FinancialAllocation[];
      equityAllocations: FinancialAllocation[];
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

function allocateCents(
  totalCents: number,
  rows: readonly { id: string; weight: number }[],
) {
  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
  if (totalWeight <= 0) return new Map(rows.map(({ id }) => [id, 0]));
  const allocations = rows.map((row) => {
    const exact = (totalCents * row.weight) / totalWeight;
    return { ...row, cents: Math.floor(exact), remainder: exact % 1 };
  });
  const remaining =
    totalCents - allocations.reduce((sum, row) => sum + row.cents, 0);
  const order = [...allocations].sort(
    (left, right) =>
      right.remainder - left.remainder || left.id.localeCompare(right.id),
  );
  for (let index = 0; index < remaining; index += 1)
    order[index % order.length].cents += 1;
  return new Map(allocations.map(({ id, cents }) => [id, cents]));
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
  if (
    input.contributorShares.some(({ share }) => share < 0) ||
    input.equityRecipients.some(({ weight }) => weight < 0)
  ) {
    rejectionCodes.push("INVALID_VALUE_INPUT");
    reasons.push("Allocation shares and weights must be non-negative");
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
  const contributorCents = allocateCents(
    pools.contributor,
    input.contributorShares.map(({ resourceId, share }) => ({
      id: resourceId,
      weight: share,
    })),
  );
  const equityCents = allocateCents(
    pools.equity,
    input.equityRecipients.map(({ participantId, weight }) => ({
      id: participantId,
      weight,
    })),
  );
  const contributorAllocations = input.contributorShares.map((item) => ({
    participantId: item.participantId,
    resourceId: item.resourceId,
    cents: contributorCents.get(item.resourceId) ?? 0,
    reason: "Proportional share of verified contributor response",
  }));
  const equityAllocations = input.equityRecipients.map((item) => ({
    participantId: item.participantId,
    cents: equityCents.get(item.participantId) ?? 0,
    reason: item.reason,
  }));
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
    communityReserve: pools.reserve / 100,
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
    contributorAllocations,
    equityAllocations,
    effectiveEquityPercent: input.policy.equityShareBps / 100,
    policy: input.policy,
    formula: `${input.verifiedFlexEnergyKwh} kWh × $${(input.valueRateCentsPerKwh / 100).toFixed(2)} per verified kWh`,
    provenance,
  };
}
