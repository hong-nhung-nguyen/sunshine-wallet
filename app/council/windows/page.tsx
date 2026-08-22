import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  eventWindowCandidates,
  lowConfidenceWindowCandidates,
} from "@/lib/data/event-window-candidates";
import {
  EVENT_WINDOW_RULES,
  selectEventWindow,
} from "@/lib/engine/event-window";

const timeFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Sydney",
  hour: "numeric",
  minute: "2-digit",
});

export default function EventWindowsPage() {
  const selection = selectEventWindow(eventWindowCandidates);
  const noEventExample = selectEventWindow(lowConfidenceWindowCandidates);
  if (selection.status !== "recommended") return null;
  const recommended = selection.recommended;

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/council/events"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-teal-800"
      >
        ← Back to events
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Window decision · DAPTO-01
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            Why this window was selected
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            A deterministic rule compares simulated forecast windows for one
            Sunshine Cell. Council can review every input and reason before
            creating an event.
          </p>
        </div>
        <span className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-900">
          Simulated forecast · calculated recommendation
        </span>
      </header>

      <section className="mt-7 grid gap-5 xl:grid-cols-[1fr_22rem]">
        <Card className="border-2 border-[var(--council-accent)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
                Recommended window
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                {timeFormatter.format(new Date(recommended.window.start))}–
                {timeFormatter.format(new Date(recommended.window.end))}
              </h2>
              <p className="mt-2 font-mono text-sm text-[var(--muted)]">
                {recommended.sunshineCellId} · {recommended.id}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--council-ink)] px-5 py-4 text-center text-white">
              <p className="text-xs text-slate-300">Window score</p>
              <p className="mt-1 font-mono text-3xl font-semibold">
                {recommended.score}
              </p>
              <p className="text-xs text-slate-400">out of 100</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
              <dt className="text-xs text-[var(--muted)]">
                Target flexibility
              </dt>
              <dd className="mt-1 font-mono text-lg font-semibold">
                {recommended.targetFlexEnergyKwh} kWh
              </dd>
            </div>
            <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
              <dt className="text-xs text-[var(--muted)]">Solar opportunity</dt>
              <dd className="mt-1 font-mono text-lg font-semibold">
                {recommended.solarExportPotentialKwh} kWh
              </dd>
            </div>
            <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
              <dt className="text-xs text-[var(--muted)]">
                Forecast confidence
              </dt>
              <dd className="mt-1 font-mono text-lg font-semibold">
                {Math.round(recommended.forecastConfidence * 100)}%
              </dd>
            </div>
            <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
              <dt className="text-xs text-[var(--muted)]">Constraint risk</dt>
              <dd className="mt-1 text-lg font-semibold capitalize">
                {recommended.constraintRisk}
              </dd>
            </div>
          </dl>
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-semibold text-emerald-950">Why this window?</p>
            <p className="mt-2 text-sm leading-6 text-emerald-900">
              It passes every gate and has the highest eligible score: strong
              forecast confidence, high network need, enough local solar
              opportunity and {recommended.availableFlexEnergyKwh} kWh of safe
              flexibility for the explicit {recommended.targetFlexEnergyKwh} kWh
              target.
            </p>
          </div>
        </Card>

        <Card className="bg-[var(--council-ink)] text-white">
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent)] uppercase">
            Scoring model
          </p>
          <h2 className="mt-2 text-xl font-semibold">100 explainable points</h2>
          <dl className="mt-5 space-y-4">
            <div>
              <dt className="flex justify-between text-sm">
                <span>Forecast confidence</span>
                <b className="font-mono">40</b>
              </dt>
              <dd className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full bg-[var(--council-accent)]"
                  style={{
                    width: `${recommended.scoreBreakdown.forecastConfidence / 0.4}%`,
                  }}
                />
              </dd>
            </div>
            <div>
              <dt className="flex justify-between text-sm">
                <span>Solar opportunity</span>
                <b className="font-mono">25</b>
              </dt>
            </div>
            <div>
              <dt className="flex justify-between text-sm">
                <span>Network need</span>
                <b className="font-mono">20</b>
              </dt>
            </div>
            <div>
              <dt className="flex justify-between text-sm">
                <span>Flexibility coverage</span>
                <b className="font-mono">15</b>
              </dt>
            </div>
          </dl>
          <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-5 text-slate-300">
            Minimum confidence:{" "}
            {Math.round(EVENT_WINDOW_RULES.minimumForecastConfidence * 100)}%.
            Scores rank valid windows only; they cannot override a failed gate.
          </p>
        </Card>
      </section>

      <section className="mt-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent-strong,#956000)] uppercase">
              Candidate comparison
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Every window remains reviewable
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)]">
            Sorted deterministically by score, then start time and ID
          </p>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {selection.candidates.map((candidate) => (
            <Card
              key={candidate.id}
              className={
                candidate.id === recommended.id ? "border-emerald-300" : ""
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {timeFormatter.format(new Date(candidate.window.start))}–
                    {timeFormatter.format(new Date(candidate.window.end))}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                    {candidate.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xl font-semibold">
                    {candidate.score}
                  </p>
                  <span
                    className={`text-xs font-semibold ${candidate.eligible ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    {candidate.eligible ? "Valid" : "Rejected"}
                  </span>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-[var(--muted)]">Solar</dt>
                  <dd className="mt-1 font-mono font-semibold">
                    {candidate.solarExportPotentialKwh} kWh
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--muted)]">Confidence</dt>
                  <dd className="mt-1 font-mono font-semibold">
                    {Math.round(candidate.forecastConfidence * 100)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--muted)]">
                    Flex available
                  </dt>
                  <dd className="mt-1 font-mono font-semibold">
                    {candidate.availableFlexEnergyKwh} kWh
                  </dd>
                </div>
              </dl>
              <ul className="mt-4 border-t border-[var(--border)] pt-4">
                {candidate.reasons.map((reason) => (
                  <li
                    key={reason}
                    className="text-sm leading-6 text-[var(--muted)]"
                  >
                    {candidate.eligible ? "✓" : "×"} {reason}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <Card className="mt-5 border-rose-200 bg-rose-50">
        <p className="text-xs font-bold tracking-[0.12em] text-rose-700 uppercase">
          No-event safeguard
        </p>
        <h2 className="mt-2 text-xl font-semibold text-rose-950">
          Low confidence returns no event
        </h2>
        <p className="mt-2 text-sm leading-6 text-rose-900">
          The same candidates at 60% confidence produce{" "}
          <span className="font-mono font-semibold">
            {noEventExample.status}
          </span>
          . No window is recommended, no resource is dispatched and no credit is
          created.
        </p>
      </Card>
    </div>
  );
}
