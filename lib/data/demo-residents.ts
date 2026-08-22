export type DemoResidentRole = "contributor" | "non_solar_owner";

export type DemoResidentPersona = {
  id: string;
  role: DemoResidentRole;
  email: string;
  password: string;
  name: string;
  firstName: string;
  initials: string;
  householdLabel: string;
  location: string;
  walletBalance: number;
  pendingCredits: number;
  totalEarned: number;
  headline: string;
  explanation: string;
  participationLabel: string;
  resource: null | {
    name: string;
    type: string;
    capacityKw: number;
    availableKwh: number;
    status: string;
  };
  nextEvent: {
    id: string;
    title: string;
    dateLabel: string;
    timeLabel: string;
    statusLabel: string;
    action: string;
    estimatedCredit: number;
  };
  recentCredits: readonly {
    id: string;
    label: string;
    date: string;
    amount: number;
    type: "contributor_reward" | "equity_credit";
  }[];
};

export const demoResidentPersonas = {
  contributor: {
    id: "resident_002",
    role: "contributor",
    email: "contributor@gmail.com",
    password: "abc",
    name: "Noah Williams",
    firstName: "Noah",
    initials: "NW",
    householdLabel: "Solar contributor",
    location: "Dapto Sunshine Cell",
    walletBalance: 52.15,
    pendingCredits: 8.4,
    totalEarned: 156.7,
    headline: "Your flexible energy is helping Dapto use more local sunshine.",
    explanation:
      "Your EV charger can shift demand into solar-rich hours. Verified delivery earns a Contributor Reward, while part of the event value is reserved for community equity credits.",
    participationLabel: "Contributor account",
    resource: {
      name: "Home EV charger",
      type: "EV charger",
      capacityKw: 7.2,
      availableKwh: 14.4,
      status: "Available",
    },
    nextEvent: {
      id: "event_006",
      title: "Midday solar shift",
      dateLabel: "Today",
      timeLabel: "12:00–2:00 pm",
      statusLabel: "Action requested",
      action: "Confirm that your EV can charge during the event window.",
      estimatedCredit: 8.4,
    },
    recentCredits: [
      {
        id: "contributor_credit_101",
        label: "EV charging contribution",
        date: "16 Aug 2026",
        amount: 14.8,
        type: "contributor_reward",
      },
      {
        id: "contributor_credit_087",
        label: "Battery-ready event",
        date: "9 Aug 2026",
        amount: 11.35,
        type: "contributor_reward",
      },
      {
        id: "contributor_credit_074",
        label: "Community solar shift",
        date: "2 Aug 2026",
        amount: 9.6,
        type: "contributor_reward",
      },
    ],
  },
  non_solar_owner: {
    id: "resident_001",
    role: "non_solar_owner",
    email: "nonsolar@gmail.com",
    password: "abc",
    name: "Aisha Patel",
    firstName: "Aisha",
    initials: "AP",
    householdLabel: "Apartment resident without rooftop solar",
    location: "Dapto Sunshine Cell",
    walletBalance: 28.4,
    pendingCredits: 6.2,
    totalEarned: 82.9,
    headline: "You share in local solar value—even without owning panels.",
    explanation:
      "Council's equity policy reserves part of every verified event for eligible residents without practical roof access. You do not need an energy device to receive an Equity Dividend.",
    participationLabel: "Community equity account",
    resource: null,
    nextEvent: {
      id: "event_006",
      title: "Community solar share",
      dateLabel: "Today",
      timeLabel: "12:00–2:00 pm",
      statusLabel: "Included",
      action: "No action is required. Your eligibility is already confirmed.",
      estimatedCredit: 6.2,
    },
    recentCredits: [
      {
        id: "credit_101",
        label: "Community Equity Dividend",
        date: "16 Aug 2026",
        amount: 12.4,
        type: "equity_credit",
      },
      {
        id: "credit_087",
        label: "Community Equity Dividend",
        date: "9 Aug 2026",
        amount: 8.75,
        type: "equity_credit",
      },
      {
        id: "credit_074",
        label: "Community Equity Dividend",
        date: "2 Aug 2026",
        amount: 7.25,
        type: "equity_credit",
      },
    ],
  },
} as const satisfies Record<DemoResidentRole, DemoResidentPersona>;

export const demoAccounts = Object.values(demoResidentPersonas);

export function findDemoResident(email: string, password: string) {
  return demoAccounts.find(
    (account) =>
      account.email.toLowerCase() === email.trim().toLowerCase() &&
      account.password === password,
  );
}
