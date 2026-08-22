import { describe, expect, it } from "vitest";
import {
  lowConfidenceVerificationInput,
  verificationInput,
} from "@/lib/data/verification-fixtures";
import {
  calculateBaseline,
  VERIFICATION_CONFIDENCE_THRESHOLD,
  verifyEvent,
} from "./verification";

describe("measurement and verification", () => {
  it("excludes event days from the baseline", () => {
    const baseline = calculateBaseline(verificationInput.referenceDays);
    expect(baseline.baselineEnergyKwh).toBe(5.8);
    expect(baseline.excludedEventDayIds).toEqual(["2026-08-16"]);
  });

  it("verifies observed energy against baseline and passes sufficient confidence", () => {
    const result = verifyEvent(verificationInput);
    expect(result.record.verifiedFlexEnergyKwh).toBe(16.5);
    expect(result.record.confidenceScore).toBeGreaterThanOrEqual(
      VERIFICATION_CONFIDENCE_THRESHOLD,
    );
    expect(result.record.settlementGatePassed).toBe(true);
    expect(result.record.verificationStatus).toBe("passed");
  });

  it("blocks settlement when confidence is below the threshold", () => {
    const result = verifyEvent(lowConfidenceVerificationInput);
    expect(result.record.confidenceScore).toBeLessThan(
      VERIFICATION_CONFIDENCE_THRESHOLD,
    );
    expect(result.record.settlementGatePassed).toBe(false);
    expect(result.record.verificationStatus).toBe("failed");
  });

  it("is deterministic and bounds confidence", () => {
    const first = verifyEvent(verificationInput);
    expect(first).toEqual(verifyEvent(verificationInput));
    expect(first.record.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(first.record.confidenceScore).toBeLessThanOrEqual(1);
  });

  it("reduces confidence when there are too few clean reference days", () => {
    const result = verifyEvent({
      ...verificationInput,
      referenceDays: verificationInput.referenceDays.slice(0, 1),
    });
    expect(result.record.settlementGatePassed).toBe(false);
    expect(result.baseline.qualityFactor).toBe(0.33);
  });
});
