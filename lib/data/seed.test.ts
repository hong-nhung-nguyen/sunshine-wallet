import { describe, expect, it } from "vitest";
import { seedData } from "./seed";
import {
  SeedDataValidationError,
  validateSunshineWalletData,
} from "./validate";

describe("Sunshine Wallet seed data", () => {
  it("satisfies schemas and cross-record invariants", () => {
    expect(validateSunshineWalletData(seedData)).toBe(seedData);
  });

  it("contains a complete settled event story", () => {
    const settlement = seedData.settlements[0];
    const verification = seedData.verificationRecords.find(
      ({ id }) => id === settlement.verificationRecordId,
    );
    const transactions = seedData.walletTransactions.filter(
      ({ eventId }) => eventId === settlement.eventId,
    );
    expect(verification?.settlementGatePassed).toBe(true);
    expect(
      transactions.reduce((sum, item) => sum + item.amount, 0),
    ).toBeCloseTo(settlement.contributorRewards + settlement.equityCredit, 2);
    expect(
      settlement.contributorRewards +
        settlement.equityCredit +
        settlement.communityReserve,
    ).toBeCloseTo(settlement.totalValue, 2);
  });

  it("rejects broken foreign keys", () => {
    const invalid = structuredClone(seedData);
    invalid.flexibleResources[0].participantId = "missing_resident";
    expect(() => validateSunshineWalletData(invalid)).toThrow(
      SeedDataValidationError,
    );
  });
});
