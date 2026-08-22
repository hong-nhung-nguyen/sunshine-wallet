"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { formatAud } from "@/lib/formatters";

type ParticipationDecision = "review" | "accepted" | "paused" | "declined";
type Contribution = {
  resourceId: string;
  resourceLabel: string;
  request: string;
  expectedShiftKwh: number;
  estimatedReward: number;
  comfortSafeguard: string;
  whySelected: string;
  responseDeadline: string;
};

const decisionCopy: Record<
  Exclude<ParticipationDecision, "review">,
  { title: string; detail: string; tone: string }
> = {
  accepted: {
    title: "You accepted this event",
    detail:
      "Your resource can be considered for this event. Council will still apply availability, safety and comfort checks before dispatch.",
    tone: "border-emerald-300 bg-emerald-50 text-emerald-950",
  },
  paused: {
    title: "Participation is paused",
    detail:
      "Your resource will not be used for this event unless you change your response before the deadline.",
    tone: "border-amber-300 bg-amber-50 text-amber-950",
  },
  declined: {
    title: "You declined this event",
    detail:
      "Your resource will not be used. This does not remove your household from Equity Dividend eligibility.",
    tone: "border-slate-300 bg-slate-50 text-slate-900",
  },
};

export function ResidentEventFlow({
  contribution,
}: Readonly<{ contribution: Contribution }>) {
  const [decision, setDecision] = useState<ParticipationDecision>("review");
  const result = decision === "review" ? null : decisionCopy[decision];

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_22rem]">
      <Card>
        <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
          Your participation request
        </p>
        <h2 className="mt-3 text-2xl font-semibold">
          Can your hot water shift into sunshine hours?
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {contribution.request}
        </p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
            <dt className="text-xs text-[var(--muted)]">Expected shift</dt>
            <dd className="mt-1 font-mono text-lg font-semibold">
              {contribution.expectedShiftKwh} kWh
            </dd>
          </div>
          <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
            <dt className="text-xs text-[var(--muted)]">Estimated reward</dt>
            <dd className="mt-1 font-mono text-lg font-semibold">
              {formatAud(contribution.estimatedReward)}
            </dd>
          </div>
          <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
            <dt className="text-xs text-[var(--muted)]">Reply by</dt>
            <dd className="mt-1 text-sm font-semibold">
              {contribution.responseDeadline}
            </dd>
          </div>
        </dl>
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-950">
            Comfort and safety come first
          </p>
          <p className="mt-2 text-sm leading-6 text-emerald-900">
            {contribution.comfortSafeguard}
          </p>
        </div>
        {result && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-6 rounded-2xl border p-4 ${result.tone}`}
          >
            <p className="font-semibold">{result.title}</p>
            <p className="mt-2 text-sm leading-6">{result.detail}</p>
          </div>
        )}
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">
            Choose your response
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              aria-pressed={decision === "accepted"}
              onClick={() => setDecision("accepted")}
              className="min-h-12 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-white"
            >
              Accept
            </button>
            <button
              type="button"
              aria-pressed={decision === "paused"}
              onClick={() => setDecision("paused")}
              className="min-h-12 rounded-full border border-amber-400 bg-amber-50 px-5 text-sm font-semibold text-amber-950"
            >
              Pause
            </button>
            <button
              type="button"
              aria-pressed={decision === "declined"}
              onClick={() => setDecision("declined")}
              className="min-h-12 rounded-full border border-[var(--border)] bg-white px-5 text-sm font-semibold"
            >
              Decline
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
            Demo only: your response is shown in this browser and is not sent to
            a live device or Council system.
          </p>
        </fieldset>
      </Card>
      <div className="space-y-5">
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
            Why this resource
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {contribution.whySelected}
          </p>
          <p className="mt-4 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
            {contribution.resourceLabel} · {contribution.resourceId} · simulated
            data
          </p>
        </Card>
        <Card className="bg-[var(--surface-muted)]">
          <h3 className="font-semibold">Two separate benefits</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            The estimated reward is for verified device contribution. Your
            Equity Dividend eligibility is separate and does not require a
            device or accepting this event.
          </p>
        </Card>
      </div>
    </div>
  );
}
