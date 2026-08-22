import type {
  SettlementInput,
  SettlementPolicy,
} from "@/lib/engine/settlement";

export const settlementPolicy: SettlementPolicy = {
  version: "SW-2026-01",
  effectiveDate: "1 August 2026",
  equityFloorBps: 6000,
  equityShareBps: 6500,
  contributorShareBps: 3000,
  reserveShareBps: 500,
};

export const settlementInput: SettlementInput = {
  eventId: "event_001",
  verificationRecordId: "verification_001",
  verificationGatePassed: true,
  verifiedFlexEnergyKwh: 16.5,
  valueRateCentsPerKwh: 80,
  policy: settlementPolicy,
  contributorShares: [
    {
      participantId: "resident_002",
      resourceId: "resource_002",
      share: 8.4 / 16.5,
    },
    {
      participantId: "resident_002",
      resourceId: "resource_004",
      share: 4.6 / 16.5,
    },
    {
      participantId: "resident_003",
      resourceId: "resource_003",
      share: 3.5 / 16.5,
    },
  ],
  equityRecipients: [
    {
      participantId: "resident_001",
      weight: 3,
      reason: "Priority apartment renter without practical roof access",
    },
    {
      participantId: "resident_003",
      weight: 2,
      reason: "Priority social-housing resident without practical roof access",
    },
  ],
  createdAt: "2026-08-22T15:00:00+10:00",
};
