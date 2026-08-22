import { Card } from "@/components/ui/card";
import { flexibleResources } from "@/lib/data";
import {
  optimisationCandidates,
  optimisationConstraints,
} from "@/lib/data/optimisation-candidates";
import { optimiseDispatchPlan } from "@/lib/engine/optimiser";

const resourceName = (resourceId: string) =>
  flexibleResources.find(({ id }) => id === resourceId)?.name ?? resourceId;

export default function OptimisationPage() {
  const result = optimiseDispatchPlan(
    optimisationCandidates,
    optimisationConstraints,
  );
  const finalResourceId = result.dispatchPlans.at(-1)?.resourceId;
  const finalCandidate = result.rankedCandidates.find(
    ({ resourceId }) => resourceId === finalResourceId,
  );
  const finalPlan = result.dispatchPlans.at(-1);
  const finalIsPartial = Boolean(
    finalPlan &&
      finalCandidate &&
      finalPlan.plannedEnergyKwh < finalCandidate.maxShiftEnergyKwh,
  );

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Optimisation · event_001
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            Recommended dispatch plan
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Eligible resources are ranked with Council’s explainable scoring
            rule, then scheduled only for the energy needed. This is a
            calculated plan using simulated availability—not a live device
            command.
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-900">
          {result.status === "optimised" ? "Target met" : "Plan blocked"}
        </span>
      </header>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Dispatch summary"
      >
        <Card className="border-l-4 border-l-emerald-500">
          <p className="text-sm text-[var(--muted)]">Planned energy</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {result.totalPlannedEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-emerald-700">
            Exactly {result.targetFlexEnergyKwh} kWh target
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Planned power</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {result.totalPlannedPowerKw}{" "}
            <span className="text-base font-normal">kW</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Within {optimisationConstraints.maxPowerKw} kW limit
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Selected</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {result.dispatchPlans.length}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            of {result.rankedCandidates.length} eligible resources
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Excluded</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {result.excludedResourceIds.length}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Failed eligibility before scoring
          </p>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_22rem]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
                Dispatch sequence
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Schedule stops at the target
              </h2>
            </div>
            <p className="text-xs text-[var(--muted)]">
              2-hour window · planned values
            </p>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs text-[var(--muted)]">
                <tr>
                  <th className="pb-3 font-medium">Rank</th>
                  <th className="pb-3 font-medium">Resource</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Planned power</th>
                  <th className="pb-3 font-medium">Planned energy</th>
                  <th className="pb-3 text-right font-medium">Decision</th>
                </tr>
              </thead>
              <tbody>
                {result.dispatchPlans.map((plan) => {
                  const selection = result.selections.find(
                    ({ resourceId }) => resourceId === plan.resourceId,
                  );
                  const candidate = result.rankedCandidates.find(
                    ({ resourceId }) => resourceId === plan.resourceId,
                  );
                  const partial =
                    plan.resourceId === finalResourceId && finalIsPartial;
                  return (
                    <tr
                      key={plan.id}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-4 font-mono">
                        {selection?.selectionRank}
                      </td>
                      <td className="py-4">
                        <p className="font-semibold">
                          {resourceName(plan.resourceId)}
                        </p>
                        <p className="font-mono text-xs text-[var(--muted)]">
                          {plan.resourceId}
                        </p>
                      </td>
                      <td className="py-4 font-mono font-semibold">
                        {candidate?.score}
                      </td>
                      <td className="py-4 font-mono">
                        {plan.plannedPowerKw} kW
                      </td>
                      <td className="py-4 font-mono font-semibold">
                        {plan.plannedEnergyKwh} kWh
                      </td>
                      <td className="py-4 text-right">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${partial ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"}`}
                        >
                          {partial ? "Partial final" : "Selected"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {finalIsPartial && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-950">
                Final resource was partially scheduled
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                {resourceName(finalResourceId!)} could shift{" "}
                {finalCandidate!.maxShiftEnergyKwh} kWh, but only{" "}
                {finalPlan!.plannedEnergyKwh} kWh remained. Scheduling stops at
                the target rather than over-dispatching.
              </p>
            </div>
          )}
        </Card>

        <Card className="bg-[var(--council-ink)] text-white">
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent)] uppercase">
            Council scoring rule
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Score sets order, not energy
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt>Network effectiveness</dt>
              <dd className="font-mono font-semibold">35%</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Equity need</dt>
              <dd className="font-mono font-semibold">30%</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Controllability</dt>
              <dd className="font-mono font-semibold">20%</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Rotation fairness</dt>
              <dd className="font-mono font-semibold">60%</dd>
            </div>
          </dl>
          <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-5 text-slate-300">
            All criteria use a 0–100 scale. Ties resolve by resource ID for
            deterministic repeat runs.
          </p>
        </Card>
      </section>

      <section className="mt-5">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent-strong,#956000)] uppercase">
            Rank audit
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Why each eligible resource ranked here
          </h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {result.rankedCandidates.map((candidate) => (
            <Card key={candidate.resourceId}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-[var(--muted)]">
                    Rank {candidate.rank} · {candidate.resourceId}
                  </p>
                  <h3 className="mt-2 font-semibold">
                    {resourceName(candidate.resourceId)}
                  </h3>
                </div>
                <p className="font-mono text-2xl font-semibold">
                  {candidate.score}
                </p>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-[var(--muted)]">Network · 35%</dt>
                  <dd className="mt-1 font-mono">
                    {candidate.networkEffectiveness} →{" "}
                    {candidate.scoreBreakdown.networkEffectiveness}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--muted)]">Equity · 30%</dt>
                  <dd className="mt-1 font-mono">
                    {candidate.equityNeed} →{" "}
                    {candidate.scoreBreakdown.equityNeed}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--muted)]">Control · 20%</dt>
                  <dd className="mt-1 font-mono">
                    {candidate.controllability} →{" "}
                    {candidate.scoreBreakdown.controllability}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--muted)]">
                    Rotation · 15%
                  </dt>
                  <dd className="mt-1 font-mono">
                    {candidate.rotationFairness} →{" "}
                    {candidate.scoreBreakdown.rotationFairness}
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      </section>

      <Card className="mt-5 border-rose-200 bg-rose-50">
        <p className="text-xs font-bold tracking-[0.12em] text-rose-700 uppercase">
          Blocked-plan behavior
        </p>
        <h2 className="mt-2 text-xl font-semibold text-rose-950">
          Insufficient flexibility remains visible
        </h2>
        <p className="mt-2 text-sm leading-6 text-rose-900">
          If eligible resources cannot meet the target within the power limit,
          the engine returns{" "}
          <span className="font-mono font-semibold">
            insufficient_flexibility
          </span>{" "}
          with an exact kWh shortfall. It never manufactures energy or silently
          exceeds constraints.
        </p>
      </Card>
    </div>
  );
}
