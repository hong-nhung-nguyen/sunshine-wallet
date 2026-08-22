import type { ContributorAttribution, Provenance } from "@/lib/types";
import { allocateCents } from "./cents";

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
