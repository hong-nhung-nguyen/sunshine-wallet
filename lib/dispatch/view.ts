import {
  findArea,
  findSite,
  isSwitchingAt,
  type DispatchArea,
  type DispatchAssignment,
  type DispatchSite,
  type DispatchStatus,
} from "@/lib/data/dispatch";

/**
 * View models for the dispatch console. Pure joins and counts only — no
 * component may recompute these, and nothing here decides an outcome.
 */

export interface DispatchRow {
  assignment: DispatchAssignment;
  site: DispatchSite;
  area: DispatchArea;
  /** 1-based stop number, ordered by planned start. Matches the map pin. */
  stop: number;
  /** Moving load at the console's current time. */
  switching: boolean;
}

export const dispatchFilters = [
  { id: "all", label: "All" },
  { id: "ongoing", label: "Ongoing" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "waiting", label: "Waiting" },
] as const;

export type DispatchFilter = (typeof dispatchFilters)[number]["id"];

export function buildRows(
  assignments: readonly DispatchAssignment[],
  now: number,
): DispatchRow[] {
  return assignments
    .flatMap((assignment) => {
      const site = findSite(assignment.resourceId);
      const area = site ? findArea(site.areaId) : undefined;
      if (!site || !area) return [];
      return [{ assignment, site, area, stop: 0, switching: false }];
    })
    .sort((a, b) => {
      const byStart = a.assignment.plannedStart - b.assignment.plannedStart;
      return byStart !== 0
        ? byStart
        : a.assignment.id.localeCompare(b.assignment.id);
    })
    .map((row, index) => ({
      ...row,
      stop: index + 1,
      switching: isSwitchingAt(row.assignment, now),
    }));
}

export function countByStatus(
  rows: readonly DispatchRow[],
): Record<DispatchFilter, number> {
  const counts: Record<DispatchFilter, number> = {
    all: rows.length,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    waiting: 0,
  };
  for (const row of rows) counts[row.assignment.status] += 1;
  return counts;
}

export function filterRows(
  rows: readonly DispatchRow[],
  filter: DispatchFilter,
): DispatchRow[] {
  return filter === "all"
    ? [...rows]
    : rows.filter((row) => row.assignment.status === filter);
}

export interface DispatchTotals {
  /** kWh confirmed delivered by completed switches. */
  deliveredKwh: number;
  /** kWh across every switch a retailer has agreed to. */
  scheduledKwh: number;
  /** Switch-minutes elapsed against switch-minutes planned. */
  elapsedMinutes: number;
  plannedMinutes: number;
  activeDevices: number;
  totalDevices: number;
}

export function totalise(
  rows: readonly DispatchRow[],
  now: number,
): DispatchTotals {
  const live = rows.filter((row) => row.assignment.status !== "cancelled");
  let deliveredKwh = 0;
  let scheduledKwh = 0;
  let elapsedMinutes = 0;
  let plannedMinutes = 0;

  for (const { assignment } of live) {
    scheduledKwh += assignment.energyKwh;
    plannedMinutes += assignment.plannedEnd - assignment.plannedStart;
    if (assignment.status === "completed") {
      deliveredKwh += assignment.energyKwh;
      elapsedMinutes +=
        (assignment.actualEnd ?? assignment.plannedEnd) -
        (assignment.actualStart ?? assignment.plannedStart);
      continue;
    }
    if (assignment.status !== "ongoing") continue;
    const start = assignment.actualStart ?? assignment.plannedStart;
    const end = assignment.actualEnd ?? assignment.plannedEnd;
    if (now <= start) continue;
    const run = Math.min(now, end) - start;
    elapsedMinutes += run;
    // Delivered energy accrues pro rata across the switch window.
    deliveredKwh += (assignment.energyKwh * run) / Math.max(end - start, 1);
  }

  return {
    deliveredKwh,
    scheduledKwh,
    elapsedMinutes,
    plannedMinutes,
    activeDevices: rows.filter((row) => row.switching).length,
    totalDevices: live.length,
  };
}

export const statusLabels: Record<DispatchStatus, string> = {
  waiting: "Awaiting retailer",
  ongoing: "Approved",
  completed: "Completed",
  cancelled: "Declined",
};

/** Refusal codes come back from the retailer adapter; humans read the console. */
export const refusalLabels: Record<string, string> = {
  METER_NOT_FOUND: "Meter not found",
  NO_CONTROLLED_LOAD: "No controlled load on this account",
  CUSTOMER_OPTED_OUT: "Customer opted out",
  SWITCH_WINDOW_CONFLICT: "Conflicting switch already scheduled",
};

export function describeNote(note: string | null): string | null {
  if (!note) return null;
  return refusalLabels[note] ?? note;
}
