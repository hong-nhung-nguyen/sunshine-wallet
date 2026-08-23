import { describe, expect, it } from "vitest";
import { demoResidentPersonas, findDemoResident } from "./demo-residents";

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

  it.each(["new_contributor", "new_receiver"] as const)(
    "starts the %s signup persona with an empty wallet",
    (role) => {
      const resident = demoResidentPersonas[role];
      expect(resident.walletBalance).toBe(0);
      expect(resident.totalEarned).toBe(0);
      expect(resident.recentCredits).toEqual([]);
      expect(resident.nextEvent).toBeNull();
      expect(resident.isNew).toBe(true);
    },
  );
});
