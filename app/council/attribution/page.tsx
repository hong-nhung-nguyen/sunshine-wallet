import Link from "next/link";
import { Card } from "@/components/ui/card";
import { flexibleResources, participants } from "@/lib/data";
import { attributionInput } from "@/lib/data/attribution-fixtures";
import { attributeVerifiedResponse } from "@/lib/engine/attribution";

const participantName = (id: string) =>
  participants.find((item) => item.id === id)?.name ?? id;
const resourceName = (id: string) =>
  flexibleResources.find((item) => item.id === id)?.name ?? id;

export default function AttributionPage() {
  const result = attributeVerifiedResponse(attributionInput);
  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-teal-700">
            Stage 7 · {result.eventId}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Contributor attribution
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Verified response is converted into transparent energy shares. No
            money is assigned until Council’s settlement policy passes the
            Equity Floor.
          </p>
        </div>
        <Link
          href="/council/settlement"
          className="inline-flex min-h-11 items-center rounded-full bg-[var(--council-ink)] px-5 text-sm font-semibold text-white"
        >
          Continue to settlement →
        </Link>
      </header>

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--muted)]">Verified flexibility</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {result.verifiedFlexEnergyKwh} kWh
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Qualifying response</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {result.totalQualifyingEnergyKwh} kWh
          </p>
        </Card>
        <Card className="border-l-4 border-l-[var(--council-accent)]">
          <p className="text-sm text-[var(--muted)]">Attributable response</p>
          <p className="mt-3 font-mono text-3xl font-semibold">
            {result.attributableEnergyKwh} kWh
          </p>
          <p className="mt-2 text-xs text-amber-700">
            Capped at verified outcome
          </p>
        </Card>
      </section>

      <Card className="mt-5">
        <p className="text-xs font-bold tracking-[0.12em] text-teal-700 uppercase">
          Energy-share output
        </p>
        <h2 className="mt-2 text-2xl font-semibold">
          Ready for downstream settlement
        </h2>
        <div className="mt-6 space-y-5">
          {result.contributorAttributions.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-[var(--surface-muted)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {participantName(item.participantId)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {resourceName(item.resourceId)}
                  </p>
                </div>
                <p className="font-mono text-xl font-semibold">
                  {(item.shareOfVerifiedResponse * 100).toFixed(1)}%
                </p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                <span
                  className="block h-full bg-teal-700"
                  style={{ width: `${item.shareOfVerifiedResponse * 100}%` }}
                />
              </div>
              <p className="mt-3 text-sm">
                <span className="font-mono font-semibold">
                  {item.qualifyingEnergyKwh} kWh
                </span>{" "}
                qualifying →{" "}
                <span className="font-mono font-semibold">
                  {item.attributedEnergyKwh} kWh
                </span>{" "}
                attributed
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-5 border-amber-200 bg-amber-50">
        <p className="text-xs font-bold tracking-[0.12em] text-amber-700 uppercase">
          Boundary enforced
        </p>
        <h2 className="mt-2 text-xl font-semibold text-amber-950">
          Accounting attribution, not electron tracing
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          This stage produces energy shares only. Contributor Rewards and Equity
          Dividends are calculated separately after the Council-approved 60%
          Equity Floor and pool totals are validated.
        </p>
      </Card>
    </div>
  );
}
