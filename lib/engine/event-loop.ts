import { flexibleResources } from "@/lib/data";
import {
  eventWindowCandidates,
  lowConfidenceWindowCandidates,
} from "@/lib/data/event-window-candidates";
import {
  optimisationCandidates,
  optimisationConstraints,
} from "@/lib/data/optimisation-candidates";
import { resourceEligibilityContexts } from "@/lib/data/resource-eligibility-contexts";
import { settlementPolicy } from "@/lib/data/settlement-fixtures";
import { attributeVerifiedResponse } from "./attribution";
import { selectEventWindow } from "./event-window";
import { optimiseDispatchPlan } from "./optimiser";
import { filterEligibleResources } from "./resource-eligibility";
import { calculateSettlement } from "./settlement";
import { simulateEvent } from "./simulation";
import { verifyEvent } from "./verification";
import { applyWalletCredits } from "./wallet";

export type EventLoopScenario = "success" | "low_confidence" | "no_event";
export const EVENT_LOOP_ID = "event_loop_001";

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
const equityRecipients = [
  {
    participantId: "resident_equity_001",
    weight: 3,
    reason:
      "Priority apartment resident without practical roof access or a controllable device",
  },
  {
    participantId: "resident_003",
    weight: 2,
    reason: "Priority social-housing resident without practical roof access",
  },
] as const;

export function runSunshineEvent(scenario: EventLoopScenario = "success") {
  const windowSelection = selectEventWindow(
    scenario === "no_event"
      ? lowConfidenceWindowCandidates
      : eventWindowCandidates,
  );
  if (windowSelection.status === "no_event")
    return {
      scenario,
      status: "no_event" as const,
      lifecycle: ["draft", "rejected"] as const,
      windowSelection,
    };

  const contexts = Object.fromEntries(
    Object.entries(resourceEligibilityContexts).map(([resourceId, context]) => [
      resourceId,
      { ...context, eventId: EVENT_LOOP_ID },
    ]),
  );
  const eligibility = filterEligibleResources(flexibleResources, contexts);
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
      eventId: EVENT_LOOP_ID,
      targetFlexEnergyKwh: windowSelection.recommended.targetFlexEnergyKwh,
    },
  );
  const simulation = simulateEvent(
    optimisation.dispatchPlans.map((dispatchPlan) => ({
      dispatchPlan,
      baselineEnergyKwh: baselineByResource[dispatchPlan.resourceId] ?? 0,
      responseFactor: responseFactors[dispatchPlan.resourceId] ?? 0,
      confidence: contexts[dispatchPlan.resourceId]?.confidence ?? 0,
    })),
  );
  const verification = verifyEvent({
    eventId: EVENT_LOOP_ID,
    plannedFlexEnergyKwh: optimisation.totalPlannedEnergyKwh,
    observedEnergyKwh: simulation.observedEnergyKwh,
    referenceDays: [
      { id: "2026-08-12", energyKwh: 5.6, eventRan: false },
      { id: "2026-08-13", energyKwh: 5.8, eventRan: false },
      { id: "2026-08-14", energyKwh: 6, eventRan: false },
      { id: "2026-08-16", energyKwh: 21.7, eventRan: true },
    ],
    baselineReference: "dapto_loop_baseline_v1",
    confidence:
      scenario === "low_confidence"
        ? { meterCoverage: 0.5, baselineQuality: 0.55, timestampIntegrity: 0.5 }
        : {
            meterCoverage: 0.92,
            baselineQuality: 0.9,
            timestampIntegrity: 0.88,
          },
    createdAt: "2026-08-22T14:20:00+10:00",
  });
  const contributions = simulation.dispatchResults.map((result) => ({
    participantId: participantByResource.get(result.resourceId) ?? "unknown",
    resourceId: result.resourceId,
    qualifyingEnergyKwh: result.actualEnergyKwh,
  }));
  const energyAttribution = attributeVerifiedResponse({
    eventId: EVENT_LOOP_ID,
    verifiedFlexEnergyKwh: verification.record.verifiedFlexEnergyKwh,
    contributions,
    contributorPoolCents: 0,
    equityPoolCents: 0,
    equityRecipients,
    createdAt: "2026-08-22T14:30:00+10:00",
  });
  const settlement = calculateSettlement({
    eventId: EVENT_LOOP_ID,
    verificationRecordId: verification.record.id,
    verificationGatePassed: verification.record.settlementGatePassed,
    verifiedFlexEnergyKwh: verification.record.verifiedFlexEnergyKwh,
    valueRateCentsPerKwh: 285,
    policy: settlementPolicy,
    createdAt: "2026-08-22T15:00:00+10:00",
  });

  if (settlement.status === "blocked")
    return {
      scenario,
      status: "settlement_blocked" as const,
      lifecycle: [
        "draft",
        "ready",
        "optimised",
        "simulated",
        "rejected",
      ] as const,
      windowSelection,
      eligibility,
      optimisation,
      simulation,
      verification,
      energyAttribution,
      settlement,
    };

  const attribution = attributeVerifiedResponse({
    eventId: EVENT_LOOP_ID,
    verifiedFlexEnergyKwh: verification.record.verifiedFlexEnergyKwh,
    contributions,
    contributorPoolCents: settlement.contributorPoolCents,
    equityPoolCents: settlement.equityPoolCents,
    equityRecipients,
    createdAt: "2026-08-22T15:05:00+10:00",
  });
  const residentAllocation = attribution.equityAllocations.find(
    ({ participantId }) => participantId === "resident_equity_001",
  );
  if (!residentAllocation)
    throw new Error("Canonical equity recipient allocation is missing");
  const wallet = applyWalletCredits({
    participantId: "resident_equity_001",
    openingBalanceCents: 0,
    existingTransactions: [],
    credits: [
      {
        participantId: "resident_equity_001",
        eventId: EVENT_LOOP_ID,
        type: "equity_credit",
        amountCents: residentAllocation.creditCents,
        createdAt: "2026-08-22T15:15:00+10:00",
        provenance: {
          source: "operator_review",
          notes:
            "Mock posting after Council-approved settlement; not a retailer payment",
        },
      },
    ],
  });

  return {
    scenario,
    status: "completed" as const,
    lifecycle: [
      "draft",
      "ready",
      "optimised",
      "simulated",
      "verified",
      "settled",
    ] as const,
    windowSelection,
    eligibility,
    optimisation,
    simulation,
    verification,
    energyAttribution,
    settlement,
    attribution,
    wallet,
  };
}

export function resetSunshineEvent() {
  return runSunshineEvent("success");
}
