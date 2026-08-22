import { Card } from "@/components/ui/card";
import { settlementInput } from "@/lib/data/settlement-fixtures";
import { calculateSettlement } from "@/lib/engine/settlement";
import { formatAud } from "@/lib/formatters";

export default function SettlementPage() {
  const result = calculateSettlement(settlementInput);
  const invalidFloor = calculateSettlement({
    ...settlementInput,
    policy: {
      ...settlementInput.policy,
      equityShareBps: 1500,
      contributorShareBps: 8000,
    },
  });
  if (result.status !== "calculated") return null;
  const { settlement, policy } = result;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Settlement calculation · {settlement.eventId}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            Program value and Equity Floor
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Council’s approved demo policy converts verified flexibility into a
            simulated program-value pool, then protects a minimum share for
            residents without practical roof access.
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-900">
          Policy valid · calculated
        </span>
      </header>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Settlement summary"
      >
        <Card>
          <p className="text-sm text-[var(--muted)]">Verified flexibility</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {settlement.verifiedFlexEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Verification gate passed
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Prototype value rate</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {formatAud(settlementInput.valueRateCentsPerKwh / 100)}
            <span className="text-base font-normal">/kWh</span>
          </p>
          <p className="mt-2 text-xs text-rose-700">
            Not a real electricity tariff
          </p>
        </Card>
        <Card className="border-l-4 border-l-[var(--council-accent)]">
          <p className="text-sm text-[var(--muted)]">Program value</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {formatAud(settlement.totalValue)}
          </p>
          <p className="mt-2 text-xs text-amber-700">{result.formula}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Equity Floor</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {policy.equityFloorBps / 100}%
          </p>
          <p className="mt-2 text-xs text-emerald-700">Applied and passed</p>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_22rem]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
                Pool allocation
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Every cent reconciles
              </h2>
            </div>
            <span className="font-mono text-sm font-semibold">
              Total {result.totalValueCents} cents
            </span>
          </div>
          <div className="mt-7 overflow-hidden rounded-2xl bg-[var(--surface-muted)]">
            <div
              className="flex h-12"
              role="img"
              aria-label="30 percent Equity Pool, 65 percent Contributor Pool and 5 percent Community Reserve"
            >
              <span
                className="grid place-items-center bg-[var(--council-accent)] text-xs font-bold text-[var(--council-ink)]"
                style={{ width: `${policy.equityShareBps / 100}%` }}
              >
                30%
              </span>
              <span
                className="grid place-items-center bg-teal-700 text-xs font-bold text-white"
                style={{ width: `${policy.contributorShareBps / 100}%` }}
              >
                65%
              </span>
              <span
                className="grid place-items-center bg-slate-400 text-xs font-bold text-white"
                style={{ width: `${policy.reserveShareBps / 100}%` }}
              >
                5%
              </span>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-amber-100 p-5 text-amber-950">
              <p className="text-sm text-amber-800">Equity Dividends</p>
              <p className="mt-2 font-mono text-3xl font-semibold">
                {formatAud(result.equityPoolCents / 100)}
              </p>
              <p className="mt-2 text-xs text-amber-800">
                {policy.equityShareBps / 100}% for eligible residents without
                roof access
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--council-ink)] p-5 text-white">
              <p className="text-sm text-slate-300">Contributor Rewards</p>
              <p className="mt-2 font-mono text-3xl font-semibold">
                {formatAud(result.contributorPoolCents / 100)}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {policy.contributorShareBps / 100}% for qualifying verified
                contribution
              </p>
            </div>
            <div className="rounded-2xl bg-slate-200 p-5">
              <p className="text-sm text-slate-600">Community Reserve</p>
              <p className="mt-2 font-mono text-3xl font-semibold">
                {formatAud(result.reservePoolCents / 100)}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                {policy.reserveShareBps / 100}% retained under demo policy
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
            <p className="text-sm font-semibold">
              {result.equityPoolCents} + {result.contributorPoolCents} +{" "}
              {result.reservePoolCents} cents
            </p>
            <p className="font-mono text-sm font-semibold">
              = {result.totalValueCents} cents ✓
            </p>
          </div>
        </Card>

        <Card className="bg-[var(--council-ink)] text-white">
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent)] uppercase">
            Council policy
          </p>
          <h2 className="mt-2 text-xl font-semibold">{policy.version}</h2>
          <p className="mt-1 text-xs text-slate-400">
            Effective {policy.effectiveDate}
          </p>
          <dl className="mt-6 space-y-4">
            <div>
              <dt className="text-xs text-slate-400">Required minimum</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold">
                {policy.equityFloorBps / 100}%
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Actual Equity Pool</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold text-[var(--council-accent)]">
                {result.effectiveEquityPercent}%
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Headroom</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold">
                +{result.effectiveEquityPercent - policy.equityFloorBps / 100}{" "}
                points
              </dd>
            </div>
          </dl>
          <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-5 text-slate-300">
            The Equity Floor applies to financial value, not energy. Council
            remains the program authority and may review the policy.
          </p>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent-strong,#956000)] uppercase">
            Settlement gates
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Required before calculation
          </h2>
          <ul className="mt-5 space-y-3">
            <li className="flex gap-3 rounded-xl bg-emerald-50 p-4 text-sm">
              <span className="text-emerald-700">✓</span>
              <span>
                <b>Verification passed.</b> Low-confidence events cannot settle.
              </span>
            </li>
            <li className="flex gap-3 rounded-xl bg-emerald-50 p-4 text-sm">
              <span className="text-emerald-700">✓</span>
              <span>
                <b>Pool total is 100%.</b> Allocations cannot create or lose
                value.
              </span>
            </li>
            <li className="flex gap-3 rounded-xl bg-emerald-50 p-4 text-sm">
              <span className="text-emerald-700">✓</span>
              <span>
                <b>Equity share exceeds floor.</b> 30% is above the required
                20%.
              </span>
            </li>
            <li className="flex gap-3 rounded-xl bg-emerald-50 p-4 text-sm">
              <span className="text-emerald-700">✓</span>
              <span>
                <b>Integer cents used.</b> Rounding is deterministic and
                reconciled.
              </span>
            </li>
          </ul>
        </Card>
        <Card className="border-rose-200 bg-rose-50">
          <p className="text-xs font-bold tracking-[0.12em] text-rose-700 uppercase">
            Invalid-policy example
          </p>
          <h2 className="mt-2 text-xl font-semibold text-rose-950">
            Equity Floor violation blocks settlement
          </h2>
          <p className="mt-3 text-sm leading-6 text-rose-900">
            A proposed 15% Equity Pool is below Council’s 20% floor. The
            calculation returns{" "}
            <span className="font-mono font-semibold">
              {invalidFloor.status}
            </span>
            , creates no settlement record and keeps credit posting disabled.
          </p>
          {invalidFloor.status === "blocked" && (
            <ul className="mt-5 space-y-2">
              {invalidFloor.reasons.map((reason) => (
                <li
                  key={reason}
                  className="rounded-xl border border-rose-200 bg-white/60 p-3 font-mono text-xs text-rose-900"
                >
                  {reason}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            disabled
            className="mt-5 min-h-11 cursor-not-allowed rounded-full bg-rose-200 px-5 text-sm font-semibold text-rose-700"
          >
            Apply credits blocked
          </button>
        </Card>
      </section>

      <Card className="mt-5 border-teal-200 bg-teal-50">
        <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
          Current lifecycle state
        </p>
        <h2 className="mt-2 text-xl font-semibold text-teal-950">
          Calculated, not yet posted
        </h2>
        <p className="mt-2 text-sm leading-6 text-teal-900">
          This settlement record prepares separate pools for downstream
          allocation. Wallet credits are not posted until the Issue 15
          credit-application step. The prototype value is simulated and is not a
          guaranteed Council payment, retailer settlement or electricity tariff.
        </p>
      </Card>
    </div>
  );
}
