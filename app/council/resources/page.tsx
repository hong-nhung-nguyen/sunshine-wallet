import { Card } from "@/components/ui/card";
import { flexEvents, flexibleResources } from "@/lib/data";
import { resourceEligibilityContexts } from "@/lib/data/resource-eligibility-contexts";
import { filterEligibleResources } from "@/lib/engine/resource-eligibility";

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ResourcesPage() {
  const event = flexEvents.find(({ id }) => id === "event_001");
  if (!event) return null;
  const { decisions, eligibleResources } = filterEligibleResources(
    flexibleResources,
    resourceEligibilityContexts,
  );
  const totalEligibleShiftKwh = eligibleResources.reduce(
    (total, resource) => total + resource.maxShiftEnergyKwh,
    0,
  );

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Eligibility engine · {event.id}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            Resource hard-gate review
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Deterministic checks decide which flexible resources may proceed to
            optimisation. No score or equity weighting can override a failed
            gate.
          </p>
        </div>
        <span className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-900">
          Mock adapter checks · calculated results
        </span>
      </header>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Eligibility summary"
      >
        <Card className="border-l-4 border-l-emerald-500">
          <p className="text-sm text-[var(--muted)]">Eligible</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {eligibleResources.length}
          </p>
          <p className="mt-2 text-xs text-emerald-700">
            May proceed to scoring
          </p>
        </Card>
        <Card className="border-l-4 border-l-rose-500">
          <p className="text-sm text-[var(--muted)]">Rejected</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {decisions.length - eligibleResources.length}
          </p>
          <p className="mt-2 text-xs text-rose-700">Blocked before scoring</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Eligible shift</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {totalEligibleShiftKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Against {event.targetFlexEnergyKwh} kWh target
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Event cell</p>
          <p className="mt-3 font-mono text-xl font-semibold">DAPTO-01</p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {event.sunshineCellId}
          </p>
        </Card>
      </section>

      <section className="mt-5 space-y-4" aria-label="Resource decisions">
        {flexibleResources.map((resource) => {
          const decision = decisions.find(
            ({ resourceId }) => resourceId === resource.id,
          );
          if (!decision) return null;
          return (
            <Card
              key={resource.id}
              className={
                decision.eligible ? "border-emerald-300" : "border-rose-200"
              }
            >
              <div className="grid gap-6 xl:grid-cols-[17rem_1fr_13rem]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${decision.eligible ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}
                    >
                      {decision.eligible ? "Eligible" : "Rejected"}
                    </span>
                    <span className="font-mono text-xs text-[var(--muted)]">
                      {resource.id}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold">
                    {resource.name}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {formatLabel(resource.resourceType)} ·{" "}
                    {resource.participantId}
                  </p>
                  <dl className="mt-5 grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-xs text-[var(--muted)]">Power</dt>
                      <dd className="mt-1 font-mono text-sm font-semibold">
                        {resource.capacityKw} kW
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--muted)]">Max shift</dt>
                      <dd className="mt-1 font-mono text-sm font-semibold">
                        {resource.maxShiftEnergyKwh} kWh
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <p className="text-xs font-bold tracking-[0.1em] text-[var(--muted)] uppercase">
                    Eight hard gates
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {decision.gates.map((gate) => (
                      <div
                        key={gate.code}
                        className={`rounded-xl border p-3 ${gate.passed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={
                              gate.passed ? "text-emerald-700" : "text-rose-700"
                            }
                          >
                            {gate.passed ? "✓" : "×"}
                          </span>
                          <p className="text-sm font-semibold">{gate.label}</p>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          {gate.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
                  <p className="text-xs text-[var(--muted)]">
                    Decision confidence
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold">
                    {Math.round(decision.confidence * 100)}%
                  </p>
                  <p className="mt-4 text-xs text-[var(--muted)]">
                    Device state
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatLabel(resource.status)}
                  </p>
                  <p className="mt-4 text-xs text-[var(--muted)]">
                    Result code
                  </p>
                  <p
                    className={`mt-1 font-mono text-xs font-semibold break-words ${decision.eligible ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    {decision.eligible
                      ? "ELIGIBLE"
                      : decision.rejectionCodes.join(" + ")}
                  </p>
                  <p className="mt-4 border-t border-[var(--border)] pt-3 text-xs leading-5 text-[var(--muted)]">
                    Checked {decision.checkedAt} using simulated availability,
                    comfort and safety acknowledgements.
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="mt-5 bg-[var(--council-ink)] text-white">
        <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent)] uppercase">
              Engine boundary
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              Eligibility filters; optimisation ranks
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              This engine evaluates consent, cell, window availability,
              compatibility, controllability, capability, comfort and safety. It
              does not select dispatch energy or calculate resident benefits.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold">
              Resident equity remains separate
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              A household without an eligible device can still receive an Equity
              Dividend under Council policy. Device eligibility only controls
              contributor participation.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
