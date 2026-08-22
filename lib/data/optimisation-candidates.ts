import type {
  OptimisationCandidate,
  OptimisationConstraints,
} from "@/lib/engine/optimiser";

export const optimisationConstraints: OptimisationConstraints = {
  eventId: "event_001",
  targetFlexEnergyKwh: 18,
  maxPowerKw: 18,
  windowDurationHours: 2,
};

export const optimisationCandidates: readonly OptimisationCandidate[] = [
  {
    resourceId: "resource_001",
    eligible: true,
    capacityKw: 2.4,
    maxShiftEnergyKwh: 5.2,
    networkEffectiveness: 88,
    equityNeed: 96,
    controllability: 90,
    rotationFairness: 84,
  },
  {
    resourceId: "resource_002",
    eligible: true,
    capacityKw: 7.2,
    maxShiftEnergyKwh: 14.4,
    networkEffectiveness: 95,
    equityNeed: 72,
    controllability: 98,
    rotationFairness: 86,
  },
  {
    resourceId: "resource_003",
    eligible: true,
    capacityKw: 3.6,
    maxShiftEnergyKwh: 7.2,
    networkEffectiveness: 90,
    equityNeed: 94,
    controllability: 92,
    rotationFairness: 91,
  },
  {
    resourceId: "resource_004",
    eligible: true,
    capacityKw: 5,
    maxShiftEnergyKwh: 10,
    networkEffectiveness: 93,
    equityNeed: 70,
    controllability: 100,
    rotationFairness: 79,
  },
  {
    resourceId: "resource_005",
    eligible: false,
    capacityKw: 3.2,
    maxShiftEnergyKwh: 0,
    networkEffectiveness: 78,
    equityNeed: 88,
    controllability: 0,
    rotationFairness: 90,
  },
  {
    resourceId: "resource_006",
    eligible: false,
    capacityKw: 1.5,
    maxShiftEnergyKwh: 3,
    networkEffectiveness: 60,
    equityNeed: 68,
    controllability: 80,
    rotationFairness: 75,
  },
] as const;
