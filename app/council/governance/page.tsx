import Link from "next/link";
import { Card } from "@/components/ui/card";
import { householdRoll } from "@/lib/data/households";
import {
  DEFAULT_GOVERNANCE_POLICY,
  settleMonth,
  validateGovernancePolicy,
  type GovernancePolicy,
} from "@/lib/engine/monthly-settlement";
import { formatAud } from "@/lib/formatters";

const POT_CENTS = 436_000; // $4,360.00 modelled monthly pot

const money = (value: number) => formatAud(value / 100);

const number = (raw: string | undefined, fallback: number) => {
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const PRESETS = [
  { label: "Default · 60/35/5", query: "", hint: "The approved policy" },
  {
    label: "Vote equity up · 70/25/5",
    query: "equity=70&contributor=25&reserve=5",
    hint: "Allowed — above the floor",
  },
  {
    label: "Cut equity · 50/45/5",
    query: "equity=50&contributor=45&reserve=5",
    hint: "Refused — below the Equity Floor",
  },
  {
    label: "Tilt capability · tank ×60",
    query: "capTank=60",
    hint: "Breaks the inversion assertion",
  },
] as const;

export default async function GovernancePage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | undefined>>;
}>) {
  const params = await searchParams;

  const equityPct = number(params.equity, 60);
  const contributorPct = number(params.contributor, 35);
  const reservePct = number(params.reserve, 5);

  const policy: GovernancePolicy = {
    ...DEFAULT_GOVERNANCE_POLICY,
    equityShareBps: Math.round(equityPct * 100),
    contributorShareBps: Math.round(contributorPct * 100),
    reserveShareBps: Math.round(reservePct * 100),
    groups: {
      ...DEFAULT_GOVERNANCE_POLICY.groups,
      tierWeights: {
        critical: number(params.wCritical, 4),
        high: number(params.wHigh, 3),
        moderate: number(params.wModerate, 2),
        standard: number(params.wStandard, 1),
      },
      capabilityWeights: {
        individual_tank: number(params.capTank, 1),
        shared_or_other: number(params.capShared, 1),
        none: number(params.capNone, 1),
      },
    },
  };

  const validation = validateGovernancePolicy(policy);
  const settlement = settleMonth({
    period: "2026-08",
    potCents: POT_CENTS,
    households: [...householdRoll],
    policy,
    createdAt: "2026-09-01T00:00:00+10:00",
  });

  const accepted = validation.valid;
  const floorPassed =
    settlement.status === "settled" && settlement.floor.passed;

  return (
    <div className="mx-auto max-w-7xl">
      <header>
        <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
          Governance · policy {policy.version}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
          Change the split, see who it moves
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          The community votes on the three-way split and the block weights. Two
          rules are structural and the console refuses to apply an edit that
          breaks either: the Equity Pool never falls below its floor, and tier
          weights must strictly decrease so need dominates contribution.
        </p>
      </header>

      <nav aria-label="Policy presets" className="mt-6 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Link
            key={preset.label}
            href={`/council/governance${preset.query ? `?${preset.query}` : ""}`}
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--council-ink)] hover:bg-[var(--surface-muted)]"
            title={preset.hint}
          >
            {preset.label}
          </Link>
        ))}
      </nav>

      <section className="mt-7 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-ink)] uppercase">
            Proposed policy
          </p>
          <form method="get" className="mt-5 space-y-5">
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">
                Three-way split (%)
              </legend>
              {[
                { name: "equity", label: "Equity Pool", value: equityPct },
                {
                  name: "contributor",
                  label: "Solar Pool",
                  value: contributorPct,
                },
                {
                  name: "reserve",
                  label: "Community Reserve",
                  value: reservePct,
                },
              ].map((field) => (
                <label
                  key={field.name}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-[var(--muted)]">{field.label}</span>
                  <input
                    type="number"
                    name={field.name}
                    defaultValue={field.value}
                    min={0}
                    max={100}
                    step={1}
                    className="w-24 rounded-lg border border-[var(--border)] px-3 py-2 text-right font-mono"
                  />
                </label>
              ))}
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Tier weights</legend>
              {[
                { name: "wCritical", label: "Critical" },
                { name: "wHigh", label: "High" },
                { name: "wModerate", label: "Moderate" },
                { name: "wStandard", label: "Standard" },
              ].map((field, index) => (
                <label
                  key={field.name}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-[var(--muted)]">{field.label}</span>
                  <input
                    type="number"
                    name={field.name}
                    defaultValue={[4, 3, 2, 1][index]}
                    min={0}
                    step={1}
                    className="w-24 rounded-lg border border-[var(--border)] px-3 py-2 text-right font-mono"
                  />
                </label>
              ))}
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">
                Capability weights
              </legend>
              {[
                { name: "capTank", label: "Individual tank" },
                { name: "capShared", label: "Shared / other" },
                { name: "capNone", label: "None" },
              ].map((field) => (
                <label
                  key={field.name}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-[var(--muted)]">{field.label}</span>
                  <input
                    type="number"
                    name={field.name}
                    defaultValue={1}
                    min={0}
                    step={1}
                    className="w-24 rounded-lg border border-[var(--border)] px-3 py-2 text-right font-mono"
                  />
                </label>
              ))}
            </fieldset>

            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--council-ink)] px-5 text-sm font-semibold text-white"
            >
              Apply policy
            </button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card
            className={
              accepted
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            }
          >
            <p className="text-xs font-bold tracking-[0.12em] uppercase">
              {accepted ? "Policy accepted" : "Policy refused"}
            </p>
            {accepted ? (
              <p className="mt-3 text-sm text-emerald-900">
                Structural rules satisfied. Equity share{" "}
                {policy.equityShareBps / 100}% sits at or above the{" "}
                {policy.minimumEquityBps / 100}% floor.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-red-900">
                {validation.reasons.map((reason) => (
                  <li key={reason}>· {reason}</li>
                ))}
              </ul>
            )}
          </Card>

          {settlement.status === "settled" ? (
            <>
              <Card>
                <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-ink)] uppercase">
                  Settlement preview · pot {money(settlement.potCents)}
                </p>
                <dl className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <dt className="text-xs text-[var(--muted)]">Equity Pool</dt>
                    <dd className="mt-1 font-mono text-xl font-semibold">
                      {money(settlement.equityPoolCents)}
                    </dd>
                    <dd className="text-xs text-[var(--muted)]">
                      {settlement.equityRollCount} households
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--muted)]">Solar Pool</dt>
                    <dd className="mt-1 font-mono text-xl font-semibold">
                      {money(settlement.contributorPoolCents)}
                    </dd>
                    <dd className="text-xs text-[var(--muted)]">
                      {money(settlement.contributorShareCents)} ×{" "}
                      {settlement.contributorCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--muted)]">Reserve</dt>
                    <dd className="mt-1 font-mono text-xl font-semibold">
                      {money(settlement.reserveCents)}
                    </dd>
                    <dd className="text-xs text-[var(--muted)]">
                      {settlement.carriedCents > 0
                        ? `incl. ${money(settlement.carriedCents)} carried`
                        : "nothing carried"}
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card
                className={
                  floorPassed
                    ? "border-emerald-200"
                    : "border-red-300 bg-red-50"
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold tracking-[0.12em] uppercase">
                    Equity Floor
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${floorPassed ? "bg-emerald-100 text-emerald-900" : "bg-red-200 text-red-900"}`}
                  >
                    {floorPassed ? "PASS" : "FAIL"}
                  </span>
                </div>
                <ul className="mt-4 space-y-3 text-sm">
                  <li>
                    <p className="font-semibold">
                      Inversion ·{" "}
                      {settlement.floor.inversion.passed ? "PASS" : "FAIL"}
                    </p>
                    <p className="mt-1 text-[var(--muted)]">
                      {settlement.floor.inversion.explanation}
                    </p>
                  </li>
                  <li>
                    <p className="font-semibold">
                      Tier monotonicity ·{" "}
                      {settlement.floor.monotonicity.passed ? "PASS" : "FAIL"}
                    </p>
                    <p className="mt-1 text-[var(--muted)]">
                      {settlement.floor.monotonicity.explanation}
                    </p>
                  </li>
                </ul>
                <dl className="mt-5 grid grid-cols-4 gap-3 border-t border-[var(--border)] pt-4">
                  {(["critical", "high", "moderate", "standard"] as const).map(
                    (tier) => (
                      <div key={tier}>
                        <dt className="text-xs text-[var(--muted)] capitalize">
                          {tier}
                        </dt>
                        <dd className="mt-1 font-mono text-sm font-semibold">
                          {money(settlement.floor.averageCreditByTier[tier])}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
                <p className="mt-3 text-xs text-[var(--muted)]">
                  Average credit per household, which must not rise as need
                  falls.
                </p>
              </Card>
            </>
          ) : (
            <Card className="border-red-200 bg-red-50">
              <p className="text-xs font-bold tracking-[0.12em] text-red-900 uppercase">
                Settlement blocked
              </p>
              <ul className="mt-3 space-y-2 text-sm text-red-900">
                {settlement.reasons.map((reason) => (
                  <li key={reason}>· {reason}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-red-900">
                No credits were written. Fix the policy and re-apply.
              </p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
