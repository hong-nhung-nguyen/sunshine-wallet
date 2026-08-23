import { Card } from "@/components/ui/card";
import { getDemoResident } from "@/lib/demo-session";

export default async function EventsPage() {
  const resident = await getDemoResident();
  const contributor = resident.role === "contributor";
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-[var(--primary)]">
        Sunshine events
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {contributor ? "Your flexibility requests" : "Your community events"}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        {contributor
          ? "Review when your registered resource is requested and what it may earn after verification."
          : "Follow the local events that fund your Equity Dividend. No device action is required from you."}
      </p>
      <Card className="mt-7 border-amber-300">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--primary)]">
              {resident.nextEvent.dateLabel} · {resident.nextEvent.timeLabel}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {resident.nextEvent.title}
            </h2>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            {resident.nextEvent.statusLabel}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          {resident.nextEvent.action}
        </p>
        {resident.resource ? (
          <dl className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-[var(--surface-muted)] p-4">
            <div>
              <dt className="text-xs text-[var(--muted)]">
                Requested resource
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {resident.resource.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">Settlement</dt>
              <dd className="mt-1 text-sm font-semibold">Monthly</dd>
            </div>
          </dl>
        ) : (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
            <b>Eligibility confirmed.</b> This event contributes to the monthly
            Equity Dividend after verification.
          </div>
        )}
      </Card>
      <Card className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--primary)]">
              16 Aug 2026 · 12:00–2:00 pm
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Verified community solar event
            </h2>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
            Verified
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          The community shifted 14.7 kWh. The result passed Council verification
          and your {contributor ? "Contributor Reward" : "Equity Dividend"} was
          posted.
        </p>
      </Card>
    </div>
  );
}
