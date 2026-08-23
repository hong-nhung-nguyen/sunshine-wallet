import Link from "next/link";
import { notFound } from "next/navigation";
import { AssignSwitchPanel } from "@/components/council/assign-switch-panel";
import { EventAssignments } from "@/components/council/event-assignments";
import { Card } from "@/components/ui/card";
import {
  councilEventCreationFixture,
  councilEvents,
  councilPolicy,
  councilResources,
} from "@/lib/data/council";

const eventRecords = [...councilEvents, councilEventCreationFixture];

export function generateStaticParams() {
  return eventRecords.map((event) => ({ eventId: event.id }));
}

export default async function CouncilEventDetailPage({
  params,
}: Readonly<{ params: Promise<{ eventId: string }> }>) {
  const { eventId } = await params;
  const event = eventRecords.find((item) => item.id === eventId);
  if (!event) notFound();
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
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${event.status === "draft" ? "bg-slate-200 text-slate-800" : "bg-amber-100 text-amber-900"}`}
            >
              {event.statusLabel}
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {event.id} · {event.dateLabel} · {event.windowLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AssignSwitchPanel
            eventId={event.id}
            windowStart={event.windowStart}
            windowEnd={event.windowEnd}
            targetFlexEnergyKwh={event.targetFlexEnergyKwh}
          />
          <Link
            href="/council/demo"
            className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-teal-800"
          >
            See how it worked →
          </Link>
          <Link
            href="/council/settlement"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--council-ink)] px-5 text-sm font-semibold text-white"
          >
            Review settlement →
          </Link>
        </div>
      </header>
      <section className="mt-7 grid gap-5 xl:grid-cols-[1fr_20rem]">
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
              <dt className="text-xs text-[var(--muted)]">Max shift</dt>
              <dd className="mt-1 font-mono font-semibold">
                {event.maxShiftEnergyKwh} kWh
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">Confidence</dt>
              <dd className="mt-1 font-mono font-semibold">
                {Math.round(event.confidence * 100)}%
              </dd>
            </div>
          </dl>
          <dl className="mt-6 grid gap-4 rounded-2xl bg-[var(--surface-muted)] p-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-[var(--muted)]">Sunshine Cell</dt>
              <dd className="mt-1 text-sm font-semibold">
                {event.sunshineCellName}
              </dd>
              <dd className="font-mono text-xs text-[var(--muted)]">
                {event.sunshineCellId}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">Window starts</dt>
              <dd className="mt-1 font-mono text-sm font-semibold">
                {event.windowStart}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">Window ends</dt>
              <dd className="mt-1 font-mono text-sm font-semibold">
                {event.windowEnd}
              </dd>
            </div>
          </dl>
          <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-4">
            <p className="text-xs font-semibold text-teal-800">
              Operator explanation
            </p>
            <p className="mt-2 text-sm leading-6 text-teal-950">
              {event.explanation}
            </p>
            <p className="mt-3 text-xs text-teal-800">
              Source: {event.provenance}
            </p>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Council policy</p>
          <p className="mt-3 font-mono text-4xl font-semibold">
            {event.equityFloorPercent}%
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            monthly Equity Pool policy
          </p>
          <p className="mt-5 border-t border-[var(--border)] pt-4 text-sm font-semibold">
            {councilPolicy.version}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Effective {councilPolicy.effectiveDate}
          </p>
          <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
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
            View resources →
          </Link>
        </div>
        {event.status === "draft" ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-6">
            <p className="font-semibold">No candidates selected yet</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Consent, location, compatibility, availability, comfort and safety
              gates run before scoring. Selection is intentionally reserved for
              a later lifecycle step.
            </p>
          </div>
        ) : (
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
        )}
      </Card>
      <EventAssignments eventId={event.id} />
    </div>
  );
}
