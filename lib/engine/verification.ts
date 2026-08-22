import type { Provenance, VerificationRecord } from "@/lib/types";

export interface BaselineReferenceDay {
  id: string;
  energyKwh: number;
  eventRan: boolean;
}

export interface VerificationConfidenceInputs {
  meterCoverage: number;
  baselineQuality: number;
  timestampIntegrity: number;
}

export interface VerifyEventInput {
  eventId: string;
  plannedFlexEnergyKwh: number;
  observedEnergyKwh: number;
  referenceDays: readonly BaselineReferenceDay[];
  baselineReference: string;
  confidence: VerificationConfidenceInputs;
  createdAt: string;
}

export interface BaselineResult {
  baselineEnergyKwh: number;
  cleanReferenceDayIds: string[];
  excludedEventDayIds: string[];
  qualityFactor: number;
}

export interface VerificationResult {
  record: VerificationRecord;
  baseline: BaselineResult;
  plannedFlexEnergyKwh: number;
  observedEnergyKwh: number;
  deliveryPercent: number;
  confidenceBreakdown: {
    meterCoverage: number;
    baselineQuality: number;
    timestampIntegrity: number;
    referenceDayQuality: number;
  };
}

export const VERIFICATION_CONFIDENCE_THRESHOLD = 0.7;
export const MINIMUM_CLEAN_REFERENCE_DAYS = 3;
const round = (value: number) => Math.round(value * 100) / 100;

export function calculateBaseline(
  referenceDays: readonly BaselineReferenceDay[],
): BaselineResult {
  const cleanDays = referenceDays.filter(({ eventRan }) => !eventRan);
  if (cleanDays.length === 0)
    throw new Error("Baseline requires at least one non-event reference day");
  if (cleanDays.some(({ energyKwh }) => energyKwh < 0))
    throw new Error("Reference-day energy cannot be negative");
  return {
    baselineEnergyKwh: round(
      cleanDays.reduce((total, day) => total + day.energyKwh, 0) /
        cleanDays.length,
    ),
    cleanReferenceDayIds: cleanDays.map(({ id }) => id),
    excludedEventDayIds: referenceDays
      .filter(({ eventRan }) => eventRan)
      .map(({ id }) => id),
    qualityFactor: round(
      Math.min(cleanDays.length / MINIMUM_CLEAN_REFERENCE_DAYS, 1),
    ),
  };
}

export function verifyEvent(input: VerifyEventInput): VerificationResult {
  const baseline = calculateBaseline(input.referenceDays);
  const components = Object.values(input.confidence);
  if (components.some((value) => value < 0 || value > 1))
    throw new Error("Confidence inputs must be between 0 and 1");
  if (input.plannedFlexEnergyKwh <= 0 || input.observedEnergyKwh < 0)
    throw new Error("Verification energy inputs are invalid");

  const verifiedFlexEnergyKwh = round(
    Math.max(input.observedEnergyKwh - baseline.baselineEnergyKwh, 0),
  );
  const confidenceBreakdown = {
    meterCoverage: round(input.confidence.meterCoverage * 0.4),
    baselineQuality: round(input.confidence.baselineQuality * 0.35),
    timestampIntegrity: round(input.confidence.timestampIntegrity * 0.25),
    referenceDayQuality: baseline.qualityFactor,
  };
  const rawConfidence =
    input.confidence.meterCoverage * 0.4 +
    input.confidence.baselineQuality * 0.35 +
    input.confidence.timestampIntegrity * 0.25;
  const confidenceScore = round(
    Math.min(Math.max(rawConfidence * baseline.qualityFactor, 0), 1),
  );
  const settlementGatePassed =
    confidenceScore >= VERIFICATION_CONFIDENCE_THRESHOLD;
  const provenance: Provenance = {
    source: "meter_reading",
    confidence: confidenceScore,
    notes:
      "Mock meter readings compared with uncontaminated comparable-day baseline",
  };
  const details = [
    `${baseline.cleanReferenceDayIds.length} clean reference days used; ${baseline.excludedEventDayIds.length} event days excluded`,
    `${verifiedFlexEnergyKwh} kWh verified against ${input.plannedFlexEnergyKwh} kWh planned`,
    settlementGatePassed
      ? "Confidence gate passed; settlement may proceed to Council review"
      : "Confidence gate failed; settlement and credits remain blocked",
  ];

  return {
    record: {
      id: `verification_${input.eventId}`,
      eventId: input.eventId,
      verificationStatus: settlementGatePassed ? "passed" : "failed",
      baselineReference: input.baselineReference,
      verifiedFlexEnergyKwh,
      confidenceScore,
      settlementGatePassed,
      details,
      createdAt: input.createdAt,
      provenance,
    },
    baseline,
    plannedFlexEnergyKwh: input.plannedFlexEnergyKwh,
    observedEnergyKwh: input.observedEnergyKwh,
    deliveryPercent: round(
      (verifiedFlexEnergyKwh / input.plannedFlexEnergyKwh) * 100,
    ),
    confidenceBreakdown,
  };
}
