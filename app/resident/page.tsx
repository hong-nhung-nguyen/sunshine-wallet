import Link from "next/link";
import { Card } from "@/components/ui/card";
import { latestVerifiedFlexEnergyKwh, residentPolicy } from "@/lib/data/resident";
import { getDemoResident } from "@/lib/demo-session";
import { formatAud } from "@/lib/formatters";

export default async function ResidentPage() {
  const resident = await getDemoResident();
  const latestCredit = resident.recentCredits[0];
  const contributor = resident.role === "contributor";

  return (
    <div className="mx-auto max-w-2xl">
      <header className="px-1 pb-6 pt-2">
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
              {formatAud(resident.walletBalance)}
            </p>
            <p className="mt-2 text-sm text-violet-100">
              {formatAud(resident.totalEarned)} earned from verified community
              events
            </p>
          </div>
          <div className="border-t border-white/15 bg-white/10 p-4 sm:px-7">
            <Link
              href="/resident/wallet"
              className="flex min-h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[var(--wallet)] transition-colors hover:bg-violet-50"
            >
              View wallet and credits
            </Link>
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
            <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 font-mono text-sm font-semibold text-emerald-800">
              +{formatAud(latestCredit.amount)}
            </span>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-4 text-sm">
            <span className="text-[var(--muted)]">Community impact</span>
            <span className="font-mono font-semibold">
              {latestVerifiedFlexEnergyKwh} kWh verified
            </span>
          </div>
          <Link
            href="/resident/wallet"
            className="mt-5 flex min-h-12 items-center justify-center rounded-xl border border-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-emerald-50"
          >
            See how it worked
          </Link>
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
          <Link
            href="/resident/events"
            className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--primary)]"
          >
            View event details →
          </Link>
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
                <dt className="text-xs text-[var(--muted)]">
                  Shift available
                </dt>
                <dd className="mt-1 font-mono font-semibold">
                  {resident.resource.availableKwh} kWh
                </dd>
              </div>
            </dl>
          )}
          <Link
            href={contributor ? "/resident/events" : "/resident/status"}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--primary)]"
          >
            Manage participation →
          </Link>
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
