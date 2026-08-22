import type { ContributorAttribution, Provenance } from "@/lib/types";

export interface QualifyingContribution {
  participantId: string;
  resourceId: string;
  qualifyingEnergyKwh: number;
}

export interface AttributionInput {
  eventId: string;
  verifiedFlexEnergyKwh: number;
  contributions: readonly QualifyingContribution[];
  createdAt: string;
}

export interface ContributorAllocation extends ContributorAttribution {
  qualifyingEnergyKwh: number;
  attributedEnergyKwh: number;
}

export interface AttributionResult {
  eventId: string;
  verifiedFlexEnergyKwh: number;
  totalQualifyingEnergyKwh: number;
  attributableEnergyKwh: number;
  contributorAttributions: ContributorAllocation[];
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

  const positive = input.contributions.filter(
    ({ qualifyingEnergyKwh }) => qualifyingEnergyKwh > 0,
  );
  const totalQualifyingEnergyKwh = roundEnergy(
    positive.reduce((total, item) => total + item.qualifyingEnergyKwh, 0),
  );
  const attributableEnergyKwh = roundEnergy(
    Math.min(totalQualifyingEnergyKwh, input.verifiedFlexEnergyKwh),
  );
  const contributorAttributions = positive.map((contribution) => {
    const share = contribution.qualifyingEnergyKwh / totalQualifyingEnergyKwh;
    return {
      id: `attribution_${input.eventId}_${contribution.resourceId}`,
      eventId: input.eventId,
      participantId: contribution.participantId,
      resourceId: contribution.resourceId,
      shareOfVerifiedResponse: share,
      rewardAmount: 0,
      equityCreditAmount: 0,
      createdAt: input.createdAt,
      provenance: {
        source: "operator_review",
        notes:
          "Accounting attribution capped by verified flexibility; money is allocated after policy validation",
      },
      qualifyingEnergyKwh: contribution.qualifyingEnergyKwh,
      attributedEnergyKwh: roundEnergy(share * attributableEnergyKwh),
    } satisfies ContributorAllocation;
  });

  return {
    eventId: input.eventId,
    verifiedFlexEnergyKwh: input.verifiedFlexEnergyKwh,
    totalQualifyingEnergyKwh,
    attributableEnergyKwh,
    contributorAttributions,
    provenance: {
      source: "operator_review",
      notes: "Accounting attribution only; no claim of electron tracing",
    },
  };
}
