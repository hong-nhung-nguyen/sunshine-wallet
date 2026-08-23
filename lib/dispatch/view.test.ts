import { describe, expect, it } from "vitest";
import { seedAssignments, type DispatchAssignment } from "@/lib/data/dispatch";
import { buildRows, countByStatus, filterRows, totalise } from "./view";

const NOON = 12 * 60;

function assignmentAt(overrides: Partial<DispatchAssignment> = {}) {
  return {
    id: "SW-9001",
    eventId: "event_001",
    resourceId: "resource_001",
    status: "ongoing",
    plannedStart: NOON,
    plannedEnd: NOON + 120,
    actualStart: NOON,
    actualEnd: null,
    energyKwh: 6,
    requestedAt: null,
    decidedAt: null,
    note: null,
    ...overrides,
  } satisfies DispatchAssignment;
}

describe("buildRows", () => {
  it("numbers stops by planned start and drops unknown resources", () => {
    const rows = buildRows(
      [
        assignmentAt({ id: "SW-9002", plannedStart: NOON + 60 }),
        assignmentAt({ id: "SW-9001", plannedStart: NOON }),
        assignmentAt({ id: "SW-9003", resourceId: "resource_missing" }),
      ],
      NOON,
    );
    expect(rows.map((row) => [row.assignment.id, row.stop])).toEqual([
      ["SW-9001", 1],
      ["SW-9002", 2],
    ]);
  });

  it("marks a switch live only inside its window", () => {
    const [before] = buildRows([assignmentAt()], NOON - 30);
    const [during] = buildRows([assignmentAt()], NOON + 30);
    const [after] = buildRows([assignmentAt()], NOON + 200);
    expect([before.switching, during.switching, after.switching]).toEqual([
      false,
      true,
      false,
    ]);
  });

  it("never marks an unapproved switch live", () => {
    const [row] = buildRows([assignmentAt({ status: "waiting" })], NOON + 30);
    expect(row.switching).toBe(false);
  });
});

describe("countByStatus", () => {
  it("counts the seeded switching day", () => {
    const counts = countByStatus(buildRows(seedAssignments, NOON));
    expect(counts).toEqual({
      all: 5,
      ongoing: 2,
      completed: 1,
      cancelled: 1,
      waiting: 1,
    });
  });
});

describe("filterRows", () => {
  it("keeps every row for the all filter", () => {
    const rows = buildRows(seedAssignments, NOON);
    expect(filterRows(rows, "all")).toHaveLength(rows.length);
    expect(filterRows(rows, "waiting")).toHaveLength(1);
  });
});

describe("totalise", () => {
  it("accrues delivered energy pro rata across an ongoing window", () => {
    const rows = buildRows([assignmentAt()], NOON + 60);
    expect(totalise(rows, NOON + 60).deliveredKwh).toBeCloseTo(3, 5);
  });

  it("counts a completed switch in full and excludes declined ones", () => {
    const rows = buildRows(
      [
        assignmentAt({
          status: "completed",
          actualEnd: NOON + 120,
        }),
        assignmentAt({
          id: "SW-9002",
          resourceId: "resource_002",
          status: "cancelled",
        }),
      ],
      NOON + 200,
    );
    const totals = totalise(rows, NOON + 200);
    expect(totals.deliveredKwh).toBe(6);
    expect(totals.scheduledKwh).toBe(6);
    expect(totals.totalDevices).toBe(1);
  });

  it("reports no elapsed time before a switch starts", () => {
    const rows = buildRows([assignmentAt()], NOON - 60);
    const totals = totalise(rows, NOON - 60);
    expect(totals.elapsedMinutes).toBe(0);
    expect(totals.deliveredKwh).toBe(0);
    expect(totals.activeDevices).toBe(0);
  });
});
