import { describe, expect, it } from "vitest";
import { allocateCents } from "./cents";

const weights = (entries: [string, number][]) =>
  entries.map(([id, weight]) => ({ id, weight }));

describe("largest-remainder cent allocation", () => {
  it("distributes every cent of the pool", () => {
    const result = allocateCents(
      261_611,
      weights([
        ["a", 56],
        ["b", 40],
        ["c", 72],
        ["d", 66],
      ]),
    );
    const total = [...result.values()].reduce((sum, cents) => sum + cents, 0);
    expect(total).toBe(261_611);
  });

  it("is deterministic and order-independent", () => {
    const ascending = weights([
      ["a", 3],
      ["b", 5],
      ["c", 7],
    ]);
    const descending = [...ascending].reverse();
    const first = allocateCents(1000, ascending);
    expect(first).toEqual(allocateCents(1000, ascending));
    // Same weights assembled in a different order must pay the same amounts.
    for (const { id } of ascending)
      expect(allocateCents(1000, descending).get(id)).toBe(first.get(id));
  });

  it("breaks remainder ties by id so no caller wins by insertion order", () => {
    // Three equal weights over 100c: 33.33 each, one cent left over.
    const result = allocateCents(
      100,
      weights([
        ["c", 1],
        ["a", 1],
        ["b", 1],
      ]),
    );
    expect(result.get("a")).toBe(34);
    expect(result.get("b")).toBe(33);
    expect(result.get("c")).toBe(33);
  });

  it("splits proportionally to weight", () => {
    const result = allocateCents(
      900,
      weights([
        ["big", 2],
        ["small", 1],
      ]),
    );
    expect(result.get("big")).toBe(600);
    expect(result.get("small")).toBe(300);
  });

  it("returns zeros when the pool is empty or the weights are", () => {
    const noPool = allocateCents(0, weights([["a", 5]]));
    expect(noPool.get("a")).toBe(0);
    const noWeight = allocateCents(500, weights([["a", 0]]));
    expect(noWeight.get("a")).toBe(0);
  });

  it("rejects a non-integer or negative pool", () => {
    expect(() => allocateCents(10.5, weights([["a", 1]]))).toThrow();
    expect(() => allocateCents(-1, weights([["a", 1]]))).toThrow();
  });
});
