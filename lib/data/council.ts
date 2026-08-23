import type { EventStatus, ResourceStatus } from "@/lib/types";
import { seedData } from "./seed";

const canonicalEvent = seedData.flexEvents.find(
  ({ id }) => id === "event_001",
)!;
const canonicalSettlement = seedData.settlements.find(
  ({ eventId }) => eventId === canonicalEvent.id,
)!;

export const councilCell = {
  id: "sunshine_cell_01",
  code: "DAPTO-01",
  name: "Dapto Sunshine Cell",
  location: "Dapto",
  constraintRisk: "high",
  solarExportForecastKwh: 70,
  availableFlexEnergyKwh: 31,
  recommendedWindow: "12:00–2:00 pm",
  forecastConfidence: 0.86,
  activeResidents: 3,
  roofAccessResidents: 2,
} as const;

export type CouncilAreaRisk = "high" | "medium" | "low";

export type CouncilAreaSummary = {
  id: string;
  code: string;
  name: string;
  location: string;
  risk: CouncilAreaRisk;
  requiredFlexEnergyKwh: number;
  availableFlexEnergyKwh: number;
  eligibleResources: number;
  windowLabel: string;
  demoAvailable: boolean;
};

/**
 * Simulated portfolio data used to demonstrate how a production council could
 * triage multiple network areas. Only Dapto has the complete event workflow.
 */
export const councilAreas: CouncilAreaSummary[] = [
  {
    id: councilCell.id,
    code: councilCell.code,
    name: councilCell.name,
    location: councilCell.location,
    risk: councilCell.constraintRisk,
    requiredFlexEnergyKwh: 24,
    availableFlexEnergyKwh: councilCell.availableFlexEnergyKwh,
    eligibleResources: 4,
    windowLabel: councilCell.recommendedWindow,
    demoAvailable: true,
  },
  {
    id: "sunshine_cell_02",
    code: "BERK-02",
    name: "Berkeley Sunshine Cell",
    location: "Berkeley",
    risk: "high",
    requiredFlexEnergyKwh: 40,
    availableFlexEnergyKwh: 22,
    eligibleResources: 7,
    windowLabel: "1:00–3:00 pm",
    demoAvailable: false,
  },
  {
    id: "sunshine_cell_03",
    code: "PORT-03",
    name: "Port Kembla Sunshine Cell",
    location: "Port Kembla",
    risk: "high",
    requiredFlexEnergyKwh: 36,
    availableFlexEnergyKwh: 29,
    eligibleResources: 9,
    windowLabel: "12:30–2:30 pm",
    demoAvailable: false,
  },
  {
    id: "sunshine_cell_04",
    code: "CORR-04",
    name: "Corrimal Sunshine Cell",
    location: "Corrimal",
    risk: "medium",
    requiredFlexEnergyKwh: 18,
    availableFlexEnergyKwh: 20,
    eligibleResources: 5,
    windowLabel: "11:30 am–1:30 pm",
    demoAvailable: false,
  },
  {
    id: "sunshine_cell_05",
    code: "FIGT-05",
    name: "Figtree Sunshine Cell",
    location: "Figtree",
    risk: "medium",
    requiredFlexEnergyKwh: 27,
    availableFlexEnergyKwh: 35,
    eligibleResources: 8,
    windowLabel: "12:00–2:00 pm",
    demoAvailable: false,
  },
  {
    id: "sunshine_cell_06",
    code: "THIR-06",
    name: "Thirroul Sunshine Cell",
    location: "Thirroul",
    risk: "low",
    requiredFlexEnergyKwh: 14,
    availableFlexEnergyKwh: 23,
    eligibleResources: 6,
    windowLabel: "1:30–3:30 pm",
    demoAvailable: false,
  },
];

export const councilPolicy = {
  version: "SW-2026-01",
  effectiveDate: "1 August 2026",
  approvedBy: "Wollongong City Council",
} as const;

export const councilEvents = [
  {
    id: "event_001",
    name: "Midday solar opportunity",
    status: "ready" satisfies EventStatus,
    statusLabel: "Ready",
    dateLabel: "23 Aug 2026",
    windowLabel: "12:00–2:00 pm",
    targetFlexEnergyKwh: 24,
    maxPowerKw: 18,
    availableFlexEnergyKwh: 31,
    confidence: 0.86,
    equityFloorPercent: 60,
    eligibleResources: 4,
    sunshineCellId: councilCell.id,
    sunshineCellName: councilCell.name,
    windowStart: "2026-08-23T12:00:00+10:00",
    windowEnd: "2026-08-23T14:00:00+10:00",
    maxShiftEnergyKwh: 31,
    explanation:
      "Use forecast local solar by shifting eligible flexible demand into the midday window.",
    provenance: "Simulated network forecast",
  },
  {
    id: "event_005",
    name: "Midday solar opportunity",
    status: "settled" satisfies EventStatus,
    statusLabel: "Settled",
    dateLabel: "22 Aug 2026",
    windowLabel: "12:00–2:00 pm",
    targetFlexEnergyKwh: 68,
    maxPowerKw: 18,
    availableFlexEnergyKwh: 84,
    confidence: 0.87,
    equityFloorPercent: 60,
    eligibleResources: 23,
    sunshineCellId: councilCell.id,
    sunshineCellName: councilCell.name,
    windowStart: "2026-08-22T12:00:00+10:00",
    windowEnd: "2026-08-22T14:00:00+10:00",
    maxShiftEnergyKwh: 84,
    explanation:
      "Completed the daily solar-shift event after the selected window passed forecast and flexibility gates.",
    provenance: "Simulated network forecast and mocked device responses",
  },
  {
    id: "event_003",
    name: "Midday solar opportunity",
    status: "settled" satisfies EventStatus,
    statusLabel: "Settled",
    dateLabel: "21 Aug 2026",
    windowLabel: "11:30 am–1:30 pm",
    targetFlexEnergyKwh: 61,
    maxPowerKw: 17,
    availableFlexEnergyKwh: 79,
    confidence: 0.83,
    equityFloorPercent: 60,
    eligibleResources: 21,
    sunshineCellId: councilCell.id,
    sunshineCellName: councilCell.name,
    windowStart: "2026-08-21T11:30:00+10:00",
    windowEnd: "2026-08-21T13:30:00+10:00",
    maxShiftEnergyKwh: 79,
    explanation:
      "Completed the daily event using the highest-scoring safe solar window.",
    provenance: "Simulated network forecast and mocked device responses",
  },
  {
    id: "event_004",
    name: "Community solar event",
    status: "settled" satisfies EventStatus,
    statusLabel: "Settled",
    dateLabel: "16 Aug 2026",
    windowLabel: "12:00–2:00 pm",
    targetFlexEnergyKwh: 72,
    maxPowerKw: 18,
    availableFlexEnergyKwh: 86,
    confidence: 0.89,
    equityFloorPercent: 60,
    eligibleResources: 22,
    sunshineCellId: councilCell.id,
    sunshineCellName: councilCell.name,
    windowStart: "2026-08-16T12:00:00+10:00",
    windowEnd: "2026-08-16T14:00:00+10:00",
    maxShiftEnergyKwh: 86,
    explanation:
      "Completed community event using Council-approved event and equity rules.",
    provenance: "Simulated network forecast and mocked device responses",
  },
] as const;

export const councilEventCreationFixture = {
  id: "draft_event_006",
  name: "Dapto midday solar share",
  status: "draft" satisfies EventStatus,
  statusLabel: "Draft",
  dateLabel: "24 Aug 2026",
  windowLabel: "12:00–2:00 pm",
  targetFlexEnergyKwh: 18,
  maxPowerKw: 18,
  availableFlexEnergyKwh: councilCell.availableFlexEnergyKwh,
  confidence: councilCell.forecastConfidence,
  equityFloorPercent: 60,
  eligibleResources: 0,
  sunshineCellId: councilCell.id,
  sunshineCellName: councilCell.name,
  windowStart: "2026-08-24T12:00:00+10:00",
  windowEnd: "2026-08-24T14:00:00+10:00",
  maxShiftEnergyKwh: 36,
  explanation:
    "Create a reviewable midday event from the recommended simulated solar forecast. Resource eligibility and optimisation run later.",
  provenance: "Simulated network forecast",
} as const;

export const councilResources = [
  {
    id: "resource_003",
    name: "Aisha's hot water",
    type: "Hot water",
    status: "available" satisfies ResourceStatus,
    capacityKwh: 7.2,
    score: 91.75,
    network: 90,
    equity: 94,
  },
  {
    id: "resource_001",
    name: "Maya's hot water",
    type: "Hot water",
    status: "available" satisfies ResourceStatus,
    capacityKwh: 5.2,
    score: 90.2,
    network: 88,
    equity: 96,
  },
  {
    id: "resource_002",
    name: "Noah's EV charger",
    type: "EV charging",
    status: "available" satisfies ResourceStatus,
    capacityKwh: 14.4,
    score: 87.35,
    network: 95,
    equity: 72,
  },
  {
    id: "resource_004",
    name: "Noah's home battery",
    type: "Battery",
    status: "reserved" satisfies ResourceStatus,
    capacityKwh: 10,
    score: 85.4,
    network: 93,
    equity: 70,
  },
] as const;

export const councilSettlement = {
  eventId: canonicalSettlement.eventId,
  verifiedFlexEnergyKwh: canonicalSettlement.verifiedFlexEnergyKwh,
  totalValue: canonicalSettlement.totalValue,
  contributorRewards: canonicalSettlement.contributorRewards,
  equityCredit: canonicalSettlement.equityCredit,
  equityFloorPercent: 60,
  confidence: canonicalEvent.confidence,
  status: canonicalSettlement.status,
} as const;

export const eventStages = [
  "Ready",
  "Optimise",
  "Simulate",
  "Verify",
  "Settle",
] as const;
