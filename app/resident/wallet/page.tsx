import { Card } from "@/components/ui/card";
import { getDemoResident } from "@/lib/demo-session";
import { formatAud } from "@/lib/formatters";

export default async function WalletPage() {
  const resident = await getDemoResident();
  const rewardName =
    resident.role === "contributor" ? "Contributor Reward" : "Equity Dividend";
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-[var(--primary)]">Your wallet</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {resident.role === "contributor"
          ? "Rewards for verified flexibility"
          : "Credits shared with you"}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        {resident.role === "contributor"
          ? "Contributor Rewards are based on the response your registered resource actually delivers and the event verifies."
          : "Equity Dividends are your Council-approved share of verified local energy value. You can receive one without owning solar or an energy device."}
      </p>
      <Card className="mt-7 border-0 bg-[var(--wallet)] text-white shadow-[0_18px_45px_rgba(64,50,118,0.2)]">
        <p className="text-sm text-violet-100">Available balance</p>
        <p className="mt-2 font-mono text-5xl font-semibold tracking-tight">
          {formatAud(resident.walletBalance)}
        </p>
        <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/20 pt-5">
          <div>
            <p className="text-xs text-violet-100">Pending</p>
            <p className="mt-1 font-mono text-xl font-semibold">
              {formatAud(resident.pendingCredits)}
            </p>
          </div>
          <div>
            <p className="text-xs text-violet-100">Total earned</p>
            <p className="mt-1 font-mono text-xl font-semibold">
              {formatAud(resident.totalEarned)}
            </p>
            <Link
              href={`/resident/wallet/${walletNotification.transactionId}`}
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-900 underline underline-offset-4"
            >
              See why you received it
            </Link>
          </div>
        </div>
      </Card>
      <section className="mt-8" aria-labelledby="credit-history-heading">
        <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
          Simulated statement
        </p>
        <h2 id="credit-history-heading" className="mt-1 text-xl font-semibold">
          Credit history
        </h2>
        <div className="mt-4 overflow-hidden rounded-3xl border border-[var(--border)] bg-white">
          {resident.recentCredits.map((credit) => (
            <div
              key={credit.id}
              className="flex min-h-20 items-center justify-between gap-4 border-b border-[var(--border)] p-5 last:border-0"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{rewardName}</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.68rem] font-semibold text-emerald-800">
                    Posted
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {credit.label} · {credit.date}
                </p>
              </div>
              <p className="font-mono text-lg font-semibold text-[var(--primary)]">
                +{formatAud(credit.amount)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
