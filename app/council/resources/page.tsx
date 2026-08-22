import Link from "next/link";
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
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Resource selection · DAPTO-01
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            Event resource pool
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Review which local resources can support this event window. Open any
            rejected result to see the checks that failed.
          </p>
        </div>
        <Link
          href="/council/optimisation"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--council-ink)] px-5 text-sm font-semibold text-[var(--council-ink)] hover:bg-white"
        >
          See selection calculation →
        </Link>
      </header>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-3"
        aria-label="Resource pool summary"
      >
        <Card className="border-l-4 border-l-emerald-500 p-5">
          <p className="text-sm text-[var(--muted)]">Selected resources</p>
          <p className="mt-2 font-mono text-3xl font-semibold">
            {eligibleResources.length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Available shift</p>
          <p className="mt-2 font-mono text-3xl font-semibold">
            {totalEligibleShiftKwh} <span className="text-base">kWh</span>
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted)]">Event target</p>
          <p className="mt-2 font-mono text-3xl font-semibold">
            {event.targetFlexEnergyKwh} <span className="text-base">kWh</span>
          </p>
        </Card>
      </section>

      <Card className="mt-5 overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold">Resource allocation pool</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {eligibleResources.length} of {flexibleResources.length} resources
              may proceed to optimisation
            </p>
          </div>
          <span className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 font-mono text-xs font-semibold text-emerald-800">
            {totalEligibleShiftKwh} kWh selected
          </span>
        </div>

        <div className="hidden grid-cols-[1.2fr_1.2fr_0.7fr_0.8fr] gap-4 border-b border-[var(--border)] bg-[var(--surface-muted)] px-6 py-3 text-xs font-semibold tracking-wide text-[var(--muted)] uppercase md:grid">
          <span>Resource</span>
          <span>Type</span>
          <span>Max shift</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {flexibleResources.map((resource) => {
            const decision = decisions.find(
              ({ resourceId }) => resourceId === resource.id,
            );
            if (!decision) return null;
            const failedGates = decision.gates.filter((gate) => !gate.passed);
            return (
              <div
                key={resource.id}
                className={decision.eligible ? "bg-white" : "bg-rose-50/30"}
              >
                <div className="grid gap-3 px-5 py-4 md:grid-cols-[1.2fr_1.2fr_0.7fr_0.8fr] md:items-center md:gap-4 md:px-6">
                  <div>
                    <p className="font-semibold">{resource.name}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                      {resource.id}
                    </p>
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {formatLabel(resource.resourceType)}
                  </p>
                  <p className="font-mono text-sm font-semibold">
                    {resource.maxShiftEnergyKwh} kWh
                  </p>
                  {decision.eligible ? (
                    <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      Selected
                    </span>
                  ) : (
                    <details className="group md:col-span-4">
                      <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 text-sm font-semibold text-rose-800 transition-colors hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">
                        <span aria-hidden="true" className="text-base">
                          ⚠
                        </span>
                        Rejected · view {failedGates.length} failed{" "}
                        {failedGates.length === 1 ? "check" : "checks"}
                        <span
                          aria-hidden="true"
                          className="transition-transform group-open:rotate-180"
                        >
                          ▾
                        </span>
                      </summary>
                      <div className="mt-3 grid gap-3 rounded-2xl border border-rose-200 bg-white p-4 sm:grid-cols-2">
                        {failedGates.map((gate) => (
                          <div key={gate.code} className="flex gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-rose-100 text-xs font-bold text-rose-700"
                            >
                              !
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-rose-900">
                                {gate.label}
                              </p>
                              <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                                {gate.explanation}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <p className="mt-5 rounded-2xl bg-[var(--surface-muted)] px-5 py-4 text-sm leading-6 text-[var(--muted)]">
        Eligibility checks consent, location, availability, compatibility,
        controllability, capability, comfort and safety. A rejected resource is
        excluded before optimisation; resident Equity Dividend eligibility is
        assessed separately.
      </p>
    </div>
  );
}
