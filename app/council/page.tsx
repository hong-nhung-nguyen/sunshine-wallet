import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";

export default function CouncilPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-mono text-sm tracking-widest text-[var(--primary)] uppercase">
            Operator console
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Dapto Sunshine Cell
          </h1>
        </div>
        <StatusBadge>Forecast opportunity</StatusBadge>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--muted)]">Constraint risk</p>
          <p className="mt-3 text-3xl font-semibold">High</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Eligible resources</p>
          <p className="mt-3 font-mono text-3xl font-semibold">24</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Available flexibility</p>
          <p className="mt-3 font-mono text-3xl font-semibold">90 kWh</p>
        </Card>
      </div>
      <Card className="mt-5">
        <h2 className="text-xl font-semibold">Event workflow</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-5">
          {["Ready", "Optimise", "Simulate", "Verify", "Settle"].map(
            (step, index) => (
              <li
                key={step}
                className="rounded-2xl bg-[var(--surface-muted)] p-4"
              >
                <span className="font-mono text-xs text-[var(--primary)]">
                  0{index + 1}
                </span>
                <p className="mt-2 font-medium">{step}</p>
              </li>
            ),
          )}
        </ol>
      </Card>
    </div>
  );
}
