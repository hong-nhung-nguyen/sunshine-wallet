import { Card } from "@/components/ui/card";
import {
  latestVerifiedFlexEnergyKwh,
  residentPolicy,
} from "@/lib/data/resident";
import { augustMonthlyLedger } from "@/lib/data/monthly-ledger";
import { getDemoResident } from "@/lib/demo-session";
import { allocateCents } from "@/lib/engine/cents";
import { formatAud } from "@/lib/formatters";

export default async function ResidentPage() {
  const resident = await getDemoResident();
  const latestCredit = resident.recentCredits[0];
  const contributor = resident.role === "contributor";
  const monthlyCredits = augustMonthlyLedger.ledger.filter(
    ({ participantId, status }) =>
      participantId === resident.id && status === "posted",
  );
  const monthlyCreditTotal = monthlyCredits.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const monthlyCreditsWithBreakdown = monthlyCredits.map((credit) => {
    const allocated = allocateCents(
      Math.round(credit.amount * 100),
      resident.recentCredits.map((event) => ({
        id: event.id,
        weight: event.amount,
      })),
    );
    return {
      credit,
      events: resident.recentCredits.map((event) => ({
        ...event,
        allocatedAmount: (allocated.get(event.id) ?? 0) / 100,
      })),
    };
  });

  return (
    <div className="mx-auto max-w-2xl">
      <header className="px-1 pt-2 pb-6">
        <p className="text-sm font-medium text-[var(--muted)]">
          {resident.location}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Hi {resident.firstName}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{resident.headline}</p>
      </header>

      <div className="space-y-4">
        <Card className="overflow-hidden border-0 bg-[var(--wallet)] p-0 text-white shadow-[0_16px_36px_rgba(64,50,118,0.18)]">
          <div className="p-6 sm:p-7">
            <p className="text-sm font-medium text-violet-100">
              Your Sunshine balance
            </p>
            <p className="mt-2 font-mono text-5xl font-semibold tracking-tight">
              {formatAud(resident.walletBalance + monthlyCreditTotal)}
            </p>
            <p className="mt-2 text-sm text-violet-100">
              {formatAud(resident.totalEarned + monthlyCreditTotal)} earned from
              verified community events
            </p>
          </div>
          <div className="border-t border-white/15 bg-white/10 p-4 sm:px-7">
            <details className="group rounded-xl bg-white text-[var(--foreground)]">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 text-sm font-semibold text-[var(--wallet)]">
                Wallet and credit history
                <span className="text-lg transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-[var(--border)] px-5 py-2">
                {monthlyCreditsWithBreakdown.map(({ credit, events }) => (
                  <div
                    key={credit.id}
                    className="border-b border-[var(--border)] py-4 last:border-0"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          {credit.type === "contributor_reward"
                            ? "Monthly Contributor Reward"
                            : "Monthly Equity Dividend"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          August settlement · Posted 1 Sep 2026
                        </p>
                      </div>
                      <p className="font-mono text-sm font-semibold text-[var(--primary)]">
                        +{formatAud(credit.amount)}
                      </p>
                    </div>
                    <details className="group mt-3 rounded-xl bg-[var(--surface-muted)]">
                      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between px-4 text-xs font-semibold text-[var(--primary)]">
                        See included events
                        <span className="transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <div className="border-t border-[var(--border)] px-4 py-1">
                        {events.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-3 last:border-0"
                          >
                            <div>
                              <p className="text-xs font-semibold">
                                {event.label}
                              </p>
                              <p className="mt-1 text-xs text-[var(--muted)]">
                                {event.date} · Verified
                              </p>
                            </div>
                            <p className="font-mono text-xs font-semibold">
                              {formatAud(event.allocatedAmount)}
                            </p>
                          </div>
                        ))}
                        <div className="flex items-center justify-between border-t border-[var(--border)] py-3 text-xs font-semibold">
                          <span>Monthly total</span>
                          <span className="font-mono">
                            {formatAud(credit.amount)}
                          </span>
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
                Latest event
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {latestCredit.label}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {latestCredit.date} · Verified event
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Verified
            </span>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-4 text-sm">
            <span className="text-[var(--muted)]">Community impact</span>
            <span className="font-mono font-semibold">
              {latestVerifiedFlexEnergyKwh} kWh verified
            </span>
          </div>
          <details className="group mt-5 rounded-xl border border-[var(--primary)]">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 text-sm font-semibold text-[var(--primary)]">
              See how it worked
              <span className="text-lg transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="border-t border-[var(--border)] px-5 py-4 text-sm leading-6 text-[var(--muted)]">
              <p>
                The event shifted {latestVerifiedFlexEnergyKwh} kWh into a
                solar-rich period and passed Council’s verification checks.
              </p>
              <p className="mt-2">
                Your{" "}
                {contributor ? "verified contribution" : "equity eligibility"}{" "}
                was included in the August monthly settlement.
              </p>
            </div>
          </details>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
                Coming up
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {resident.nextEvent.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {resident.nextEvent.dateLabel} · {resident.nextEvent.timeLabel}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              {resident.nextEvent.statusLabel}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            {resident.nextEvent.action} Estimated credit:{" "}
            <strong className="text-[var(--foreground)]">
              {formatAud(resident.nextEvent.estimatedCredit)}
            </strong>
            .
          </p>
          <details className="group mt-5 border-t border-[var(--border)] pt-1">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-[var(--primary)]">
              Event details
              <span className="text-lg transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <dl className="grid grid-cols-2 gap-4 rounded-xl bg-[var(--surface-muted)] p-4 text-sm">
              <div>
                <dt className="text-xs text-[var(--muted)]">When</dt>
                <dd className="mt-1 font-semibold">
                  {resident.nextEvent.dateLabel}, {resident.nextEvent.timeLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">
                  Estimated credit
                </dt>
                <dd className="mt-1 font-mono font-semibold">
                  {formatAud(resident.nextEvent.estimatedCredit)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-[var(--muted)]">
                  What you need to do
                </dt>
                <dd className="mt-1">{resident.nextEvent.action}</dd>
              </div>
            </dl>
          </details>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold">Participation status</h2>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="size-2 rounded-full bg-emerald-600" />
              Active
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {resident.explanation}
          </p>
          {resident.resource && (
            <dl className="mt-4 grid grid-cols-2 gap-4 rounded-xl bg-[var(--surface-muted)] p-4 text-sm">
              <div>
                <dt className="text-xs text-[var(--muted)]">
                  Registered resource
                </dt>
                <dd className="mt-1 font-semibold">{resident.resource.type}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Shift available</dt>
                <dd className="mt-1 font-mono font-semibold">
                  {resident.resource.availableKwh} kWh
                </dd>
              </div>
            </dl>
          )}
          <details className="group mt-4 border-t border-[var(--border)] pt-1">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-[var(--primary)]">
              Participation details
              <span className="text-lg transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="rounded-xl bg-[var(--surface-muted)] p-4 text-sm leading-6 text-[var(--muted)]">
              <p>
                Account type:{" "}
                <strong className="text-[var(--foreground)]">
                  {resident.participationLabel}
                </strong>
              </p>
              <p className="mt-2">
                Council policy {residentPolicy.version} has been effective since{" "}
                {residentPolicy.effectiveDate}.
              </p>
              <p className="mt-2">
                Contact Council if you want to review eligibility, change
                consent or pause participation.
              </p>
            </div>
          </details>
        </Card>

        <div className="flex gap-3 rounded-2xl bg-white/55 p-4 text-sm leading-6 text-[var(--muted)]">
          <span
            aria-hidden="true"
            className="grid size-6 shrink-0 place-items-center rounded-full border border-[var(--accent)] text-xs font-bold text-amber-700"
          >
            i
          </span>
          <p>
            {contributor
              ? "Verified device contributions earn rewards, while every event also reserves value for community equity."
              : `You don’t need rooftop solar to take part. Equity Dividends follow Council policy ${residentPolicy.version}.`}
          </p>
        </div>
      </div>
    </div>
  );
}
