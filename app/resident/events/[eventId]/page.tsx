import Link from "next/link";
import { notFound } from "next/navigation";
import { ResidentEventFlow } from "@/components/resident/resident-event-flow";
import { Card } from "@/components/ui/card";
import { residentEvents } from "@/lib/data/resident";
import { formatAud } from "@/lib/formatters";

export function generateStaticParams() {
  return residentEvents.map((event) => ({ eventId: event.id }));
}

export default async function ResidentEventDetailPage({
  params,
}: Readonly<{ params: Promise<{ eventId: string }> }>) {
  const { eventId } = await params;
  const event = residentEvents.find((item) => item.id === eventId);
  if (!event) notFound();
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/resident/events"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--primary)]"
      >
        &lt;- All events
      </Link>
      <header className="mt-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-[var(--primary)]">
            {event.dateLabel} · {event.timeLabel}
          </p>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            {event.statusLabel}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
          {event.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {event.description}
        </p>
      </header>
      {event.contribution ? (
        <ResidentEventFlow contribution={event.contribution} />
      ) : (
        <Card className="mt-6">
          <p className="text-sm font-semibold text-emerald-800">
            Event verified
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Your community benefit is complete
          </h2>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Council verified the event result and posted{" "}
            {formatAud(event.estimatedCredit)} to your wallet as an Equity
            Dividend.
          </p>
        </Card>
      )}
    </div>
  );
}
