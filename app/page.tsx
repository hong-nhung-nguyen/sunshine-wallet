import Link from "next/link";
import { Card } from "@/components/ui/card";

const stages = ["Identify", "Coordinate", "Verify", "Share"];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-4 font-mono text-sm font-semibold tracking-[0.18em] text-[var(--primary)] uppercase">
            Local energy. Community value.
          </p>
          <h1 className="max-w-3xl text-5xl leading-[1.05] font-semibold tracking-tight sm:text-7xl">
            Make abundant sunshine work for everyone.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--muted)] sm:text-xl">
            Sunshine Wallet turns flexible local demand into verified network
            value, then distributes the benefit through a transparent equity
            policy.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/resident"
              className="inline-flex min-h-12 items-center rounded-full bg-[var(--primary)] px-6 font-semibold text-white transition-colors hover:bg-[var(--primary-strong)]"
            >
              Open resident view
            </Link>
            <Link
              href="/council"
              className="inline-flex min-h-12 items-center rounded-full border border-[var(--border)] bg-white px-6 font-semibold transition-colors hover:bg-[var(--surface-muted)]"
            >
              Open council view
            </Link>
          </div>
        </div>
        <Card className="bg-[var(--primary)] text-white">
          <p className="text-sm text-emerald-100">DAPTO-01 · Event preview</p>
          <p className="mt-6 font-mono text-5xl font-semibold">16.5 kWh</p>
          <p className="mt-2 text-emerald-100">verified flexible energy</p>
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/20 pt-6">
            <div>
              <p className="text-sm text-emerald-100">Community value</p>
              <p className="mt-1 font-mono text-2xl">$13.20</p>
            </div>
            <div>
              <p className="text-sm text-emerald-100">Equity credit</p>
              <p className="mt-1 font-mono text-2xl">$8.58</p>
            </div>
          </div>
        </Card>
      </section>
      <section
        className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="How Sunshine Wallet works"
      >
        {stages.map((stage, index) => (
          <Card key={stage}>
            <p className="font-mono text-sm text-[var(--primary)]">
              0{index + 1}
            </p>
            <h2 className="mt-4 text-xl font-semibold">{stage}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {
                [
                  "Find a local solar opportunity.",
                  "Schedule eligible flexible resources.",
                  "Compare observed demand to baseline.",
                  "Allocate rewards and equity credits.",
                ][index]
              }
            </p>
          </Card>
        ))}
      </section>
    </div>
  );
}
