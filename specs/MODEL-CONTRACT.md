# Sunshine Wallet Model Contract

Version: 1.0
Date: 2026-08-22
Scope: Hackathon MVP domain model for the Sunshine Wallet single-app architecture

## 1. Purpose

This document is the single source of truth for the domain objects used by the Sunshine Wallet MVP. It defines the canonical entities, enums, required fields, constraints, relationships, and derived values that the frontend, API routes, and engine logic must all agree on.

This model intentionally narrows scope to the hackathon demo. It is not a production-grade electricity market schema. The design is built to preserve the critical distinctions the project documents repeatedly emphasize:

- kW vs kWh
- flexible demand vs solar contribution
- baseline vs observed demand
- planned vs actual response
- verification vs settlement
- equity credit vs contributor reward
- provenance as a required truthfulness mechanism

The project contract rule is simple: do not create separate frontend and backend versions of Participant, Resource, FlexEvent, or Settlement. One canonical model must be shared everywhere.

---

## 2. Modelling principles

### 2.1 One source of truth
Each domain object has a canonical TypeScript definition and must be used consistently by UI, API, and engine code.

### 2.2 Separate concept, separate field
The model must not collapse different concepts into one field:

- `capacityKw` is not `targetFlexEnergyKwh`
- `baselineEnergyKwh` is not `observedEnergyKwh`
- `projectedReward` is not `equityCredit`
- `dispatchPlan` is not `deliveryActual`

### 2.3 Explainability over opacity
Every major calculation or derived output must keep a provenance trail explaining how the value was generated or estimated.

### 2.4 Determinism
The engine should be deterministic and explainable. It must not rely on hidden or opaque decision-making.

### 2.5 MVP-first data model
The model should support only the fields the demo needs. It is okay to omit production-scale features like full retail tariff logic, KYC, or NEM settlement standardisation.

---

## 3. Core conceptual model

The domain is built around five main concepts:

1. Participant
   - resident, solar contributor, or operator
2. Sunshine Cell
   - a local geographic and network area with a forecast constraint or opportunity
3. Flexible Resource
   - an asset or load that can shift or reduce demand
4. Flex Event
   - the scheduled local flexibility action for a cell
5. Settlement
   - the verified value attribution, reward allocation, and wallet credit result

---

## 4. Enumerations

```ts
export type HouseholdType = 'renter' | 'owner' | 'social_housing' | 'mixed_household';
export type EquityTier = 'priority' | 'standard' | 'premium';
export type ResourceType =
  | 'hot_water'
  | 'battery'
  | 'ev_charger'
  | 'community_load'
  | 'solar_export'
  | 'pool_pump'
  | 'hvac'
  | 'other';

export type ResourceStatus =
  | 'available'
  | 'reserved'
  | 'dispatched'
  | 'paused'
  | 'offline'
  | 'pending_review';

export type EventStatus =
  | 'draft'
  | 'ready'
  | 'optimised'
  | 'simulated'
  | 'verified'
  | 'settled'
  | 'rejected';

export type ConsentStatus = 'not_requested' | 'accepted' | 'declined' | 'paused';
export type VerificationStatus = 'pending' | 'passed' | 'failed' | 'partial';
export type SettlementStatus = 'pending' | 'calculated' | 'settled' | 'reversed';
export type ProvenanceSource =
  | 'simulated_network_forecast'
  | 'meter_reading'
  | 'device_acknowledgement'
  | 'manual_override'
  | 'retailer_settlement'
  | 'operator_review';
```

---

## 5. Shared type definitions

```ts
export interface Provenance {
  source: ProvenanceSource;
  confidence?: number; // 0 to 1.0
  assumptions?: string[];
  notes?: string;
  updatedAt?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TimeWindow {
  start: string; // ISO timestamp
  end: string;   // ISO timestamp
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  confidence: number;
  checkedAt?: string;
}

export interface FinancialValue {
  amount: number;
  currency: 'AUD';
}
```

---

## 6. Entity definitions

## 6.1 Participant

A Participant may be a resident, a solar contributor, or a council/operator user. For the MVP, the most important concrete type is the resident and the contributor.

```ts
export interface Participant {
  id: string;
  type: 'resident' | 'contributor' | 'operator' | 'council';
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
```

### Participant invariants

- `id` must be unique across the system.
- `type` cannot be empty.
- `walletBalance` must be numeric and non-negative for the demo.
- if `type === 'resident'`, `locationId` is generally expected.
- if `consentStatus` is `'accepted'`, the participant is considered participating in a specific event only when linked by event participation data.

## 6.2 SunshineCell

A Sunshine Cell is a local energy zone or community area where the system sees a solar-rich opportunity or network constraint.

```ts
export interface SunshineCell {
  id: string;
  name: string;
  location: string;
  region?: string;
  coordinates?: Coordinates;
  constraintRisk: 'low' | 'medium' | 'high';
  solarExportPotentialKwh?: number;
  forecastWindow: TimeWindow;
  demandProfile?: 'normal' | 'constraint' | 'peak' | 'available';
  createdAt: string;
  provenance?: Provenance;
}
```

### SunshineCell invariants

- `forecastWindow.start` must be before `forecastWindow.end`.
- if `solarExportPotentialKwh` is present, it must be non-negative.
- `constraintRisk` must not be empty.

## 6.3 FlexibleResource

A FlexibleResource is a device, load, or flexible demand source that can be shifted or reduced in an event. This includes hot water, EV charging, community loads, battery charging, and other compatible resources.

```ts
export interface FlexibleResource {
  id: string;
  participantId: string; // resident or contributor owner
  resourceType: ResourceType;
  name: string;
  description?: string;
  locationId: string; // typically a SunshineCell id
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
```

### FlexibleResource invariants

- `capacityKw > 0` for dispatchable resources.
- `maxShiftEnergyKwh >= 0`.
- `dispatchable` may be `false` for non-dispatchable resources.
- `status` should be compatible with `dispatchable`.
- `participantId` must reference a valid participant.

## 6.4 MeterReading

```ts
export interface MeterReading {
  id: string;
  resourceId: string;
  timestamp: string;
  actualPowerKw: number;
  actualEnergyKwh: number;
  baselineEnergyKwh?: number;
  observedEnergyKwh?: number;
  source: 'smart_meter' | 'simulated' | 'mock_adapter';
  provenance?: Provenance;
}
```

### MeterReading invariants

- `actualPowerKw` and `actualEnergyKwh` should be numeric.
- `observedEnergyKwh` and `baselineEnergyKwh` must clearly be kept separate.
- `actualEnergyKwh` is not the same as `targetFlexEnergyKwh` at event scale.

## 6.5 FlexEvent

FlexEvent is the heart of the system. It represents a demand response or flexibility opportunity in a defined Sunshine Cell over a specific time window.

```ts
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
  equityFloor: number; // canonical Council policy is 0.60
  createdAt: string;
  updatedAt?: string;
  provenance?: Provenance;
}
```

### FlexEvent invariants

- `window.start < window.end`.
- `targetFlexEnergyKwh > 0`.
- `maxPowerKw > 0`.
- `maxShiftEnergyKwh >= targetFlexEnergyKwh` is a recommended MVP rule.
- `confidence` must be between 0 and 1.
- `equityFloor` must be between 0 and 1.
- `status` must follow the lifecycle progression.

## 6.6 EventResourceSelection

A join object capturing which resources were selected for a given event and how they were ranked.

```ts
export interface EventResourceSelection {
  id: string;
  eventId: string;
  resourceId: string;
  selectionRank: number;
  score: number;
  recommendedPowerKw: number;
  recommendedEnergyKwh: number;
  status: 'candidate' | 'selected' | 'rejected';
  provenance?: Provenance;
}
```

## 6.7 DispatchPlan

```ts
export interface DispatchPlan {
  id: string;
  eventId: string;
  resourceId: string;
  plannedPowerKw: number;
  plannedEnergyKwh: number;
  baselineEnergyKwh?: number;
  dispatchTimestamp?: string;
  status: 'planned' | 'issued' | 'completed' | 'failed';
  provenance?: Provenance;
}
```

### DispatchPlan invariants

- `plannedPowerKw >= 0`.
- `plannedEnergyKwh >= 0`.
- planned values should be considered separate from actual values.

## 6.8 DispatchResult

```ts
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
  status: 'completed' | 'partial' | 'failed';
  provenance?: Provenance;
}
```

## 6.9 VerificationRecord

```ts
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
```

### VerificationRecord invariants

- `verifiedFlexEnergyKwh >= 0`.
- `confidenceScore` between 0 and 1.
- `settlementGatePassed` must be `true` before settlement may proceed.

## 6.10 ContributorAttribution

This records how verified response is attributed across contributors.

```ts
export interface ContributorAttribution {
  id: string;
  eventId: string;
  participantId: string;
  resourceId: string;
  shareOfVerifiedResponse: number; // 0 to 1
  rewardAmount: number;
  equityCreditAmount: number;
  createdAt: string;
  provenance?: Provenance;
}
```

### ContributorAttribution invariants

- sum of `shareOfVerifiedResponse` across resources should approximate 1 for the event.
- `rewardAmount` and `equityCreditAmount` should be logically derived from the event settlement, not independently invented.

## 6.11 Settlement

```ts
export interface Settlement {
  id: string;
  eventId: string;
  verificationRecordId: string;
  verifiedFlexEnergyKwh: number;
  totalValue: number;
  contributorRewards: number;
  equityCredit: number;
  communityReserve: number;
  equityFloorApplied: boolean;
  status: SettlementStatus;
  createdAt: string;
  updatedAt?: string;
  provenance?: Provenance;
}
```

### Settlement invariants

- settlement cannot be created before verification.
- `totalValue >= 0`.
- `contributorRewards + equityCredit + communityReserve` must reconcile with `totalValue` in the demo logic.
- `equityFloorApplied` must be explicit.

## 6.12 WalletTransaction

```ts
export interface WalletTransaction {
  id: string;
  participantId: string;
  eventId?: string;
  type: 'equity_credit' | 'contributor_reward' | 'adjustment';
  amount: number;
  currency: 'AUD';
  status: 'pending' | 'posted' | 'reversed';
  createdAt: string;
  provenance?: Provenance;
}
```

---

## 7. Event lifecycle model

The lifecycle defines how a FlexEvent moves through the system.

```ts
export type EventLifecycle =
  | 'draft'
  | 'ready'
  | 'optimised'
  | 'simulated'
  | 'verified'
  | 'settled'
  | 'rejected';
```

Lifecycle meaning:

1. `draft`
   - event has been proposed but not validated
2. `ready`
   - event window and targets are valid; resource set is available
3. `optimised`
   - candidate resources have been scored and ranked
4. `simulated`
   - dispatch and expected impacts are calculated
5. `verified`
   - measurement and verification confirms actual response and confidence gate passes
6. `settled`
   - total value and credits are allocated
7. `rejected`
   - event fails validation or M&V gate

---

## 8. Relationship model

```text
Participant 1 --- * FlexibleResource
SunshineCell 1 --- * FlexibleResource
SunshineCell 1 --- * FlexEvent
FlexEvent 1 --- * EventResourceSelection
FlexEvent 1 --- * DispatchPlan
FlexEvent 1 --- * DispatchResult
FlexEvent 1 --- * VerificationRecord
FlexEvent 1 --- * Settlement
FlexEvent 1 --- * ContributorAttribution
Participant 1 --- * WalletTransaction
Participant 1 --- * ContributorAttribution
```

Notes:

- A participant can have multiple resources.
- A resource may be bound to one cell.
- An event is attached to one Sunshine Cell.
- A resource may participate in multiple events over time.
- A settlement is tied to a verified event and not created before verification.

---

## 9. Derived fields and ownership

Several fields are derived from other inputs and should be computed in the engine layer rather than manually edited by the frontend.

### 9.1 Derived by engine

- `confidence` for an event
- `verifiedFlexEnergyKwh`
- `settlementGatePassed`
- `shareOfVerifiedResponse`
- `rewardAmount`
- `equityCreditAmount`
- `walletBalance` after settlement

### 9.2 Derived by API layer

- summary cards for resident dashboard
- recommended resource ranking
- active event counts
- total credits distributed

### 9.3 Must not be user-edited directly

- `verifiedFlexEnergyKwh`
- `totalValue`
- `rewardAmount`
- `equityCreditAmount`
- `walletBalance`
- `confidenceScore`

---

## 10. Invariants for the MVP

These must never be violated by the application:

1. `window.start < window.end`
2. `targetFlexEnergyKwh > 0`
3. `maxPowerKw > 0`
4. `confidence` is always in `[0,1]`
5. `equityFloor` is always in `[0,1]`
6. `verifiedFlexEnergyKwh` can only be produced after verification
7. settlement cannot be created unless verification passes
8. `baselineEnergyKwh` and `observedEnergyKwh` remain separate
9. `equityCredit` and `contributorRewards` must remain conceptually distinct
10. every estimated field should carry provenance metadata

---

## 11. Example JSON object for a full event

```json
{
  "event": {
    "id": "event_001",
    "sunshineCellId": "sunshine_cell_01",
    "status": "verified",
    "window": {
      "start": "2026-08-22T12:00:00Z",
      "end": "2026-08-22T14:00:00Z"
    },
    "targetFlexEnergyKwh": 72,
    "maxPowerKw": 18,
    "maxShiftEnergyKwh": 90,
    "confidence": 0.86,
    "equityFloor": 0.60,
    "provenance": {
      "source": "simulated_network_forecast",
      "assumptions": [
        "Excess midday solar in north Wollongong zone",
        "Hot water and EV charging are compatible with time-shifting"
      ],
      "confidence": 0.86
    }
  },
  "resources": [
    {
      "id": "resource_001",
      "participantId": "resident_001",
      "resourceType": "hot_water",
      "capacityKw": 2.4,
      "maxShiftEnergyKwh": 5.2,
      "dispatchable": true,
      "status": "available"
    }
  ],
  "verification": {
    "id": "verification_001",
    "eventId": "event_001",
    "verificationStatus": "passed",
    "baselineReference": "baseline_2026_08_22_12_00",
    "verifiedFlexEnergyKwh": 16.5,
    "confidenceScore": 0.89,
    "settlementGatePassed": true
  },
  "settlement": {
    "id": "settlement_001",
    "eventId": "event_001",
    "verifiedFlexEnergyKwh": 16.5,
    "totalValue": 13.2,
    "contributorRewards": 3.96,
    "equityCredit": 8.58,
    "communityReserve": 0.66,
    "equityFloorApplied": true,
    "status": "settled"
  }
}
```

---

## 12. Persistence guidance

The MVP should use seed data and a JSON-like structure first, with a future move to Supabase/PostgreSQL if needed. The important rule is that the storage schema should mirror the domain model closely.

Recommended persistence mapping:

- `participants` table / JSON array
- `sunshine_cells` table / JSON array
- `flexible_resources` table / JSON array
- `flex_events` table / JSON array
- `dispatch_plans` table / JSON array
- `dispatch_results` table / JSON array
- `verification_records` table / JSON array
- `settlements` table / JSON array
- `wallet_transactions` table / JSON array

This model should be kept simple and should not introduce unnecessary abstraction layers.

---

## 13. Recommended frontend/backend contract usage

The frontend can read only the fields it needs to render cards, tables, and summaries. The backend/engine code owns the calculated values, especially anything involving:

- confidence
- M&V
- dispatch result comparison
- attribution shares
- equity floor calculation
- wallet credits

The frontend should not overwrite engine-derived fields directly.

---

## 14. Minimal TypeScript file structure

```ts
// types/models.ts
export type HouseholdType = ...
export type ResourceType = ...
export type EventStatus = ...

export interface Participant { ... }
export interface SunshineCell { ... }
export interface FlexibleResource { ... }
export interface MeterReading { ... }
export interface FlexEvent { ... }
export interface EventResourceSelection { ... }
export interface DispatchPlan { ... }
export interface DispatchResult { ... }
export interface VerificationRecord { ... }
export interface ContributorAttribution { ... }
export interface Settlement { ... }
export interface WalletTransaction { ... }
```

---

## 15. Final implementation guidance

This model is sufficient for the hackathon MVP because it supports the exact flow documented in the implementation brief:

1. resident and contributor enrolment
2. Sunshine Cell definition and event creation
3. flexible resource eligibility
4. optimisation and dispatch selection
5. simulated or observed meter response
6. M&V verification and confidence gate
7. attribution and settlement
8. transparent equity credit allocation

For the MVP, keep the model strict, explicit, and deterministic. That will prevent frontend/backend drift and make the final demo easier to explain and defend.
