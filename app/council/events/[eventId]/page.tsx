import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  councilEvents,
  councilResources,
  eventStages,
} from "@/lib/data/council";

export function generateStaticParams() {
  return councilEvents.map((event) => ({ eventId: event.id }));
}

export default async function CouncilEventDetailPage({
  params,
}: Readonly<{ params: Promise<{ eventId: string }> }>) {
  const { eventId } = await params;
  const event = councilEvents.find((item) => item.id === eventId);
  if (!event) notFound();
  const currentStage = event.status === "settled" ? 4 : 0;
  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/council/events"
        className="text-sm font-semibold text-teal-800"
      >
        ← All events
      </Link>
      <header className="mt-5 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
              {event.name}
            </h1>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              {event.statusLabel}
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {event.id} · {event.dateLabel} · {event.windowLabel}
          </p>
        </div>
        <Link
          href="/council/engine"
          className="inline-flex min-h-11 items-center rounded-full bg-[var(--council-ink)] px-5 text-sm font-semibold text-white"
        >
          Review complete engine flow →
        </Link>
      </header>
      <Card className="mt-7">
        <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
          Lifecycle
        </p>
        <ol className="mt-5 grid gap-2 sm:grid-cols-5">
          {eventStages.map((stage, index) => (
            <li
              key={stage}
              className={`rounded-xl p-4 ${index === currentStage ? "bg-[var(--council-ink)] text-white" : "bg-[var(--surface-muted)]"}`}
            >
              <span
                className={`font-mono text-xs ${index === currentStage ? "text-[var(--council-accent)]" : "text-teal-700"}`}
              >
                0{index + 1}
              </span>
              <p className="mt-2 text-sm font-semibold">{stage}</p>
            </li>
          ))}
        </ol>
      </Card>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_20rem]">
        <Card>
          <h2 className="text-xl font-semibold">Event parameters</h2>
          <dl className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-[var(--muted)]">Target energy</dt>
              <dd className="mt-1 font-mono font-semibold">
                {event.targetFlexEnergyKwh} kWh
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">Max power</dt>
              <dd className="mt-1 font-mono font-semibold">
                {event.maxPowerKw} kW
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
          </dl>
          <div className="mt-6 rounded-2xl bg-[var(--surface-muted)] p-4">
            <p className="text-xs font-semibold text-[var(--muted)]">
              Provenance
            </p>
            <p className="mt-2 text-sm">
              Simulated network forecast · Constraint expected during midday
              export period
            </p>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Council policy</p>
          <p className="mt-3 font-mono text-4xl font-semibold">
            {event.equityFloorPercent}%
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            minimum Equity Floor
          </p>
          <p className="mt-5 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--muted)]">
            Policy inputs remain reviewable by Council before settlement.
          </p>
        </Card>
      </section>
      <Card className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Candidate preview</h2>
          <Link
            href="/council/resources"
            className="text-sm font-semibold text-teal-800"
          >
            View scoring →
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {councilResources.slice(0, 3).map((resource) => (
            <div
              key={resource.id}
              className="rounded-2xl border border-[var(--border)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{resource.id}</p>
                <span className="font-mono text-sm font-semibold text-teal-800">
                  {resource.score}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {resource.name}
              </p>
              <p className="mt-4 font-mono text-sm">
                {resource.capacityKwh} kWh available
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
