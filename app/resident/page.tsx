import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";

export default function ResidentPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <StatusBadge>Ready to participate</StatusBadge>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight">
        Good afternoon, Maya.
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        Your energy flexibility helps the whole Dapto community.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-[var(--muted)]">Wallet balance</p>
          <p className="mt-3 font-mono text-4xl font-semibold">$38.20</p>
          <p className="mt-3 text-sm text-[var(--primary)]">
            $7.40 earned this month
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Next Sunshine Event</p>
          <p className="mt-3 text-2xl font-semibold">Today, 12–2 pm</p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Your hot water system can shift 4.6 kWh.
          </p>
        </Card>
      </div>
    </div>
  );
}
