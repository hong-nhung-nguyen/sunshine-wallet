import type { EventWindowCandidate } from "@/lib/engine/event-window";

export const eventWindowCandidates: readonly EventWindowCandidate[] = [
  {
    id: "window_1200",
    sunshineCellId: "sunshine_cell_01",
    window: {
      start: "2026-08-22T12:00:00+10:00",
      end: "2026-08-22T14:00:00+10:00",
    },
    solarExportPotentialKwh: 128,
    constraintRisk: "high",
    forecastConfidence: 0.86,
    availableFlexEnergyKwh: 36,
    targetFlexEnergyKwh: 18,
    comfortProtected: true,
  },
  {
    id: "window_1000",
    sunshineCellId: "sunshine_cell_01",
    window: {
      start: "2026-08-22T10:00:00+10:00",
      end: "2026-08-22T12:00:00+10:00",
    },
    solarExportPotentialKwh: 82,
    constraintRisk: "medium",
    forecastConfidence: 0.81,
    availableFlexEnergyKwh: 29,
    targetFlexEnergyKwh: 18,
    comfortProtected: true,
  },
  {
    id: "window_1400",
    sunshineCellId: "sunshine_cell_01",
    window: {
      start: "2026-08-22T14:00:00+10:00",
      end: "2026-08-22T16:00:00+10:00",
    },
    solarExportPotentialKwh: 61,
    constraintRisk: "medium",
    forecastConfidence: 0.68,
    availableFlexEnergyKwh: 24,
    targetFlexEnergyKwh: 18,
    comfortProtected: true,
  },
  {
    id: "window_1600",
    sunshineCellId: "sunshine_cell_01",
    window: {
      start: "2026-08-22T16:00:00+10:00",
      end: "2026-08-22T18:00:00+10:00",
    },
    solarExportPotentialKwh: 22,
    constraintRisk: "low",
    forecastConfidence: 0.79,
    availableFlexEnergyKwh: 12,
    targetFlexEnergyKwh: 18,
    comfortProtected: true,
  },
] as const;

export const lowConfidenceWindowCandidates: readonly EventWindowCandidate[] =
  eventWindowCandidates.map((candidate) => ({
    ...candidate,
    forecastConfidence: 0.6,
  }));
