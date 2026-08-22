import type {
  ConsentStatus,
  EligibilityResult,
  FlexibleResource,
  ResourceType,
} from "@/lib/types";

export type EligibilityRejectionCode =
  | "NO_CONSENT"
  | "WRONG_SUNSHINE_CELL"
  | "UNAVAILABLE"
  | "INCOMPATIBLE"
  | "NOT_DISPATCHABLE"
  | "INSUFFICIENT_CAPABILITY"
  | "COMFORT_CONSTRAINT"
  | "SAFETY_CONSTRAINT";

export interface ResourceEligibilityContext {
  eventId: string;
  sunshineCellId: string;
  consentStatus: ConsentStatus;
  availableForWindow: boolean;
  comfortSafe: boolean;
  safetySafe: boolean;
  confidence: number;
  checkedAt: string;
}

export interface EligibilityGateResult {
  code: EligibilityRejectionCode;
  label: string;
  passed: boolean;
  explanation: string;
}

export interface ResourceEligibilityDecision extends EligibilityResult {
  resourceId: string;
  eventId: string;
  rejectionCodes: EligibilityRejectionCode[];
  gates: EligibilityGateResult[];
}

export const COMPATIBLE_FLEXIBLE_RESOURCE_TYPES: readonly ResourceType[] = [
  "hot_water",
  "battery",
  "ev_charger",
  "community_load",
  "pool_pump",
  "hvac",
];

const gate = (
  code: EligibilityRejectionCode,
  label: string,
  passed: boolean,
  passExplanation: string,
  failExplanation: string,
): EligibilityGateResult => ({
  code,
  label,
  passed,
  explanation: passed ? passExplanation : failExplanation,
});

export function evaluateResourceEligibility(
  resource: FlexibleResource,
  context: ResourceEligibilityContext,
): ResourceEligibilityDecision {
  const statusAvailable =
    resource.status === "available" || resource.status === "reserved";
  const compatible = COMPATIBLE_FLEXIBLE_RESOURCE_TYPES.includes(
    resource.resourceType,
  );
  const hasCapability =
    resource.capacityKw > 0 && resource.maxShiftEnergyKwh > 0;
  const gates = [
    gate(
      "NO_CONSENT",
      "Consent",
      context.consentStatus === "accepted",
      "Participant consent is accepted",
      `Participant consent is ${context.consentStatus.replaceAll("_", " ")}`,
    ),
    gate(
      "WRONG_SUNSHINE_CELL",
      "Sunshine Cell",
      resource.locationId === context.sunshineCellId,
      "Resource is in the event Sunshine Cell",
      "Resource is outside the event Sunshine Cell",
    ),
    gate(
      "UNAVAILABLE",
      "Availability",
      statusAvailable && context.availableForWindow,
      "Resource is available for the full event window",
      "Resource is not available for the full event window",
    ),
    gate(
      "INCOMPATIBLE",
      "Compatibility",
      compatible,
      "Resource type supports flexible demand",
      "Resource type is not compatible with flexible-demand dispatch",
    ),
    gate(
      "NOT_DISPATCHABLE",
      "Controllability",
      resource.dispatchable,
      "Resource can receive a mock dispatch instruction",
      "Resource is not dispatchable",
    ),
    gate(
      "INSUFFICIENT_CAPABILITY",
      "Capability",
      hasCapability,
      "Resource has positive power and shift capability",
      "Resource has no usable shift capability",
    ),
    gate(
      "COMFORT_CONSTRAINT",
      "Comfort",
      context.comfortSafe,
      "Resident comfort limits can be protected",
      "Resident comfort limits cannot be protected",
    ),
    gate(
      "SAFETY_CONSTRAINT",
      "Safety",
      context.safetySafe,
      "Safety limits can be protected",
      "Safety limits cannot be protected",
    ),
  ];
  const failedGates = gates.filter((result) => !result.passed);
  return {
    resourceId: resource.id,
    eventId: context.eventId,
    eligible: failedGates.length === 0,
    rejectionCodes: failedGates.map((result) => result.code),
    reasons:
      failedGates.length === 0
        ? ["All hard eligibility gates passed"]
        : failedGates.map((result) => result.explanation),
    confidence: Math.min(Math.max(context.confidence, 0), 1),
    checkedAt: context.checkedAt,
    gates,
  };
}

export function filterEligibleResources(
  resources: readonly FlexibleResource[],
  contexts: Readonly<Record<string, ResourceEligibilityContext>>,
) {
  const decisions = resources.map((resource) => {
    const context = contexts[resource.id];
    if (!context)
      throw new Error(`Missing eligibility context for ${resource.id}`);
    return evaluateResourceEligibility(resource, context);
  });
  const eligibleIds = new Set(
    decisions
      .filter((decision) => decision.eligible)
      .map((decision) => decision.resourceId),
  );
  return {
    decisions,
    eligibleResources: resources.filter((resource) =>
      eligibleIds.has(resource.id),
    ),
  };
}
