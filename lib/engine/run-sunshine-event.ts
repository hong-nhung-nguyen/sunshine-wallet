import { eventWindowCandidates } from "@/lib/data/event-window-candidates";
import {
  optimisationCandidates,
  optimisationConstraints,
} from "@/lib/data/optimisation-candidates";
import { resourceEligibilityContexts } from "@/lib/data/resource-eligibility-contexts";
import { settlementPolicy } from "@/lib/data/settlement-fixtures";
import { flexibleResources } from "@/lib/data";
import { attributeVerifiedResponse } from "./attribution";
import { selectEventWindow, type EventWindowCandidate } from "./event-window";
import { optimiseDispatchPlan } from "./optimiser";
import { filterEligibleResources } from "./resource-eligibility";
import { calculateSettlement } from "./settlement";
import { simulateEvent } from "./simulation";
import { verifyEvent } from "./verification";

const responseFactors: Readonly<Record<string, number>> = {
  resource_001: 0.96,
  resource_002: 0.9333,
  resource_003: 0.875,
  resource_004: 0.92,
};
const baselineByResource: Readonly<Record<string, number>> = {
  resource_001: 1,
  resource_002: 2.2,
  resource_003: 2.8,
  resource_004: 0.8,
};
const participantByResource = new Map(
  flexibleResources.map((resource) => [resource.id, resource.participantId]),
);

export function runSunshineEvent(
  candidates: readonly EventWindowCandidate[] = eventWindowCandidates,
) {
  const windowSelection = selectEventWindow(candidates);
  if (windowSelection.status === "no_event")
    return { status: "no_event" as const, windowSelection };

  const eligibility = filterEligibleResources(
    flexibleResources,
    resourceEligibilityContexts,
  );
  const eligibleIds = new Set(
    eligibility.eligibleResources.map(({ id }) => id),
  );
  const optimisation = optimiseDispatchPlan(
    optimisationCandidates.map((candidate) => ({
      ...candidate,
      eligible: eligibleIds.has(candidate.resourceId),
    })),
    {
      ...optimisationConstraints,
      targetFlexEnergyKwh: windowSelection.recommended.targetFlexEnergyKwh,
    },
  );
  const simulation = simulateEvent(
    optimisation.dispatchPlans.map((dispatchPlan) => ({
      dispatchPlan,
      baselineEnergyKwh: baselineByResource[dispatchPlan.resourceId] ?? 0,
      responseFactor: responseFactors[dispatchPlan.resourceId] ?? 0,
      confidence:
        resourceEligibilityContexts[dispatchPlan.resourceId]?.confidence ?? 0,
    })),
  );
  const verification = verifyEvent({
    eventId: optimisationConstraints.eventId,
    plannedFlexEnergyKwh: optimisation.totalPlannedEnergyKwh,
    observedEnergyKwh: simulation.observedEnergyKwh,
    referenceDays: [
      { id: "2026-08-12", energyKwh: 5.6, eventRan: false },
      { id: "2026-08-13", energyKwh: 5.8, eventRan: false },
      { id: "2026-08-14", energyKwh: 6, eventRan: false },
      { id: "2026-08-16", energyKwh: 21.7, eventRan: true },
    ],
    baselineReference: "dapto_baseline_2026_08_22_v1",
    confidence: {
      meterCoverage: 0.92,
      baselineQuality: 0.9,
      timestampIntegrity: 0.88,
    },
    createdAt: "2026-08-22T14:20:00+10:00",
  });
  const attribution = attributeVerifiedResponse({
    eventId: optimisationConstraints.eventId,
    verifiedFlexEnergyKwh: verification.record.verifiedFlexEnergyKwh,
    contributions: simulation.dispatchResults.map((result) => ({
      participantId: participantByResource.get(result.resourceId) ?? "unknown",
      resourceId: result.resourceId,
      qualifyingEnergyKwh: result.actualEnergyKwh,
    })),
    createdAt: "2026-08-22T14:30:00+10:00",
  });
  const settlement = calculateSettlement({
    eventId: optimisationConstraints.eventId,
    verificationRecordId: verification.record.id,
    verificationGatePassed: verification.record.settlementGatePassed,
    verifiedFlexEnergyKwh: verification.record.verifiedFlexEnergyKwh,
    valueRateCentsPerKwh: 80,
    policy: settlementPolicy,
    contributorShares: attribution.contributorAttributions.map((item) => ({
      participantId: item.participantId,
      resourceId: item.resourceId,
      share: item.shareOfVerifiedResponse,
    })),
    equityRecipients: [
      {
        participantId: "resident_001",
        weight: 3,
        reason: "Priority apartment renter without practical roof access",
      },
      {
        participantId: "resident_003",
        weight: 2,
        reason:
          "Priority social-housing resident without practical roof access",
      },
    ],
    createdAt: "2026-08-22T15:00:00+10:00",
  });

  return {
    status: "completed" as const,
    windowSelection,
    eligibility,
    optimisation,
    simulation,
    verification,
    attribution,
    settlement,
  };
}
