import Link from "next/link";
import { AreaOverview } from "@/components/council/area-overview";
import { DispatchConsole } from "@/components/council/dispatch-console";
import { Card } from "@/components/ui/card";
import { councilAreas, councilCell, councilEvents } from "@/lib/data/council";

export default function CouncilPage() {
  const activeEvent = councilEvents[0];
  return (
    <div className="mx-auto max-w-7xl">
      <header
        id="dapto-demo"
        className="flex scroll-mt-6 flex-wrap items-end justify-between gap-5"
      >
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Dispatch planner · 22 Aug 2026
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            {councilCell.name}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {councilCell.code} · Who is switching, where and when. Forecast,
            switching and map data are simulated.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/council/events"
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-white px-5 text-sm font-semibold hover:bg-[var(--surface-muted)]"
          >
            Solar opportunities
          </Link>
          <Link
            href={`/council/events/${activeEvent.id}`}
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--council-ink)] px-5 text-sm font-semibold text-white"
          >
            Open active event →
          </Link>
        </div>
      </header>

      <AreaOverview areas={councilAreas} />

      <div className="mt-6">
        <DispatchConsole />
      </div>

      <section
        className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Cell summary"
      >
        <Card className="border-l-4 border-l-rose-500">
          <p className="text-sm text-[var(--muted)]">Network congestion risk</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold capitalize">
              {councilCell.constraintRisk}
            </p>
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800">
              Schedule an event
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
            {councilCell.recommendedWindow} window
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Available flexibility</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {councilCell.availableFlexEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-emerald-700">
            {Math.round(
              (councilCell.availableFlexEnergyKwh /
                activeEvent.targetFlexEnergyKwh) *
                100,
            )}
            % of event target
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Event target</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {activeEvent.targetFlexEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            flexible energy required
          </p>
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
              {Math.round(councilCell.forecastConfidence * 100)}% confidence
            </span>
          </div>
          <div
            className="mt-8 flex h-36 items-stretch gap-3"
            aria-label="Simulated solar export forecast from 9 am to 4 pm"
          >
            {[28, 45, 68, 92, 100, 84, 57, 32].map((height, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col items-center gap-2"
              >
                {/* A percentage height needs a parent with a definite one. */}
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-md ${index >= 3 && index <= 4 ? "bg-[var(--council-accent)]" : "bg-teal-700/25"}`}
                    style={{ height: `${height}%` }}
                  />
                </div>
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
            How a switch gets on the map
          </p>
          <h2 className="mt-3 text-2xl font-semibold">{activeEvent.name}</h2>
          <ol className="mt-6 space-y-3 text-sm">
            {[
              {
                title: "Review the opportunity",
                body: "Events lists the best simulated solar windows.",
              },
              {
                title: "Open the record and assign",
                body: "Pick the retailer or battery owner that will switch.",
              },
              {
                title: "They approve",
                body: "The request waits with the partner until answered.",
              },
              {
                title: "Watch it live",
                body: "Approved switches appear on the map above; hover for area and time.",
              },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 font-mono text-xs text-[var(--council-accent)]">
                  {index + 1}
                </span>
                <span>
                  <b className="font-semibold">{step.title}</b>
                  <span className="mt-0.5 block text-slate-300">
                    {step.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <Link
            href="/council/events"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[var(--council-accent)] px-5 text-sm font-bold text-[var(--council-ink)]"
          >
            View records →
          </Link>
        </Card>
      </section>
    </div>
  );
}
