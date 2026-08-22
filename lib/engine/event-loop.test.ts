import { describe, expect, it } from "vitest";
import { resetSunshineEvent, runSunshineEvent } from "./event-loop";
import { applyWalletCredits } from "./wallet";

describe("end-to-end event loop", () => {
  it("runs deterministically from opportunity to posted Equity Dividend", () => {
    const result = runSunshineEvent("success");
    expect(result).toEqual(runSunshineEvent("success"));
    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result.optimisation.totalPlannedEnergyKwh).toBe(18);
    expect(result.verification.record.settlementGatePassed).toBe(true);
    expect(result.settlement.status).toBe("calculated");
    expect(result.wallet.postedTransactions[0]).toMatchObject({
      participantId: "resident_001",
      type: "equity_credit",
      status: "posted",
    });
    expect(result.wallet.closingBalanceCents).toBeGreaterThan(0);
  });

  it("blocks settlement and wallet posting when M&V confidence fails", () => {
    const result = runSunshineEvent("low_confidence");
    expect(result.status).toBe("settlement_blocked");
    expect("wallet" in result).toBe(false);
  });

  it("returns no event before eligibility or dispatch", () => {
    const result = runSunshineEvent("no_event");
    expect(result.status).toBe("no_event");
    expect("optimisation" in result).toBe(false);
  });

  it("does not post the final credit twice", () => {
    const result = runSunshineEvent("success");
    if (result.status !== "completed")
      throw new Error("Expected completed event");
    const duplicate = applyWalletCredits({
      participantId: result.wallet.participantId,
      openingBalanceCents: result.wallet.closingBalanceCents,
      existingTransactions: result.wallet.allTransactions,
      credits: [
        {
          participantId: result.wallet.participantId,
          eventId: result.wallet.postedTransactions[0].eventId!,
          type: "equity_credit",
          amountCents: Math.round(
            result.wallet.postedTransactions[0].amount * 100,
          ),
          createdAt: result.wallet.postedTransactions[0].createdAt,
          provenance: result.wallet.postedTransactions[0].provenance!,
        },
      ],
    });
    expect(duplicate.postedTransactions).toEqual([]);
    expect(duplicate.closingBalanceCents).toBe(
      result.wallet.closingBalanceCents,
    );
  });

  it("reset restores the exact canonical scenario", () => {
    expect(resetSunshineEvent()).toEqual(runSunshineEvent("success"));
  });
});
