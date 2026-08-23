import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  FACTOR_A_POINTS,
  FACTOR_B_POINTS,
  FACTOR_C_POINTS,
  FACTOR_D_POINTS,
  FACTOR_E_POINTS,
  computePriorityScore,
  isPhysicalChannelEligible,
  scoreAnswers,
  type FactorAAnswer,
  type FactorBAnswer,
  type FactorCAnswer,
  type FactorDAnswer,
  type FactorEAnswer,
} from "@/lib/engine/priority-scheme";
import { prefillFactors } from "@/services/eligibility";
import { fetchEligibility, isValidNmi, resolveNmi } from "@/services/retailer";

const QUESTIONS = {
  factorA: {
    legend: "How do you pay for electricity, and have you had trouble lately?",
    why: "Households in debt recovery or on a prepay meter face the sharpest access barrier.",
    options: [
      ["acute_hardship", "No active bill, prepay meter, in debt recovery, disconnected, or referred by a support service"],
      ["eapa_last_12m", "Received EAPA assistance in the last 12 months"],
      ["missed_bill", "Missed or deferred a bill in the last 6 months"],
      ["none", "None of these"],
    ],
  },
  factorB: {
    legend: "Do you receive an energy rebate, or hold a concession card?",
    why: "We store only the band, never which program. No health information enters the system.",
    options: [
      ["low_income_or_concession", "Low Income Household Rebate, concession card, or pensioner card"],
      ["family_or_seniors_rebate", "Family Energy Rebate or Seniors Energy Rebate"],
      ["below_median_no_rebate", "No rebate, household income below median"],
      ["none", "None of these"],
    ],
  },
  factorC: {
    legend: "Do you rent or own, and what type of home?",
    why: "Renters and apartment residents cannot install solar themselves. No partner can tell us this, so we always ask.",
    options: [
      ["renter", "I rent — private, social, or community housing"],
      ["owner_apartment", "I own an apartment or strata property"],
      ["owner_detached_no_solar", "I own a detached home without solar"],
      ["owner_with_solar", "I own a home with solar already installed"],
    ],
  },
  factorD: {
    legend: "Who do you pay — a retailer, or your landlord or building?",
    why: "Embedded-network customers often have less retail choice and fewer protections.",
    options: [
      ["embedded_network", "My landlord or building operator, through an embedded network"],
      ["standing_offer", "My own retail account, on a standing or default offer"],
      ["market_offer", "My own retail account, on a market offer"],
    ],
  },
  factorE: {
    legend: "What kind of hot water system do you have?",
    why: "This decides what you can physically offer. It never changes your need tier.",
    options: [
      ["individual_tank", "A storage tank on its own controlled-load meter"],
      ["shared_tank", "A shared or site storage tank"],
      ["other_controllable_load", "Another controllable load — EV charger, pool pump, or home battery"],
      ["none", "Instantaneous electric, gas, or nothing controllable"],
    ],
  },
} as const;

const POINTS = {
  factorA: FACTOR_A_POINTS,
  factorB: FACTOR_B_POINTS,
  factorC: FACTOR_C_POINTS,
  factorD: FACTOR_D_POINTS,
  factorE: FACTOR_E_POINTS,
} as const;

type FactorKey = keyof typeof QUESTIONS;

const pick = <T extends string>(
  raw: string | undefined,
  allowed: readonly (readonly [string, string])[],
  fallback: T,
): T =>
  (allowed.some(([value]) => value === raw) ? (raw as T) : fallback) as T;

export default async function OnboardingPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | undefined>>;
}>) {
  const params = await searchParams;
  const nmiInput = (params.nmi ?? "").trim();
  const submitted = params.submitted === "1";

  // Flow B: resolve the NMI, and prefill from the retailer if it is a partner.
  const resolution = nmiInput ? resolveNmi(nmiInput) : null;
  const assertions = resolution?.partner ? fetchEligibility(resolution.nmi) : null;
  const prefilled = assertions ? prefillFactors(assertions) : null;

  const answers = {
    factorA: pick<FactorAAnswer>(params.factorA, QUESTIONS.factorA.options, prefilled?.factorA ?? "none"),
    factorB: pick<FactorBAnswer>(params.factorB, QUESTIONS.factorB.options, prefilled?.factorB ?? "none"),
    factorC: pick<FactorCAnswer>(params.factorC, QUESTIONS.factorC.options, "renter"),
    factorD: pick<FactorDAnswer>(params.factorD, QUESTIONS.factorD.options, prefilled?.factorD ?? "market_offer"),
    factorE: pick<FactorEAnswer>(params.factorE, QUESTIONS.factorE.options, prefilled?.factorE ?? "none"),
  };

  const score = computePriorityScore(scoreAnswers(answers));
  const verification = prefilled ? "retailer_confirmed" : "self_declared";
  // Flow B still asks tenure: no partner asserts it.
  const askOnly: FactorKey[] = prefilled ? ["factorC"] : ["factorA", "factorB", "factorC", "factorD", "factorE"];

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-sm font-semibold text-[var(--primary)]">
        Step 2 of 2 · setting up your wallet
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        A few questions, then you are done
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        These decide your share of the Equity Pool. Every question has a
        &ldquo;none of these&rdquo; answer, nothing blocks you from finishing,
        and we never store which support program you are on.
      </p>

      <Card className="mt-7">
        <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
          Faster: link your bill
        </p>
        <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
          <label className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">
              NMI from your electricity bill
            </span>
            <input
              name="nmi"
              defaultValue={nmiInput}
              placeholder="10 or 11 characters"
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 font-mono"
            />
          </label>
          <button
            type="submit"
            className="min-h-12 rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white"
          >
            Look it up
          </button>
        </form>

        {nmiInput && !isValidNmi(nmiInput) && (
          <p className="mt-3 text-sm font-semibold text-rose-700">
            A NMI is 10 or 11 letters and digits. Check the number on your bill.
          </p>
        )}
        {resolution && (
          <div className="mt-4 rounded-2xl bg-[var(--surface-muted)] p-4 text-sm">
            <p className="font-semibold">{resolution.address}</p>
            <p className="mt-1 text-[var(--muted)]">
              {resolution.retailer} ·{" "}
              {resolution.partner
                ? "a program partner, so we can fill most of this in for you"
                : "not a program partner, so we will ask you directly instead"}
            </p>
            {!resolution.partner && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                This does not reduce your score. Answering the questions
                yourself counts the same.
              </p>
            )}
          </div>
        )}
      </Card>

      <form method="get" className="mt-6 space-y-5">
        <input type="hidden" name="nmi" value={nmiInput} />
        <input type="hidden" name="submitted" value="1" />

        {prefilled && (
          <Card className="border-emerald-200 bg-emerald-50">
            <p className="text-sm font-semibold text-emerald-900">
              Filled in from {assertions!.source}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-emerald-900">
              <li>· Payment difficulty, rebate band, billing and hot water</li>
              <li>· We still need one answer from you below</li>
            </ul>
          </Card>
        )}

        {(Object.keys(QUESTIONS) as FactorKey[]).map((key) => {
          const question = QUESTIONS[key];
          const isAsked = askOnly.includes(key);
          const value = answers[key];
          if (!isAsked)
            return (
              <input key={key} type="hidden" name={key} value={value} />
            );
          return (
            <Card key={key}>
              <fieldset>
                <legend className="text-base font-semibold">
                  {question.legend}
                </legend>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {question.why}
                </p>
                <div className="mt-4 space-y-2">
                  {question.options.map(([optionValue, label]) => (
                    <label
                      key={optionValue}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${value === optionValue ? "border-[var(--primary)] bg-emerald-50" : "border-[var(--border)] hover:bg-[var(--surface-muted)]"}`}
                    >
                      <input
                        type="radio"
                        name={key}
                        value={optionValue}
                        defaultChecked={value === optionValue}
                        className="mt-1 size-4 accent-[var(--primary)]"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </Card>
          );
        })}

        <button
          type="submit"
          className="min-h-12 w-full rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white"
        >
          {submitted ? "Update my answers" : "Finish and see my wallet"}
        </button>
      </form>

      {submitted && (
        <Card className="mt-6 border-[var(--primary)]">
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--primary)] uppercase">
            Your priority score
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-[var(--muted)]">Need (A–D)</p>
              <p className="mt-1 font-mono text-2xl font-semibold">
                {score.needScore}
                <span className="text-sm font-normal"> / 85</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">Contribution (E)</p>
              <p className="mt-1 font-mono text-2xl font-semibold">
                {score.contribScore}
                <span className="text-sm font-normal"> / 15</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">Priority</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-[var(--primary)]">
                {score.priorityScore}
                <span className="text-sm font-normal"> / 100</span>
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-1 border-t border-[var(--border)] pt-4 text-sm">
            {(Object.keys(QUESTIONS) as FactorKey[]).map((key) => {
              const label = key.replace("factor", "Factor ");
              const value = answers[key];
              const points = (POINTS[key] as Record<string, number>)[value];
              return (
                <li key={key} className="flex justify-between gap-3">
                  <span className="text-[var(--muted)]">
                    {label}
                    {key === "factorE" ? " · contribution" : " · need"}
                  </span>
                  <span className="font-mono font-semibold">{points}</span>
                </li>
              );
            })}
          </ul>

          <dl className="mt-5 grid gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--muted)]">Need tier</dt>
              <dd className="mt-1 font-semibold capitalize">
                {score.needTier}
              </dd>
              <dd className="text-xs text-[var(--muted)]">
                From your first four answers only — your hot water system cannot
                change this.
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">Equity cell</dt>
              <dd className="mt-1 font-mono text-sm font-semibold">
                {score.cellKey}
              </dd>
              <dd className="text-xs text-[var(--muted)]">
                Your cell sizes the block; your score divides it.
              </dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-[var(--border)] pt-4 text-sm">
            <p>
              <span className="font-semibold">Verification:</span>{" "}
              {verification === "retailer_confirmed"
                ? "confirmed by your retailer"
                : "self-declared, which counts the same"}
            </p>
            <p className="mt-1">
              <span className="font-semibold">Physical channel:</span>{" "}
              {isPhysicalChannelEligible(score.needTier, score.contribScore)
                ? "eligible — your hot water can be shifted into the sunshine window"
                : "not eligible — you take part financially, which pays the same way"}
            </p>
          </div>

          <Link
            href="/resident/wallet"
            className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white"
          >
            Open my wallet →
          </Link>
        </Card>
      )}
    </div>
  );
}
