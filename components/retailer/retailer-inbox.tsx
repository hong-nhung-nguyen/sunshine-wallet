"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { findSite, formatClock, formatDuration } from "@/lib/data/dispatch";
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
  // Sections are open by default: these are items awaiting action, so
  // hiding them behind a closed dropdown would bury the work.
  const [collapsed, setCollapsed] = useState<string[]>([]);

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

  /**
   * A retailer thinks in customers, not assignment ids. Requests are grouped
   * under the company that has to act, with the devices behind a dropdown.
   */
  const pendingByCompany = useMemo(() => {
    const byName = new Map<string, typeof pending>();
    for (const row of pending) {
      const list = byName.get(row.site.partyName) ?? [];
      list.push(row);
      byName.set(row.site.partyName, list);
    }
    return [...byName.entries()]
      .map(([name, requests]) => ({ name, requests }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [pending]);

  return (
    <div>
      <p className="text-sm text-[var(--muted)]">
        Council has asked to move these loads into the surplus window. Approving
        schedules the switch; refusing returns a reason.
      </p>

      <div
        className="mt-5 flex flex-wrap gap-2"
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
          {pendingByCompany.map(({ name, requests }) => {
            const isOpen = !collapsed.includes(name);
            const totalKwh = requests.reduce(
              (sum, row) => sum + row.assignment.energyKwh,
              0,
            );
            const panelId = `requests-${name.replace(/\s+/g, "-")}`;
            return (
              <li key={name}>
                <Card className="border-l-4 border-l-[var(--accent)] p-0">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <button
                      type="button"
                      onClick={() =>
                        setCollapsed((current) =>
                          isOpen
                            ? [...current, name]
                            : current.filter((item) => item !== name),
                        )
                      }
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                    >
                      <span
                        aria-hidden="true"
                        className={`shrink-0 text-lg text-[var(--muted)] transition-transform ${isOpen ? "rotate-90" : ""}`}
                      >
                        &rsaquo;
                      </span>
                      <span className="min-w-0">
                        <span className="block text-lg font-semibold">
                          {name}
                        </span>
                        <span className="mt-1 block text-sm text-[var(--muted)]">
                          {requests.length} switch
                          {requests.length === 1 ? "" : "es"} awaiting ·{" "}
                          {totalKwh.toFixed(1)} kWh
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        for (const row of requests) approve(row.assignment.id);
                      }}
                      className="min-h-11 cursor-pointer rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--primary-strong)]"
                    >
                      Approve all {requests.length}
                    </button>
                  </div>

                  {isOpen && (
                    <ul
                      id={panelId}
                      className="space-y-3 border-t border-[var(--border)] bg-[var(--surface-muted)]/50 p-4"
                    >
                      {requests.map(({ assignment, site }) => (
                        <li
                          key={assignment.id}
                          className="rounded-2xl border border-[var(--border)] bg-white p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold">{site.name}</p>
                              <p className="mt-1 text-sm text-[var(--muted)]">
                                {site.deviceType} · {site.address}
                              </p>
                            </div>
                            <span className="font-mono text-xs text-[var(--muted)]">
                              {assignment.id}
                            </span>
                          </div>
                          <dl className="mt-3 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-3 sm:grid-cols-4">
                            <div>
                              <dt className="text-xs text-[var(--muted)]">
                                Window
                              </dt>
                              <dd className="mt-1 font-mono text-sm font-semibold">
                                {formatClock(assignment.plannedStart)} –{" "}
                                {formatClock(assignment.plannedEnd)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-[var(--muted)]">
                                Duration
                              </dt>
                              <dd className="mt-1 font-mono text-sm font-semibold">
                                {formatDuration(
                                  assignment.plannedEnd -
                                    assignment.plannedStart,
                                )}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-[var(--muted)]">
                                Energy
                              </dt>
                              <dd className="mt-1 font-mono text-sm font-semibold">
                                {assignment.energyKwh} kWh
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-[var(--muted)]">
                                Max power
                              </dt>
                              <dd className="mt-1 font-mono text-sm font-semibold">
                                {site.powerKw} kW
                              </dd>
                            </div>
                          </dl>

                          {declining === assignment.id ? (
                            <div className="mt-3 rounded-2xl bg-[var(--surface-muted)] p-4">
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
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => approve(assignment.id)}
                                className="min-h-11 cursor-pointer rounded-full bg-[var(--primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--primary-strong)]"
                              >
                                ✓ Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeclining(assignment.id)}
                                className="min-h-11 cursor-pointer rounded-full border border-[var(--border)] px-4 text-sm font-semibold hover:bg-rose-50"
                              >
                                ✕ Not approved
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </li>
            );
          })}
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
    </div>
  );
}
