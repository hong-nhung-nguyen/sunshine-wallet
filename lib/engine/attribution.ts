import type { ContributorAttribution, Provenance } from "@/lib/types";

export interface QualifyingContribution {
  participantId: string;
  resourceId: string;
  qualifyingEnergyKwh: number;
}

export interface EquityRecipient {
  participantId: string;
  weight: number;
  reason: string;
}

export interface AttributionInput {
  eventId: string;
  verifiedFlexEnergyKwh: number;
  contributions: readonly QualifyingContribution[];
  contributorPoolCents: number;
  equityPoolCents: number;
  equityRecipients: readonly EquityRecipient[];
  createdAt: string;
}

export interface ContributorAllocation extends ContributorAttribution {
  qualifyingEnergyKwh: number;
  attributedEnergyKwh: number;
  rewardCents: number;
}

export interface EquityAllocation {
  participantId: string;
  shareOfEquityPool: number;
  creditCents: number;
  creditAmount: number;
  reason: string;
}

export interface AttributionResult {
  eventId: string;
  verifiedFlexEnergyKwh: number;
  totalQualifyingEnergyKwh: number;
  attributableEnergyKwh: number;
  contributorAttributions: ContributorAllocation[];
  equityAllocations: EquityAllocation[];
  allocatedContributorCents: number;
  allocatedEquityCents: number;
  unallocatedContributorCents: number;
  provenance: Provenance;
}

const roundEnergy = (value: number) => Math.round(value * 1000) / 1000;

function allocateCents(
  totalCents: number,
  weightedIds: readonly { id: string; weight: number }[],
): Map<string, number> {
  if (!Number.isInteger(totalCents) || totalCents < 0)
    throw new Error("Pool amounts must be non-negative integer cents");
  const totalWeight = weightedIds.reduce(
    (total, item) => total + item.weight,
    0,
  );
  if (totalWeight <= 0 || totalCents === 0)
    return new Map(weightedIds.map(({ id }) => [id, 0]));
  const rows = weightedIds.map(({ id, weight }) => {
    const exact = (totalCents * weight) / totalWeight;
    return {
      id,
      cents: Math.floor(exact),
      remainder: exact - Math.floor(exact),
    };
  });
  const centsRemaining =
    totalCents - rows.reduce((total, row) => total + row.cents, 0);
  const remainderOrder = [...rows].sort(
    (left, right) =>
      right.remainder - left.remainder || left.id.localeCompare(right.id),
  );
  for (let index = 0; index < centsRemaining; index += 1)
    remainderOrder[index % remainderOrder.length].cents += 1;
  return new Map(rows.map(({ id, cents }) => [id, cents]));
}

export function attributeVerifiedResponse(
  input: AttributionInput,
): AttributionResult {
  if (input.verifiedFlexEnergyKwh < 0)
    throw new Error("Verified flexibility cannot be negative");
  if (
    input.contributions.some(
      ({ qualifyingEnergyKwh }) => qualifyingEnergyKwh < 0,
    )
  )
    throw new Error("Qualifying energy cannot be negative");
  if (input.equityRecipients.some(({ weight }) => weight < 0))
    throw new Error("Equity weights cannot be negative");

  const positiveContributions = input.contributions.filter(
    ({ qualifyingEnergyKwh }) => qualifyingEnergyKwh > 0,
  );
  const totalQualifyingEnergyKwh = roundEnergy(
    positiveContributions.reduce(
      (total, contribution) => total + contribution.qualifyingEnergyKwh,
      0,
    ),
  );
  const attributableEnergyKwh = roundEnergy(
    Math.min(totalQualifyingEnergyKwh, input.verifiedFlexEnergyKwh),
  );
  const contributorCents = allocateCents(
    input.contributorPoolCents,
    positiveContributions.map(({ resourceId, qualifyingEnergyKwh }) => ({
      id: resourceId,
      weight: qualifyingEnergyKwh,
    })),
  );
  const equityCents = allocateCents(
    input.equityPoolCents,
    input.equityRecipients.map(({ participantId, weight }) => ({
      id: participantId,
      weight,
    })),
  );

  const contributorAttributions = positiveContributions.map((contribution) => {
    const share =
      totalQualifyingEnergyKwh === 0
        ? 0
        : contribution.qualifyingEnergyKwh / totalQualifyingEnergyKwh;
    const rewardCents = contributorCents.get(contribution.resourceId) ?? 0;
    return {
      id: `attribution_${input.eventId}_${contribution.resourceId}`,
      eventId: input.eventId,
      participantId: contribution.participantId,
      resourceId: contribution.resourceId,
      shareOfVerifiedResponse: share,
      rewardAmount: rewardCents / 100,
      equityCreditAmount: 0,
      createdAt: input.createdAt,
      provenance: {
        source: "operator_review",
        notes:
          "Proportional accounting attribution capped by verified event flexibility",
      },
      qualifyingEnergyKwh: contribution.qualifyingEnergyKwh,
      attributedEnergyKwh: roundEnergy(share * attributableEnergyKwh),
      rewardCents,
    } satisfies ContributorAllocation;
  });

  const equityWeightTotal = input.equityRecipients.reduce(
    (total, recipient) => total + recipient.weight,
    0,
  );
  const equityAllocations = input.equityRecipients.map((recipient) => {
    const creditCents = equityCents.get(recipient.participantId) ?? 0;
    return {
      participantId: recipient.participantId,
      shareOfEquityPool:
        equityWeightTotal === 0 ? 0 : recipient.weight / equityWeightTotal,
      creditCents,
      creditAmount: creditCents / 100,
      reason: recipient.reason,
    };
  });
  const allocatedContributorCents = contributorAttributions.reduce(
    (total, attribution) => total + attribution.rewardCents,
    0,
  );
  const allocatedEquityCents = equityAllocations.reduce(
    (total, allocation) => total + allocation.creditCents,
    0,
  );

  return {
    eventId: input.eventId,
    verifiedFlexEnergyKwh: input.verifiedFlexEnergyKwh,
    totalQualifyingEnergyKwh,
    attributableEnergyKwh,
    contributorAttributions,
    equityAllocations,
    allocatedContributorCents,
    allocatedEquityCents,
    unallocatedContributorCents:
      input.contributorPoolCents - allocatedContributorCents,
    provenance: {
      source: "operator_review",
      notes: "Accounting attribution only; no claim of electron tracing",
    },
  };
}
