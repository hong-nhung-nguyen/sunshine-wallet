import type { Provenance, WalletTransaction } from "@/lib/types";

export interface WalletCreditInstruction {
  participantId: string;
  eventId: string;
  type: "equity_credit" | "contributor_reward";
  amountCents: number;
  createdAt: string;
  provenance: Provenance;
}

export interface WalletPostingInput {
  participantId: string;
  openingBalanceCents: number;
  existingTransactions: readonly WalletTransaction[];
  credits: readonly WalletCreditInstruction[];
}

export interface WalletPostingResult {
  participantId: string;
  openingBalanceCents: number;
  postedTransactions: WalletTransaction[];
  skippedTransactionKeys: string[];
  allTransactions: WalletTransaction[];
  closingBalanceCents: number;
}

const transactionKey = ({
  participantId,
  eventId,
  type,
}: Pick<WalletCreditInstruction, "participantId" | "eventId" | "type">) =>
  `${participantId}:${eventId}:${type}`;

export function applyWalletCredits(
  input: WalletPostingInput,
): WalletPostingResult {
  if (
    !Number.isInteger(input.openingBalanceCents) ||
    input.openingBalanceCents < 0
  )
    throw new Error("Opening balance must be non-negative integer cents");

  const knownKeys = new Set(
    input.existingTransactions
      .filter((item): item is WalletTransaction & { eventId: string } =>
        Boolean(item.eventId),
      )
      .map((item) =>
        transactionKey({
          participantId: item.participantId,
          eventId: item.eventId,
          type: item.type === "adjustment" ? "equity_credit" : item.type,
        }),
      ),
  );
  const postedTransactions: WalletTransaction[] = [];
  const skippedTransactionKeys: string[] = [];

  for (const credit of input.credits) {
    if (credit.participantId !== input.participantId)
      throw new Error("Credit participant does not match wallet participant");
    if (!Number.isInteger(credit.amountCents) || credit.amountCents < 0)
      throw new Error("Credit amount must be non-negative integer cents");
    const key = transactionKey(credit);
    if (knownKeys.has(key)) {
      skippedTransactionKeys.push(key);
      continue;
    }
    knownKeys.add(key);
    postedTransactions.push({
      id: `wallet_${credit.eventId}_${credit.participantId}_${credit.type}`,
      participantId: credit.participantId,
      eventId: credit.eventId,
      type: credit.type,
      amount: credit.amountCents / 100,
      currency: "AUD",
      status: "posted",
      createdAt: credit.createdAt,
      provenance: credit.provenance,
    });
  }

  const closingBalanceCents =
    input.openingBalanceCents +
    postedTransactions.reduce(
      (sum, item) => sum + Math.round(item.amount * 100),
      0,
    );
  return {
    participantId: input.participantId,
    openingBalanceCents: input.openingBalanceCents,
    postedTransactions,
    skippedTransactionKeys,
    allTransactions: [...postedTransactions, ...input.existingTransactions],
    closingBalanceCents,
  };
}
