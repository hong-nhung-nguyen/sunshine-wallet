"use client";

import { useSyncExternalStore } from "react";
import { seedAssignments, type DispatchAssignment } from "@/lib/data/dispatch";

/**
 * Demo dispatch state, shared by the council console and the retailer inbox.
 *
 * Deliberately browser-local: the hackathon MVP has no persistence layer, and
 * both personas are demonstrated in the same browser. An external store keeps
 * the server snapshot (the seed) and the client snapshot (localStorage) apart,
 * so hydration never disagrees with itself, and a second tab stays in step.
 *
 * Nothing here decides anything — Council assigns, the partner answers, and
 * the console renders the result.
 */

const STORAGE_KEY = "sunshine-wallet.dispatch.v1";

const serverSnapshot: DispatchAssignment[] = [...seedAssignments];
let snapshot: DispatchAssignment[] = serverSnapshot;
let restored = false;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function isAssignment(value: unknown): value is DispatchAssignment {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DispatchAssignment>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.resourceId === "string" &&
    typeof candidate.plannedStart === "number"
  );
}

function readStored(): DispatchAssignment[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isAssignment)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // A demo that cannot persist still has to keep running.
  }
}

function commit(next: DispatchAssignment[]) {
  snapshot = next;
  persist();
  emit();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  const stored = readStored();
  if (!stored) return;
  snapshot = stored;
  emit();
}

function subscribe(listener: () => void) {
  if (!restored) {
    restored = true;
    const stored = readStored();
    if (stored) snapshot = stored;
  }
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return serverSnapshot;
}

function nextId(assignments: readonly DispatchAssignment[], offset: number) {
  const highest = assignments.reduce((max, assignment) => {
    const parsed = Number.parseInt(assignment.id.replace(/\D/g, ""), 10);
    return Number.isNaN(parsed) ? max : Math.max(max, parsed);
  }, 1040);
  return `SW-${highest + offset + 1}`;
}

export interface AssignInput {
  eventId: string;
  resourceIds: readonly string[];
  plannedStart: number;
  plannedEnd: number;
  energyByResource: Readonly<Record<string, number>>;
}

/** Council sends switch requests. They start life waiting on the partner. */
export function assign(input: AssignInput): string[] {
  const created: string[] = [];
  const additions = input.resourceIds.map((resourceId, index) => {
    const id = nextId(snapshot, index);
    created.push(id);
    return {
      id,
      eventId: input.eventId,
      resourceId,
      status: "waiting" as const,
      plannedStart: input.plannedStart,
      plannedEnd: input.plannedEnd,
      actualStart: null,
      actualEnd: null,
      energyKwh: input.energyByResource[resourceId] ?? 0,
      requestedAt: new Date().toISOString(),
      decidedAt: null,
      note: null,
    };
  });
  commit([...snapshot, ...additions]);
  return created;
}

/** The partner agrees; the switch is scheduled and becomes visible on the map. */
export function approve(id: string) {
  commit(
    snapshot.map((assignment) =>
      assignment.id === id
        ? {
            ...assignment,
            status: "ongoing" as const,
            // Partners confirm on the planned edge, then report actuals.
            actualStart: assignment.plannedStart + 4,
            decidedAt: new Date().toISOString(),
            note: null,
          }
        : assignment,
    ),
  );
}

/** The partner refuses, with a reason the operator can read. */
export function decline(id: string, reason: string) {
  commit(
    snapshot.map((assignment) =>
      assignment.id === id
        ? {
            ...assignment,
            status: "cancelled" as const,
            decidedAt: new Date().toISOString(),
            note: reason,
          }
        : assignment,
    ),
  );
}

/** Back to the deterministic starting state. */
export function reset() {
  commit([...seedAssignments]);
}

export function useAssignments(): DispatchAssignment[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
