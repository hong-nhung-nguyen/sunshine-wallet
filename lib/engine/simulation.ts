import type { DispatchPlan, DispatchResult, Provenance } from "@/lib/types";

export interface ResourceSimulationInput {
  dispatchPlan: DispatchPlan;
  baselineEnergyKwh: number;
  responseFactor: number;
  confidence: number;
}

export interface EventSimulationResult {
  eventId: string;
  status: "simulated";
  direction: "load_increase";
  plannedFlexEnergyKwh: number;
  estimatedFlexEnergyKwh: number;
  baselineEnergyKwh: number;
  observedEnergyKwh: number;
  dispatchConfidence: number;
  targetAchievementPercent: number;
  dispatchResults: DispatchResult[];
  provenance: Provenance;
}

const round = (value: number) => Math.round(value * 100) / 100;

export function simulateEvent(
  inputs: readonly ResourceSimulationInput[],
): EventSimulationResult {
  if (inputs.length === 0)
    throw new Error("Simulation requires at least one dispatch plan");
  const eventId = inputs[0].dispatchPlan.eventId;
  if (inputs.some(({ dispatchPlan }) => dispatchPlan.eventId !== eventId))
    throw new Error("All dispatch plans must belong to the same event");

  const dispatchResults = inputs.map(
    ({ dispatchPlan, baselineEnergyKwh, responseFactor, confidence }) => {
      if (baselineEnergyKwh < 0)
        throw new Error("Baseline energy cannot be negative");
      if (responseFactor < 0 || responseFactor > 1)
        throw new Error("Response factor must be between 0 and 1");
      if (confidence < 0 || confidence > 1)
        throw new Error("Confidence must be between 0 and 1");
      const actualEnergyKwh = round(
        dispatchPlan.plannedEnergyKwh * responseFactor,
      );
      const actualPowerKw = round(dispatchPlan.plannedPowerKw * responseFactor);
      return {
        id: `result_${dispatchPlan.id}`,
        eventId,
        resourceId: dispatchPlan.resourceId,
        plannedPowerKw: dispatchPlan.plannedPowerKw,
        actualPowerKw,
        plannedEnergyKwh: dispatchPlan.plannedEnergyKwh,
        actualEnergyKwh,
        baselineEnergyKwh,
        observedEnergyKwh: round(baselineEnergyKwh + actualEnergyKwh),
        confidence,
        status:
          responseFactor >= 0.9
            ? "completed"
            : responseFactor > 0
              ? "partial"
              : "failed",
        provenance: {
          source: "device_acknowledgement",
          confidence,
          notes: `Deterministic response factor ${responseFactor}`,
        },
      } satisfies DispatchResult;
    },
  );

  const plannedFlexEnergyKwh = round(
    dispatchResults.reduce(
      (total, result) => total + result.plannedEnergyKwh,
      0,
    ),
  );
  const estimatedFlexEnergyKwh = round(
    dispatchResults.reduce(
      (total, result) => total + result.actualEnergyKwh,
      0,
    ),
  );
  const baselineEnergyKwh = round(
    dispatchResults.reduce(
      (total, result) => total + (result.baselineEnergyKwh ?? 0),
      0,
    ),
  );
  const observedEnergyKwh = round(
    dispatchResults.reduce(
      (total, result) => total + (result.observedEnergyKwh ?? 0),
      0,
    ),
  );
  const confidenceWeight = estimatedFlexEnergyKwh || dispatchResults.length;
  const dispatchConfidence = round(
    dispatchResults.reduce(
      (total, result) =>
        total + result.confidence * (result.actualEnergyKwh || 1),
      0,
    ) / confidenceWeight,
  );

  return {
    eventId,
    status: "simulated",
    direction: "load_increase",
    plannedFlexEnergyKwh,
    estimatedFlexEnergyKwh,
    baselineEnergyKwh,
    observedEnergyKwh,
    dispatchConfidence,
    targetAchievementPercent:
      plannedFlexEnergyKwh === 0
        ? 0
        : round((estimatedFlexEnergyKwh / plannedFlexEnergyKwh) * 100),
    dispatchResults,
    provenance: {
      source: "device_acknowledgement",
      confidence: dispatchConfidence,
      notes:
        "Calculated from mocked dispatch acknowledgements and fixed response factors",
    },
  };
}
