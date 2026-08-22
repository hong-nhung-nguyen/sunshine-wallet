import type { ResourceSimulationInput } from "@/lib/engine/simulation";

export const simulationInputs: readonly ResourceSimulationInput[] = [
  {
    dispatchPlan: {
      id: "plan_001",
      eventId: "event_001",
      resourceId: "resource_002",
      plannedPowerKw: 7.2,
      plannedEnergyKwh: 9,
      status: "planned",
    },
    baselineEnergyKwh: 2.2,
    responseFactor: 0.9333,
    confidence: 0.93,
  },
  {
    dispatchPlan: {
      id: "plan_002",
      eventId: "event_001",
      resourceId: "resource_004",
      plannedPowerKw: 5,
      plannedEnergyKwh: 5,
      status: "planned",
    },
    baselineEnergyKwh: 0.8,
    responseFactor: 0.92,
    confidence: 0.9,
  },
  {
    dispatchPlan: {
      id: "plan_003",
      eventId: "event_001",
      resourceId: "resource_003",
      plannedPowerKw: 3.6,
      plannedEnergyKwh: 4,
      status: "planned",
    },
    baselineEnergyKwh: 2.8,
    responseFactor: 0.875,
    confidence: 0.88,
  },
] as const;
