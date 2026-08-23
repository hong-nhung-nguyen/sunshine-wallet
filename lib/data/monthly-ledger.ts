import { householdRoll } from "./households";
import { seedData } from "./seed";
import { DEFAULT_GOVERNANCE_POLICY } from "@/lib/engine/monthly-settlement";
import {
  runMonthlyWalletPipeline,
  type VerifiedEventValue,
} from "@/lib/engine/monthly-wallet-pipeline";

const verifiedEvents: VerifiedEventValue[] = seedData.settlements.map(
  (settlement) => {
    const verification = seedData.verificationRecords.find(
      ({ id }) => id === settlement.verificationRecordId,
    );
    // Deterministic verified shares for the demo event. They sum to 1 and
    // include several need-eligible households so the dual-credit path is
    // visible in the Equity Cell drill-down.
    const contributorWeights = {
      hh_contributor_00: 0.3,
      hh_critical_individual_tank_00: 0.22,
      hh_critical_individual_tank_03: 0.18,
      hh_critical_individual_tank_06: 0.16,
      hh_edge_needy_contributor: 0.14,
    };
    return {
      eventId: settlement.eventId,
      occurredAt: settlement.createdAt,
      verificationGatePassed:
        verification?.settlementGatePassed === true &&
        verification.verificationStatus === "passed",
      verifiedValueCents: Math.round(settlement.totalValue * 100),
      contributorWeights,
    };
  },
);

/**
 * Canonical deterministic ledger for the demo month. In production the input
 * events and returned transactions belong in a database-backed repository.
 */
export const augustMonthlyLedger = runMonthlyWalletPipeline({
  period: "2026-08",
  events: verifiedEvents,
  households: householdRoll,
  walletParticipantIds: {
    hh_contributor_00: "resident_002",
    hh_critical_none_00: "resident_001",
  },
  policy: DEFAULT_GOVERNANCE_POLICY,
  existingTransactions: [],
  createdAt: "2026-09-01T00:00:00+10:00",
});

export { verifiedEvents as verifiedMonthlyEvents };
