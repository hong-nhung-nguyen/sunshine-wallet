import { Card } from "@/components/ui/card";
import { getDemoResident } from "@/lib/demo-session";

export default async function StatusPage() {
  const resident = await getDemoResident();
  const contributor = resident.role === "contributor";
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-[var(--primary)]">
        Program status
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {contributor ? "You are ready to contribute" : "You are included"}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        {resident.explanation}
      </p>
      <Card className="mt-7 border-emerald-200 bg-emerald-50">
        <p className="text-sm font-semibold text-emerald-800">
          Active demo account
        </p>
        <h2 className="mt-2 text-xl font-semibold text-emerald-950">
          {resident.participationLabel}
        </h2>
        <p className="mt-2 text-sm leading-6 text-emerald-900">
          {contributor
            ? `${resident.resource?.name} is registered and available for suitable Dapto events.`
            : "Council has confirmed your household's community equity eligibility."}
        </p>
      </Card>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
            Household
          </p>
          <p className="mt-3 text-xl font-semibold">
            {resident.householdLabel}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {resident.location}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
            Value pathway
          </p>
          <p className="mt-3 text-xl font-semibold">
            {contributor ? "Verified delivery" : "20% equity floor"}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {contributor
              ? "Rewards are calculated only after measured response passes verification."
              : "A protected share of verified value supports eligible residents without rooftop access."}
          </p>
        </Card>
      </div>
    </div>
  );
}
