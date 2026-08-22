import type { EventStatus, ResourceStatus } from "@/lib/types";
import { seedData } from "./seed";

const canonicalEvent = seedData.flexEvents.find(({ id }) => id === "event_001")!;
const canonicalSettlement = seedData.settlements.find(
  ({ eventId }) => eventId === canonicalEvent.id,
)!;

export const councilCell = {
  id: "sunshine_cell_01",
  code: "DAPTO-01",
  name: "Dapto Sunshine Cell",
  location: "Dapto",
  constraintRisk: "high",
  solarExportForecastKwh: 128,
  availableFlexEnergyKwh: 36,
  recommendedWindow: "12:00–2:00 pm",
  forecastConfidence: 0.86,
  activeResidents: 3,
  roofAccessResidents: 2,
} as const;

export const councilPolicy = {
  version: "SW-2026-01",
  effectiveDate: "1 August 2026",
  approvedBy: "Wollongong City Council",
} as const;

export const councilEvents = [
  {
    id: "event_001",
    name: "Dapto Midday Solar Shift",
    status: "settled" satisfies EventStatus,
    statusLabel: "Settled",
    dateLabel: "22 Aug 2026",
    windowLabel: "12:00–2:00 pm",
    targetFlexEnergyKwh: 18,
    maxPowerKw: 18,
    availableFlexEnergyKwh: 36,
    confidence: 0.86,
    equityFloorPercent: 20,
    eligibleResources: 4,
    sunshineCellId: councilCell.id,
    sunshineCellName: councilCell.name,
    windowStart: "2026-08-22T12:00:00+10:00",
    windowEnd: "2026-08-22T14:00:00+10:00",
    maxShiftEnergyKwh: 36,
    explanation:
      "Use forecast local solar by shifting eligible flexible demand into the midday window.",
    provenance: "Simulated network forecast",
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
  equityFloorPercent: 20,
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
  equityFloorPercent: 20,
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
