"use client";

import {
  DISPATCH_DAY_END,
  DISPATCH_DAY_START,
  formatClock,
  trackPercent,
} from "@/lib/data/dispatch";
import { statusLabels, type DispatchRow } from "@/lib/dispatch/view";
import { statusStyles } from "./dispatch-style";

const HOURS = [10, 11, 12, 13, 14, 15, 16];

interface DispatchTimelineProps {
  rows: readonly DispatchRow[];
  now: number;
  onNowChange: (minutes: number) => void;
  activeId: string | null;
  onActivate: (id: string | null) => void;
}

/**
 * Planned against executed, on one 10 am – 4 pm track. The scrubber moves the
 * console's simulated clock: the event day is fixed demo data, so "now" is a
 * position the operator chooses rather than the wall clock.
 */
export function DispatchTimeline({
  rows,
  now,
  onNowChange,
  activeId,
  onActivate,
}: DispatchTimelineProps) {
  const executed = rows.filter((row) => row.assignment.actualStart !== null);
  const planned = rows.filter((row) => row.assignment.status !== "cancelled");

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4">
      <div className="flex flex-wrap items-center gap-4">
        <label
          htmlFor="dispatch-clock"
          className="text-xs font-bold tracking-[0.12em] text-[var(--muted)] uppercase"
        >
          Console time
        </label>
        <input
          id="dispatch-clock"
          type="range"
          min={DISPATCH_DAY_START}
          max={DISPATCH_DAY_END}
          step={5}
          value={now}
          onChange={(event) => onNowChange(Number(event.target.value))}
          className="h-2 min-w-40 flex-1 cursor-pointer accent-[var(--council-ink)]"
        />
        <output
          htmlFor="dispatch-clock"
          className="rounded-full bg-[var(--council-ink)] px-3 py-1 font-mono text-xs font-semibold text-white"
        >
          {formatClock(now)}
        </output>
      </div>

      <div className="mt-4 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-2">
        <span />
        <div className="relative h-4">
          {HOURS.map((hour) => (
            <span
              key={hour}
              className="absolute -translate-x-1/2 text-[11px] text-[var(--muted)]"
              style={{ left: `${trackPercent(hour * 60)}%` }}
            >
              {hour > 12
                ? `${hour - 12} PM`
                : hour === 12
                  ? "12 PM"
                  : `${hour} AM`}
            </span>
          ))}
        </div>

        <TrackLabel label="Executed" tone="solid" />
        <Track
          rows={executed}
          now={now}
          activeId={activeId}
          onActivate={onActivate}
          variant="executed"
        />

        <TrackLabel label="Planned" tone="dashed" />
        <Track
          rows={planned}
          now={now}
          activeId={activeId}
          onActivate={onActivate}
          variant="planned"
        />
      </div>
    </div>
  );
}

function TrackLabel({
  label,
  tone,
}: Readonly<{ label: string; tone: "solid" | "dashed" }>) {
  return (
    <span className="flex items-center gap-2 self-center text-xs font-semibold">
      <span
        aria-hidden="true"
        className={`h-0.5 w-6 ${tone === "solid" ? "bg-[#0f766e]" : "bg-slate-400"}`}
      />
      {label}
    </span>
  );
}

function Track({
  rows,
  now,
  activeId,
  onActivate,
  variant,
}: Readonly<{
  rows: readonly DispatchRow[];
  now: number;
  activeId: string | null;
  onActivate: (id: string | null) => void;
  variant: "executed" | "planned";
}>) {
  return (
    <div className="relative h-11 rounded-lg bg-[var(--surface-muted)]">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 z-10 w-px bg-[var(--council-ink)]"
        style={{ left: `${trackPercent(now)}%` }}
      />
      {rows.map((row) => {
        const { assignment, stop } = row;
        const start =
          variant === "executed"
            ? (assignment.actualStart ?? assignment.plannedStart)
            : assignment.plannedStart;
        const rawEnd =
          variant === "executed"
            ? (assignment.actualEnd ??
              Math.min(assignment.plannedEnd, Math.max(now, start)))
            : assignment.plannedEnd;
        const left = trackPercent(start);
        const width = Math.max(trackPercent(rawEnd) - left, 0.6);
        const active = assignment.id === activeId;
        return (
          <button
            key={`${variant}-${assignment.id}`}
            type="button"
            onMouseEnter={() => onActivate(assignment.id)}
            onMouseLeave={() => onActivate(null)}
            onFocus={() => onActivate(assignment.id)}
            onBlur={() => onActivate(null)}
            title={`${stop}. ${row.site.name} — ${formatClock(start)} to ${formatClock(rawEnd)} — ${statusLabels[assignment.status]}`}
            className={`absolute top-1/2 flex h-6 -translate-y-1/2 cursor-pointer items-center rounded-full px-1 transition-opacity ${
              variant === "executed"
                ? assignment.status === "completed"
                  ? "bg-[#0f766e]"
                  : "bg-[#f2b84b]"
                : "bg-slate-300"
            } ${active ? "opacity-100 ring-2 ring-[var(--council-ink)]" : "opacity-90"}`}
            style={{ left: `${left}%`, width: `${width}%` }}
          >
            <span
              className={`grid size-4 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                variant === "executed"
                  ? "bg-white text-[var(--council-ink)]"
                  : "bg-white text-slate-600"
              }`}
            >
              {stop}
            </span>
          </button>
        );
      })}
      {rows.length === 0 && (
        <span className="absolute inset-0 grid place-items-center text-[11px] text-[var(--muted)]">
          Nothing {variant === "executed" ? "executed" : "planned"} in this view
        </span>
      )}
      <span
        aria-hidden="true"
        className={`absolute -top-1 z-10 size-2 -translate-x-1/2 rotate-45 ${statusStyles.ongoing.dot}`}
        style={{ left: `${trackPercent(now)}%` }}
      />
    </div>
  );
}
