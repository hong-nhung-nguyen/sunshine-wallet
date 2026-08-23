import Link from "next/link";
import { Card } from "@/components/ui/card";
import { flexibleResources, participants } from "@/lib/data";
import { attributionInput } from "@/lib/data/attribution-fixtures";
import { attributeVerifiedResponse } from "@/lib/engine/attribution";
import { formatAud } from "@/lib/formatters";

const participantName = (participantId: string) =>
  participants.find(({ id }) => id === participantId)?.name ?? participantId;
const resourceName = (resourceId: string) =>
  flexibleResources.find(({ id }) => id === resourceId)?.name ?? resourceId;

export default function AttributionPage() {
  const result = attributeVerifiedResponse(attributionInput);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-[var(--council-accent-strong,#956000)]">
            Attribution · {result.eventId}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--council-ink)] sm:text-4xl">
            Verified response attribution
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Qualifying resource response is converted into proportional
            accounting shares, capped by the verified event outcome. Contributor
            These shares feed the monthly settlement; this page does not post
            event-level rewards.
          </p>
        </div>
        <Link
          href="/council/settlement"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--council-ink)] px-5 text-sm font-semibold text-[var(--council-ink)] hover:bg-white"
        >
          See settlement calculation →
        </Link>
      </header>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Attribution summary"
      >
        <Card>
          <p className="text-sm text-[var(--muted)]">Verified flexibility</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {result.verifiedFlexEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            M&V-approved outcome
          </p>
        </Card>
        <Card className="border-l-4 border-l-[var(--council-accent)]">
          <p className="text-sm text-[var(--muted)]">Attributable energy</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {result.attributableEnergyKwh}{" "}
            <span className="text-base font-normal">kWh</span>
          </p>
          <p className="mt-2 text-xs text-amber-700">
            Capped at verified flexibility
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Contributor pool</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {formatAud(result.allocatedContributorCents / 100)}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Input from settlement policy
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Equity pool</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {formatAud(result.allocatedEquityCents / 100)}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            For residents without roof access
          </p>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_22rem]">
        <Card>
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
              Contributor accounting
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Share of verified response
            </h2>
          </div>
          <div className="mt-6 space-y-6">
            {result.contributorAttributions.map((attribution) => (
              <div key={attribution.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {participantName(attribution.participantId)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {resourceName(attribution.resourceId)} ·{" "}
                      {attribution.resourceId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xl font-semibold">
                      {(attribution.shareOfVerifiedResponse * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      response share
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <span
                    className="block h-full bg-teal-700"
                    style={{
                      width: `${attribution.shareOfVerifiedResponse * 100}%`,
                    }}
                  />
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-[var(--muted)]">Qualifying</dt>
                    <dd className="mt-1 font-mono font-semibold">
                      {attribution.qualifyingEnergyKwh} kWh
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--muted)]">Attributed</dt>
                    <dd className="mt-1 font-mono font-semibold">
                      {attribution.attributedEnergyKwh} kWh
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--muted)]">
                      Monthly-pool share
                    </dt>
                    <dd className="mt-1 font-mono font-semibold">
                      {formatAud(attribution.rewardAmount)}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[var(--council-ink)] text-white">
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent)] uppercase">
            Attribution rule
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Accounting, not electron tracing
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Each resource receives a proportional share based on qualifying
            response. Total attributable energy is the lower of qualifying
            contribution and verified event flexibility.
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-sm">
              min({result.totalQualifyingEnergyKwh},{" "}
              {result.verifiedFlexEnergyKwh})
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold">
              = {result.attributableEnergyKwh} kWh
            </p>
          </div>
          <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-300">
            This does not claim that a contributor’s exact electrons reached a
            particular household.
          </p>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent-strong,#956000)] uppercase">
            Contributor weighting preview
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Input to monthly Solar Pool
          </h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs text-[var(--muted)]">
                <tr>
                  <th className="pb-3 font-medium">Participant</th>
                  <th className="pb-3 font-medium">Resource</th>
                  <th className="pb-3 font-medium">Share</th>
                  <th className="pb-3 text-right font-medium">Pool share</th>
                </tr>
              </thead>
              <tbody>
                {result.contributorAttributions.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-4 font-semibold">
                      {participantName(item.participantId)}
                    </td>
                    <td className="py-4 text-[var(--muted)]">
                      {resourceName(item.resourceId)}
                    </td>
                    <td className="py-4 font-mono">
                      {(item.shareOfVerifiedResponse * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 text-right font-mono font-semibold">
                      {formatAud(item.rewardAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-4 font-semibold">
                    Reconciled total
                  </td>
                  <td className="pt-4 text-right font-mono font-semibold">
                    {formatAud(result.allocatedContributorCents / 100)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--council-accent-strong,#956000)] uppercase">
            Equity allocation preview
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Roof-access benefit stays separate
          </h2>
          <div className="mt-5 space-y-4">
            {result.equityAllocations.map((allocation) => (
              <div
                key={allocation.participantId}
                className="rounded-2xl bg-[var(--surface-muted)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {participantName(allocation.participantId)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                      {allocation.reason}
                    </p>
                  </div>
                  <p className="font-mono text-lg font-semibold">
                    {formatAud(allocation.creditAmount)}
                  </p>
                </div>
                <p className="mt-3 text-xs text-[var(--muted)]">
                  {Math.round(allocation.shareOfEquityPool * 100)}% of Equity
                  Pool · no device ownership required
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-[var(--border)] pt-4">
            <p className="font-semibold">Reconciled total</p>
            <p className="font-mono font-semibold">
              {formatAud(result.allocatedEquityCents / 100)}
            </p>
          </div>
        </Card>
      </section>

      <Card className="mt-5 border-amber-200 bg-amber-50">
        <p className="text-xs font-bold tracking-[0.12em] text-amber-700 uppercase">
          Downstream settlement boundary
        </p>
        <h2 className="mt-2 text-xl font-semibold text-amber-950">
          Event attribution feeds monthly settlement
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          Event response establishes contribution weights. The monthly engine
          aggregates every verified event, applies governance once, and posts
          one wallet transaction per eligible household.
        </p>
      </Card>
    </div>
  );
}
