import { walletTransactions } from "./resident";
import { applyWalletCredits } from "@/lib/engine/wallet";

export const walletPostingResult = applyWalletCredits({
  participantId: "resident_001",
  openingBalanceCents: 1600,
  existingTransactions: walletTransactions.slice(1),
  credits: [
    {
      participantId: "resident_001",
      eventId: "event_001",
      type: "equity_credit",
      amountCents: 1240,
      createdAt: "2026-08-16T16:00:00+10:00",
      provenance: {
        source: "operator_review",
        notes: "Posted after verification under Council policy SW-2026-01.",
      },
    },
  ],
});

export const walletStatementDetails = {
  credit_101: {
    title: "Equity Dividend",
    eventName: "Community solar event",
    eventDate: "16 August 2026",
    amount: 12.4,
    policyVersion: "SW-2026-01",
    reason:
      "You received a share reserved for Dapto residents without practical access to rooftop solar.",
    calculation:
      "Council allocated this amount from the event’s verified Equity Pool. You did not need to own or control an energy device.",
  },
  credit_087: {
    title: "Equity Dividend",
    eventName: "Dapto midday solar share",
    eventDate: "9 August 2026",
    amount: 8.75,
    policyVersion: "SW-2026-01",
    reason: "Council confirmed your no-roof-access eligibility for this event.",
    calculation:
      "This credit is an Equity Dividend and is separate from rewards paid for device contribution.",
  },
  credit_074: {
    title: "Equity Dividend",
    eventName: "Local solar opportunity",
    eventDate: "2 August 2026",
    amount: 7.25,
    policyVersion: "SW-2026-01",
    reason: "Your household was included in the Council-approved Equity Pool.",
    calculation:
      "The amount was posted after the event passed measurement and verification checks.",
  },
} as const;

export const statementTransactions = walletTransactions.map((transaction) => ({
  transaction,
  detail:
    walletStatementDetails[
      transaction.id as keyof typeof walletStatementDetails
    ],
}));

export const walletNotification = {
  id: "notification_wallet_credit_101",
  title: "Your Equity Dividend was posted",
  body: "$12.40 was added to your wallet after Council confirmed the Community solar event result.",
  changedAt: "2026-08-16T16:00:00+10:00",
  reason:
    "The event passed verification and the Council-approved allocation was applied.",
  creditChanged: true,
} as const;
