import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { residentProfile } from "@/lib/data/resident";
import { statementTransactions } from "@/lib/data/wallet-statements";
import { formatAud } from "@/lib/formatters";

export function generateStaticParams() {
  return statementTransactions.map(({ transaction }) => ({
    transactionId: transaction.id,
  }));
}

export default async function WalletStatementPage({
  params,
}: Readonly<{ params: Promise<{ transactionId: string }> }>) {
  const { transactionId } = await params;
  const statement = statementTransactions.find(
    ({ transaction }) => transaction.id === transactionId,
  );
  if (!statement) notFound();
  const { transaction, detail } = statement;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/resident/wallet"
        className="text-sm font-semibold text-[var(--primary)]"
      >
        ← Back to wallet
      </Link>
      <header className="mt-6">
        <p className="text-sm font-semibold text-[var(--primary)]">
          Posted credit statement
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {detail.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {detail.eventName} · {detail.eventDate}
        </p>
      </header>
      <Card className="mt-6 border-0 bg-[var(--wallet)] text-white">
        <p className="text-sm text-violet-100">Amount added</p>
        <p className="mt-2 font-mono text-5xl font-semibold">
          +{formatAud(transaction.amount)}
        </p>
        <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4 text-sm">
          <span>Status</span>
          <span className="rounded-full bg-white/15 px-3 py-1 font-semibold">
            Posted
          </span>
        </div>
      </Card>
      <section className="mt-5 space-y-4">
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
            Why you received it
          </p>
          <p className="mt-3 text-sm leading-6">{detail.reason}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
            How it was decided
          </p>
          <p className="mt-3 text-sm leading-6">{detail.calculation}</p>
          <dl className="mt-5 grid gap-3 rounded-2xl bg-[var(--surface-muted)] p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--muted)]">Council policy</dt>
              <dd className="mt-1 font-mono font-semibold">
                {detail.policyVersion}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">Transaction ID</dt>
              <dd className="mt-1 font-mono text-xs font-semibold break-all">
                {transaction.id}
              </dd>
            </div>
          </dl>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <p className="font-semibold text-amber-950">
            About this prototype credit
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            This is a simulated Council-approved program credit, not an
            electricity tariff, retailer payment or guaranteed market revenue.
          </p>
        </Card>
      </section>
      <a
        href={`mailto:${residentProfile.councilEmail}?subject=Review wallet transaction ${transaction.id}`}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary)]"
      >
        Ask Council to review this credit
      </a>
    </div>
  );
}
