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
    eligibleResources: 24,
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
  },
] as const;

export const councilResources = [
  { id: "HW-101", name: "Apartment hot water bank", type: "Hot water", status: "available" satisfies ResourceStatus, capacityKwh: 18.4, score: 92, network: 95, equity: 90 },
  { id: "BAT-01", name: "Community battery", type: "Battery", status: "available" satisfies ResourceStatus, capacityKwh: 24, score: 88, network: 94, equity: 78 },
  { id: "EV-204", name: "Council depot chargers", type: "EV charging", status: "available" satisfies ResourceStatus, capacityKwh: 16.5, score: 81, network: 86, equity: 72 },
  { id: "APT-08", name: "Residential shared load", type: "Community load", status: "pending_review" satisfies ResourceStatus, capacityKwh: 8.2, score: 74, network: 82, equity: 88 },
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

export const eventStages = ["Ready", "Optimise", "Simulate", "Verify", "Settle"] as const;
