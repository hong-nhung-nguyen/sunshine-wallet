import { Card } from "@/components/ui/card";
import { rollSummary } from "@/lib/data/households";
import { augustMonthlyLedger } from "@/lib/data/monthly-ledger";
import {
  averageCreditByTier,
  checkInversion,
  checkTierMonotonicity,
} from "@/lib/engine/equity-allocation";
import { formatAud } from "@/lib/formatters";

const cents = (value: number) => formatAud(value / 100);
const rate = (value: number) => `$${(value / 100).toFixed(4)}`;

export default function EquityCellsPage() {
  if (augustMonthlyLedger.settlement.status !== "settled") return null;
  const result = augustMonthlyLedger.settlement.allocation;
  const inversion = checkInversion(result);
  const monotonicity = checkTierMonotonicity(result);
  const averages = averageCreditByTier(result);
  const totalWeight = result.cells.reduce((sum, c) => sum + c.cellWeight, 0);
  const distributed = result.credits.reduce(
    (sum, credit) => sum + credit.amountCents,
    0,
  );
  const floorPassed = inversion.passed && monotonicity.passed;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Layer 1A · equity allocation
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            Twelve cells, twelve rates
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            The equity pool is not divided by one per-point rate. It splits into
            twelve blocks by need tier and capability, and only inside a block
            do priority points divide the money. Solar contributors are paid
            from the Solar Pool and do not appear here.
          </p>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-xs font-semibold ${floorPassed ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}
        >
          Equity Floor: {floorPassed ? "PASS" : "FAIL"}
        </span>
      </header>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Roll summary"
      >
        <Card>
          <p className="text-sm text-[var(--muted)]">Equity pool</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {cents(result.equityPoolCents)}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            60% of {augustMonthlyLedger.includedEventIds.length} verified event
            {augustMonthlyLedger.includedEventIds.length === 1 ? "" : "s"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Equity roll</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {result.eligibleCount}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            of {rollSummary.total} participants · {result.zeroPointCount}{" "}
            zero-point excluded
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Paid from Solar Pool</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {result.excludedSolarCount}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            contributors · off the equity roll
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Distributed</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {cents(distributed)}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {result.undistributedCents === 0
              ? "closes exactly to the cent"
              : `${cents(result.undistributedCents)} carried to reserve`}
          </p>
        </Card>
      </section>

      <section className="mt-8" aria-labelledby="cells-heading">
        <h2
          id="cells-heading"
          className="text-xl font-semibold text-[var(--council-ink)]"
        >
          Block allocation
        </h2>
        <div className="mt-4 overflow-x-auto rounded-3xl border border-[var(--border)] bg-white">
          <table className="w-full min-w-[56rem] text-sm">
            <thead className="bg-[var(--surface-muted)] text-left">
              <tr>
                <th className="p-4 font-semibold">Cell</th>
                <th className="p-4 text-right font-semibold">Claimants</th>
                <th className="p-4 text-right font-semibold">Points</th>
                <th className="p-4 text-right font-semibold">Weight</th>
                <th className="p-4 text-right font-semibold">Block</th>
                <th className="p-4 text-right font-semibold">Block %</th>
                <th className="p-4 text-right font-semibold">Rate / point</th>
              </tr>
            </thead>
            <tbody>
              {result.cells.map((cell) => (
                <tr
                  key={cell.key}
                  className="border-t border-[var(--border)] last:border-b-0"
                >
                  <td className="p-4">
                    <span className="font-semibold capitalize">
                      {cell.tier}
                    </span>
                    <span className="text-[var(--muted)]">
                      {" · "}
                      {cell.capability.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono">
                    {cell.claimantCount}
                  </td>
                  <td className="p-4 text-right font-mono">
                    {cell.cellPoints.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-mono">
                    {cell.cellWeight}
                  </td>
                  <td className="p-4 text-right font-mono">
                    {cents(cell.blockCents)}
                  </td>
                  <td className="p-4 text-right font-mono text-[var(--muted)]">
                    {totalWeight > 0
                      ? `${((cell.cellWeight / totalWeight) * 100).toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="p-4 text-right font-mono font-semibold">
                    {rate(cell.centsPerPoint)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          The rate is highest where capability is lowest. That is the mechanism
          working: the block is set by need and headcount, so a cell holding
          fewer points converts each point into more money.
        </p>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-ink)] uppercase">
            Average credit by tier
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            {(["critical", "high", "moderate", "standard"] as const).map(
              (tier) => (
                <div key={tier}>
                  <dt className="text-xs text-[var(--muted)] capitalize">
                    {tier}
                  </dt>
                  <dd className="mt-1 font-mono text-xl font-semibold">
                    {cents(averages[tier])}
                  </dd>
                </div>
              ),
            )}
          </dl>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Must not increase as need falls — asserted at settlement.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-ink)] uppercase">
            Equity Floor assertions
          </p>
          <ul className="mt-4 space-y-4 text-sm">
            <li>
              <p className="font-semibold">
                Inversion · {inversion.passed ? "PASS" : "FAIL"}
              </p>
              <p className="mt-1 text-[var(--muted)]">
                {inversion.explanation}
              </p>
            </li>
            <li>
              <p className="font-semibold">
                Tier monotonicity · {monotonicity.passed ? "PASS" : "FAIL"}
              </p>
              <p className="mt-1 text-[var(--muted)]">
                {monotonicity.explanation}
              </p>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
