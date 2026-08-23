import Link from "next/link";
import { Card } from "@/components/ui/card";
import { augustMonthlyLedger } from "@/lib/data/monthly-ledger";
import { formatAud } from "@/lib/formatters";

const money = (cents: number) => formatAud(cents / 100);

export default function SettlementPage() {
  const settlement = augustMonthlyLedger.settlement;
  if (settlement.status !== "settled") return null;

  const equityCredits = settlement.credits.filter(
    ({ branch, amountCents }) => branch === "1A" && amountCents > 0,
  );
  const contributorCredits = settlement.credits.filter(
    ({ branch, amountCents }) => branch === "1B" && amountCents > 0,
  );
  const dualCreditCount = equityCredits.filter((equity) =>
    contributorCredits.some(
      (contributor) => contributor.householdId === equity.householdId,
    ),
  ).length;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Monthly settlement · August 2026
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            Need and verified service, reconciled separately
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Only verification-approved event value enters this pot. Need Score
            determines Equity credits; verified attributed energy determines
            Contributor rewards. An eligible household may receive both.
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-900">
          Equity Floor: {settlement.floor.passed ? "PASS" : "FAIL"}
        </span>
      </header>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Monthly settlement summary"
      >
        <Metric
          label="Verified monthly pot"
          value={money(settlement.potCents)}
          note={`${augustMonthlyLedger.includedEventIds.length} verified event${augustMonthlyLedger.includedEventIds.length === 1 ? "" : "s"}`}
        />
        <Metric
          label="Equity Pool"
          value={money(settlement.equityPoolCents)}
          note={`${settlement.policy.equityShareBps / 100}% · Need Score only`}
        />
        <Metric
          label="Contributor Pool"
          value={money(settlement.contributorPoolCents)}
          note={`${settlement.policy.contributorShareBps / 100}% · verified contribution`}
        />
        <Metric
          label="Community Reserve"
          value={money(settlement.reserveCents)}
          note={`${settlement.policy.reserveShareBps / 100}% plus carried value`}
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_22rem]">
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
            Reconciliation
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Every cent has one home
          </h2>
          <div
            className="mt-6 flex h-12 overflow-hidden rounded-2xl"
            role="img"
            aria-label={`${settlement.policy.equityShareBps / 100}% Equity Pool, ${settlement.policy.contributorShareBps / 100}% Contributor Pool and ${settlement.policy.reserveShareBps / 100}% Community Reserve`}
          >
            <PoolSegment
              percent={settlement.policy.equityShareBps / 100}
              className="bg-[var(--council-accent)] text-[var(--council-ink)]"
            />
            <PoolSegment
              percent={settlement.policy.contributorShareBps / 100}
              className="bg-teal-700 text-white"
            />
            <PoolSegment
              percent={settlement.policy.reserveShareBps / 100}
              className="bg-slate-400 text-white"
            />
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <Breakdown
              label="Equity credits"
              value={money(
                equityCredits.reduce(
                  (sum, credit) => sum + credit.amountCents,
                  0,
                ),
              )}
              note={`${equityCredits.length} need-eligible households`}
            />
            <Breakdown
              label="Contributor rewards"
              value={money(
                contributorCredits.reduce(
                  (sum, credit) => sum + credit.amountCents,
                  0,
                ),
              )}
              note={`${contributorCredits.length} verified contributors`}
            />
            <Breakdown
              label="Eligible for both"
              value={`${dualCreditCount}`}
              note="Separate reasons and ledger types"
            />
          </dl>
          <p className="mt-5 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
            Credits plus reserve close exactly to {money(settlement.potCents)}.
            The same contribution weight is used once, and idempotency prevents
            either monthly credit type from being posted twice.
          </p>
        </Card>

        <Card className="bg-[var(--council-ink)] text-white">
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent)] uppercase">
            Current policy
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            {settlement.policy.version}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Effective {settlement.policy.effectiveDate}
          </p>
          <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-200">
            <li>Equity uses Factors A–D only.</li>
            <li>Factor E is operational context, not an Equity multiplier.</li>
            <li>Contributor rewards require verified attribution.</li>
            <li>Both credits remain separately explainable.</li>
          </ul>
          <Link
            href="/council/equity-cells"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[var(--council-ink)]"
          >
            Inspect Equity cells →
          </Link>
        </Card>
      </section>

      <Card className="mt-5 border-teal-200 bg-teal-50">
        <h2 className="text-lg font-semibold text-teal-950">
          Why receiving both is not double-counting
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-teal-900">
          The Equity Pool compensates disadvantage; the Contributor Pool pays
          for a verified energy service. Their budgets are split before either
          household calculation, and each posts under a different idempotent
          transaction type.
        </p>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-3 font-mono text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-xs text-[var(--muted)]">{note}</p>
    </Card>
  );
}

function PoolSegment({
  percent,
  className,
}: {
  percent: number;
  className: string;
}) {
  return (
    <span
      className={`grid place-items-center text-xs font-bold ${className}`}
      style={{ width: `${percent}%` }}
    >
      {percent}%
    </span>
  );
}

function Breakdown({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl bg-[var(--surface-muted)] p-5">
      <dt className="text-sm text-[var(--muted)]">{label}</dt>
      <dd className="mt-2 font-mono text-2xl font-semibold">{value}</dd>
      <p className="mt-2 text-xs text-[var(--muted)]">{note}</p>
    </div>
  );
}
