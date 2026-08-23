"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DISPATCH_DEFAULT_NOW, formatDuration } from "@/lib/data/dispatch";
import { reset, useAssignments } from "@/lib/dispatch/store";
import {
  buildRows,
  countByStatus,
  dispatchFilters,
  filterRows,
  totalise,
  type DispatchFilter,
} from "@/lib/dispatch/view";
import { DispatchLog } from "./dispatch-log";
import { DispatchMap } from "./dispatch-map";
import { DispatchTimeline } from "./dispatch-timeline";

/**
 * The dispatch planner: who is switching, where, and when. Council assigns
 * from an event; retailers and battery owners answer; this is where the answer
 * shows up.
 */
export function DispatchConsole() {
  const assignments = useAssignments();
  const [now, setNow] = useState(DISPATCH_DEFAULT_NOW);
  const [filter, setFilter] = useState<DispatchFilter>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(true);

  const rows = useMemo(() => buildRows(assignments, now), [assignments, now]);
  const counts = useMemo(() => countByStatus(rows), [rows]);
  const totals = useMemo(() => totalise(rows, now), [rows, now]);
  const visible = useMemo(() => filterRows(rows, filter), [rows, filter]);
  const activeId = hoveredId ?? selectedId;
  const completePercent = rows.length
    ? Math.round((counts.completed / rows.length) * 100)
    : 0;

  return (
    <section
      aria-label="Dispatch planner"
      className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
    >
      <div className="flex flex-wrap items-stretch justify-between gap-4 border-b border-[var(--border)] px-4 py-3">
        <div
          role="tablist"
          aria-label="Filter switches by status"
          className="flex flex-wrap gap-1"
        >
          {dispatchFilters.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item.id)}
                className={`min-w-24 cursor-pointer rounded-xl border-b-[3px] px-3 py-1.5 text-left transition-colors ${active ? "border-b-[var(--council-ink)] bg-[var(--surface-muted)]" : "border-b-transparent hover:bg-[var(--surface-muted)]"}`}
              >
                <span className="block font-mono text-2xl font-semibold">
                  {counts[item.id]}
                </span>
                <span
                  className={`block text-xs font-semibold ${active ? "text-[var(--council-ink)]" : "text-[var(--muted)]"}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 self-center pr-1">
          <Metric
            value={`${totals.deliveredKwh.toFixed(1)}/${totals.scheduledKwh.toFixed(1)}`}
            unit="kWh"
            label="Energy shifted"
          />
          <Metric
            value={formatDuration(totals.elapsedMinutes)}
            unit={`/${formatDuration(totals.plannedMinutes)}`}
            label="Switch time"
          />
          <Metric
            value={`${totals.activeDevices}/${totals.totalDevices}`}
            unit="live"
            label="Devices"
          />
        </dl>
      </div>

      <div
        className={`grid min-h-[26rem] ${logOpen ? "lg:grid-cols-[20rem_minmax(0,1fr)]" : "lg:grid-cols-[3rem_minmax(0,1fr)]"}`}
      >
        {logOpen ? (
          <div className="border-b border-[var(--border)] lg:max-h-[32rem] lg:border-r lg:border-b-0">
            <DispatchLog
              rows={visible}
              now={now}
              completePercent={completePercent}
              activeId={activeId}
              onActivate={setHoveredId}
              onSelect={(id) =>
                setSelectedId((current) => (current === id ? null : id))
              }
              onCollapse={() => setLogOpen(false)}
            />
          </div>
        ) : (
          <div className="flex items-start justify-center border-b border-[var(--border)] py-3 lg:border-r lg:border-b-0">
            <button
              type="button"
              onClick={() => setLogOpen(true)}
              aria-label="Expand activity log"
              className="grid size-8 cursor-pointer place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-muted)]"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        )}

        <div className="p-3 lg:max-h-[32rem]">
          <DispatchMap
            rows={visible}
            now={now}
            activeId={activeId}
            onActivate={setHoveredId}
            onSelect={(id) =>
              setSelectedId((current) => (current === id ? null : id))
            }
          />
        </div>
      </div>

      <DispatchTimeline
        rows={visible}
        now={now}
        onNowChange={setNow}
        activeId={activeId}
        onActivate={setHoveredId}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-xs text-[var(--muted)]">
        <p>
          Hover a pin, a log row or a bar to see what is switching. Switch data
          is simulated.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {counts.waiting > 0 && (
            <Link
              href="/retailer"
              className="font-semibold text-teal-800 hover:underline"
            >
              {counts.waiting} awaiting retailer →
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              reset();
              setSelectedId(null);
            }}
            className="cursor-pointer rounded-full border border-[var(--border)] bg-white px-3 py-1 font-semibold hover:bg-[var(--surface-muted)]"
          >
            Reset demo state
          </button>
        </div>
      </div>
    </section>
  );
}

function Metric({
  value,
  unit,
  label,
}: Readonly<{ value: string; unit: string; label: string }>) {
  return (
    <div>
      <dd className="font-mono text-lg font-semibold">
        {value}
        <span className="ml-1 text-xs font-normal text-[var(--muted)]">
          {unit}
        </span>
      </dd>
      <dt className="text-xs text-[var(--muted)]">{label}</dt>
    </div>
  );
}
