"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  DISPATCH_DATE_LABEL,
  findSite,
  formatClock,
  formatDuration,
} from "@/lib/data/dispatch";
import { approve, decline, useAssignments } from "@/lib/dispatch/store";
import { describeNote, refusalLabels, statusLabels } from "@/lib/dispatch/view";
import { statusStyles } from "@/components/council/dispatch-style";

const declineReasons = Object.keys(refusalLabels);

/**
 * The other side of the request. A retailer or battery owner sees what Council
 * asked for and answers it — approving is what puts a switch on the map, and
 * refusing has to stay just as easy.
 */
export function RetailerInbox() {
  const assignments = useAssignments();
  const [party, setParty] = useState<string>("all");
  const [declining, setDeclining] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      assignments
        .flatMap((assignment) => {
          const site = findSite(assignment.resourceId);
          return site ? [{ assignment, site }] : [];
        })
        .sort((a, b) => a.assignment.plannedStart - b.assignment.plannedStart),
    [assignments],
  );

  const parties = useMemo(
    () => Array.from(new Set(rows.map((row) => row.site.partyName))).sort(),
    [rows],
  );

  const visible =
    party === "all" ? rows : rows.filter((row) => row.site.partyName === party);
  const pending = visible.filter((row) => row.assignment.status === "waiting");
  const decided = visible.filter((row) => row.assignment.status !== "waiting");

  return (
    <div className="mx-auto max-w-4xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--primary)]">
            Partner console · {DISPATCH_DATE_LABEL}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Switch requests
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Council has asked to move these loads into the surplus window.
            Approving schedules the switch; refusing returns a reason.
          </p>
        </div>
        <Link
          href="/council"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--border)] px-5 text-sm font-semibold hover:bg-white"
        >
          Council overview →
        </Link>
      </header>

      <div
        className="mt-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by party"
      >
        {["all", ...parties].map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setParty(name)}
            aria-pressed={party === name}
            className={`min-h-10 cursor-pointer rounded-full px-4 text-sm font-semibold transition-colors ${party === name ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] bg-white hover:bg-[var(--surface-muted)]"}`}
          >
            {name === "all" ? "All partners" : name}
          </button>
        ))}
      </div>

      <h2 className="mt-7 text-lg font-semibold">
        Awaiting your decision ({pending.length})
      </h2>
      {pending.length === 0 ? (
        <Card className="mt-3">
          <p className="text-sm text-[var(--muted)]">
            Nothing waiting. New requests appear here the moment Council assigns
            a switch.
          </p>
        </Card>
      ) : (
        <ul className="mt-3 space-y-3">
          {pending.map(({ assignment, site }) => (
            <li key={assignment.id}>
              <Card className="border-l-4 border-l-[var(--accent)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{site.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {site.deviceType} · {site.partyName} · {site.address}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[var(--muted)]">
                    {assignment.id} · {assignment.eventId}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-[var(--muted)]">Window</dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {formatClock(assignment.plannedStart)} –{" "}
                      {formatClock(assignment.plannedEnd)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--muted)]">Duration</dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {formatDuration(
                        assignment.plannedEnd - assignment.plannedStart,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--muted)]">Energy</dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {assignment.energyKwh} kWh
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--muted)]">Max power</dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {site.powerKw} kW
                    </dd>
                  </div>
                </dl>

                {declining === assignment.id ? (
                  <div className="mt-4 rounded-2xl bg-[var(--surface-muted)] p-4">
                    <p className="text-sm font-semibold">
                      Why can this switch not run?
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {declineReasons.map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => {
                            decline(assignment.id, reason);
                            setDeclining(null);
                          }}
                          className="min-h-10 cursor-pointer rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold hover:bg-rose-50"
                        >
                          {refusalLabels[reason]}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setDeclining(null)}
                        className="min-h-10 cursor-pointer px-3 text-sm font-semibold text-[var(--muted)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => approve(assignment.id)}
                      className="min-h-11 cursor-pointer rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--primary-strong)]"
                    >
                      Approve switch
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeclining(assignment.id)}
                      className="min-h-11 cursor-pointer rounded-full border border-[var(--border)] px-5 text-sm font-semibold hover:bg-[var(--surface-muted)]"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-lg font-semibold">Decided ({decided.length})</h2>
      <Card className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="border-b border-[var(--border)] text-xs text-[var(--muted)]">
            <tr>
              <th className="pb-3 font-medium">Request</th>
              <th className="pb-3 font-medium">Device</th>
              <th className="pb-3 font-medium">Window</th>
              <th className="pb-3 text-right font-medium">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {decided.map(({ assignment, site }) => {
              const note = describeNote(assignment.note);
              return (
                <tr
                  key={assignment.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="py-3.5 font-mono text-xs">{assignment.id}</td>
                  <td className="py-3.5">
                    <p className="font-semibold">{site.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {site.partyName}
                    </p>
                  </td>
                  <td className="py-3.5 font-mono text-xs">
                    {formatClock(assignment.plannedStart)} –{" "}
                    {formatClock(assignment.plannedEnd)}
                  </td>
                  <td className="py-3.5 text-right">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[assignment.status].chip}`}
                    >
                      {statusLabels[assignment.status]}
                    </span>
                    {note && (
                      <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>
                    )}
                  </td>
                </tr>
              );
            })}
            {decided.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-6 text-center text-[var(--muted)]"
                >
                  No decisions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <p className="mt-6 text-xs leading-5 text-[var(--muted)]">
        Demonstration only. This console stands in for a partner retailer&apos;s
        own systems; no request here reaches a real retailer, meter or customer.
      </p>
    </div>
  );
}
