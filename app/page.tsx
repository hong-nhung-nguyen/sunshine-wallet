import Link from "next/link";
import { Card } from "@/components/ui/card";
import { RotatingStoryCards } from "@/components/home/rotating-story-cards";

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
              href="/login"
              className="inline-flex min-h-12 items-center rounded-full bg-[var(--primary)] px-6 font-semibold text-white transition-colors hover:bg-[var(--primary-strong)]"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center rounded-full border border-[var(--border)] bg-white px-6 font-semibold transition-colors hover:bg-[var(--surface-muted)]"
            >
              Create account
            </Link>
            <Link
              href="/council"
              className="inline-flex min-h-12 items-center px-3 font-semibold text-[var(--primary)] underline decoration-2 underline-offset-4"
            >
              Council operator view
            </Link>
          </div>
        </div>
        <RotatingStoryCards />
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
