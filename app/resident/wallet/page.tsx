import { Card } from "@/components/ui/card";
import { residentProfile, walletTransactions } from "@/lib/data/resident";
import { formatAud } from "@/lib/formatters";

const dateFormatter = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" });

export default function WalletPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-[var(--primary)]">Your wallet</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Credits shared with you</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Equity Dividends are your Council-approved share of value from verified local energy events. They are separate from equipment contributor rewards.</p>
      <Card className="mt-7 border-0 bg-[var(--wallet)] text-white shadow-[0_18px_45px_rgba(64,50,118,0.2)]">
        <p className="text-sm text-violet-100">Available balance</p><p className="mt-2 font-mono text-5xl font-semibold tracking-tight">{formatAud(residentProfile.walletBalance)}</p>
        <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/20 pt-5">
          <div><p className="text-xs text-violet-100">Pending</p><p className="mt-1 font-mono text-xl font-semibold">{formatAud(residentProfile.pendingCredits)}</p></div>
          <div><p className="text-xs text-violet-100">Total earned</p><p className="mt-1 font-mono text-xl font-semibold">{formatAud(residentProfile.totalEarned)}</p></div>
        </div>
      </Card>
      <section className="mt-8" aria-labelledby="credit-history-heading">
        <h2 id="credit-history-heading" className="text-xl font-semibold">Credit history</h2>
        <div className="mt-4 overflow-hidden rounded-3xl border border-[var(--border)] bg-white">
          {walletTransactions.map((transaction) => (
            <article key={transaction.id} className="flex items-center justify-between gap-4 border-b border-[var(--border)] p-5 last:border-0">
              <div><p className="font-semibold">Equity Dividend</p><p className="mt-1 text-sm text-[var(--muted)]">{dateFormatter.format(new Date(transaction.createdAt))} · Verified event</p></div>
              <div className="text-right"><p className="font-mono text-lg font-semibold text-[var(--primary)]">+{formatAud(transaction.amount)}</p><p className="mt-1 text-xs capitalize text-[var(--muted)]">{transaction.status}</p></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
