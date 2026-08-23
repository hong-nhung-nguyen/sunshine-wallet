"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  PartnerMessages,
  partyNames,
} from "@/components/messaging/partner-messages";
import { Card } from "@/components/ui/card";
import {
  DISPATCH_DATE_LABEL,
  findSite,
  formatClock,
  type DispatchAssignment,
  type DispatchSite,
  type DispatchStatus,
} from "@/lib/data/dispatch";
import { useMessages } from "@/lib/dispatch/messages";
import { useAssignments } from "@/lib/dispatch/store";
import { describeNote, statusLabels } from "@/lib/dispatch/view";
import { statusStyles } from "./dispatch-style";

type RequestsTab = "requests" | "messages";

interface RequestRow {
  assignment: DispatchAssignment;
  site: DispatchSite;
}

interface PartyGroup {
  partyName: string;
  kind: "Retailer" | "Battery owner";
  rows: RequestRow[];
  approved: number;
  awaiting: number;
  declined: number;
}

/**
 * Council's view of what it asked for, one section per partner company.
 *
 * Read-only by design: Council sends the request, the retailer or battery
 * owner is the one who accepts or refuses it, and there is no control here
 * that could pretend otherwise. The ticks report their answer; they do not
 * make it.
 */
export function CouncilRequests() {
  const [tab, setTab] = useState<RequestsTab>("requests");
  const [party, setParty] = useState(partyNames[0] ?? "");
  const assignments = useAssignments();
  const messages = useMessages();

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

  const groups = useMemo<PartyGroup[]>(() => {
    const byParty = new Map<string, RequestRow[]>();
    for (const row of rows) {
      const existing = byParty.get(row.site.partyName);
      if (existing) existing.push(row);
      else byParty.set(row.site.partyName, [row]);
    }
    return [...byParty.entries()]
      .map(([partyName, partyRows]) => ({
        partyName,
        kind:
          partyRows[0].site.party === "retailer"
            ? ("Retailer" as const)
            : ("Battery owner" as const),
        rows: partyRows,
        approved: partyRows.filter(
          ({ assignment }) =>
            assignment.status === "ongoing" ||
            assignment.status === "completed",
        ).length,
        awaiting: partyRows.filter(
          ({ assignment }) => assignment.status === "waiting",
        ).length,
        declined: partyRows.filter(
          ({ assignment }) => assignment.status === "cancelled",
        ).length,
      }))
      .sort((a, b) => a.partyName.localeCompare(b.partyName));
  }, [rows]);

  const totals = {
    awaiting: groups.reduce((sum, group) => sum + group.awaiting, 0),
    approved: groups.reduce((sum, group) => sum + group.approved, 0),
    declined: groups.reduce((sum, group) => sum + group.declined, 0),
  };

  const tabs = [
    { id: "requests", label: "Requests", badge: rows.length },
    { id: "messages", label: "Messages", badge: messages.length },
  ] as const;

  function openThread(partyName: string) {
    setParty(partyName);
    setTab("messages");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/council/events"
        className="text-sm font-semibold text-teal-800"
      >
        ← Events
      </Link>
      <header className="mt-5">
        <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
          Retailer inbox · {DISPATCH_DATE_LABEL}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
          Switch requests
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Council asks; the retailer or battery owner decides. Each company is
          listed once — open it to see the devices Council asked them to switch
          and whether they agreed.
        </p>
      </header>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryTile
          label="Awaiting a partner"
          value={totals.awaiting}
          tone="waiting"
        />
        <SummaryTile label="Approved" value={totals.approved} tone="ongoing" />
        <SummaryTile
          label="Declined"
          value={totals.declined}
          tone="cancelled"
        />
      </dl>

      <div
        role="tablist"
        aria-label="Retailer inbox sections"
        className="mt-7 flex gap-1 border-b border-[var(--border)]"
      >
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={`-mb-px flex min-h-11 cursor-pointer items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors ${active ? "border-b-[var(--council-ink)] text-[var(--council-ink)]" : "border-b-transparent text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              {item.label}
              {item.badge > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-[var(--council-ink)] text-white" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === "messages" ? (
          <PartnerMessages
            as="council"
            party={party}
            onPartyChange={setParty}
          />
        ) : (
          <ul className="space-y-3">
            {groups.map((group) => (
              <li key={group.partyName}>
                <CompanySection group={group} onMessage={openThread} />
              </li>
            ))}
            {groups.length === 0 && (
              <li>
                <Card>
                  <p className="text-sm text-[var(--muted)]">
                    No switch requests yet. Open an event record and use{" "}
                    <b>Assign</b> to send one.
                  </p>
                </Card>
              </li>
            )}
          </ul>
        )}
      </div>

      <p className="mt-6 text-xs leading-5 text-[var(--muted)]">
        Council cannot approve on a partner&apos;s behalf. Approvals and
        refusals are made by the retailer or battery owner in their own console,
        which this demo stands in for at <code>/retailer</code>.
      </p>
    </div>
  );
}

/** One company, with the devices Council asked it to switch folded inside. */
function CompanySection({
  group,
  onMessage,
}: Readonly<{ group: PartyGroup; onMessage: (partyName: string) => void }>) {
  return (
    <Card className="p-0">
      {/* Open by default while the company still owes Council an answer. */}
      <details className="group" open={group.awaiting > 0}>
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 p-5">
          <svg
            viewBox="0 0 24 24"
            className="size-4 shrink-0 text-[var(--muted)] transition-transform group-open:rotate-90"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
          <span className="min-w-0">
            <span className="block text-lg font-semibold">
              {group.partyName}
            </span>
            <span className="mt-0.5 block text-xs text-[var(--muted)]">
              {group.kind} · {group.rows.length} device
              {group.rows.length === 1 ? "" : "s"} requested
            </span>
          </span>
          <span className="ml-auto flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">
              {group.approved} approved
            </span>
            {group.awaiting > 0 && (
              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-900">
                {group.awaiting} awaiting
              </span>
            )}
            {group.declined > 0 && (
              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {group.declined} declined
              </span>
            )}
          </span>
        </summary>

        <ul className="border-t border-[var(--border)]">
          {group.rows.map(({ assignment, site }) => {
            const note = describeNote(assignment.note);
            return (
              <li
                key={assignment.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--border)] px-5 py-4 last:border-b-0"
              >
                <ApprovalTick status={assignment.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{site.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {site.deviceType} · {site.address}
                  </p>
                </div>
                <dl className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                  <div>
                    <dt className="sr-only">Request</dt>
                    <dd className="font-mono text-[var(--muted)]">
                      {assignment.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Window</dt>
                    <dd className="font-mono font-semibold">
                      {formatClock(assignment.plannedStart)} –{" "}
                      {formatClock(assignment.plannedEnd)}
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Energy</dt>
                    <dd className="font-mono font-semibold">
                      {assignment.energyKwh} kWh
                    </dd>
                  </div>
                </dl>
                <span className="w-full sm:w-auto sm:text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[assignment.status].chip}`}
                  >
                    {statusLabels[assignment.status]}
                  </span>
                  {note && (
                    <span className="mt-1 block text-xs text-[var(--muted)]">
                      {note}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-muted)] px-5 py-3">
          <p className="text-xs text-[var(--muted)]">
            {group.awaiting > 0
              ? `${group.partyName} has ${group.awaiting} request${group.awaiting === 1 ? "" : "s"} still to answer.`
              : `${group.partyName} has answered every request.`}
          </p>
          <button
            type="button"
            onClick={() => onMessage(group.partyName)}
            className="min-h-10 cursor-pointer rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold hover:bg-white/60"
          >
            Message {group.partyName}
          </button>
        </div>
      </details>
    </Card>
  );
}

/** Did the partner agree to this device? A report, not a control. */
function ApprovalTick({ status }: Readonly<{ status: DispatchStatus }>) {
  const approved = status === "ongoing" || status === "completed";
  const declined = status === "cancelled";
  const label = approved
    ? "Approved by partner"
    : declined
      ? "Not approved — declined by partner"
      : "Not approved yet — awaiting partner";

  return (
    <span
      title={label}
      className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${
        approved
          ? "border-emerald-600 bg-emerald-600 text-white"
          : declined
            ? "border-slate-400 bg-slate-400 text-white"
            : "border-dashed border-[#b45309] bg-white text-[#b45309]"
      }`}
    >
      <span className="sr-only">{label}</span>
      {approved && (
        <svg
          viewBox="0 0 24 24"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          aria-hidden="true"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
      {declined && (
        <svg
          viewBox="0 0 24 24"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      )}
    </span>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: Readonly<{
  label: string;
  value: number;
  tone: "waiting" | "ongoing" | "cancelled";
}>) {
  return (
    <Card className="p-4">
      <dt className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <span className={`size-2.5 rounded-full ${statusStyles[tone].dot}`} />
        {label}
      </dt>
      <dd className="mt-2 font-mono text-3xl font-semibold">{value}</dd>
    </Card>
  );
}
