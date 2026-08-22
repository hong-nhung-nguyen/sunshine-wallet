import type { AttributionInput } from "@/lib/engine/attribution";

export const attributionInput: AttributionInput = {
  eventId: "event_001",
  verifiedFlexEnergyKwh: 16.5,
  contributions: [
    {
      participantId: "resident_002",
      resourceId: "resource_002",
      qualifyingEnergyKwh: 8.4,
    },
    {
      participantId: "resident_002",
      resourceId: "resource_004",
      qualifyingEnergyKwh: 4.6,
    },
    {
      participantId: "resident_003",
      resourceId: "resource_003",
      qualifyingEnergyKwh: 3.5,
    },
  ],
  createdAt: "2026-08-22T14:30:00+10:00",
};
