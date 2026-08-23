import { describe, expect, it } from "vitest";
import type { WalletTransaction } from "@/lib/types";
import type { EquityHousehold } from "./equity-allocation";
import { DEFAULT_GOVERNANCE_POLICY } from "./monthly-settlement";
import { runMonthlyWalletPipeline } from "./monthly-wallet-pipeline";

const households: EquityHousehold[] = [
  {
    id: "equity_household",
    factors: { factorA: 25, factorB: 25, factorC: 15, factorD: 10, factorE: 0 },
    receivesSolarPool: false,
  },
  {
    id: "solar_household",
    factors: { factorA: 0, factorB: 0, factorC: 3, factorD: 6, factorE: 15 },
    receivesSolarPool: true,
  },
];

const run = (existingTransactions: readonly WalletTransaction[] = []) =>
  runMonthlyWalletPipeline({
    period: "2026-08",
    events: [
      {
        eventId: "verified",
        occurredAt: "2026-08-10T12:00:00+10:00",
        verificationGatePassed: true,
        verifiedValueCents: 10_000,
        contributorWeights: { solar_household: 5 },
      },
      {
        eventId: "failed",
        occurredAt: "2026-08-11T12:00:00+10:00",
        verificationGatePassed: false,
        verifiedValueCents: 50_000,
        contributorWeights: { solar_household: 50 },
      },
      {
        eventId: "other_month",
        occurredAt: "2026-09-01T12:00:00+10:00",
        verificationGatePassed: true,
        verifiedValueCents: 20_000,
        contributorWeights: { solar_household: 20 },
      },
    ],
    households,
    policy: DEFAULT_GOVERNANCE_POLICY,
    existingTransactions,
    createdAt: "2026-09-01T00:00:00+10:00",
  });

describe("monthly wallet pipeline", () => {
  it("aggregates only verified events in the requested month", () => {
    const result = run();
    expect(result.potCents).toBe(10_000);
    expect(result.includedEventIds).toEqual(["verified"]);
    expect(result.excludedEventIds).toEqual(["failed", "other_month"]);
  });

  it("allocates exclusive pools and posts wallet transactions", () => {
    const result = run();
    expect(result.settlement.status).toBe("settled");
    expect(result.postedTransactions).toHaveLength(2);
    expect(
      result.postedTransactions.find(
        ({ participantId }) => participantId === "equity_household",
      )?.type,
    ).toBe("equity_credit");
    expect(
      result.postedTransactions.find(
        ({ participantId }) => participantId === "solar_household",
      )?.type,
    ).toBe("contributor_reward");
  });

  it("does not post the same monthly credit twice", () => {
    const first = run();
    const second = run(first.ledger);
    expect(second.postedTransactions).toHaveLength(0);
    expect(second.skippedTransactionKeys).toHaveLength(2);
  });
});
