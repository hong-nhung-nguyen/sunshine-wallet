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
  contributorPoolCents: 13070,
  equityPoolCents: 5140,
  equityRecipients: [
    {
      participantId: "resident_001",
      weight: 3,
      reason: "Priority renter without practical roof access",
    },
    {
      participantId: "resident_003",
      weight: 2,
      reason: "Priority social-housing resident without practical roof access",
    },
  ],
  createdAt: "2026-08-22T14:30:00+10:00",
};
