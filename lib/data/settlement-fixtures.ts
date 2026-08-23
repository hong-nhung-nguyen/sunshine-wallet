import type {
  SettlementInput,
  SettlementPolicy,
} from "@/lib/engine/settlement";

export const settlementPolicy: SettlementPolicy = {
  version: "SW-2026-01",
  effectiveDate: "1 August 2026",
  equityFloorBps: 6000,
  equityShareBps: 6000,
  contributorShareBps: 3500,
  reserveShareBps: 500,
};

export const settlementInput: SettlementInput = {
  eventId: "event_001",
  verificationRecordId: "verification_001",
  verificationGatePassed: true,
  verifiedFlexEnergyKwh: 16.5,
  valueRateCentsPerKwh: 285,
  policy: settlementPolicy,
  createdAt: "2026-08-22T15:00:00+10:00",
};
