import Link from "next/link";
import { Card } from "@/components/ui/card";
import { runSunshineEvent } from "@/lib/engine/run-sunshine-event";
import { formatAud } from "@/lib/formatters";

export default function EngineFlowPage() {
  const result = runSunshineEvent();
  if (result.status === "no_event")
    return (
      <Card>
        <h1 className="text-2xl font-semibold">No event recommended</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          The forecast did not pass Council’s hard gates, so no resources were
          dispatched.
        </p>
      </Card>
    );
  if (result.settlement.status !== "calculated")
    return (
      <Card>
        <h1 className="text-2xl font-semibold">Settlement blocked</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          The event remains visible, but no credits can be created.
        </p>
      </Card>
    );

  const stages = [
    [
      "1",
      "Window",
      result.windowSelection.recommended.window.start.slice(11, 16),
      `${result.windowSelection.recommended.score}/100`,
    ],
    [
      "2",
      "Eligibility",
      `${result.eligibility.eligibleResources.length} eligible`,
      `${result.eligibility.decisions.length - result.eligibility.eligibleResources.length} rejected`,
    ],
    [
      "3",
      "Optimisation",
      `${result.optimisation.totalPlannedEnergyKwh} kWh`,
      `${result.optimisation.dispatchPlans.length} resources`,
    ],
    [
      "4",
      "Simulation",
      `${result.simulation.estimatedFlexEnergyKwh} kWh`,
      "deterministic",
    ],
    [
      "5",
      "Baseline",
      `${result.verification.baseline.baselineEnergyKwh} kWh`,
      `${result.verification.baseline.cleanReferenceDayIds.length} clean days`,
    ],
    [
      "6",
      "Verification",
      `${result.verification.record.verifiedFlexEnergyKwh} kWh`,
      `${Math.round(result.verification.record.confidenceScore * 100)}% confidence`,
    ],
    [
      "7",
      "Attribution",
      `${result.attribution.attributableEnergyKwh} kWh`,
      `${result.attribution.contributorAttributions.length} shares`,
    ],
    [
      "8",
      "Settlement",
      formatAud(result.settlement.settlement.totalValue),
      `${result.settlement.effectiveEquityPercent}% equity`,
    ],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-teal-700">
            Integrated engine · event_001
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            One traceable event flow
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Every stage consumes the previous stage’s result. Values are
            simulated or calculated, deterministic, and reviewable by Council.
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-900">
          All gates passed
        </span>
      </header>
      <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stages.map(([number, label, value, note]) => (
          <Card key={number}>
            <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
              Stage {number} · {label}
            </p>
            <p className="mt-3 font-mono text-2xl font-semibold">{value}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">{note}</p>
          </Card>
        ))}
      </section>
      <Card className="mt-5 border-l-4 border-l-[var(--council-accent)]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-amber-700 uppercase">
              Canonical chain
            </p>
            <p className="mt-2 font-mono text-sm leading-7">
              18 kWh planned → 16.5 kWh simulated → 16.5 kWh verified → 16.5 kWh
              attributed → $13.20 program value
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              $8.58 Equity Dividends · $3.96 Contributor Rewards · $0.66
              Community Reserve
            </p>
          </div>
          <Link
            href="/council/settlement"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--council-ink)] px-5 text-sm font-semibold text-white"
          >
            Inspect settlement →
          </Link>
        </div>
      </Card>
    </div>
  );
}
