export type HouseholdType =
  | "renter"
  | "owner"
  | "social_housing"
  | "mixed_household";
export type EquityTier = "priority" | "standard" | "premium";
export type ResourceType =
  | "hot_water"
  | "battery"
  | "ev_charger"
  | "community_load"
  | "solar_export"
  | "pool_pump"
  | "hvac"
  | "other";
export type ResourceStatus =
  | "available"
  | "reserved"
  | "dispatched"
  | "paused"
  | "offline"
  | "pending_review";
export type EventStatus =
  | "draft"
  | "ready"
  | "optimised"
  | "simulated"
  | "verified"
  | "settled"
  | "rejected";
export type ConsentStatus =
  | "not_requested"
  | "accepted"
  | "declined"
  | "paused";
export type VerificationStatus = "pending" | "passed" | "failed" | "partial";
export type SettlementStatus =
  | "pending"
  | "calculated"
  | "settled"
  | "reversed";
export type ProvenanceSource =
  | "simulated_network_forecast"
  | "meter_reading"
  | "device_acknowledgement"
  | "manual_override"
  | "retailer_settlement"
  | "operator_review";

export interface Provenance {
  source: ProvenanceSource;
  confidence?: number;
  assumptions?: string[];
  notes?: string;
  updatedAt?: string;
}
export interface Coordinates {
  lat: number;
  lng: number;
}
export interface TimeWindow {
  start: string;
  end: string;
}
export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  confidence: number;
  checkedAt?: string;
}
export interface FinancialValue {
  amount: number;
  currency: "AUD";
}

export interface Participant {
  id: string;
  type: "resident" | "contributor" | "operator" | "council";
  name: string;
  email?: string;
  householdType?: HouseholdType;
  equityTier?: EquityTier;
  locationId?: string;
  walletBalance?: number;
  consentStatus?: ConsentStatus;
  createdAt: string;
  updatedAt?: string;
  provenance?: Provenance;
}

export interface SunshineCell {
  id: string;
  name: string;
  location: string;
  region?: string;
  coordinates?: Coordinates;
  constraintRisk: "low" | "medium" | "high";
  solarExportPotentialKwh?: number;
  forecastWindow: TimeWindow;
  demandProfile?: "normal" | "constraint" | "peak" | "available";
  createdAt: string;
  provenance?: Provenance;
}

export interface MeterReading {
  id: string;
  resourceId: string;
  timestamp: string;
  actualPowerKw: number;
  actualEnergyKwh: number;
  baselineEnergyKwh?: number;
  observedEnergyKwh?: number;
  source: "smart_meter" | "simulated" | "mock_adapter";
  provenance?: Provenance;
}

export interface FlexibleResource {
  id: string;
  participantId: string;
  resourceType: ResourceType;
  name: string;
  description?: string;
  locationId: string;
  capacityKw: number;
  maxShiftEnergyKwh: number;
  dispatchable: boolean;
  status: ResourceStatus;
  eligibility?: EligibilityResult;
  lastKnownMeterReading?: MeterReading;
  createdAt: string;
  updatedAt?: string;
  provenance?: Provenance;
}

export interface FlexEvent {
  id: string;
  sunshineCellId: string;
  name?: string;
  status: EventStatus;
  window: TimeWindow;
  targetFlexEnergyKwh: number;
  maxPowerKw: number;
  maxShiftEnergyKwh: number;
  confidence: number;
  equityFloor: number;
  createdAt: string;
  updatedAt?: string;
  provenance?: Provenance;
}

export interface EventResourceSelection {
  id: string;
  eventId: string;
  resourceId: string;
  selectionRank: number;
  score: number;
  recommendedPowerKw: number;
  recommendedEnergyKwh: number;
  status: "candidate" | "selected" | "rejected";
  provenance?: Provenance;
}

export interface DispatchPlan {
  id: string;
  eventId: string;
  resourceId: string;
  plannedPowerKw: number;
  plannedEnergyKwh: number;
  baselineEnergyKwh?: number;
  dispatchTimestamp?: string;
  status: "planned" | "issued" | "completed" | "failed";
  provenance?: Provenance;
}

export interface DispatchResult {
  id: string;
  eventId: string;
  resourceId: string;
  plannedPowerKw: number;
  actualPowerKw: number;
  plannedEnergyKwh: number;
  actualEnergyKwh: number;
  baselineEnergyKwh?: number;
  observedEnergyKwh?: number;
  confidence: number;
  status: "completed" | "partial" | "failed";
  provenance?: Provenance;
}

export interface VerificationRecord {
  id: string;
  eventId: string;
  verificationStatus: VerificationStatus;
  baselineReference: string;
  verifiedFlexEnergyKwh: number;
  confidenceScore: number;
  settlementGatePassed: boolean;
  details?: string[];
  createdAt: string;
  provenance?: Provenance;
}

export interface ContributorAttribution {
  id: string;
  eventId: string;
  participantId: string;
  resourceId: string;
  shareOfVerifiedResponse: number;
  rewardAmount: number;
  equityCreditAmount: number;
  createdAt: string;
  provenance?: Provenance;
}

export interface Settlement {
  id: string;
  eventId: string;
  verificationRecordId: string;
  verifiedFlexEnergyKwh: number;
  totalValue: number;
  contributorRewards: number;
  equityCredit: number;
  equityFloorApplied: boolean;
  status: SettlementStatus;
  createdAt: string;
  updatedAt?: string;
  provenance?: Provenance;
}

export interface WalletTransaction {
  id: string;
  participantId: string;
  eventId?: string;
  type: "equity_credit" | "contributor_reward" | "adjustment";
  amount: number;
  currency: "AUD";
  status: "pending" | "posted" | "reversed";
  createdAt: string;
  provenance?: Provenance;
}

/** Complete in-memory data contract used by the MVP repository and mock APIs. */
export interface SunshineWalletData {
  participants: Participant[];
  sunshineCells: SunshineCell[];
  flexibleResources: FlexibleResource[];
  flexEvents: FlexEvent[];
  eventResourceSelections: EventResourceSelection[];
  dispatchPlans: DispatchPlan[];
  dispatchResults: DispatchResult[];
  verificationRecords: VerificationRecord[];
  contributorAttributions: ContributorAttribution[];
  settlements: Settlement[];
  walletTransactions: WalletTransaction[];
}
