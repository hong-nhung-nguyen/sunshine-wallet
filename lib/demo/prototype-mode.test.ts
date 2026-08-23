import { describe, expect, it } from "vitest";
import { verifyContributor } from "@/lib/engine/contributor-verification";
import { isValidNmi } from "@/services/retailer";
import { demoVerifiableNmi } from "./prototype-mode";

describe("prototype mode", () => {
  it("falls back to a NMI that clears every gate", () => {
    const result = verifyContributor({
      householdId: "hh_prototype",
      nmi: demoVerifiableNmi,
    });
    expect(result.outcome).toBe("verified");
    expect(result.receivesSolarPool).toBe(true);
    expect(result.gates.every((gate) => gate.passed)).toBe(true);
    expect(result.failedCodes).toEqual([]);
  });

  it("offers a NMI the format check accepts, so the field can be prefilled", () => {
    expect(isValidNmi(demoVerifiableNmi)).toBe(true);
  });
});
