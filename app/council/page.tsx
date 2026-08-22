import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  councilCell,
  councilEvents,
  councilResources,
  eventStages,
} from "@/lib/data/council";

export default function CouncilPage() {
  const activeEvent = councilEvents[0];
  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Operations overview · 22 Aug 2026
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            {councilCell.name}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {councilCell.code} · Forecast and resource data are simulated
          </p>
        </div>
        <Link
          href={`/council/events/${activeEvent.id}`}
          className="inline-flex min-h-11 items-center rounded-full bg-[var(--council-ink)] px-5 text-sm font-semibold text-white"
        >
          Open active event →
        </Link>
      </header>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Cell summary"
      >
        <Card className="border-l-4 border-l-rose-500">
          <p className="text-sm text-[var(--muted)]">Constraint risk</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold capitalize">
              {councilCell.constraintRisk}
            </p>
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800">
              Action advised
            </span>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Solar export forecast</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {councilCell.solarExportForecastKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            12:00–2:00 pm window
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Available flexibility</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {councilCell.availableFlexEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-emerald-700">125% of event target</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Eligible resources</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {activeEvent.eligibleResources}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">Hard gates passed</p>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="metric-grid overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent-strong,#956000)] uppercase">
                Forecast context
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Midday export opportunity
              </h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm">
              86% confidence
            </span>
          </div>
          <div
            className="mt-8 flex h-36 items-end gap-3"
            aria-label="Simulated solar export forecast from 9 am to 4 pm"
          >
            {[28, 45, 68, 92, 100, 84, 57, 32].map((height, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className={`w-full rounded-t-md ${index >= 3 && index <= 4 ? "bg-[var(--council-accent)]" : "bg-teal-700/25"}`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-[var(--muted)]">
                  {index + 9}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
            <span>
              <b className="text-[var(--foreground)]">Recommended:</b>{" "}
              {councilCell.recommendedWindow}
            </span>
            <span>
              <b className="text-[var(--foreground)]">Source:</b> simulated
              network forecast
            </span>
            <Link
              href="/council/windows"
              className="font-semibold text-teal-800"
            >
              Review selection →
            </Link>
          </div>
        </Card>

        <Card className="bg-[var(--council-ink)] text-white">
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent)] uppercase">
            Active event
          </p>
          <h2 className="mt-3 text-2xl font-semibold">{activeEvent.name}</h2>
          <p className="mt-2 text-sm text-slate-300">
            Target {activeEvent.targetFlexEnergyKwh} kWh · max{" "}
            {activeEvent.maxPowerKw} kW
          </p>
          <ol className="mt-7 space-y-2" aria-label="Event workflow">
            {eventStages.map((stage, index) => (
              <li
                key={stage}
                className={`flex items-center gap-3 rounded-xl p-3 ${index === 0 ? "bg-white text-[var(--council-ink)]" : "border border-white/10 text-slate-400"}`}
              >
                <span
                  className={`grid size-7 place-items-center rounded-full font-mono text-xs ${index === 0 ? "bg-[var(--council-accent)]" : "bg-white/5"}`}
                >
                  {index + 1}
                </span>
                <span className="text-sm font-semibold">{stage}</span>
                {index === 0 && (
                  <span className="ml-auto text-xs">Current</span>
                )}
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_18rem]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent-strong,#956000)] uppercase">
                Scoring summary
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                Top candidate resources
              </h2>
            </div>
            <Link
              href="/council/resources"
              className="text-sm font-semibold text-teal-800"
            >
              View all →
            </Link>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs text-[var(--muted)]">
                <tr>
                  <th className="pb-3 font-medium">Resource</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Capacity</th>
                  <th className="pb-3 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {councilResources.slice(0, 3).map((resource) => (
                  <tr
                    key={resource.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-4">
                      <p className="font-semibold">{resource.name}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {resource.id}
                      </p>
                    </td>
                    <td className="py-4">{resource.type}</td>
                    <td className="py-4 font-mono">
                      {resource.capacityKwh} kWh
                    </td>
                    <td className="py-4 text-right">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 font-mono font-semibold text-emerald-900">
                        {resource.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Equity reach</p>
          <p className="mt-3 font-mono text-4xl font-semibold">
            {councilCell.roofAccessResidents}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            residents without practical roof access are included in this cell.
          </p>
          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <p className="text-sm font-semibold">15% Equity Floor</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Council demo policy
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
