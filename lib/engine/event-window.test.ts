import { describe, expect, it } from "vitest";
import {
  isValidTimeWindow,
  selectEventWindow,
  type EventWindowCandidate,
} from "./event-window";

const candidate: EventWindowCandidate = {
  id: "window_midday",
  sunshineCellId: "sunshine_cell_01",
  window: {
    start: "2026-08-22T12:00:00+10:00",
    end: "2026-08-22T14:00:00+10:00",
  },
  solarExportPotentialKwh: 128,
  constraintRisk: "high",
  forecastConfidence: 0.86,
  availableFlexEnergyKwh: 36,
  targetFlexEnergyKwh: 18,
  comfortProtected: true,
};

describe("isValidTimeWindow", () => {
  it("accepts a window whose end follows its start", () => {
    expect(
      isValidTimeWindow({
        start: "2026-08-22T12:00:00Z",
        end: "2026-08-22T14:00:00Z",
      }),
    ).toBe(true);
  });

  it("rejects equal or reversed timestamps", () => {
    expect(
      isValidTimeWindow({
        start: "2026-08-22T14:00:00Z",
        end: "2026-08-22T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("selects the highest-scoring eligible window deterministically", () => {
    const lowerScore = {
      ...candidate,
      id: "window_morning",
      constraintRisk: "medium" as const,
    };
    const first = selectEventWindow([lowerScore, candidate]);
    const second = selectEventWindow([lowerScore, candidate]);
    expect(first).toEqual(second);
    expect(first.status).toBe("recommended");
    if (first.status === "recommended")
      expect(first.recommended.id).toBe("window_midday");
  });

  it("returns no event when forecast confidence is below the gate", () => {
    const result = selectEventWindow([
      { ...candidate, forecastConfidence: 0.6 },
    ]);
    expect(result.status).toBe("no_event");
    if (result.status === "no_event")
      expect(result.reasons).toContain("Forecast confidence is below 75%");
  });

  it("rejects insufficient flexibility and unprotected comfort", () => {
    const result = selectEventWindow([
      { ...candidate, availableFlexEnergyKwh: 10, comfortProtected: false },
    ]);
    expect(result.status).toBe("no_event");
    if (result.status === "no_event") {
      expect(result.reasons).toContain(
        "Available flexibility is below the target",
      );
      expect(result.reasons).toContain("Customer comfort cannot be protected");
    }
  });
});
