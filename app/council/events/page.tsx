import Link from "next/link";
import { Card } from "@/components/ui/card";
import { councilEvents } from "@/lib/data/council";

export default function CouncilEventsPage() {
  const [todayEvent, ...previousEvents] = councilEvents;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Event management
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            Daily Sunshine events
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            A new local solar window is assessed every day. Review today&apos;s
            run, take the next action and keep a complete record of earlier
            outcomes.
          </p>
        </div>
        <Link
          href="/council/events/new"
          className="inline-flex min-h-11 items-center rounded-full bg-[var(--council-accent)] px-5 text-sm font-bold text-[var(--council-ink)]"
        >
          Create manual event
        </Link>
      </header>

      <section className="mt-7" aria-labelledby="today-event-heading">
        <Card className="border-0 bg-[var(--council-ink)] text-white shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-[var(--council-accent)]">
                Today · {todayEvent.dateLabel}
              </p>
              <h2
                id="today-event-heading"
                className="mt-2 text-2xl font-semibold"
              >
                {todayEvent.name}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Today&apos;s best window is ready. Check the forecast and
                available flexibility before optimisation begins.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/council/windows"
                className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-[var(--council-accent)] hover:text-amber-200"
              >
                See how it was selected →
              </Link>
              <Link
                href={`/council/events/${todayEvent.id}`}
                className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-bold text-[var(--council-ink)] transition-colors hover:bg-slate-100"
              >
                Open today&apos;s event →
              </Link>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-4">
            <Metric label="Selected window" value={todayEvent.windowLabel} />
            <Metric
              label="Target"
              value={`${todayEvent.targetFlexEnergyKwh} kWh`}
            />
            <Metric
              label="Available"
              value={`${todayEvent.availableFlexEnergyKwh} kWh`}
            />
            <Metric
              label="Forecast confidence"
              value={`${Math.round(todayEvent.confidence * 100)}%`}
            />
          </dl>
        </Card>
      </section>

      <section className="mt-8" aria-labelledby="event-history-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
              Daily record
            </p>
            <h2
              id="event-history-heading"
              className="mt-1 text-2xl font-semibold text-[var(--council-ink)]"
            >
              Previous events
            </h2>
          </div>
          <p className="text-sm text-[var(--muted)]">
            {previousEvents.length} recorded runs
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {previousEvents.map((event) => (
            <Card key={event.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-teal-800">
                    {event.dateLabel}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{event.name}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {event.windowLabel} · {event.statusLabel} · {event.id}
                  </p>
                </div>
                <Link
                  href={`/council/events/${event.id}`}
                  className="inline-flex min-h-10 items-center rounded-full border border-[var(--border)] px-4 text-sm font-semibold hover:bg-[var(--surface-muted)]"
                >
                  View record →
                </Link>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-4">
                <HistoryMetric
                  label="Target"
                  value={`${event.targetFlexEnergyKwh} kWh`}
                />
                <HistoryMetric
                  label="Available"
                  value={`${event.availableFlexEnergyKwh} kWh`}
                />
                <HistoryMetric
                  label="Confidence"
                  value={`${Math.round(event.confidence * 100)}%`}
                />
                <HistoryMetric
                  label="Equity Floor"
                  value={`${event.equityFloorPercent}%`}
                />
              </dl>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-1 font-mono font-semibold">{value}</dd>
    </div>
  );
}

function HistoryMetric({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <dt className="text-xs text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 font-mono font-semibold">{value}</dd>
    </div>
  );
}
