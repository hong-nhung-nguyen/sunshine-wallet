import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import {
  residentEvents,
  latestVerifiedFlexEnergyKwh,
  residentPolicy,
  residentProfile,
} from "@/lib/data/resident";
import { formatAud } from "@/lib/formatters";

export default function ResidentPage() {
  const nextEvent = residentEvents[0];
  return (
    <div>
      <section className="resident-hero overflow-hidden rounded-[2rem] bg-[var(--primary)] p-6 text-white shadow-[0_22px_55px_rgba(16,75,44,0.18)] sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <StatusBadge>Included in the community program</StatusBadge>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
            Good afternoon, {residentProfile.firstName}.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
            You can share in local solar benefits even without panels on your
            apartment building.
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
            {formatAud(residentProfile.walletBalance)}
          </p>
          <p className="mt-3 text-sm text-violet-100">
            {formatAud(residentProfile.pendingCredits)} pending from the next
            event
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
                {nextEvent.dateLabel}
              </h2>
              <p className="mt-1 font-medium text-[var(--primary)]">
                {nextEvent.timeLabel}
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              {nextEvent.statusLabel}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            {nextEvent.residentAction}. Review the request and choose whether
            your registered hot-water system can take part.
          </p>
          <Link
            href={`/resident/events/${nextEvent.id}`}
            className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--primary)]"
          >
            Review event →
          </Link>
        </Card>
      </section>
      <section className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
            Why you are included
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Fair access for residents without a roof
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {residentPolicy.explanation} Your eligibility does not depend on
            owning solar, a battery, an EV or a controllable device.
          </p>
          <Link
            href="/resident/status"
            className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--primary)]"
          >
            Review your status →
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
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Effective {residentPolicy.effectiveDate}
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
