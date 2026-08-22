import { describe, expect, it } from "vitest";
import { findDemoResident } from "./demo-residents";

describe("demo resident credentials", () => {
  it("selects the contributor persona", () => {
    expect(findDemoResident("CONTRIBUTOR@gmail.com", "abc")?.role).toBe(
      "contributor",
    );
  });

  it("selects the resident without solar persona", () => {
    expect(findDemoResident("nonsolar@gmail.com", "abc")?.role).toBe(
      "non_solar_owner",
    );
  });

  it("rejects unknown credentials", () => {
    expect(findDemoResident("contributor@gmail.com", "wrong")).toBeUndefined();
  });
});
