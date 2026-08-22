import { describe, expect, it } from "vitest";
import { applyWalletCredits, type WalletCreditInstruction } from "./wallet";

const equityCredit: WalletCreditInstruction = {
  participantId: "resident_001",
  eventId: "event_001",
  type: "equity_credit",
  amountCents: 1240,
  createdAt: "2026-08-16T16:00:00+10:00",
  provenance: { source: "operator_review", notes: "Council policy SW-2026-01" },
};

describe("wallet credit application", () => {
  it("posts a settlement credit and updates the balance", () => {
    const result = applyWalletCredits({
      participantId: "resident_001",
      openingBalanceCents: 1600,
      existingTransactions: [],
      credits: [equityCredit],
    });
    expect(result.closingBalanceCents).toBe(2840);
    expect(result.postedTransactions).toHaveLength(1);
    expect(result.postedTransactions[0].type).toBe("equity_credit");
  });

  it("is idempotent when the same event credit is applied twice", () => {
    const first = applyWalletCredits({
      participantId: "resident_001",
      openingBalanceCents: 1600,
      existingTransactions: [],
      credits: [equityCredit],
    });
    const second = applyWalletCredits({
      participantId: "resident_001",
      openingBalanceCents: first.closingBalanceCents,
      existingTransactions: first.allTransactions,
      credits: [equityCredit],
    });
    expect(second.closingBalanceCents).toBe(2840);
    expect(second.postedTransactions).toEqual([]);
    expect(second.skippedTransactionKeys).toEqual([
      "resident_001:event_001:equity_credit",
    ]);
  });

  it("keeps Equity Dividends and Contributor Rewards as separate credits", () => {
    const result = applyWalletCredits({
      participantId: "resident_001",
      openingBalanceCents: 0,
      existingTransactions: [],
      credits: [
        equityCredit,
        { ...equityCredit, type: "contributor_reward", amountCents: 240 },
      ],
    });
    expect(result.postedTransactions.map(({ type }) => type)).toEqual([
      "equity_credit",
      "contributor_reward",
    ]);
    expect(result.closingBalanceCents).toBe(1480);
  });

  it("allows an apartment resident without a device to receive an Equity Dividend", () => {
    const result = applyWalletCredits({
      participantId: "resident_001",
      openingBalanceCents: 0,
      existingTransactions: [],
      credits: [equityCredit],
    });
    expect(result.postedTransactions[0]).toMatchObject({
      participantId: "resident_001",
      type: "equity_credit",
      amount: 12.4,
    });
  });
});
