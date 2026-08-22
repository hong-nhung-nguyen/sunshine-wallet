import Link from "next/link";
import { Card } from "@/components/ui/card";
import { councilEvents, eventStages } from "@/lib/data/council";

export default function CouncilEventsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Event management
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            Sunshine events
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Review event windows, lifecycle status and policy before taking
            action.
          </p>
        </div>
        <Link
          href="/council/events/new"
          className="inline-flex min-h-11 items-center rounded-full bg-[var(--council-accent)] px-5 text-sm font-bold text-[var(--council-ink)]"
        >
          Create event
        </Link>
      </header>
      <Card className="mt-7">
        <h2 className="text-lg font-semibold">Event lifecycle</h2>
        <ol className="mt-5 grid gap-2 sm:grid-cols-5">
          {eventStages.map((stage, index) => (
            <li
              key={stage}
              className="rounded-xl bg-[var(--surface-muted)] p-4"
            >
              <span className="font-mono text-xs text-teal-700">
                0{index + 1}
              </span>
              <p className="mt-2 text-sm font-semibold">{stage}</p>
            </li>
          ))}
        </ol>
      </Card>
      <section className="mt-5 space-y-4" aria-label="Events">
        {councilEvents.map((event) => (
          <Card
            key={event.id}
            className={
              event.status !== "settled"
                ? "border-l-4 border-l-[var(--council-accent)]"
                : ""
            }
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold">{event.name}</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${event.status === "settled" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}
                  >
                    {event.statusLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {event.id} · {event.dateLabel} · {event.windowLabel}
                </p>
              </div>
              <Link
                href={`/council/events/${event.id}`}
                className="inline-flex min-h-10 items-center rounded-full border border-[var(--border)] px-4 text-sm font-semibold hover:bg-[var(--surface-muted)]"
              >
                Open event →
              </Link>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-[var(--muted)]">Target</dt>
                <dd className="mt-1 font-mono font-semibold">
                  {event.targetFlexEnergyKwh} kWh
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Available</dt>
                <dd className="mt-1 font-mono font-semibold">
                  {event.availableFlexEnergyKwh} kWh
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Confidence</dt>
                <dd className="mt-1 font-mono font-semibold">
                  {Math.round(event.confidence * 100)}%
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Equity Floor</dt>
                <dd className="mt-1 font-mono font-semibold">
                  {event.equityFloorPercent}%
                </dd>
              </div>
            </dl>
          </Card>
        ))}
      </section>
    </div>
  );
}
