import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  councilCell,
  councilEvents,
  councilResources,
} from "@/lib/data/council";

const chartTimes = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

export default function CouncilPage() {
  const activeEvent = councilEvents[0];
  const flexibilityCoverage = Math.round(
    (councilCell.availableFlexEnergyKwh / activeEvent.targetFlexEnergyKwh) *
      100,
  );

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Operations overview · 23 Aug 2026
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            {councilCell.name}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {councilCell.code} · Forecast and resource data are simulated
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/council/demo"
            className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-teal-800"
          >
            See how it worked →
          </Link>
          <Link
            href={`/council/events/${activeEvent.id}`}
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--council-ink)] px-5 text-sm font-semibold text-white"
          >
            Open active event →
          </Link>
        </div>
      </header>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Cell summary"
      >
        <Card className="border-l-4 border-l-rose-500">
          <p className="text-sm text-[var(--muted)]">Constraint risk</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold capitalize">
              {councilCell.constraintRisk}
            </p>
            <span className="text-xs font-semibold text-rose-800">
              Action advised
            </span>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Solar export forecast</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {councilCell.solarExportForecastKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            12:00–2:00 pm window
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Available flexibility</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {councilCell.availableFlexEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-emerald-700">
            {flexibilityCoverage}% of event target
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Eligible resources</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {activeEvent.eligibleResources}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">Hard gates passed</p>
        </Card>
      </section>

      <section className="mt-5" aria-labelledby="forecast-decision-heading">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-[var(--border)] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent-strong,#956000)] uppercase">
                  Today&apos;s event decision
                </p>
                <h2
                  id="forecast-decision-heading"
                  className="mt-2 text-2xl font-semibold"
                >
                  Solar-rich flexibility window
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  The engine compares solar opportunity with baseline demand and
                  selects the safest window with enough available flexibility.
                </p>
              </div>
              <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold">
                {Math.round(activeEvent.confidence * 100)}% confidence
              </span>
            </div>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <DecisionMetric label="Constraint window" value="12:00–14:00" />
              <DecisionMetric
                label="Target flexibility"
                value={`${activeEvent.targetFlexEnergyKwh} kWh`}
              />
              <DecisionMetric
                label="Available flexibility"
                value={`${activeEvent.availableFlexEnergyKwh} kWh`}
              />
              <DecisionMetric
                label="Eligible resources"
                value={`${activeEvent.eligibleResources}`}
              />
            </dl>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6">
              <svg
                viewBox="0 0 800 280"
                role="img"
                aria-labelledby="forecast-chart-title forecast-chart-description"
                className="h-auto w-full"
              >
                <title id="forecast-chart-title">
                  Daily solar opportunity and baseline demand
                </title>
                <desc id="forecast-chart-description">
                  Solar opportunity rises above baseline demand around midday.
                  The selected event window is noon to 2 pm.
                </desc>
                {[40, 90, 140, 190, 240].map((y) => (
                  <line
                    key={y}
                    x1="52"
                    y1={y}
                    x2="772"
                    y2={y}
                    stroke="#dce4d9"
                    strokeWidth="1"
                  />
                ))}
                <rect
                  x="310"
                  y="24"
                  width="205"
                  height="216"
                  fill="#f2b84b"
                  fillOpacity="0.12"
                  stroke="#e3a008"
                  strokeWidth="2"
                />
                <polyline
                  points="52,220 155,202 258,150 361,78 464,42 567,62 670,145 772,215"
                  fill="none"
                  stroke="#dc7f19"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <polyline
                  points="52,168 155,172 258,176 361,178 464,180 567,174 670,164 772,157"
                  fill="none"
                  stroke="#246b9a"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {chartTimes.map((label, index) => (
                  <text
                    key={label}
                    x={52 + index * 102.85}
                    y="265"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#5f6f65"
                  >
                    {label}
                  </text>
                ))}
                <text
                  x="412"
                  y="226"
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill="#956000"
                >
                  Selected · 12:00–14:00
                </text>
              </svg>
              <div
                className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]"
                aria-label="Chart legend"
              >
                <span className="inline-flex items-center gap-2">
                  <i className="h-0.5 w-8 bg-orange-600" />
                  Solar opportunity
                </span>
                <span className="inline-flex items-center gap-2">
                  <i className="h-0.5 w-8 bg-sky-700" />
                  Baseline demand
                </span>
                <span>Source: simulated network forecast</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--surface-muted)] px-6 py-5 sm:px-8">
            <div>
              <p className="font-semibold text-[var(--council-ink)]">
                Event proposed for 12:00–14:00
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {activeEvent.targetFlexEnergyKwh} kWh is required and{" "}
                {activeEvent.availableFlexEnergyKwh} kWh is available, so this
                window passes the flexibility gate.
              </p>
            </div>
            <Link
              href={`/council/events/${activeEvent.id}`}
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--council-ink)] px-5 text-sm font-semibold text-white"
            >
              Review proposed event →
            </Link>
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_18rem]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent-strong,#956000)] uppercase">
                Scoring summary
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                Top candidate resources
              </h2>
            </div>
            <Link
              href="/council/resources"
              className="text-sm font-semibold text-teal-800"
            >
              View all →
            </Link>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs text-[var(--muted)]">
                <tr>
                  <th className="pb-3 font-medium">Resource</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Capacity</th>
                  <th className="pb-3 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {councilResources.slice(0, 3).map((resource) => (
                  <tr
                    key={resource.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-4">
                      <p className="font-semibold">{resource.name}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {resource.id}
                      </p>
                    </td>
                    <td className="py-4">{resource.type}</td>
                    <td className="py-4 font-mono">
                      {resource.capacityKwh} kWh
                    </td>
                    <td className="py-4 text-right">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 font-mono font-semibold text-emerald-900">
                        {resource.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Equity reach</p>
          <p className="mt-3 font-mono text-4xl font-semibold">
            {councilCell.roofAccessResidents}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            residents without practical roof access are included in this cell.
          </p>
          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <p className="text-sm font-semibold">15% Equity Floor</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Council demo policy
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}

function DecisionMetric({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <dt className="text-sm text-[var(--muted)]">{label}</dt>
      <dd className="mt-2 font-mono text-2xl font-semibold text-[var(--council-ink)]">
        {value}
      </dd>
    </div>
  );
}
