"use client";

import Link from "next/link";
import { findSite } from "@/lib/data/dispatch";
import { useAssignments } from "@/lib/dispatch/store";

/**
 * Council's way into the partner console: how many switch requests are still
 * unanswered, how many were accepted, and a way through to discuss them.
 */
export function RetailerInboxButton() {
  const assignments = useAssignments().filter((assignment) =>
    findSite(assignment.resourceId),
  );
  const waiting = assignments.filter(
    (assignment) => assignment.status === "waiting",
  ).length;
  const accepted = assignments.filter(
    (assignment) =>
      assignment.status === "ongoing" || assignment.status === "completed",
  ).length;
  const declined = assignments.filter(
    (assignment) => assignment.status === "cancelled",
  ).length;

  return (
    <Link
      href="/council/requests"
      className="inline-flex min-h-11 flex-col justify-center rounded-2xl border border-[var(--border)] bg-white px-5 py-2 transition-colors hover:bg-[var(--surface-muted)]"
    >
      <span className="flex items-center gap-2 text-sm font-bold text-[var(--council-ink)]">
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M3 8l9 6 9-6" />
          <rect x="3" y="5" width="18" height="14" rx="2" />
        </svg>
        Retailer inbox
        {waiting > 0 && (
          <span className="rounded-full bg-[var(--council-accent)] px-2 py-0.5 text-[11px] font-bold text-[var(--council-ink)]">
            {waiting} awaiting
          </span>
        )}
      </span>
      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-[var(--muted)]">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#0f766e]" />
          {accepted} accepted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full border-2 border-[#b45309] bg-white" />
          {waiting} awaiting
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-slate-400" />
          {declined} declined
        </span>
        <span className="font-semibold text-teal-800">Messages →</span>
      </span>
    </Link>
  );
}
