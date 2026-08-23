"use client";

import {
  DISPATCH_DATE_LABEL,
  dispatchHomebase,
  formatClock,
} from "@/lib/data/dispatch";
import {
  describeNote,
  statusLabels,
  type DispatchRow,
} from "@/lib/dispatch/view";
import { statusStyles } from "./dispatch-style";

interface DispatchLogProps {
  rows: readonly DispatchRow[];
  now: number;
  completePercent: number;
  activeId: string | null;
  onActivate: (id: string | null) => void;
  onSelect: (id: string) => void;
  onCollapse: () => void;
}

/** The operator's running record of the switching day, newest window last. */
export function DispatchLog({
  rows,
  now,
  completePercent,
  activeId,
  onActivate,
  onSelect,
  onCollapse,
}: DispatchLogProps) {
  const scheduledKwh = rows
    .filter((row) => row.assignment.status !== "cancelled")
    .reduce((total, row) => total + row.assignment.energyKwh, 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3.5">
        <div>
          <p className="text-sm font-semibold">Activity log</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {completePercent}% complete
          </p>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Collapse activity log"
          className="grid size-8 cursor-pointer place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-muted)]"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3 text-sm font-semibold">
          <svg
            viewBox="0 0 24 24"
            className="size-4 text-[var(--muted)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          {DISPATCH_DATE_LABEL}
        </div>

        <LogRow
          marker={<span className="size-3 rounded-full bg-[#0f766e]" />}
          title="Window opens"
          lines={[`Confirmed ${formatClock(12 * 60)}`]}
        />
        <LogRow
          marker={
            <span className="grid size-3.5 place-items-center rounded-[3px] bg-[#112f35]">
              <span className="size-1.5 rounded-[1px] bg-[#f2b84b]" />
            </span>
          }
          title={dispatchHomebase.name}
          lines={[
            `${rows.length} assignments`,
            `${scheduledKwh.toFixed(1)} kWh scheduled`,
            dispatchHomebase.address,
          ]}
        />

        {rows.map((row) => {
          const { assignment, site, area, stop, switching } = row;
          const style = statusStyles[assignment.status];
          const active = assignment.id === activeId;
          const note = describeNote(assignment.note);
          return (
            <button
              key={assignment.id}
              type="button"
              onMouseEnter={() => onActivate(assignment.id)}
              onMouseLeave={() => onActivate(null)}
              onFocus={() => onActivate(assignment.id)}
              onBlur={() => onActivate(null)}
              onClick={() => onSelect(assignment.id)}
              className={`flex w-full cursor-pointer gap-3 border-b border-[var(--border)] px-4 py-3.5 text-left transition-colors ${active ? "bg-[var(--surface-muted)]" : "hover:bg-[var(--surface-muted)]"}`}
            >
              <span className="mt-1 flex flex-col items-center gap-1">
                <span
                  className={`grid size-5 place-items-center rounded-full text-[10px] font-bold ring-4 ${style.dot} ${assignment.status === "waiting" ? "border-2 border-[#b45309] text-[#b45309]" : assignment.status === "ongoing" ? "text-[#112f35]" : "text-white"}`}
                >
                  {stop}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">
                    {site.name}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--muted)]">
                    {assignment.id}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-[var(--muted)]">
                  {site.deviceType} · {site.partyName}
                </span>
                <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                  <span className="font-mono">
                    {formatClock(
                      assignment.actualStart ?? assignment.plannedStart,
                    )}
                  </span>
                  <span className="font-mono">{assignment.energyKwh} kWh</span>
                  <span className="truncate">{area.name}</span>
                </span>
                <span
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.chip}`}
                >
                  {switching
                    ? `Switching now · ${formatClock(now)}`
                    : statusLabels[assignment.status]}
                  {note ? ` · ${note}` : ""}
                </span>
              </span>
            </button>
          );
        })}

        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
            No switches match this filter.
          </p>
        )}
      </div>
    </div>
  );
}

function LogRow({
  marker,
  title,
  lines,
}: Readonly<{ marker: React.ReactNode; title: string; lines: string[] }>) {
  return (
    <div className="flex gap-3 border-b border-[var(--border)] px-4 py-3.5">
      <span className="mt-1.5 flex w-5 justify-center">{marker}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {lines.map((line) => (
          <p key={line} className="mt-1 truncate text-xs text-[var(--muted)]">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
