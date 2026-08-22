import type { VerifyEventInput } from "@/lib/engine/verification";

export const verificationInput: VerifyEventInput = {
  eventId: "event_001",
  plannedFlexEnergyKwh: 18,
  observedEnergyKwh: 22.3,
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
};

export const lowConfidenceVerificationInput: VerifyEventInput = {
  ...verificationInput,
  baselineReference: "dapto_baseline_low_confidence_demo",
  confidence: {
    meterCoverage: 0.62,
    baselineQuality: 0.6,
    timestampIntegrity: 0.58,
  },
};
