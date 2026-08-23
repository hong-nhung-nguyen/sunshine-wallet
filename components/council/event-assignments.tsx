"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { findSite, formatClock } from "@/lib/data/dispatch";
import { useAssignments } from "@/lib/dispatch/store";
import { describeNote, statusLabels } from "@/lib/dispatch/view";
import { statusStyles } from "./dispatch-style";

/** What Council has assigned for this event, and how each partner answered. */
export function EventAssignments({ eventId }: Readonly<{ eventId: string }>) {
  const assignments = useAssignments();
  const rows = assignments
    .filter((assignment) => assignment.eventId === eventId)
    .flatMap((assignment) => {
      const site = findSite(assignment.resourceId);
      return site ? [{ assignment, site }] : [];
    })
    .sort((a, b) => a.assignment.plannedStart - b.assignment.plannedStart);

  const waiting = rows.filter(
    (row) => row.assignment.status === "waiting",
  ).length;

  return (
    <Card className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
            Dispatch
          </p>
          <h2 className="mt-2 text-xl font-semibold">Switch assignments</h2>
        </div>
        {waiting > 0 && (
          <Link
            href="/retailer"
            className="text-sm font-semibold text-teal-800"
          >
            {waiting} awaiting retailer →
          </Link>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-6">
          <p className="font-semibold">Nobody assigned yet</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Use <b>Assign</b> above to choose which retailer or battery owner
            switches in this window. Each request has to be approved by that
            partner before anything moves.
          </p>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {rows.map(({ assignment, site }) => {
            const note = describeNote(assignment.note);
            return (
              <li
                key={assignment.id}
                className="rounded-2xl border border-[var(--border)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{site.name}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {site.party === "retailer" ? "Retailer" : "Battery owner"}{" "}
                      · {site.partyName}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-[var(--muted)]">
                    {assignment.id}
                  </span>
                </div>
                <p className="mt-3 font-mono text-sm">
                  {formatClock(assignment.plannedStart)} –{" "}
                  {formatClock(assignment.plannedEnd)} · {assignment.energyKwh}{" "}
                  kWh
                </p>
                <span
                  className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[assignment.status].chip}`}
                >
                  {statusLabels[assignment.status]}
                  {note ? ` · ${note}` : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
