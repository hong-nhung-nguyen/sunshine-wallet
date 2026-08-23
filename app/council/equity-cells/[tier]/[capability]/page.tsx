import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getEquityCellDetail } from "@/lib/data/equity-cell-details";
import { formatAud } from "@/lib/formatters";

interface PageProps {
  params: Promise<{ tier: string; capability: string }>;
}

const money = (cents: number) => formatAud(cents / 100);
const capabilityLabel = (value: string) => value.replace(/_/g, " ");

function activityLabel(
  energyKwh: number,
  status: "verified" | "eligible_not_dispatched" | "not_available",
) {
  if (status === "verified") return `${energyKwh.toFixed(1)} kWh verified`;
  if (status === "eligible_not_dispatched") return "Eligible · not dispatched";
  return "No verified activity";
}

export default async function EquityCellDetailPage({ params }: PageProps) {
  const { tier, capability } = await params;
  const detail = getEquityCellDetail(`${tier}:${capability}`);
  if (!detail) notFound();

  const reconciledCreditCents = detail.households.reduce(
    (sum, household) => sum + household.creditCents,
    0,
  );

  return (
    <div className="mx-auto max-w-7xl">
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--muted)]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/council/equity-cells"
              className="inline-flex min-h-11 items-center rounded-lg font-semibold text-[var(--council-ink)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--council-accent)]"
            >
              Equity cells
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="capitalize" aria-current="page">
            {detail.tier} · {capabilityLabel(detail.capability)}
          </li>
        </ol>
      </nav>

      <header className="mt-4">
        <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
          Equity allocation · August 2026
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] capitalize sm:text-4xl">
          {detail.tier} · {capabilityLabel(detail.capability)}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          All qualifying households in this policy cell. Household identifiers
          are anonymised; credits come from priority points inside the cell’s
          Council-approved block.
        </p>
      </header>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
        aria-label="Selected cell summary"
      >
        <SummaryCard
          label="Qualifying households"
          value={`${detail.claimantCount}`}
        />
        <SummaryCard
          label="Priority points"
          value={detail.cellPoints.toLocaleString()}
        />
        <SummaryCard label="Cell allocation" value={money(detail.blockCents)} />
        <SummaryCard
          label="Rate per point"
          value={`$${(detail.centsPerPoint / 100).toFixed(4)}`}
        />
        <SummaryCard
          label="Verified energy activity"
          value={`${detail.totalVerifiedEnergyKwh.toFixed(1)} kWh`}
        />
      </section>

      <Card className="mt-5 border-amber-200 bg-amber-50">
        <h2 className="text-sm font-semibold text-amber-950">
          Energy activity and Equity credit are separate
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-amber-900">
          Verified energy is simulated operational context for this demo. It
          does not determine the credit below. Each household’s Equity credit is
          its priority-point share of this cell’s {money(detail.blockCents)}
          block. Solar Contributor rewards remain in the separate Solar Pool.
        </p>
      </Card>

      <section className="mt-8" aria-labelledby="households-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="households-heading"
              className="text-xl font-semibold text-[var(--council-ink)]"
            >
              Qualifying households
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Sorted by monthly Equity credit, highest first.
            </p>
          </div>
          <p className="text-sm font-semibold text-[var(--council-ink)]">
            Reconciled total · {money(reconciledCreditCents)}
          </p>
        </div>

        <div className="mt-4 overflow-x-auto rounded-3xl border border-[var(--border)] bg-white">
          <table className="w-full min-w-[58rem] text-sm">
            <caption className="sr-only">
              Anonymised qualifying households, priority scores, simulated
              energy activity and August Equity credits
            </caption>
            <thead className="bg-[var(--surface-muted)] text-left">
              <tr>
                <th scope="col" className="p-4 font-semibold">
                  Household
                </th>
                <th scope="col" className="p-4 text-right font-semibold">
                  Need score
                </th>
                <th scope="col" className="p-4 text-right font-semibold">
                  Capability
                </th>
                <th scope="col" className="p-4 text-right font-semibold">
                  Priority points
                </th>
                <th scope="col" className="p-4 font-semibold">
                  Energy activity
                </th>
                <th scope="col" className="p-4 text-right font-semibold">
                  August credit
                </th>
              </tr>
            </thead>
            <tbody>
              {detail.households.map((household) => (
                <tr
                  key={household.householdId}
                  className="border-t border-[var(--border)]"
                >
                  <th scope="row" className="p-4 text-left font-semibold">
                    {household.displayId}
                  </th>
                  <td className="p-4 text-right font-mono">
                    {household.needScore}
                  </td>
                  <td className="p-4 text-right font-mono">
                    {household.capabilityScore}
                  </td>
                  <td className="p-4 text-right font-mono font-semibold">
                    {household.priorityScore}
                  </td>
                  <td className="p-4">
                    <span
                      className={
                        household.energyStatus === "verified"
                          ? "font-semibold text-emerald-800"
                          : "text-[var(--muted)]"
                      }
                    >
                      {activityLabel(
                        household.verifiedEnergyKwh,
                        household.energyStatus,
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-semibold text-[var(--council-ink)]">
                    {money(household.creditCents)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-[var(--council-ink)] bg-[var(--surface-muted)]">
              <tr>
                <th
                  scope="row"
                  colSpan={4}
                  className="p-4 text-left font-semibold"
                >
                  Cell total
                </th>
                <td className="p-4 font-mono font-semibold">
                  {detail.totalVerifiedEnergyKwh.toFixed(1)} kWh
                </td>
                <td className="p-4 text-right font-mono font-semibold">
                  {money(reconciledCreditCents)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
          Demo provenance: household energy activity is simulated. Eligibility,
          points and credits are calculated from governance policy version
          governance-1.0.0 and the canonical August settlement.
        </p>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-3 font-mono text-3xl font-semibold">{value}</p>
    </Card>
  );
}
