"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { dispatchSites, formatClock } from "@/lib/data/dispatch";
import { assign, useAssignments } from "@/lib/dispatch/store";
import { statusLabels } from "@/lib/dispatch/view";
import { statusStyles } from "./dispatch-style";

interface AssignSwitchPanelProps {
  eventId: string;
  /** ISO window from the event record, used to prefill the switch window. */
  windowStart: string;
  windowEnd: string;
  targetFlexEnergyKwh: number;
}

function isoToTimeValue(iso: string): string {
  const match = /T(\d{2}):(\d{2})/.exec(iso);
  return match ? `${match[1]}:${match[2]}` : "12:00";
}

function timeValueToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Council picks which retailer or battery owner will switch, and sends the
 * request. Nothing switches until the other side agrees — approval is theirs,
 * not ours.
 */
export function AssignSwitchPanel({
  eventId,
  windowStart,
  windowEnd,
  targetFlexEnergyKwh,
}: AssignSwitchPanelProps) {
  const assignments = useAssignments();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [startValue, setStartValue] = useState(isoToTimeValue(windowStart));
  const [endValue, setEndValue] = useState(isoToTimeValue(windowEnd));
  const [sentTo, setSentTo] = useState<string[] | null>(null);

  const existing = useMemo(() => {
    const map = new Map<string, (typeof assignments)[number]>();
    for (const assignment of assignments) {
      if (assignment.eventId !== eventId) continue;
      if (assignment.status === "cancelled" && map.has(assignment.resourceId))
        continue;
      map.set(assignment.resourceId, assignment);
    }
    return map;
  }, [assignments, eventId]);

  const assignable = dispatchSites.filter((site) => {
    const current = existing.get(site.resourceId);
    return !current || current.status === "cancelled";
  });

  const selectedKwh = selected.reduce((total, resourceId) => {
    const site = dispatchSites.find((item) => item.resourceId === resourceId);
    return total + (site?.capacityKwh ?? 0);
  }, 0);

  const start = timeValueToMinutes(startValue);
  const end = timeValueToMinutes(endValue);
  const windowValid = end > start;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function confirm() {
    if (!selected.length || !windowValid) return;
    const energyByResource = Object.fromEntries(
      selected.map((resourceId) => [
        resourceId,
        dispatchSites.find((item) => item.resourceId === resourceId)
          ?.capacityKwh ?? 0,
      ]),
    );
    assign({
      eventId,
      resourceIds: selected,
      plannedStart: start,
      plannedEnd: end,
      energyByResource,
    });
    const parties = Array.from(
      new Set(
        selected.map(
          (resourceId) =>
            dispatchSites.find((item) => item.resourceId === resourceId)
              ?.partyName ?? "",
        ),
      ),
    ).filter(Boolean);
    setSentTo(parties);
    setSelected([]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setSentTo(null);
        }}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[var(--council-accent)] px-5 text-sm font-bold text-[var(--council-ink)] hover:brightness-95"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M4 12h12M12 5l7 7-7 7" />
        </svg>
        Assign
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-title"
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent-strong,#956000)] uppercase">
                  Dispatch assignment
                </p>
                <h2 id="assign-title" className="mt-2 text-2xl font-semibold">
                  Assign who switches
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-9 cursor-pointer place-items-center rounded-full border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-muted)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {sentTo ? (
              <div className="mt-6">
                <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
                  <p className="text-sm font-semibold text-teal-900">
                    Switch request sent to {sentTo.join(", ")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-teal-950">
                    Each request sits at <b>Awaiting retailer</b> until the
                    other side approves it. Approved switches appear live on the
                    overview map for the window you set.
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/retailer"
                    className="inline-flex min-h-11 items-center rounded-full bg-[var(--council-ink)] px-5 text-sm font-semibold text-white"
                  >
                    Open retailer inbox →
                  </Link>
                  <Link
                    href="/council"
                    className="inline-flex min-h-11 items-center rounded-full border border-[var(--border)] px-5 text-sm font-semibold hover:bg-[var(--surface-muted)]"
                  >
                    Back to overview
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSentTo(null)}
                    className="inline-flex min-h-11 cursor-pointer items-center px-2 text-sm font-semibold text-teal-800"
                  >
                    Assign more
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-5 grid gap-4 rounded-2xl bg-[var(--surface-muted)] p-4 sm:grid-cols-3">
                  <label className="text-xs font-semibold text-[var(--muted)]">
                    Switch starts
                    <input
                      type="time"
                      value={startValue}
                      onChange={(event) => setStartValue(event.target.value)}
                      className="mt-1.5 block w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 font-mono text-sm text-[var(--foreground)]"
                    />
                  </label>
                  <label className="text-xs font-semibold text-[var(--muted)]">
                    Switch ends
                    <input
                      type="time"
                      value={endValue}
                      onChange={(event) => setEndValue(event.target.value)}
                      className="mt-1.5 block w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 font-mono text-sm text-[var(--foreground)]"
                    />
                  </label>
                  <div className="text-xs font-semibold text-[var(--muted)]">
                    Selected
                    <p className="mt-1.5 font-mono text-lg font-semibold text-[var(--foreground)]">
                      {selectedKwh.toFixed(1)} / {targetFlexEnergyKwh} kWh
                    </p>
                    <p className="mt-0.5 text-[11px] font-normal">
                      against event target
                    </p>
                  </div>
                </div>
                {!windowValid && (
                  <p className="mt-2 text-xs font-semibold text-rose-700">
                    The switch must end after it starts.
                  </p>
                )}

                <ul className="mt-4 space-y-2">
                  {dispatchSites.map((site) => {
                    const current = existing.get(site.resourceId);
                    const locked =
                      Boolean(current) && !assignable.includes(site);
                    const checked = selected.includes(site.resourceId);
                    return (
                      <li key={site.resourceId}>
                        <label
                          className={`flex items-start gap-3 rounded-2xl border p-4 ${locked ? "border-[var(--border)] bg-[var(--surface-muted)] opacity-70" : checked ? "cursor-pointer border-[var(--council-accent)] bg-amber-50" : "cursor-pointer border-[var(--border)] hover:bg-[var(--surface-muted)]"}`}
                        >
                          <input
                            type="checkbox"
                            disabled={locked}
                            checked={checked}
                            onChange={(event) =>
                              setSelected((current) =>
                                event.target.checked
                                  ? [...current, site.resourceId]
                                  : current.filter(
                                      (id) => id !== site.resourceId,
                                    ),
                              )
                            }
                            className="mt-1 size-4 accent-[var(--council-ink)]"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold">
                                {site.name}
                              </span>
                              <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
                                {site.party === "retailer"
                                  ? "Retailer"
                                  : "Battery owner"}{" "}
                                · {site.partyName}
                              </span>
                            </span>
                            <span className="mt-1 block text-xs text-[var(--muted)]">
                              {site.deviceType} · {site.capacityKwh} kWh ·{" "}
                              {site.powerKw} kW · {site.address}
                            </span>
                            {current && (
                              <span
                                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyles[current.status].chip}`}
                              >
                                {current.id} · {statusLabels[current.status]}
                              </span>
                            )}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                  <p className="text-xs text-[var(--muted)]">
                    {selected.length} selected ·{" "}
                    {windowValid
                      ? `${formatClock(start)} – ${formatClock(end)}`
                      : "invalid window"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="min-h-11 cursor-pointer rounded-full border border-[var(--border)] px-5 text-sm font-semibold hover:bg-[var(--surface-muted)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirm}
                      disabled={!selected.length || !windowValid}
                      className="min-h-11 cursor-pointer rounded-full bg-[var(--council-ink)] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Confirm and send request
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
