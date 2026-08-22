import { describe, expect, it } from "vitest";
import { computePriorityScore } from "@/lib/engine/priority-scheme";
import { intBetween, numberBetween, unitOf } from "./contracts";
import { checkRebateStatus, prefillFactors } from "./eligibility";
import { fetchTelemetry, requestBatteryDispatch } from "./endeavour";
import { dailyTotalKwh, fetchIntervals, windowTotalKwh } from "./meterdata";
import {
  applyCredit,
  fetchEligibility,
  isValidNmi,
  requestLoadSwitch,
  resolveNmi,
} from "./retailer";

const window = { start: "2026-08-20T11:00:00+10:00", end: "2026-08-20T14:00:00+10:00" };
const plan = {
  chargeKw: 30,
  chargeWindow: window,
  dischargeKw: 25,
  dischargeWindow: {
    start: "2026-08-20T17:00:00+10:00",
    end: "2026-08-20T20:00:00+10:00",
  },
};

describe("determinism kernel", () => {
  it("returns the same value for the same seed", () => {
    expect(unitOf("a", 1)).toBe(unitOf("a", 1));
    expect(intBetween(1, 100, "x")).toBe(intBetween(1, 100, "x"));
    expect(numberBetween(0, 1, 3, "y")).toBe(numberBetween(0, 1, 3, "y"));
  });

  it("stays inside its bounds", () => {
    for (let i = 0; i < 200; i += 1) {
      const value = intBetween(5, 9, "seed", i);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThanOrEqual(9);
    }
  });

  it("separates different seeds", () => {
    expect(unitOf("a")).not.toBe(unitOf("b"));
  });
});

describe("adapter:endeavour", () => {
  it("is deterministic for a given asset and plan", () => {
    expect(requestBatteryDispatch("battery_01", plan)).toEqual(
      requestBatteryDispatch("battery_01", plan),
    );
  });

  it("refuses some assets and gives a reason", () => {
    const responses = Array.from({ length: 40 }, (_, i) =>
      requestBatteryDispatch(`battery_${i}`, plan),
    );
    const refused = responses.filter((r) => !r.accepted);
    expect(refused.length).toBeGreaterThan(0);
    for (const response of refused) {
      expect(response.refusal).toBeDefined();
      expect(response.cappedKw).toBe(0);
    }
  });

  it("never accepts more than was requested", () => {
    for (let i = 0; i < 40; i += 1) {
      const response = requestBatteryDispatch(`battery_${i}`, plan);
      expect(response.cappedKw).toBeLessThanOrEqual(
        Math.max(plan.chargeKw, plan.dischargeKw),
      );
    }
  });

  it("rejects a nonsensical plan outright", () => {
    const response = requestBatteryDispatch("battery_01", {
      ...plan,
      chargeKw: 0,
    });
    expect(response.accepted).toBe(false);
    expect(response.refusal).toBe("OUTSIDE_OPERATING_ENVELOPE");
  });

  it("reports charge and discharge separately, with a documented portion", () => {
    const telemetry = fetchTelemetry("battery_01", "2026-08-20");
    expect(telemetry.intervals).toHaveLength(48);
    expect(telemetry.chargedKwh).toBeGreaterThan(0);
    expect(telemetry.dischargedKwh).toBeGreaterThan(0);
    // Only the defensible portion may be claimed.
    expect(telemetry.documentedLimitKwh).toBeLessThan(telemetry.dischargedKwh);
    expect(telemetry.documentedLimitKwh).toBeGreaterThan(0);
  });
});

describe("adapter:retailer", () => {
  it("validates NMI shape before looking anything up", () => {
    expect(isValidNmi("NAAAWW1234")).toBe(true);
    expect(isValidNmi("NAAAWW12345")).toBe(true);
    expect(isValidNmi("short")).toBe(false);
    expect(isValidNmi("NAAAWW1234567")).toBe(false);
    expect(resolveNmi("nope")).toBeNull();
  });

  it("resolves a NMI deterministically", () => {
    expect(resolveNmi("NAAAWW1234")).toEqual(resolveNmi("naaaww1234"));
  });

  it("returns null eligibility for a non-partner retailer", () => {
    const nonPartner = Array.from({ length: 60 }, (_, i) => `NMI000000${i}`)
      .map((nmi) => resolveNmi(nmi))
      .filter((r) => r && !r.partner);
    expect(nonPartner.length).toBeGreaterThan(0);
    for (const resolution of nonPartner)
      expect(fetchEligibility(resolution!.nmi)).toBeNull();
  });

  it("asserts nothing identifying when the retailer is a partner", () => {
    const assertions = Array.from({ length: 60 }, (_, i) => `NMI000000${i}`)
      .map((nmi) => fetchEligibility(nmi))
      .find((a) => a !== null);
    expect(assertions).toBeDefined();
    const serialised = JSON.stringify(assertions);
    // No CRN, no program names, no free text that could carry health data.
    expect(serialised).not.toMatch(/crn|medicare|pension|disabil|medical/i);
    expect(assertions!.verification).toBe("retailer_confirmed");
  });

  it("splits a load switch into accepted and rejected meters", () => {
    const meterIds = Array.from({ length: 60 }, (_, i) => `meter_${i}`);
    const result = requestLoadSwitch(meterIds, window);
    expect(result.accepted.length + result.rejected.length).toBe(60);
    expect(result.rejected.length).toBeGreaterThan(0);
    expect(requestLoadSwitch(meterIds, window)).toEqual(result);
  });

  it("issues a stable credit reference and refuses bad amounts", () => {
    const receipt = applyCredit("acct_001", 1220);
    expect(receipt.ok).toBe(true);
    expect(receipt.reference).toMatch(/^CR-[0-9A-F]{8}$/);
    expect(applyCredit("acct_001", 1220)).toEqual(receipt);
    expect(applyCredit("acct_001", -5).ok).toBe(false);
    expect(applyCredit("acct_001", 12.5).ok).toBe(false);
  });
});

describe("adapter:meterdata", () => {
  const meterIds = Array.from({ length: 40 }, (_, i) => `meter_${i}`);

  it("returns 48 half-hour readings per circuit", () => {
    const result = fetchIntervals(meterIds, "2026-08-20");
    const first = Object.values(result.series)[0];
    expect(first.controlledLoad).toHaveLength(48);
    expect(first.general).toHaveLength(48);
    expect(first.labels[0]).toBe("00:00");
    expect(first.labels[47]).toBe("23:30");
  });

  it("reports meters whose data did not arrive", () => {
    // Gaps are ~4% and deterministic, so a small fixed set can legitimately
    // contain none. Sample widely enough that some meter must be missing.
    const wide = Array.from({ length: 200 }, (_, i) => `meter_${i}`);
    const result = fetchIntervals(wide, "2026-08-20");
    expect(result.missing.length).toBeGreaterThan(0);
    for (const gap of result.missing)
      expect(result.series[gap.meterId]).toBeUndefined();
    // A missing meter cannot be verified, so it must not appear in the series.
    expect(Object.keys(result.series).length + result.missing.length).toBe(200);
  });

  it("shows a midday bump only for meters that were switched", () => {
    const [switched, unswitched] = ["meter_a", "meter_b"];
    const result = fetchIntervals([switched, unswitched], "2026-08-20", [
      switched,
    ]);
    const midday = (id: string) =>
      windowTotalKwh(result.series[id].controlledLoad, 11, 14);
    const overnight = (id: string) =>
      windowTotalKwh(result.series[id].controlledLoad, 23, 24);
    expect(midday(switched)).toBeGreaterThan(midday(unswitched));
    expect(overnight(unswitched)).toBeGreaterThan(overnight(switched));
  });

  it("gives a daily total that a shift-not-addition check can use", () => {
    const result = fetchIntervals(["meter_a"], "2026-08-20");
    expect(dailyTotalKwh(result.series.meter_a)).toBeGreaterThan(0);
  });

  it("is deterministic", () => {
    expect(fetchIntervals(meterIds, "2026-08-20")).toEqual(
      fetchIntervals(meterIds, "2026-08-20"),
    );
  });
});

describe("adapter:eligibility", () => {
  it("returns null when the lookup is unavailable, not a zero score", () => {
    const results = Array.from({ length: 60 }, (_, i) =>
      checkRebateStatus(`cust_${i}`),
    );
    expect(results.some((r) => r === null)).toBe(true);
    expect(results.some((r) => r !== null)).toBe(true);
    expect(checkRebateStatus("")).toBeNull();
  });

  it("prefills A, B, D and E but always leaves tenure to be asked", () => {
    const assertions = Array.from({ length: 60 }, (_, i) =>
      checkRebateStatus(`cust_${i}`),
    ).find((a) => a !== null)!;
    const prefilled = prefillFactors(assertions);
    expect(prefilled.mustAsk).toBe("factorC");
    // The prefilled points must form a valid partial score.
    const score = computePriorityScore({
      factorA: prefilled.points.factorA,
      factorB: prefilled.points.factorB,
      factorC: 0,
      factorD: prefilled.points.factorD,
      factorE: prefilled.points.factorE,
    });
    expect(score.priorityScore).toBeGreaterThanOrEqual(0);
    expect(score.priorityScore).toBeLessThanOrEqual(100);
  });

  it("maps a primary rebate band to the top income factor", () => {
    const prefilled = prefillFactors({
      source: "eligibility:test",
      issuedAt: "2026-08-14",
      rebateBand: "primary",
      eapaLast12m: false,
      accountStatus: "current",
      embeddedNetwork: true,
      offerType: "embedded",
      controlledLoad: true,
      verification: "retailer_confirmed",
    });
    expect(prefilled.factorB).toBe("low_income_or_concession");
    expect(prefilled.factorD).toBe("embedded_network");
    expect(prefilled.factorE).toBe("individual_tank");
  });

  it("treats debt recovery as acute hardship", () => {
    const prefilled = prefillFactors({
      source: "eligibility:test",
      issuedAt: "2026-08-14",
      rebateBand: "none",
      eapaLast12m: false,
      accountStatus: "debt_recovery",
      embeddedNetwork: false,
      offerType: "market",
      controlledLoad: false,
      verification: "retailer_confirmed",
    });
    expect(prefilled.factorA).toBe("acute_hardship");
    expect(prefilled.points.factorA).toBe(35);
  });
});
