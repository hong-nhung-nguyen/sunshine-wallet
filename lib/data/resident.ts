import type {
  ConsentStatus,
  EventStatus,
  WalletTransaction,
} from "@/lib/types";
import { seedData } from "./seed";

const participant = seedData.participants.find(({ id }) => id === "resident_003")!;
const completedEvent = seedData.flexEvents.find(({ id }) => id === "event_001")!;
const upcomingEvent = seedData.flexEvents.find(({ id }) => id === "event_006")!;
const completedVerification = seedData.verificationRecords.find(
  ({ eventId }) => eventId === completedEvent.id,
)!;
const residentEquityCredit = seedData.walletTransactions.find(
  ({ participantId, eventId, type }) =>
    participantId === participant.id &&
    eventId === completedEvent.id &&
    type === "equity_credit",
)!;

export const residentProfile = {
  id: participant.id,
  name: participant.name,
  firstName: "Aisha",
  initials: "AR",
  householdLabel: "Apartment resident",
  location: "Dapto Sunshine Cell",
  walletBalance: participant.walletBalance ?? 0,
  pendingCredits: 6.2,
  totalEarned: seedData.walletTransactions
    .filter(({ participantId }) => participantId === participant.id)
    .reduce((sum, transaction) => sum + transaction.amount, 0),
  consentStatus: "accepted" satisfies ConsentStatus,
  councilEmail: "sunshinewallet-demo@wollongong.example",
} as const;

export const residentEvents = [
  {
    id: upcomingEvent.id,
    title: upcomingEvent.name,
    dateLabel: "24 Aug 2026",
    timeLabel: "12:00–2:00 pm",
    location: "Dapto Sunshine Cell",
    status: "ready" satisfies EventStatus,
    statusLabel: "Ready",
    description:
      "Local solar is expected to be abundant. Community devices will shift demand into the sunny period.",
    residentAction: "Response needed",
    estimatedCredit: 6.2,
    contribution: {
      resourceId: "resource_003",
      resourceLabel: "Aisha's hot-water system",
      request:
        "Let the registered hot-water system finish heating during the sunny period instead of later in the evening.",
      expectedShiftKwh: 1.8,
      estimatedReward: 2.4,
      comfortSafeguard:
        "Hot water must remain within its safe temperature range. The event stops for this resource if that safeguard cannot be met.",
      whySelected:
        "The resource is in the Dapto Sunshine Cell, is available in this window and has current resident consent.",
      responseDeadline: "11:30 am today",
    },
  },
  {
    id: completedEvent.id,
    title: completedEvent.name,
    dateLabel: "22 Aug 2026",
    timeLabel: "12:00–2:00 pm",
    location: "Dapto Sunshine Cell",
    status: "verified" satisfies EventStatus,
    statusLabel: "Verified",
    description:
      `The community shifted ${completedVerification.verifiedFlexEnergyKwh} kWh and the result passed Council's verification checks.`,
    residentAction: "Completed",
    estimatedCredit: residentEquityCredit.amount,
    contribution: null,
  },
] as const;

export const walletTransactions: readonly WalletTransaction[] =
  seedData.walletTransactions.filter(
    ({ participantId }) => participantId === residentProfile.id,
  );

export const latestVerifiedFlexEnergyKwh =
  completedVerification.verifiedFlexEnergyKwh;

export const residentPolicy = {
  version: "SW-2026-01",
  effectiveDate: "1 August 2026",
  eligibilityLabel: "Eligible — no practical roof access",
  equityFloorPercent: 20,
  explanation:
    "Council reserves at least 20% of verified event value for participating residents who cannot install rooftop solar.",
} as const;
