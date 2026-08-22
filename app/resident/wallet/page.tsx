import Link from "next/link";
import { Card } from "@/components/ui/card";
import { residentProfile } from "@/lib/data/resident";
import {
  statementTransactions,
  walletNotification,
  walletPostingResult,
} from "@/lib/data/wallet-statements";
import { formatAud } from "@/lib/formatters";

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const typeLabel = {
  equity_credit: "Equity Dividend",
  contributor_reward: "Contributor Reward",
  adjustment: "Council adjustment",
} as const;

export default function WalletPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-[var(--primary)]">Your wallet</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Credits shared with you
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        Equity Dividends are your Council-approved share of value from verified
        local energy events. You can receive one without owning solar, a
        battery, an EV or a controllable device.
      </p>

      <Card className="mt-7 border-0 bg-[var(--wallet)] text-white shadow-[0_18px_45px_rgba(64,50,118,0.2)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-violet-100">Available balance</p>
            <p className="mt-2 font-mono text-5xl font-semibold tracking-tight">
              {formatAud(walletPostingResult.closingBalanceCents / 100)}
            </p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            Credit posted
          </span>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/20 pt-5">
          <div>
            <p className="text-xs text-violet-100">Pending</p>
            <p className="mt-1 font-mono text-xl font-semibold">
              {formatAud(residentProfile.pendingCredits)}
            </p>
          </div>
          <div>
            <p className="text-xs text-violet-100">Total earned</p>
            <p className="mt-1 font-mono text-xl font-semibold">
              {formatAud(residentProfile.totalEarned)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="mt-5 border-emerald-200 bg-emerald-50">
        <div className="flex gap-3">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-700 font-bold text-white"
          >
            ✓
          </span>
          <div>
            <p className="font-semibold text-emerald-950">
              {walletNotification.title}
            </p>
            <p className="mt-1 text-sm leading-6 text-emerald-900">
              {walletNotification.body}
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
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
              Statement
            </p>
            <h2
              id="credit-history-heading"
              className="mt-1 text-xl font-semibold"
            >
              Credit history
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)]">Amounts in AUD</p>
        </div>
        <div className="mt-4 overflow-hidden rounded-3xl border border-[var(--border)] bg-white">
          {statementTransactions.map(({ transaction }) => (
            <Link
              key={transaction.id}
              href={`/resident/wallet/${transaction.id}`}
              className="flex min-h-20 items-center justify-between gap-4 border-b border-[var(--border)] p-5 transition-colors last:border-0 hover:bg-[var(--surface-muted)] focus-visible:bg-[var(--surface-muted)]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{typeLabel[transaction.type]}</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.68rem] font-semibold text-emerald-800">
                    Posted
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {dateFormatter.format(new Date(transaction.createdAt))} ·
                  Verified event
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-semibold text-[var(--primary)]">
                  +{formatAud(transaction.amount)}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  View details →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Card className="mt-6 bg-[var(--surface-muted)]">
        <p className="font-semibold">Questions about a credit?</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Council can review the decision and notify you if a justified change
          affects your balance.
        </p>
        <a
          href={`mailto:${residentProfile.councilEmail}?subject=Sunshine Wallet credit review`}
          className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--primary)] underline underline-offset-4"
        >
          Email Wollongong City Council
        </a>
      </Card>
    </div>
  );
}
