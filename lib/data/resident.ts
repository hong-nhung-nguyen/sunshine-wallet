import type {
  ConsentStatus,
  EventStatus,
  WalletTransaction,
} from "@/lib/types";

export const residentProfile = {
  id: "resident_001",
  name: "Aisha Patel",
  firstName: "Aisha",
  initials: "AP",
  householdLabel: "Apartment resident",
  location: "Dapto Sunshine Cell",
  walletBalance: 28.4,
  pendingCredits: 6.2,
  totalEarned: 82.9,
  consentStatus: "accepted" satisfies ConsentStatus,
  councilEmail: "sunshinewallet-demo@wollongong.example",
} as const;

export const residentEvents = [
  {
    id: "event_006",
    title: "Midday solar share",
    dateLabel: "Today",
    timeLabel: "12:00–2:00 pm",
    location: "Dapto Sunshine Cell",
    status: "ready" satisfies EventStatus,
    statusLabel: "Ready",
    description:
      "Local solar is expected to be abundant. Community devices will shift demand into the sunny period.",
    residentAction: "Response needed",
    estimatedCredit: 6.2,
    contribution: {
      resourceId: "resource_001",
      resourceLabel: "Apartment hot-water system",
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
    id: "event_001",
    title: "Community solar event",
    dateLabel: "16 Aug 2026",
    timeLabel: "12:00–2:00 pm",
    location: "Dapto Sunshine Cell",
    status: "verified" satisfies EventStatus,
    statusLabel: "Verified",
    description:
      "The community shifted 14.7 kWh and the result passed Council's verification checks.",
    residentAction: "Completed",
    estimatedCredit: 12.4,
    contribution: null,
  },
] as const;

export const walletTransactions: readonly WalletTransaction[] = [
  {
    id: "credit_101",
    participantId: residentProfile.id,
    eventId: "event_001",
    type: "equity_credit",
    amount: 12.4,
    currency: "AUD",
    status: "posted",
    createdAt: "2026-08-16T16:00:00+10:00",
    provenance: {
      source: "operator_review",
      notes: "Demo data under Council policy SW-2026-01.",
    },
  },
  {
    id: "credit_087",
    participantId: residentProfile.id,
    eventId: "event_004",
    type: "equity_credit",
    amount: 8.75,
    currency: "AUD",
    status: "posted",
    createdAt: "2026-08-09T16:00:00+10:00",
    provenance: {
      source: "operator_review",
      notes: "Demo data under Council policy SW-2026-01.",
    },
  },
  {
    id: "credit_074",
    participantId: residentProfile.id,
    eventId: "event_003",
    type: "equity_credit",
    amount: 7.25,
    currency: "AUD",
    status: "posted",
    createdAt: "2026-08-02T16:00:00+10:00",
    provenance: {
      source: "operator_review",
      notes: "Demo data under Council policy SW-2026-01.",
    },
  },
] as const;

export const residentPolicy = {
  version: "SW-2026-01",
  effectiveDate: "1 August 2026",
  eligibilityLabel: "Eligible — no practical roof access",
  equityFloorPercent: 20,
  explanation:
    "Council reserves at least 20% of verified event value for participating residents who cannot install rooftop solar.",
} as const;
