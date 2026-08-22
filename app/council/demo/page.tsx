import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  runSunshineEvent,
  type EventLoopScenario,
} from "@/lib/engine/event-loop";
import { formatAud } from "@/lib/formatters";

const validScenarios: readonly EventLoopScenario[] = [
  "success",
  "low_confidence",
  "no_event",
];
const scenarioLabels: Record<EventLoopScenario, string> = {
  success: "Successful event",
  low_confidence: "Low-confidence block",
  no_event: "No-event outcome",
};

export default async function CouncilDemoPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ scenario?: string }> }>) {
  const requested = (await searchParams).scenario ?? "success";
  const scenario = validScenarios.includes(requested as EventLoopScenario)
    ? (requested as EventLoopScenario)
    : "success";
  const result = runSunshineEvent(scenario);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            End-to-end demo · event_loop_001
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            One event, every decision visible
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Run the deterministic Dapto scenario from local solar opportunity
            through verification, Council settlement and an apartment resident’s
            wallet credit.
          </p>
        </div>
        <Link
          href="/council/demo"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--council-ink)] px-5 text-sm font-semibold text-[var(--council-ink)]"
        >
          Reset demo
        </Link>
      </header>

      <nav aria-label="Demo scenarios" className="mt-6 flex flex-wrap gap-2">
        {validScenarios.map((item) => (
          <Link
            key={item}
            href={`/council/demo?scenario=${item}`}
            aria-current={scenario === item ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold ${scenario === item ? "bg-[var(--council-ink)] text-white" : "border border-[var(--border)] bg-white text-[var(--council-ink)]"}`}
          >
            {scenarioLabels[item]}
          </Link>
        ))}
      </nav>

      {result.status === "no_event" ? (
        <Card className="mt-7 border-amber-300 bg-amber-50">
          <p className="text-xs font-bold tracking-[0.12em] text-amber-700 uppercase">
            Stopped at window selection
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-amber-950">
            No safe event recommended
          </h2>
          <p className="mt-3 text-sm leading-6 text-amber-900">
            Forecast confidence did not meet the prototype threshold. No
            residents were contacted, no resources were dispatched and no
            settlement was created.
          </p>
          <ul className="mt-4 space-y-2">
            {result.windowSelection.reasons.map((reason) => (
              <li
                key={reason}
                className="rounded-xl bg-white/70 p-3 text-sm text-amber-950"
              >
                {reason}
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <>
          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
                1 · Opportunity
              </p>
              <p className="mt-3 font-mono text-3xl font-semibold">
                {result.windowSelection.recommended.score}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Window score · DAPTO-01
              </p>
            </Card>
            <Card>
              <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
                2 · Eligibility
              </p>
              <p className="mt-3 font-mono text-3xl font-semibold">
                {result.eligibility.eligibleResources.length}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Resources passed every hard gate
              </p>
            </Card>
            <Card>
              <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
                3 · Plan
              </p>
              <p className="mt-3 font-mono text-3xl font-semibold">
                {result.optimisation.totalPlannedEnergyKwh} kWh
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Scheduled without exceeding target
              </p>
            </Card>
            <Card>
              <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
                4 · Simulate
              </p>
              <p className="mt-3 font-mono text-3xl font-semibold">
                {result.simulation.estimatedFlexEnergyKwh} kWh
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Mock device response · deterministic
              </p>
            </Card>
          </section>

          <Card
            className={`mt-5 border-l-4 ${result.status === "completed" ? "border-l-emerald-500" : "border-l-rose-500"}`}
          >
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-[var(--muted)] uppercase">
                  5 · Baseline
                </p>
                <p className="mt-2 font-mono text-2xl font-semibold">
                  {result.verification.baseline.baselineEnergyKwh} kWh
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Clean non-event days only
                </p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-[var(--muted)] uppercase">
                  6 · Verified
                </p>
                <p className="mt-2 font-mono text-2xl font-semibold">
                  {result.verification.record.verifiedFlexEnergyKwh} kWh
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Observed minus baseline
                </p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-[var(--muted)] uppercase">
                  7 · Confidence gate
                </p>
                <p className="mt-2 font-mono text-2xl font-semibold">
                  {Math.round(result.verification.record.confidenceScore * 100)}
                  %
                </p>
                <p
                  className={`mt-1 text-xs font-semibold ${result.verification.record.settlementGatePassed ? "text-emerald-700" : "text-rose-700"}`}
                >
                  {result.verification.record.settlementGatePassed
                    ? "Passed · settlement allowed"
                    : "Failed · settlement blocked"}
                </p>
              </div>
            </div>
          </Card>

          {result.status === "settlement_blocked" ? (
            <Card className="mt-5 border-rose-200 bg-rose-50">
              <p className="text-xs font-bold tracking-[0.12em] text-rose-700 uppercase">
                Lifecycle stopped
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-rose-950">
                No settlement and no wallet credit
              </h2>
              <p className="mt-3 text-sm leading-6 text-rose-900">
                The response remains visible for Council review, but the
                low-confidence gate prevents value allocation and credit
                posting.
              </p>
            </Card>
          ) : (
            <section className="mt-5 grid gap-5 lg:grid-cols-2">
              <Card>
                <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
                  8 · Attribution and settlement
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  Verified value reconciled
                </h2>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-[var(--muted)]">Program value</dt>
                    <dd className="mt-1 font-mono text-2xl font-semibold">
                      {formatAud(result.settlement.settlement.totalValue)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Equity Pool</dt>
                    <dd className="mt-1 font-mono text-2xl font-semibold">
                      {formatAud(result.settlement.equityPoolCents / 100)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Contributor Pool</dt>
                    <dd className="mt-1 font-mono text-xl font-semibold">
                      {formatAud(result.settlement.contributorPoolCents / 100)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Council floor</dt>
                    <dd className="mt-1 font-mono text-xl font-semibold">
                      {result.settlement.policy.equityFloorBps / 100}%
                    </dd>
                  </div>
                </dl>
              </Card>
              <Card className="border-0 bg-[var(--wallet)] text-white">
                <p className="text-xs font-bold tracking-[0.12em] text-violet-200 uppercase">
                  9 · Resident outcome
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  Equity Dividend posted
                </h2>
                <p className="mt-5 font-mono text-5xl font-semibold">
                  {formatAud(result.wallet.closingBalanceCents / 100)}
                </p>
                <p className="mt-2 text-sm text-violet-100">
                  Apartment resident · no roof access · no device required
                </p>
                <div className="mt-5 border-t border-white/20 pt-4">
                  <p className="text-sm">
                    Transaction status: <b>posted</b>
                  </p>
                  <p className="mt-1 text-xs text-violet-200">
                    Retry-safe: the same event credit cannot post twice.
                  </p>
                </div>
              </Card>
            </section>
          )}
        </>
      )}

      <Card className="mt-5 bg-[var(--surface-muted)]">
        <p className="text-xs font-bold tracking-[0.12em] text-[var(--muted)] uppercase">
          Prototype provenance
        </p>
        <p className="mt-2 text-sm leading-6">
          Network forecasts, device acknowledgements, meter readings and
          settlement acknowledgement are mocked. Calculations are deterministic
          and Council-reviewable. Program value is simulated and is not a
          tariff, retailer settlement or guaranteed payment.
        </p>
      </Card>
    </div>
  );
}
