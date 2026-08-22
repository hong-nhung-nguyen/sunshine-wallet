import type {
  SettlementInput,
  SettlementPolicy,
} from "@/lib/engine/settlement";

export const settlementPolicy: SettlementPolicy = {
  version: "SW-2026-01",
  effectiveDate: "1 August 2026",
  equityFloorBps: 2000,
  equityShareBps: 3000,
  contributorShareBps: 6500,
  reserveShareBps: 500,
};

export const settlementInput: SettlementInput = {
  eventId: "event_001",
  verificationRecordId: "verification_001",
  verificationGatePassed: true,
  verifiedFlexEnergyKwh: 63.8,
  valueRateCentsPerKwh: 285,
  policy: settlementPolicy,
  createdAt: "2026-08-22T15:00:00+10:00",
};
