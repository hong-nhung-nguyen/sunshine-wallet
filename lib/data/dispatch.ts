/**
 * Dispatch planner fixtures — the switching side of one Sunshine event.
 *
 * A "switch" is a retailer moving a controlled load, or a battery owner
 * shifting a charge, into the surplus window. Everything here is simulated:
 * the map is a stylised schematic of the Dapto cell, not a GIS layer, and the
 * suburb outlines carry no claim about electrical topology.
 */

export type DispatchStatus = "waiting" | "ongoing" | "completed" | "cancelled";

export type SwitchParty = "retailer" | "battery_owner";

/** A stylised suburb outline in the map's 1000x620 coordinate space. */
export interface DispatchArea {
  id: string;
  name: string;
  points: string;
  labelX: number;
  labelY: number;
}

/** Where a switchable device sits, and who has to agree to switch it. */
export interface DispatchSite {
  resourceId: string;
  name: string;
  deviceType: "Hot water" | "EV charging" | "Battery";
  party: SwitchParty;
  partyName: string;
  areaId: string;
  address: string;
  x: number;
  y: number;
  capacityKwh: number;
  powerKw: number;
}

export interface DispatchAssignment {
  id: string;
  eventId: string;
  resourceId: string;
  status: DispatchStatus;
  /** Minutes from midnight, local demo time. */
  plannedStart: number;
  plannedEnd: number;
  actualStart: number | null;
  actualEnd: number | null;
  energyKwh: number;
  requestedAt: string | null;
  decidedAt: string | null;
  /** Retailer refusal reason or council note. */
  note: string | null;
}

/** The console's visible day, 10 am to 4 pm. */
export const DISPATCH_DAY_START = 10 * 60;
export const DISPATCH_DAY_END = 16 * 60;
export const DISPATCH_DEFAULT_NOW = 13 * 60 + 20;
export const DISPATCH_DATE_LABEL = "22 Aug 2026";

export const dispatchAreas: readonly DispatchArea[] = [
  {
    id: "area_north",
    name: "Dapto North",
    points: "160,55 430,42 468,188 198,205",
    labelX: 232,
    labelY: 92,
  },
  {
    id: "area_central",
    name: "Dapto Central",
    points: "198,205 468,188 505,338 235,360",
    labelX: 250,
    labelY: 242,
  },
  {
    id: "area_east",
    name: "Dapto East",
    points: "492,182 748,166 790,320 520,340",
    labelX: 560,
    labelY: 213,
  },
  {
    id: "area_kanahooka",
    name: "Kanahooka",
    points: "235,360 520,340 566,520 265,545",
    labelX: 300,
    labelY: 400,
  },
];

/** Council depot — the "homebase" row at the top of the activity log. */
export const dispatchHomebase = {
  name: "Dapto Sunshine Cell",
  address: "Council depot, Bong Bong Road, Dapto",
  areaId: "area_central",
  x: 318,
  y: 232,
} as const;

export const dispatchSites: readonly DispatchSite[] = [
  {
    resourceId: "resource_001",
    name: "Maya's hot water",
    deviceType: "Hot water",
    party: "retailer",
    partyName: "Acme Energy",
    areaId: "area_central",
    address: "14 Bong Bong Road, Dapto",
    x: 352,
    y: 272,
    capacityKwh: 5.2,
    powerKw: 3.6,
  },
  {
    resourceId: "resource_002",
    name: "Noah's EV charger",
    deviceType: "EV charging",
    party: "retailer",
    partyName: "Illawarra Power",
    areaId: "area_east",
    address: "41 Fowlers Road, Dapto",
    x: 622,
    y: 252,
    capacityKwh: 14.4,
    powerKw: 7.2,
  },
  {
    resourceId: "resource_003",
    name: "Aisha's hot water",
    deviceType: "Hot water",
    party: "retailer",
    partyName: "Acme Energy",
    areaId: "area_kanahooka",
    address: "9 Byamee Street, Kanahooka",
    x: 372,
    y: 448,
    capacityKwh: 7.2,
    powerKw: 3.6,
  },
  {
    resourceId: "resource_004",
    name: "Noah's home battery",
    deviceType: "Battery",
    party: "battery_owner",
    partyName: "Noah Williams",
    areaId: "area_east",
    address: "41 Fowlers Road, Dapto",
    x: 688,
    y: 296,
    capacityKwh: 10,
    powerKw: 5,
  },
  {
    resourceId: "resource_005",
    name: "Marshall Street community battery",
    deviceType: "Battery",
    party: "battery_owner",
    partyName: "Dapto Community Energy",
    areaId: "area_north",
    address: "2 Marshall Street, Dapto",
    x: 300,
    y: 128,
    capacityKwh: 22,
    powerKw: 11,
  },
  {
    resourceId: "resource_006",
    name: "Kanahooka apartments hot water",
    deviceType: "Hot water",
    party: "retailer",
    partyName: "Coastline Electric",
    areaId: "area_kanahooka",
    address: "77 Prince Edward Drive, Kanahooka",
    x: 476,
    y: 466,
    capacityKwh: 9.6,
    powerKw: 4.8,
  },
];

/**
 * Opening state of the console. Two switches running, one finished, one still
 * with the retailer, one refused — every status the tab strip can show.
 */
export const seedAssignments: readonly DispatchAssignment[] = [
  {
    id: "SW-1041",
    eventId: "event_001",
    resourceId: "resource_003",
    status: "completed",
    plannedStart: 11 * 60 + 40,
    plannedEnd: 12 * 60 + 35,
    actualStart: 11 * 60 + 44,
    actualEnd: 12 * 60 + 33,
    energyKwh: 7.2,
    requestedAt: "2026-08-22T10:15:00+10:00",
    decidedAt: "2026-08-22T10:22:00+10:00",
    note: null,
  },
  {
    id: "SW-1042",
    eventId: "event_001",
    resourceId: "resource_001",
    status: "ongoing",
    plannedStart: 12 * 60,
    plannedEnd: 14 * 60,
    actualStart: 12 * 60 + 6,
    actualEnd: null,
    energyKwh: 5.2,
    requestedAt: "2026-08-22T10:15:00+10:00",
    decidedAt: "2026-08-22T10:24:00+10:00",
    note: null,
  },
  {
    id: "SW-1043",
    eventId: "event_001",
    resourceId: "resource_002",
    status: "ongoing",
    plannedStart: 12 * 60 + 30,
    plannedEnd: 14 * 60 + 30,
    actualStart: 12 * 60 + 34,
    actualEnd: null,
    energyKwh: 14.4,
    requestedAt: "2026-08-22T10:15:00+10:00",
    decidedAt: "2026-08-22T10:31:00+10:00",
    note: null,
  },
  {
    id: "SW-1044",
    eventId: "event_001",
    resourceId: "resource_004",
    status: "waiting",
    plannedStart: 13 * 60,
    plannedEnd: 15 * 60,
    actualStart: null,
    actualEnd: null,
    energyKwh: 10,
    requestedAt: "2026-08-22T11:02:00+10:00",
    decidedAt: null,
    note: null,
  },
  {
    id: "SW-1045",
    eventId: "event_001",
    resourceId: "resource_006",
    status: "cancelled",
    plannedStart: 12 * 60,
    plannedEnd: 14 * 60,
    actualStart: null,
    actualEnd: null,
    energyKwh: 9.6,
    requestedAt: "2026-08-22T10:15:00+10:00",
    decidedAt: "2026-08-22T10:29:00+10:00",
    note: "SWITCH_WINDOW_CONFLICT",
  },
];

export function findSite(resourceId: string): DispatchSite | undefined {
  return dispatchSites.find((site) => site.resourceId === resourceId);
}

export function findArea(areaId: string): DispatchArea | undefined {
  return dispatchAreas.find((area) => area.id === areaId);
}

/** 750 becomes "12:30 pm". */
export function formatClock(minutes: number): string {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour24 >= 12 ? "pm" : "am";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

/** 145 becomes "2h 25m". */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  if (!rest) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/** Position on the 10 am to 4 pm track, clamped to the visible day. */
export function trackPercent(minutes: number): number {
  const span = DISPATCH_DAY_END - DISPATCH_DAY_START;
  const clamped = Math.min(
    Math.max(minutes, DISPATCH_DAY_START),
    DISPATCH_DAY_END,
  );
  return ((clamped - DISPATCH_DAY_START) / span) * 100;
}

/** True when the switch is actually moving load at `now`. */
export function isSwitchingAt(
  assignment: DispatchAssignment,
  now: number,
): boolean {
  if (assignment.status !== "ongoing") return false;
  const start = assignment.actualStart ?? assignment.plannedStart;
  const end = assignment.actualEnd ?? assignment.plannedEnd;
  return now >= start && now <= end;
}
