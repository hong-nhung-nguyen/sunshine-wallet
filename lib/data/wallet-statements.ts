import { residentProfile, walletTransactions } from "./resident";

export const walletPostingResult = {
  participantId: residentProfile.id,
  closingBalanceCents: Math.round(residentProfile.walletBalance * 100),
  allTransactions: walletTransactions,
} as const;

export const walletStatementDetails = {
  transaction_002: {
    title: "Contributor Reward",
    eventName: "Dapto Midday Solar Shift",
    eventDate: "22 August 2026",
    amount: 6.98,
    policyVersion: "SW-2026-01",
    reason:
      "Your registered hot-water system delivered verified flexibility during the event.",
    calculation:
      "Council allocated this amount from the contributor pool based on your verified share of the response.",
  },
  transaction_004: {
    title: "Equity Dividend",
    eventName: "Dapto Midday Solar Shift",
    eventDate: "22 August 2026",
    amount: 5.64,
    policyVersion: "SW-2026-01",
    reason:
      "Council confirmed your social-housing and no-roof-access eligibility for this event.",
    calculation:
      "Council allocated this amount from the verified Equity Pool, separately from your device contribution reward.",
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
  id: "notification_wallet_transaction_004",
  title: "Your Equity Dividend was posted",
  body: "$5.64 was added to your wallet after Council confirmed the Dapto Midday Solar Shift result.",
  changedAt: "2026-08-22T15:15:00+10:00",
  transactionId: "transaction_004",
  reason:
    "The event passed verification and the Council-approved allocation was applied.",
  creditChanged: true,
} as const;
