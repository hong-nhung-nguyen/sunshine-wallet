import { Card } from "@/components/ui/card";
import { flexibleResources } from "@/lib/data";
import { simulationInputs } from "@/lib/data/simulation-fixtures";
import { simulateEvent } from "@/lib/engine/simulation";

const resourceName = (resourceId: string) =>
  flexibleResources.find(({ id }) => id === resourceId)?.name ?? resourceId;

export default function SimulationPage() {
  const simulation = simulateEvent(simulationInputs);
  const chartMaximumKwh = Math.max(
    ...simulation.dispatchResults.map(
      ({ observedEnergyKwh }) => observedEnergyKwh ?? 0,
    ),
  );

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Event simulation · {simulation.eventId}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            Expected solar-soak response
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Fixed response factors estimate how planned flexible loads may
            respond. Baseline, planned, simulated actual and observed energy
            remain separate; none of these values are verified meter outcomes.
          </p>
        </div>
        <span className="rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-950">
          Simulated · not verified
        </span>
      </header>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Simulation summary"
      >
        <Card>
          <p className="text-sm text-[var(--muted)]">Planned flexibility</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {simulation.plannedFlexEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Scheduled before simulation
          </p>
        </Card>
        <Card className="border-l-4 border-l-[var(--council-accent)]">
          <p className="text-sm text-[var(--muted)]">Simulated response</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {simulation.estimatedFlexEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-amber-700">
            {simulation.targetAchievementPercent}% of plan
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Baseline demand</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {simulation.baselineEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Estimated without intervention
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Observed demand</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {simulation.observedEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Baseline + simulated solar soak
          </p>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_22rem]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
                Energy comparison
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Baseline and observed stay distinct
              </h2>
            </div>
            <div className="flex gap-4 text-xs text-[var(--muted)]">
              <span>
                <i className="mr-1 inline-block size-2 rounded-full bg-slate-300" />
                Baseline
              </span>
              <span>
                <i className="mr-1 inline-block size-2 rounded-full bg-[var(--council-accent)]" />
                Simulated flexibility
              </span>
            </div>
          </div>
          <div
            className="mt-8 space-y-6"
            role="img"
            aria-label="Stacked bars comparing baseline demand and simulated flexible energy by resource"
          >
            {simulation.dispatchResults.map((result) => {
              const baseline = result.baselineEnergyKwh ?? 0;
              const actual = result.actualEnergyKwh;
              return (
                <div key={result.id}>
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        {resourceName(result.resourceId)}
                      </p>
                      <p className="font-mono text-xs text-[var(--muted)]">
                        {result.resourceId}
                      </p>
                    </div>
                    <p className="font-mono text-sm font-semibold">
                      {result.observedEnergyKwh} kWh observed
                    </p>
                  </div>
                  <div className="mt-3 flex h-8 w-full overflow-hidden rounded-lg bg-slate-100">
                    <span
                      className="bg-slate-300"
                      style={{
                        width: `${(baseline / chartMaximumKwh) * 100}%`,
                      }}
                      title={`Baseline ${baseline} kWh`}
                    />
                    <span
                      className="bg-[var(--council-accent)]"
                      style={{ width: `${(actual / chartMaximumKwh) * 100}%` }}
                      title={`Simulated flexibility ${actual} kWh`}
                    />
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-[var(--muted)]">
                    <span>Baseline {baseline} kWh</span>
                    <span>+ simulated {actual} kWh</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="bg-[var(--council-ink)] text-white">
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent)] uppercase">
            Simulation rule
          </p>
          <h2 className="mt-2 text-xl font-semibold">No randomness</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Simulated actual energy equals planned energy multiplied by a fixed
            response factor. The same inputs always produce the same output.
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">
              Weighted dispatch confidence
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold">
              {Math.round(simulation.dispatchConfidence * 100)}%
            </p>
          </div>
          <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-300">
            Source: mocked dispatch acknowledgements · calculated locally · no
            live device control
          </p>
        </Card>
      </section>

      <Card className="mt-5">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent-strong,#956000)] uppercase">
            Resource audit
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Planned versus simulated
          </h2>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b border-[var(--border)] text-xs text-[var(--muted)]">
              <tr>
                <th className="pb-3 font-medium">Resource</th>
                <th className="pb-3 font-medium">Planned</th>
                <th className="pb-3 font-medium">Response factor</th>
                <th className="pb-3 font-medium">Simulated actual</th>
                <th className="pb-3 font-medium">Confidence</th>
                <th className="pb-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {simulation.dispatchResults.map((result, index) => (
                <tr
                  key={result.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="py-4">
                    <p className="font-semibold">
                      {resourceName(result.resourceId)}
                    </p>
                    <p className="font-mono text-xs text-[var(--muted)]">
                      {result.resourceId}
                    </p>
                  </td>
                  <td className="py-4 font-mono">
                    {result.plannedEnergyKwh} kWh
                  </td>
                  <td className="py-4 font-mono">
                    × {simulationInputs[index].responseFactor}
                  </td>
                  <td className="py-4 font-mono font-semibold">
                    {result.actualEnergyKwh} kWh
                  </td>
                  <td className="py-4 font-mono">
                    {Math.round(result.confidence * 100)}%
                  </td>
                  <td className="py-4 text-right">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${result.status === "completed" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}
                    >
                      {result.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-5 border-teal-200 bg-teal-50">
        <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
          Next lifecycle gate
        </p>
        <h2 className="mt-2 text-xl font-semibold text-teal-950">
          Simulation is not verification
        </h2>
        <p className="mt-2 text-sm leading-6 text-teal-900">
          This result estimates expected response before the event is verified.
          Settlement and credits remain blocked until later
          measurement-and-verification checks compare actual readings with an
          approved baseline and pass the confidence gate.
        </p>
      </Card>
    </div>
  );
}
