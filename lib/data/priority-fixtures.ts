import type { FactorScores } from "@/lib/engine/priority-scheme";

/**
 * The worked households from the priority scheme doc (§19), as factor scores.
 * Keeping them here makes the spec's own examples executable, so a change to
 * the scoring rules fails a test rather than quietly contradicting the doc.
 */
export interface WorkedHousehold {
  id: string;
  label: string;
  factors: FactorScores;
  /** Enrolled as a solar contributor - paid from the solar pool, not equity. */
  receivesSolarPool: boolean;
  expected: {
    needScore: number;
    contribScore: number;
    priorityScore: number;
    needTier: string;
    capabilityClass: string;
  };
}

export const workedHouseholds: readonly WorkedHousehold[] = [
  {
    id: "aroha",
    label: "Apartment renter, embedded network, EAPA, instantaneous hot water",
    factors: { factorA: 25, factorB: 25, factorC: 15, factorD: 10, factorE: 0 },
    receivesSolarPool: false,
    expected: {
      needScore: 75,
      contribScore: 0,
      priorityScore: 75,
      needTier: "critical",
      capabilityClass: "none",
    },
  },
  {
    id: "dinh",
    label: "Private renter, low income rebate, default offer, own storage tank",
    factors: { factorA: 0, factorB: 25, factorC: 15, factorD: 6, factorE: 15 },
    receivesSolarPool: false,
    expected: {
      needScore: 46,
      contribScore: 15,
      priorityScore: 61,
      needTier: "high",
      capabilityClass: "individual_tank",
    },
  },
  {
    id: "sam",
    label: "Share house, below median income, shared storage tank",
    factors: { factorA: 12, factorB: 10, factorC: 15, factorD: 6, factorE: 8 },
    receivesSolarPool: false,
    expected: {
      needScore: 43,
      contribScore: 8,
      priorityScore: 51,
      needTier: "high",
      capabilityClass: "shared_or_other",
    },
  },
  {
    id: "maria",
    label: "Owner-occupier, 6.6 kW rooftop solar, storage tank, no hardship",
    factors: { factorA: 0, factorB: 0, factorC: 0, factorD: 3, factorE: 15 },
    receivesSolarPool: true,
    expected: {
      needScore: 3,
      contribScore: 15,
      priorityScore: 18,
      needTier: "standard",
      capabilityClass: "individual_tank",
    },
  },
];
