import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import {
  residentEvents,
  latestVerifiedFlexEnergyKwh,
  residentPolicy,
  residentProfile,
} from "@/lib/data/resident";
import { getDemoResident } from "@/lib/demo-session";
import { formatAud } from "@/lib/formatters";

export default async function ResidentPage() {
  const resident = await getDemoResident();
  const contributor = resident.role === "contributor";
  return (
    <div>
      <section className="resident-hero overflow-hidden rounded-[2rem] bg-[var(--primary)] p-6 text-white shadow-[0_22px_55px_rgba(16,75,44,0.18)] sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <StatusBadge>{resident.participationLabel}</StatusBadge>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
            Good afternoon, {resident.firstName}.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
            {resident.headline}
          </p>
        </div>
      </section>

      <section
        className="mt-5 grid gap-4 sm:grid-cols-2"
        aria-label="Your summary"
      >
        <Card className="border-0 bg-[var(--wallet)] text-white shadow-[0_16px_35px_rgba(64,50,118,0.18)]">
          <p className="text-sm text-violet-100">Available balance</p>
          <p className="mt-2 font-mono text-4xl font-semibold tracking-tight">
            {formatAud(resident.walletBalance)}
          </p>
          <p className="mt-3 text-sm text-violet-100">
            {formatAud(resident.pendingCredits)} pending from the next event
          </p>
          <Link
            href="/resident/wallet"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[var(--wallet)]"
          >
            View wallet
          </Link>
        </Card>
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Next event
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {resident.nextEvent.dateLabel}
              </h2>
              <p className="mt-1 font-medium text-[var(--primary)]">
                {resident.nextEvent.timeLabel}
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              {resident.nextEvent.statusLabel}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            {resident.nextEvent.action}
          </p>
          <Link
            href="/resident/events"
            className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--primary)]"
          >
            View event details →
          </Link>
        </Card>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
            {contributor ? "Your contribution" : "Why you are included"}
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            {contributor
              ? resident.resource?.name
              : "Fair access without rooftop solar"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {resident.explanation}
          </p>
          <Link
            href={contributor ? "/resident/events" : "/resident/status"}
            className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--primary)]"
          >
            {contributor ? "Manage participation" : "Review eligibility"} →
          </Link>
        </Card>
        <Card className="bg-[var(--surface-muted)]">
          <p className="text-sm text-[var(--muted)]">Community impact</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {latestVerifiedFlexEnergyKwh} kWh
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            verified in the latest event
          </p>
          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <p className="text-sm font-semibold">
              Council policy {residentPolicy.version}
        {resident.resource ? (
          <Card className="bg-[var(--surface-muted)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[var(--muted)]">Registered resource</p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                {resident.resource.status}
              </span>
            </div>
            <p className="mt-3 text-xl font-semibold">
              {resident.resource.type}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
              <div>
                <dt className="text-xs text-[var(--muted)]">Capacity</dt>
                <dd className="mt-1 font-mono font-semibold">
                  {resident.resource.capacityKw} kW
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Shift available</dt>
                <dd className="mt-1 font-mono font-semibold">
                  {resident.resource.availableKwh} kWh
                </dd>
              </div>
            </dl>
          </Card>
        ) : (
          <Card className="bg-[var(--surface-muted)]">
            <p className="text-sm text-[var(--muted)]">Community impact</p>
            <p className="mt-3 font-mono text-3xl font-semibold">14.7 kWh</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              verified in the latest event
            </p>
            <div className="mt-5 border-t border-[var(--border)] pt-4">
              <p className="text-sm font-semibold">
                20% community equity floor
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Applied after verification
              </p>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
