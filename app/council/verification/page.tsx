import { Card } from "@/components/ui/card";
import {
  lowConfidenceVerificationInput,
  verificationInput,
} from "@/lib/data/verification-fixtures";
import {
  VERIFICATION_CONFIDENCE_THRESHOLD,
  verifyEvent,
} from "@/lib/engine/verification";

export default function VerificationPage() {
  const result = verifyEvent(verificationInput);
  const lowConfidenceResult = verifyEvent(lowConfidenceVerificationInput);
  const { record, baseline } = result;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Measurement & verification · {record.eventId}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            Confidence gate review
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Mock meter readings are compared with an uncontaminated
            comparable-day baseline. Council can review the calculation and
            confidence inputs before settlement is allowed.
          </p>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-xs font-semibold ${record.settlementGatePassed ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}
        >
          {record.settlementGatePassed
            ? "Settlement gate passed"
            : "Settlement blocked"}
        </span>
      </header>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Verification summary"
      >
        <Card>
          <p className="text-sm text-[var(--muted)]">Planned response</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {result.plannedFlexEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">Optimiser plan</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Baseline demand</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {baseline.baselineEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            No-intervention estimate
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Observed demand</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {result.observedEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">Mock meter reading</p>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <p className="text-sm text-[var(--muted)]">Verified flexibility</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {record.verifiedFlexEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-emerald-700">
            {result.deliveryPercent}% of plan
          </p>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_22rem]">
        <Card>
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
              Defendable calculation
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Observed minus baseline
            </h2>
          </div>
          <div className="mt-6 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <div className="rounded-2xl bg-[var(--surface-muted)] p-5">
              <p className="text-xs text-[var(--muted)]">Observed</p>
              <p className="mt-2 font-mono text-2xl font-semibold">
                {result.observedEnergyKwh} kWh
              </p>
            </div>
            <span className="text-center text-2xl text-[var(--muted)]">−</span>
            <div className="rounded-2xl bg-[var(--surface-muted)] p-5">
              <p className="text-xs text-[var(--muted)]">Baseline</p>
              <p className="mt-2 font-mono text-2xl font-semibold">
                {baseline.baselineEnergyKwh} kWh
              </p>
            </div>
            <span className="text-center text-2xl text-[var(--muted)]">=</span>
            <div className="rounded-2xl bg-emerald-100 p-5">
              <p className="text-xs text-emerald-800">Verified</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-emerald-950">
                {record.verifiedFlexEnergyKwh} kWh
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
            Scheduled energy is not assumed to be delivered. The verified result
            is capped by what the mock observed reading supports relative to the
            no-intervention baseline.
          </p>
        </Card>

        <Card className="bg-[var(--council-ink)] text-white">
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent)] uppercase">
            Confidence gate
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="font-mono text-5xl font-semibold">
              {Math.round(record.confidenceScore * 100)}%
            </p>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
              Pass
            </span>
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full bg-[var(--council-accent)]"
              style={{ width: `${record.confidenceScore * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>0%</span>
            <span>
              Gate {Math.round(VERIFICATION_CONFIDENCE_THRESHOLD * 100)}%
            </span>
            <span>100%</span>
          </div>
          <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-5 text-slate-300">
            Confidence is numeric, bounded from 0 to 100%, and must reach the
            prototype threshold before settlement can proceed.
          </p>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent-strong,#956000)] uppercase">
            Baseline provenance
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Only clean reference days
          </h2>
          <div className="mt-5 space-y-3">
            {verificationInput.referenceDays.map((day) => (
              <div
                key={day.id}
                className={`flex items-center justify-between gap-4 rounded-xl border p-3 ${day.eventRan ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}
              >
                <div>
                  <p className="font-mono text-sm font-semibold">{day.id}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {day.eventRan
                      ? "Previous event day"
                      : "Comparable non-event day"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold">
                    {day.energyKwh} kWh
                  </p>
                  <p
                    className={`text-xs font-semibold ${day.eventRan ? "text-rose-700" : "text-emerald-700"}`}
                  >
                    {day.eventRan ? "Excluded" : "Included"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-xs text-[var(--muted)]">
            Reference: {record.baselineReference}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent-strong,#956000)] uppercase">
            Confidence inputs
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Weighted and reviewable
          </h2>
          <dl className="mt-5 space-y-5">
            <div>
              <dt className="flex justify-between text-sm">
                <span>Meter coverage · 40%</span>
                <b className="font-mono">
                  {Math.round(verificationInput.confidence.meterCoverage * 100)}
                  %
                </b>
              </dt>
              <dd className="mt-2 text-xs text-[var(--muted)]">
                Weighted contribution:{" "}
                {result.confidenceBreakdown.meterCoverage}
              </dd>
            </div>
            <div>
              <dt className="flex justify-between text-sm">
                <span>Baseline quality · 35%</span>
                <b className="font-mono">
                  {Math.round(
                    verificationInput.confidence.baselineQuality * 100,
                  )}
                  %
                </b>
              </dt>
              <dd className="mt-2 text-xs text-[var(--muted)]">
                Weighted contribution:{" "}
                {result.confidenceBreakdown.baselineQuality}
              </dd>
            </div>
            <div>
              <dt className="flex justify-between text-sm">
                <span>Timestamp integrity · 25%</span>
                <b className="font-mono">
                  {Math.round(
                    verificationInput.confidence.timestampIntegrity * 100,
                  )}
                  %
                </b>
              </dt>
              <dd className="mt-2 text-xs text-[var(--muted)]">
                Weighted contribution:{" "}
                {result.confidenceBreakdown.timestampIntegrity}
              </dd>
            </div>
          </dl>
          <div className="mt-6 rounded-2xl bg-[var(--surface-muted)] p-4">
            <p className="text-xs text-[var(--muted)]">
              Reference-day quality factor
            </p>
            <p className="mt-1 font-mono text-xl font-semibold">
              {Math.round(baseline.qualityFactor * 100)}%
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Three clean days meet the prototype minimum.
            </p>
          </div>
        </Card>
      </section>

      <Card className="mt-5 border-rose-200 bg-rose-50">
        <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-rose-700 uppercase">
              Low-confidence safeguard
            </p>
            <h2 className="mt-2 text-xl font-semibold text-rose-950">
              Result shown; settlement blocked
            </h2>
            <p className="mt-2 text-sm leading-6 text-rose-900">
              With incomplete mock meter coverage and weaker baseline quality,
              confidence falls to{" "}
              {Math.round(lowConfidenceResult.record.confidenceScore * 100)}%.
              The verified energy remains visible as provisional, but the gate
              returns <span className="font-mono font-semibold">false</span> and
              no credit may be settled.
            </p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-white/60 p-4">
            <p className="text-xs text-rose-700">Settlement gate</p>
            <p className="mt-2 text-2xl font-semibold text-rose-950">BLOCKED</p>
            <p className="mt-2 font-mono text-xs text-rose-800">
              confidence &lt; 70%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
