import { Card } from "@/components/ui/card";
import { residentPolicy, residentProfile } from "@/lib/data/resident";

export default function StatusPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-[var(--primary)]">Program status</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">You are included</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Council has confirmed that your household can receive a share of verified community energy value.</p>

      <Card className="mt-7 border-emerald-200 bg-emerald-50">
        <div className="flex items-start gap-4">
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-700 font-bold text-white">✓</span>
          <div><h2 className="text-xl font-semibold text-emerald-950">{residentPolicy.eligibilityLabel}</h2><p className="mt-2 text-sm leading-6 text-emerald-900">You live in an apartment and cannot practically install rooftop solar. You do not need to own an energy device to qualify.</p></div>
        </div>
      </Card>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">Your participation</p>
          <dl className="mt-4 space-y-4 text-sm">
            <div><dt className="text-[var(--muted)]">Household</dt><dd className="mt-1 font-semibold">{residentProfile.householdLabel}</dd></div>
            <div><dt className="text-[var(--muted)]">Area</dt><dd className="mt-1 font-semibold">{residentProfile.location}</dd></div>
            <div><dt className="text-[var(--muted)]">Consent</dt><dd className="mt-1 font-semibold">Active</dd></div>
          </dl>
        </Card>
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">Council policy</p>
          <h2 className="mt-3 text-xl font-semibold">{residentPolicy.version}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">At least {residentPolicy.equityFloorPercent}% of verified event value is reserved for eligible residents without practical roof access.</p>
          <p className="mt-4 text-xs text-[var(--muted)]">Effective {residentPolicy.effectiveDate}</p>
        </Card>
      </div>

      <Card className="mt-5">
        <h2 className="text-xl font-semibold">Questions or concerns?</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Ask Wollongong City Council to review your eligibility or a credit. If Council changes a decision affecting you, you will receive a notification.</p>
        <a href={`mailto:${residentProfile.councilEmail}?subject=Sunshine%20Wallet%20review%20request`} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-white">Email Council (demo)</a>
      </Card>
    </div>
  );
}
