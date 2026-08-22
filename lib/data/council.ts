import type { EventStatus, ResourceStatus } from "@/lib/types";

export const councilCell = {
  id: "sunshine_cell_01",
  code: "WLG-NORTH-01",
  name: "Wollongong North Solar Zone",
  location: "Wollongong",
  constraintRisk: "high",
  solarExportForecastKwh: 180,
  availableFlexEnergyKwh: 90,
  recommendedWindow: "12:00–2:00 pm",
  forecastConfidence: 0.86,
  activeResidents: 42,
  roofAccessResidents: 18,
} as const;

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
    dateLabel: "22 Aug 2026",
    windowLabel: "12:00–2:00 pm",
    targetFlexEnergyKwh: 72,
    maxPowerKw: 18,
    availableFlexEnergyKwh: 90,
    confidence: 0.86,
    equityFloorPercent: 15,
    eligibleResources: 4,
    sunshineCellId: councilCell.id,
    sunshineCellName: councilCell.name,
    windowStart: "2026-08-22T12:00:00+10:00",
    windowEnd: "2026-08-22T14:00:00+10:00",
    maxShiftEnergyKwh: 90,
    explanation:
      "Use forecast local solar by shifting eligible flexible demand into the midday window.",
    provenance: "Simulated network forecast",
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
    equityFloorPercent: 15,
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
  id: "event_006",
  name: "Dapto midday solar share",
  status: "draft" satisfies EventStatus,
  statusLabel: "Draft",
  dateLabel: "24 Aug 2026",
  windowLabel: "12:00–2:00 pm",
  targetFlexEnergyKwh: 72,
  maxPowerKw: 18,
  availableFlexEnergyKwh: councilCell.availableFlexEnergyKwh,
  confidence: councilCell.forecastConfidence,
  equityFloorPercent: 20,
  eligibleResources: 0,
  sunshineCellId: councilCell.id,
  sunshineCellName: councilCell.name,
  windowStart: "2026-08-24T12:00:00+10:00",
  windowEnd: "2026-08-24T14:00:00+10:00",
  maxShiftEnergyKwh: 90,
  explanation:
    "Create a reviewable midday event from the recommended simulated solar forecast. Resource eligibility and optimisation run later.",
  provenance: "Simulated network forecast",
} as const;

export const councilResources = [
  {
    id: "HW-101",
    name: "Apartment hot water bank",
    type: "Hot water",
    status: "available" satisfies ResourceStatus,
    capacityKwh: 18.4,
    score: 92,
    network: 95,
    equity: 90,
  },
  {
    id: "BAT-01",
    name: "Community battery",
    type: "Battery",
    status: "available" satisfies ResourceStatus,
    capacityKwh: 24,
    score: 88,
    network: 94,
    equity: 78,
  },
  {
    id: "EV-204",
    name: "Council depot chargers",
    type: "EV charging",
    status: "available" satisfies ResourceStatus,
    capacityKwh: 16.5,
    score: 81,
    network: 86,
    equity: 72,
  },
  {
    id: "APT-08",
    name: "Residential shared load",
    type: "Community load",
    status: "pending_review" satisfies ResourceStatus,
    capacityKwh: 8.2,
    score: 74,
    network: 82,
    equity: 88,
  },
] as const;

export const councilSettlement = {
  eventId: "event_004",
  verifiedFlexEnergyKwh: 63.8,
  totalValue: 182.1,
  contributorRewards: 130.7,
  equityCredit: 51.4,
  equityFloorPercent: 15,
  confidence: 0.89,
  status: "settled",
} as const;

export const eventStages = [
  "Ready",
  "Optimise",
  "Simulate",
  "Verify",
  "Settle",
] as const;
