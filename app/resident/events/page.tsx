import Link from "next/link";
import { Card } from "@/components/ui/card";
import { residentEvents } from "@/lib/data/resident";
import { formatAud } from "@/lib/formatters";

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-[var(--primary)]">
        Sunshine events
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Your community events
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        Events coordinate local devices when Wollongong sunshine is abundant.
        You can receive an Equity Dividend without owning one of those devices.
      </p>
      <div className="mt-7 space-y-4">
        {residentEvents.map((event, index) => (
          <Card
            key={event.id}
            className={index === 0 ? "border-amber-300" : ""}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--primary)]">
                  {event.dateLabel} · {event.timeLabel}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{event.title}</h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${index === 0 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"}`}
              >
                {event.statusLabel}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              {event.description}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-[var(--surface-muted)] p-4">
              <div>
                <dt className="text-xs text-[var(--muted)]">Your status</dt>
                <dd className="mt-1 text-sm font-semibold">
                  {event.residentAction}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">
                  {index === 0 ? "Estimated credit" : "Credit received"}
                </dt>
                <dd className="mt-1 font-mono text-sm font-semibold">
                  {formatAud(event.estimatedCredit)}
                </dd>
              </div>
            </dl>
            <Link
              href={`/resident/events/${event.id}`}
              className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--primary)]"
            >
              {event.contribution
                ? "Review participation request ->"
                : "View event result ->"}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
