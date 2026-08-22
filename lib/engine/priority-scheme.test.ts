import { describe, expect, it } from "vitest";
import { workedHouseholds } from "@/lib/data/priority-fixtures";
import {
  EQUITY_CELLS,
  classifyCapability,
  computePriorityScore,
  deriveNeedTier,
  isPhysicalChannelEligible,
  scoreAnswers,
  type FactorScores,
} from "./priority-scheme";

const factors = (
  factorA: number,
  factorB: number,
  factorC: number,
  factorD: number,
  factorE: number,
): FactorScores => ({ factorA, factorB, factorC, factorD, factorE });

describe("need tier bands", () => {
  it("maps the documented band edges", () => {
    expect(deriveNeedTier(85)).toBe("critical");
    expect(deriveNeedTier(60)).toBe("critical");
    expect(deriveNeedTier(59)).toBe("high");
    expect(deriveNeedTier(40)).toBe("high");
    expect(deriveNeedTier(39)).toBe("moderate");
    expect(deriveNeedTier(20)).toBe("moderate");
    expect(deriveNeedTier(19)).toBe("standard");
    expect(deriveNeedTier(0)).toBe("standard");
  });
});

describe("capability classes", () => {
  it("folds Factor E's four levels into three columns", () => {
    expect(classifyCapability(15)).toBe("individual_tank");
    expect(classifyCapability(8)).toBe("shared_or_other");
    expect(classifyCapability(4)).toBe("shared_or_other");
    expect(classifyCapability(0)).toBe("none");
  });
});

describe("priority score", () => {
  it("is need_score + contrib_score", () => {
    const result = computePriorityScore(factors(25, 25, 15, 10, 15));
    expect(result.needScore).toBe(75);
    expect(result.contribScore).toBe(15);
    expect(result.priorityScore).toBe(90);
  });

  it("NEVER lets Factor E move the need tier", () => {
    // Same A-D (need 10, standard band), opposite ends of Factor E.
    const noDevice = computePriorityScore(factors(0, 10, 0, 0, 0));
    const bestDevice = computePriorityScore(factors(0, 10, 0, 0, 15));
    expect(noDevice.needTier).toBe("standard");
    expect(bestDevice.needTier).toBe("standard");
    // The score moves, the tier does not. This is the scheme's core invariant:
    // capability must never buy a household a larger equity block.
    expect(bestDevice.priorityScore).toBeGreaterThan(noDevice.priorityScore);
    expect(bestDevice.capabilityClass).not.toBe(noDevice.capabilityClass);
  });

  it("does not let a full Factor E push a household over a band edge", () => {
    // need 59 is High; 59 + 15 = 74 would be Critical if the total were used.
    const result = computePriorityScore(factors(35, 18, 3, 3, 15));
    expect(result.needScore).toBe(59);
    expect(result.priorityScore).toBe(74);
    expect(result.needTier).toBe("high");
  });

  it("is deterministic", () => {
    const input = factors(12, 10, 15, 6, 8);
    expect(computePriorityScore(input)).toEqual(computePriorityScore(input));
  });

  it("rejects out-of-range factor scores", () => {
    expect(() => computePriorityScore(factors(36, 0, 0, 3, 0))).toThrow();
    expect(() => computePriorityScore(factors(0, 0, 0, 3, 16))).toThrow();
    expect(() => computePriorityScore(factors(-1, 0, 0, 3, 0))).toThrow();
    expect(() => computePriorityScore(factors(1.5, 0, 0, 3, 0))).toThrow();
  });
});

describe("the doc's worked households", () => {
  it.each(workedHouseholds)("scores $id as documented", (household) => {
    const result = computePriorityScore(household.factors);
    expect(result.needScore).toBe(household.expected.needScore);
    expect(result.contribScore).toBe(household.expected.contribScore);
    expect(result.priorityScore).toBe(household.expected.priorityScore);
    expect(result.needTier).toBe(household.expected.needTier);
    expect(result.capabilityClass).toBe(household.expected.capabilityClass);
  });
});

describe("answer scoring", () => {
  it("maps onboarding answers to factor points", () => {
    expect(
      scoreAnswers({
        factorA: "eapa_last_12m",
        factorB: "low_income_or_concession",
        factorC: "renter",
        factorD: "embedded_network",
        factorE: "none",
      }),
    ).toEqual(factors(25, 25, 15, 10, 0));
  });
});

describe("equity cells", () => {
  it("enumerates exactly twelve cells with unique keys", () => {
    expect(EQUITY_CELLS).toHaveLength(12);
    expect(new Set(EQUITY_CELLS.map((cell) => cell.key)).size).toBe(12);
  });
});

describe("physical channel gate", () => {
  it("reads the raw contribution score, not the capability class", () => {
    // E=4 is shared_or_other for allocation but below the enrolment gate.
    expect(isPhysicalChannelEligible("critical", 4)).toBe(false);
    expect(isPhysicalChannelEligible("critical", 8)).toBe(true);
  });

  it("requires need tier of at least Moderate", () => {
    expect(isPhysicalChannelEligible("moderate", 15)).toBe(true);
    expect(isPhysicalChannelEligible("standard", 15)).toBe(false);
  });
});
