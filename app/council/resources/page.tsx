import { Card } from "@/components/ui/card";
import { flexibleResources } from "@/lib/data";

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ResourcesPage() {
  const eligibleResources = flexibleResources.filter(
    (resource) => resource.eligibility?.eligible,
  );
  const rejectedResources = flexibleResources.filter(
    (resource) => resource.eligibility && !resource.eligibility.eligible,
  );
  const totalShiftEnergyKwh = eligibleResources.reduce(
    (total, resource) => total + resource.maxShiftEnergyKwh,
    0,
  );
  const totalCapacityKw = eligibleResources.reduce(
    (total, resource) => total + resource.capacityKw,
    0,
  );

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Resource eligibility · event_001
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            Flexible resource dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Review hard-gate results before optimisation. This page uses
            deterministic seed data for DAPTO-01 and does not represent a live
            device connection.
          </p>
        </div>
        <span className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-900">
          Checked 22 Aug 2026 · 9:30 am
        </span>
      </header>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Eligibility summary"
      >
        <Card className="border-l-4 border-l-emerald-500">
          <p className="text-sm text-[var(--muted)]">Eligible resources</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {eligibleResources.length}
          </p>
          <p className="mt-2 text-xs text-emerald-700">All hard gates passed</p>
        </Card>
        <Card className="border-l-4 border-l-rose-500">
          <p className="text-sm text-[var(--muted)]">Not eligible</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {rejectedResources.length}
          </p>
          <p className="mt-2 text-xs text-rose-700">Excluded before scoring</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Eligible power</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {totalCapacityKw} <span className="text-base font-normal">kW</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Maximum combined power
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Shift available</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {totalShiftEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Before optimisation
          </p>
        </Card>
      </section>

      <section
        className="mt-5 grid gap-4 lg:grid-cols-2"
        aria-label="Resource eligibility results"
      >
        {flexibleResources.map((resource) => {
          const eligibility = resource.eligibility;
          const eligible = eligibility?.eligible === true;
          return (
            <Card
              key={resource.id}
              className={eligible ? "border-emerald-300" : "border-rose-200"}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-[var(--muted)]">
                    {resource.id} · {resource.participantId}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    {resource.name}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {formatLabel(resource.resourceType)} · {resource.locationId}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${eligible ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}
                >
                  {eligible ? "Eligible" : "Not eligible"}
                </span>
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-[var(--surface-muted)] p-4">
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
                <div>
                  <dt className="text-xs text-[var(--muted)]">Device state</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {formatLabel(resource.status)}
                  </dd>
                </div>
              </dl>
              <div className="mt-5">
                <p className="text-xs font-bold tracking-[0.1em] text-[var(--muted)] uppercase">
                  Gate explanation
                </p>
                <ul className="mt-3 space-y-2">
                  {(
                    eligibility?.reasons ?? ["Eligibility has not been checked"]
                  ).map((reason) => (
                    <li key={reason} className="flex gap-2 text-sm leading-6">
                      <span
                        aria-hidden="true"
                        className={
                          eligible ? "text-emerald-600" : "text-rose-600"
                        }
                      >
                        {eligible ? "✓" : "×"}
                      </span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
                <span>
                  Compatibility:{" "}
                  {resource.dispatchable
                    ? "Dispatchable flexible load"
                    : "Not a dispatchable load"}
                </span>
                <span className="font-mono">
                  Confidence {Math.round((eligibility?.confidence ?? 0) * 100)}%
                </span>
              </div>
              <div className="mt-3 rounded-xl bg-slate-100 px-4 py-3 text-xs leading-5 text-slate-700">
                Optimisation status:{" "}
                {eligible
                  ? "Eligible to be considered — not yet scored or selected"
                  : "Rejected by hard gates — scoring blocked"}
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="mt-5 bg-[var(--council-ink)] text-white">
        <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent)] uppercase">
              Decision boundary
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              Eligibility comes before optimisation
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Consent, Sunshine Cell, load compatibility, availability, safety
              and comfort are non-negotiable gates. Equity weighting cannot make
              an unsafe or non-consenting resource eligible.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold">Next engine step</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Only the {eligibleResources.length} eligible resources may receive
              network, equity, controllability and rotation scores. A future
              score will set order, not delivered energy.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
