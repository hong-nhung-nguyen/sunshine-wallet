import { beforeEach, describe, expect, it } from "vitest";
import {
  lookupGridConnection,
  lookupRegistrationByNmi,
  markSerialEnrolled,
  resetEnrolledSerials,
} from "@/services/solar-registry";
import {
  verifyContributor,
  type ContributorClaim,
} from "./contributor-verification";

/** Find a NMI that satisfies a condition, so tests do not depend on luck. */
const findNmi = (predicate: (nmi: string) => boolean): string => {
  for (let i = 0; i < 4000; i += 1) {
    const nmi = `NCON${String(i).padStart(6, "0")}`;
    if (predicate(nmi)) return nmi;
  }
  throw new Error("no NMI matched the predicate");
};

const fullyVerifiable = () =>
  findNmi((nmi) => {
    const connection = lookupGridConnection(nmi);
    const registration = lookupRegistrationByNmi(nmi);
    return (
      Boolean(connection) &&
      Boolean(registration) &&
      registration!.status === "active" &&
      registration!.systemSizeKw <= connection!.exportLimitKw + 1
    );
  });

const claim = (overrides: Partial<ContributorClaim> = {}): ContributorClaim => ({
  householdId: "hh_test",
  nmi: fullyVerifiable(),
  ...overrides,
});

beforeEach(() => resetEnrolledSerials());

describe("a genuine contributor", () => {
  it("verifies against the address registration and export approval", () => {
    const result = verifyContributor(claim());
    expect(result.outcome).toBe("verified");
    expect(result.route).toBe("nmi_registry");
    expect(result.receivesSolarPool).toBe(true);
    expect(result.registrationId).toMatch(/^SRES-/);
    expect(result.systemSizeKw).toBeGreaterThan(0);
  });

  it("never returns a raw serial, only a salted hash", () => {
    const result = verifyContributor(claim());
    expect(result.inverterSerialHash).toMatch(/^sha:[0-9a-f]{8}$/);
    expect(JSON.stringify(result)).not.toMatch(/INV-\d/);
  });

  it("is deterministic", () => {
    const input = claim();
    expect(verifyContributor(input)).toEqual(verifyContributor(input));
  });
});

describe("claims that must not be paid", () => {
  it("refuses a NMI with no export approval on file", () => {
    const nmi = findNmi((n) => lookupGridConnection(n) === null);
    const result = verifyContributor({ householdId: "hh", nmi });
    expect(result.outcome).not.toBe("verified");
    expect(result.receivesSolarPool).toBe(false);
    expect(result.failedCodes).toContain("NO_GRID_CONNECTION");
  });

  it("refuses a household with no registration and no serial", () => {
    const nmi = findNmi((n) => lookupRegistrationByNmi(n) === null);
    const result = verifyContributor({ householdId: "hh", nmi });
    expect(result.failedCodes).toContain("NOT_ON_REGISTRY");
    expect(result.receivesSolarPool).toBe(false);
  });

  it("refuses a decommissioned system", () => {
    const nmi = findNmi(
      (n) => lookupRegistrationByNmi(n)?.status === "decommissioned",
    );
    const result = verifyContributor({ householdId: "hh", nmi });
    expect(result.failedCodes).toContain("REGISTRATION_INACTIVE");
    expect(result.outcome).toBe("rejected");
  });

  it("refuses a malformed inverter serial", () => {
    const nmi = findNmi((n) => lookupRegistrationByNmi(n) === null);
    const result = verifyContributor({
      householdId: "hh",
      nmi,
      inverterSerial: "abc",
    });
    expect(result.failedCodes).toContain("SERIAL_MALFORMED");
  });

  it("refuses the same physical system enrolled twice", () => {
    const input = claim();
    const first = verifyContributor(input);
    expect(first.outcome).toBe("verified");
    markSerialEnrolled(first.inverterSerialHash!);

    const second = verifyContributor({ ...input, householdId: "hh_other" });
    expect(second.failedCodes).toContain("ALREADY_ENROLLED");
    expect(second.receivesSolarPool).toBe(false);
  });

  it("flags a declared size that disagrees with the registry", () => {
    const input = claim();
    const registered = verifyContributor(input).systemSizeKw!;
    const result = verifyContributor({
      ...input,
      declaredSystemSizeKw: registered + 5,
    });
    expect(result.outcome).toBe("rejected");
    expect(result.summary).toMatch(/registry holds/);
  });
});

describe("households the checks cannot reach", () => {
  it("routes to manual review when records are missing but documents exist", () => {
    const nmi = findNmi(
      (n) =>
        lookupRegistrationByNmi(n) === null && lookupGridConnection(n) !== null,
    );
    const result = verifyContributor({
      householdId: "hh",
      nmi,
      hasConnectionDocuments: true,
    });
    expect(result.outcome).toBe("manual_review");
    expect(result.route).toBe("documents");
    // Manual review is a queue, not a pass.
    expect(result.receivesSolarPool).toBe(false);
  });

  it("does not route a substantive failure to manual review", () => {
    // A decommissioned system is not a missing record — documents cannot fix it.
    const nmi = findNmi(
      (n) => lookupRegistrationByNmi(n)?.status === "decommissioned",
    );
    const result = verifyContributor({
      householdId: "hh",
      nmi,
      hasConnectionDocuments: true,
    });
    expect(result.outcome).toBe("rejected");
  });
});

describe("every verdict explains itself", () => {
  it("gives a reason for each gate, passed or failed", () => {
    const result = verifyContributor(claim());
    expect(result.gates.length).toBeGreaterThan(2);
    for (const gate of result.gates) {
      expect(gate.explanation.length).toBeGreaterThan(10);
      expect(gate.label.length).toBeGreaterThan(2);
    }
  });

  it("names the blocking reason in the summary when refused", () => {
    const nmi = findNmi((n) => lookupGridConnection(n) === null);
    const result = verifyContributor({ householdId: "hh", nmi });
    expect(result.summary).toMatch(/Cannot enrol/);
  });
});
