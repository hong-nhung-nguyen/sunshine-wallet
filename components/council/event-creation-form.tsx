"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

type CreationFixture = {
  id: string;
  name: string;
  sunshineCellId: string;
  sunshineCellName: string;
  windowStart: string;
  windowEnd: string;
  targetFlexEnergyKwh: number;
  maxPowerKw: number;
  maxShiftEnergyKwh: number;
  equityFloorPercent: number;
  confidence: number;
  provenance: string;
};

export function EventCreationForm({
  fixture,
}: Readonly<{ fixture: CreationFixture }>) {
  const [created, setCreated] = useState(false);

  function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreated(true);
  }

  if (created) {
    return (
      <Card
        className="mt-7 border-emerald-300 bg-emerald-50"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-semibold text-emerald-800">
          Draft event created
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-emerald-950">
          {fixture.name}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-900">
          The mock event is ready for Council review. No resource has been
          selected or dispatched, and no resident has been credited.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/council/events/${fixture.id}`}
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--council-ink)] px-5 text-sm font-semibold text-white"
          >
            Open draft event →
          </Link>
          <button
            type="button"
            onClick={() => setCreated(false)}
            className="min-h-11 rounded-full border border-emerald-400 px-5 text-sm font-semibold text-emerald-950"
          >
            Edit details
          </button>
        </div>
        <p className="mt-4 text-xs text-emerald-800">
          Demo only — this draft is not persisted to a live Council system.
        </p>
      </Card>
    );
  }

  return (
    <form
      onSubmit={createEvent}
      className="mt-7 grid gap-5 xl:grid-cols-[1fr_22rem]"
    >
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
              Event settings
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Recommended midday window
            </h2>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            Simulated forecast
          </span>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">
            Event name
            <input
              name="name"
              required
              defaultValue={fixture.name}
              className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 font-normal"
            />
          </label>
          <label className="text-sm font-semibold">
            Sunshine Cell
            <select
              name="sunshineCellId"
              defaultValue={fixture.sunshineCellId}
              className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 font-normal"
            >
              <option value={fixture.sunshineCellId}>
                {fixture.sunshineCellName}
              </option>
            </select>
          </label>
          <div className="text-sm font-semibold">
            Monthly Equity Pool
            <p className="mt-2 flex min-h-12 items-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 font-mono font-normal">
              {fixture.equityFloorPercent}% · governed monthly
            </p>
          </div>
          <label className="text-sm font-semibold">
            Window start
            <input
              name="windowStart"
              type="datetime-local"
              required
              defaultValue="2026-08-24T12:00"
              className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 font-mono font-normal"
            />
          </label>
          <label className="text-sm font-semibold">
            Window end
            <input
              name="windowEnd"
              type="datetime-local"
              required
              defaultValue="2026-08-24T14:00"
              className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 font-mono font-normal"
            />
          </label>
          <label className="text-sm font-semibold">
            Target flexibility (kWh)
            <input
              name="targetFlexEnergyKwh"
              type="number"
              min="1"
              max={fixture.maxShiftEnergyKwh}
              step="1"
              required
              defaultValue={fixture.targetFlexEnergyKwh}
              className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 font-mono font-normal"
            />
          </label>
          <label className="text-sm font-semibold">
            Maximum power (kW)
            <input
              name="maxPowerKw"
              type="number"
              min="1"
              step="1"
              required
              defaultValue={fixture.maxPowerKw}
              className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 font-mono font-normal"
            />
          </label>
        </div>
      </Card>
      <div className="space-y-5">
        <Card className="bg-[var(--council-ink)] text-white">
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent)] uppercase">
            Forecast basis
          </p>
          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-xs text-slate-400">Confidence</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold">
                {Math.round(fixture.confidence * 100)}%
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">
                Maximum shift available
              </dt>
              <dd className="mt-1 font-mono text-2xl font-semibold">
                {fixture.maxShiftEnergyKwh} kWh
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Source</dt>
              <dd className="mt-1 text-sm font-semibold">
                {fixture.provenance}
              </dd>
            </div>
          </dl>
        </Card>
        <Card>
          <h3 className="font-semibold">What happens next?</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Creating the draft records the window and targets only. Consent and
            other hard gates must pass before resources can be scored or
            scheduled.
          </p>
          <button
            type="submit"
            className="mt-5 min-h-12 w-full rounded-full bg-[var(--council-accent)] px-5 text-sm font-bold text-[var(--council-ink)]"
          >
            Create draft event
          </button>
        </Card>
      </div>
    </form>
  );
}
