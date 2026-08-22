import { describe, expect, it } from "vitest";
import { isValidTimeWindow } from "./event-window";

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
});
