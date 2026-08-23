import type { WalletTransaction } from "@/lib/types";
import type { EquityHousehold } from "./equity-allocation";
import {
  settleMonth,
  type GovernancePolicy,
  type MonthlySettlement,
} from "./monthly-settlement";
import { applyWalletCredits } from "./wallet";

export interface VerifiedEventValue {
  eventId: string;
  occurredAt: string;
  verificationGatePassed: boolean;
  /** Monetary value already proven for this event, in integer cents. */
  verifiedValueCents: number;
  /** Verified contribution weight by Solar Pool household. */
  contributorWeights: Readonly<Record<string, number>>;
}

export interface MonthlyWalletPipelineInput {
  period: string;
  events: readonly VerifiedEventValue[];
  households: readonly EquityHousehold[];
  /** Maps settlement household ids onto wallet account participant ids. */
  walletParticipantIds?: Readonly<Record<string, string>>;
  policy: GovernancePolicy;
  existingTransactions: readonly WalletTransaction[];
  createdAt: string;
}

export interface MonthlyWalletPipelineResult {
  period: string;
  includedEventIds: string[];
  excludedEventIds: string[];
  potCents: number;
  settlement: MonthlySettlement;
  postedTransactions: WalletTransaction[];
  skippedTransactionKeys: string[];
  ledger: WalletTransaction[];
}

function eventPeriod(timestamp: string): string {
  return timestamp.slice(0, 7);
}

export function runMonthlyWalletPipeline(
  input: MonthlyWalletPipelineInput,
): MonthlyWalletPipelineResult {
  if (!/^\d{4}-\d{2}$/.test(input.period))
    throw new Error("Period must use YYYY-MM format");
  if (
    input.events.some(
      (event) =>
        !Number.isInteger(event.verifiedValueCents) ||
        event.verifiedValueCents < 0,
    )
  )
    throw new Error("Verified event values must be non-negative integer cents");

  const included = input.events.filter(
    (event) =>
      event.verificationGatePassed &&
      eventPeriod(event.occurredAt) === input.period,
  );
  const includedIds = new Set(included.map(({ eventId }) => eventId));
  const contributorWeights: Record<string, number> = {};
  for (const event of included)
    for (const [householdId, weight] of Object.entries(
      event.contributorWeights,
    )) {
      if (!Number.isFinite(weight) || weight < 0)
        throw new Error("Contributor weights must be finite and non-negative");
      contributorWeights[householdId] =
        (contributorWeights[householdId] ?? 0) + weight;
    }

  const potCents = included.reduce(
    (sum, event) => sum + event.verifiedValueCents,
    0,
  );
  const settlement = settleMonth({
    period: input.period,
    potCents,
    households: input.households,
    contributorWeights,
    policy: input.policy,
    createdAt: input.createdAt,
  });
  if (settlement.status === "blocked")
    return {
      period: input.period,
      includedEventIds: [...includedIds],
      excludedEventIds: input.events
        .filter(({ eventId }) => !includedIds.has(eventId))
        .map(({ eventId }) => eventId),
      potCents,
      settlement,
      postedTransactions: [],
      skippedTransactionKeys: [],
      ledger: [...input.existingTransactions],
    };

  const monthlyEventId = `monthly:${input.period}`;
  const postedTransactions: WalletTransaction[] = [];
  const skippedTransactionKeys: string[] = [];
  for (const credit of settlement.credits.filter(
    ({ amountCents }) => amountCents > 0,
  )) {
    const participantId =
      input.walletParticipantIds?.[credit.householdId] ?? credit.householdId;
    const existingForHousehold = [
      ...input.existingTransactions,
      ...postedTransactions,
    ].filter((transaction) => transaction.participantId === participantId);
    const posting = applyWalletCredits({
      participantId,
      openingBalanceCents: 0,
      existingTransactions: existingForHousehold,
      credits: [
        {
          participantId,
          eventId: monthlyEventId,
          type: credit.branch === "1A" ? "equity_credit" : "contributor_reward",
          amountCents: credit.amountCents,
          createdAt: input.createdAt,
          provenance: {
            source: "operator_review",
            notes: `Monthly ${input.period} allocation under ${input.policy.version}`,
          },
        },
      ],
    });
    postedTransactions.push(...posting.postedTransactions);
    skippedTransactionKeys.push(...posting.skippedTransactionKeys);
  }

  return {
    period: input.period,
    includedEventIds: [...includedIds],
    excludedEventIds: input.events
      .filter(({ eventId }) => !includedIds.has(eventId))
      .map(({ eventId }) => eventId),
    potCents,
    settlement,
    postedTransactions,
    skippedTransactionKeys,
    ledger: [...postedTransactions, ...input.existingTransactions],
  };
}
