"use client";

import Link from "next/link";
import { useState } from "react";
import { DISPATCH_DATE_LABEL, findSite } from "@/lib/data/dispatch";
import { useMessages } from "@/lib/dispatch/messages";
import { useAssignments } from "@/lib/dispatch/store";
import {
  PartnerMessages,
  partyNames,
} from "@/components/messaging/partner-messages";
import { RetailerInbox } from "./retailer-inbox";

type ConsoleTab = "requests" | "messages";

/**
 * The partner's two jobs in one place: answer switch requests, and talk to
 * Council about them.
 */
export function RetailerConsole() {
  const [tab, setTab] = useState<ConsoleTab>("requests");
  const [party, setParty] = useState(partyNames[0] ?? "");
  const assignments = useAssignments();
  const messages = useMessages();

  const waiting = assignments.filter(
    (assignment) =>
      assignment.status === "waiting" && findSite(assignment.resourceId),
  ).length;
  const threads = new Set(messages.map((message) => message.partyName)).size;

  const tabs = [
    { id: "requests", label: "Requests", badge: waiting },
    { id: "messages", label: "Messages", badge: threads },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--primary)]">
            Partner console · {DISPATCH_DATE_LABEL}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Retailer inbox
          </h1>
        </div>
        <Link
          href="/council/events"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--border)] px-5 text-sm font-semibold hover:bg-white"
        >
          ← Council events
        </Link>
      </header>

      <div
        role="tablist"
        aria-label="Partner console sections"
        className="mt-6 flex gap-1 border-b border-[var(--border)]"
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
              className={`-mb-px flex min-h-11 cursor-pointer items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors ${active ? "border-b-[var(--primary)] text-[var(--primary)]" : "border-b-transparent text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              {item.label}
              {item.badge > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === "requests" ? (
          <RetailerInbox />
        ) : (
          <PartnerMessages
            as="partner"
            party={party}
            onPartyChange={setParty}
          />
        )}
      </div>

      <p className="mt-6 text-xs leading-5 text-[var(--muted)]">
        Demonstration only. This console stands in for a partner retailer&apos;s
        own systems; no request or message here reaches a real retailer, meter
        or customer.
      </p>
    </div>
  );
}
