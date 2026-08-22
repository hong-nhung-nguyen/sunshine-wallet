import type { ResourceEligibilityContext } from "@/lib/engine/resource-eligibility";

const baseContext = {
  eventId: "event_001",
  sunshineCellId: "sunshine_cell_01",
  consentStatus: "accepted",
  availableForWindow: true,
  comfortSafe: true,
  safetySafe: true,
  confidence: 0.94,
  checkedAt: "2026-08-22T09:30:00+10:00",
} satisfies ResourceEligibilityContext;

export const resourceEligibilityContexts: Readonly<
  Record<string, ResourceEligibilityContext>
> = {
  resource_001: baseContext,
  resource_002: { ...baseContext, confidence: 0.91 },
  resource_003: { ...baseContext, confidence: 0.9 },
  resource_004: { ...baseContext, confidence: 0.88 },
  resource_005: { ...baseContext, confidence: 1 },
  resource_006: {
    ...baseContext,
    consentStatus: "paused",
    availableForWindow: false,
    confidence: 1,
  },
};
