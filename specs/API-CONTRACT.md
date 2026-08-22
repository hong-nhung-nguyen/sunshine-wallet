# Sunshine Wallet API Contract

Version: 1.0
Date: 2026-08-22
Scope: Hackathon MVP, single Next.js app, resident + council/operator flows

## 1. Purpose and scope

This document defines the API contract for the Sunshine Wallet MVP. It is intentionally narrower than a production market platform and designed to support one defensible DAPTO-01 style event from need identification, through optimisation and verification, to settlement and equity crediting.

The API is designed for a single Next.js application with route handlers and server actions. It does not assume separate microservices or a production-grade market integration layer.

This contract covers:

- resident wallet and participation flows
- council/operator event management
- resource registration and eligibility checks
- optimisation and simulation
- measurement & verification (M&V)
- contributor attribution
- settlement and equity credit allocation
- mock integrations for smart meters, grid, settlement, and device control

## 2. Architecture assumptions

- Application type: Next.js web app
- API style: REST-like route handlers using JSON payloads
- Persistence: seeded TypeScript/JSON first; optional DB later
- External systems: smart meter, DNSP, retailer settlement, device control are mocked
- Truthfulness: every simulated or estimated field exposes provenance metadata
- Determinism: engine logic should be explainable and deterministic, not opaque ML-driven

## 3. API conventions

### Base URL

```text
/app/api
```

### Standard response format

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req_123",
    "generatedAt": "2026-08-22T10:00:00Z"
  }
}
```

### Error format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The event window is invalid.",
    "details": [
      {
        "field": "targetFlexEnergyKwh",
        "issue": "must be greater than zero"
      }
    ]
  }
}
```

### Common status fields

- `status`: `draft | active | queued | ready | dispatched | verified | settled | rejected`
- `confidence`: numeric value in the range 0 to 1.0
- `provenance`: metadata explaining source or simulation assumptions

### Units

The API must keep units explicit:

- `power`: kW
- `energy`: kWh
- `window`: ISO timestamps or local time strings
- `credit`: AUD or local currency units, if used in demo output

## 4. Core domain objects

### 4.1 Resident

```json
{
  "id": "resident_001",
  "name": "Aisha Patel",
  "householdType": "renter",
  "locationId": "sunshine_cell_01",
  "walletBalance": 28.40,
  "equityTier": "priority",
  "consentStatus": "active",
  "createdAt": "2026-08-22T09:00:00Z"
}
```

### 4.2 Flexible resource

```json
{
  "id": "resource_001",
  "residentId": "resident_001",
  "type": "hot_water",
  "capacityKw": 2.4,
  "maxShiftEnergyKwh": 5.2,
  "dispatchable": true,
  "eligibility": {
    "eligible": true,
    "reasons": ["compatible_load_type", "available_window"]
  },
  "status": "available"
}
```

### 4.3 Sunshine Cell

```json
{
  "id": "sunshine_cell_01",
  "name": "Wollongong North Solar Zone",
  "location": "Wollongong",
  "constraintRisk": "high",
  "forecastWindowStart": "2026-08-22T12:00:00Z",
  "forecastWindowEnd": "2026-08-22T14:00:00Z",
  "solarExportPotentialKwh": 180,
  "demandProfile": "available"
}
```

### 4.4 Flex event

```json
{
  "id": "event_001",
  "sunshineCellId": "sunshine_cell_01",
  "status": "ready",
  "targetFlexEnergyKwh": 72,
  "maxPowerKw": 18,
  "maxShiftEnergyKwh": 90,
  "windowStart": "2026-08-22T12:00:00Z",
  "windowEnd": "2026-08-22T14:00:00Z",
  "confidence": 0.86,
  "equityFloor": 0.15,
  "provenance": {
    "source": "simulated_network_forecast",
    "notes": "Constraint expected during midday export period"
  }
}
```

### 4.5 Dispatch result

```json
{
  "id": "dispatch_001",
  "eventId": "event_001",
  "resourceId": "resource_001",
  "plannedPowerKw": 2.4,
  "actualPowerKw": 2.3,
  "plannedEnergyKwh": 4.8,
  "actualEnergyKwh": 4.4,
  "baselineEnergyKwh": 6.2,
  "observedEnergyKwh": 4.7,
  "status": "completed",
  "confidence": 0.89
}
```

### 4.6 Settlement record

```json
{
  "id": "settlement_001",
  "eventId": "event_001",
  "verifiedFlexEnergyKwh": 60.4,
  "totalValue": 182.10,
  "equityCredit": 51.40,
  "contributorRewards": 130.70,
  "equityFloorApplied": true,
  "status": "settled"
}
```

## 5. Endpoint catalog

## 5.1 Health and app bootstrap

### GET /api/health
Returns service availability.

Response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "app": "sunshine-wallet",
    "version": "1.0.0",
    "environment": "demo"
  }
}
```

### GET /api/bootstrap
Returns dashboard seed data for resident and council views.

Response:

```json
{
  "success": true,
  "data": {
    "resident": {
      "id": "resident_001",
      "walletBalance": 28.4,
      "pendingEvents": 2
    },
    "council": {
      "activeCells": 3,
      "activeEvents": 1
    },
    "summary": {
      "verifiedEvents": 5,
      "totalCreditsDistributed": 840.25
    }
  }
}
```

## 5.2 Resident endpoints

### GET /api/residents
List residents.

Query params:

- `locationId`
- `status`
- `page`
- `limit`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "resident_001",
      "name": "Aisha Patel",
      "householdType": "renter",
      "walletBalance": 28.4,
      "consentStatus": "active"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

### GET /api/residents/:residentId
Get a single resident.

Response:

```json
{
  "success": true,
  "data": {
    "id": "resident_001",
    "name": "Aisha Patel",
    "householdType": "renter",
    "locationId": "sunshine_cell_01",
    "walletBalance": 28.4,
    "equityTier": "priority",
    "consentStatus": "active",
    "programHistory": [
      "event_001",
      "event_004"
    ]
  }
}
```

### GET /api/residents/:residentId/wallet
Get resident wallet summary and recent credits.

Response:

```json
{
  "success": true,
  "data": {
    "residentId": "resident_001",
    "walletBalance": 28.4,
    "pendingCredits": 6.2,
    "totalEarned": 82.9,
    "recentTransactions": [
      {
        "id": "credit_101",
        "eventId": "event_001",
        "amount": 12.4,
        "type": "equity_credit",
        "status": "posted",
        "createdAt": "2026-08-22T16:00:00Z"
      }
    ]
  }
}
```

### GET /api/residents/:residentId/events
List resident participation events.

Response:

```json
{
  "success": true,
  "data": [
    {
      "eventId": "event_001",
      "status": "verified",
      "consentStatus": "accepted",
      "impactKwh": 14.7,
      "creditAward": 12.4
    }
  ]
}
```

### POST /api/residents/:residentId/consent
Update resident consent for an event or program.

Request:

```json
{
  "eventId": "event_001",
  "decision": "accept",
  "notes": "Available to participate between 12:00 and 14:00"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "residentId": "resident_001",
    "eventId": "event_001",
    "consentStatus": "accepted",
    "updatedAt": "2026-08-22T11:05:00Z"
  }
}
```

### POST /api/residents/:residentId/pause
Pause resident participation for a resource or event.

Request:

```json
{
  "eventId": "event_001",
  "reason": "temporary absence"
}
```

## 5.3 Resource endpoints

### GET /api/resources
List all flexible resources, optionally filtered by cell or resident.

Query params:

- `residentId`
- `cellId`
- `type`
- `eligible`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "resource_001",
      "residentId": "resident_001",
      "type": "hot_water",
      "capacityKw": 2.4,
      "maxShiftEnergyKwh": 5.2,
      "dispatchable": true,
      "status": "available",
      "eligibility": {
        "eligible": true,
        "reasons": ["compatible_load_type", "available_window"]
      }
    }
  ]
}
```

### GET /api/resources/:resourceId
Get single resource details and eligibility.

Response:

```json
{
  "success": true,
  "data": {
    "id": "resource_001",
    "residentId": "resident_001",
    "type": "hot_water",
    "capacityKw": 2.4,
    "maxShiftEnergyKwh": 5.2,
    "dispatchable": true,
    "status": "available",
    "eligibility": {
      "eligible": true,
      "reasons": ["compatible_load_type", "available_window"],
      "confidence": 0.92
    },
    "history": [
      {
        "eventId": "event_005",
        "result": "completed"
      }
    ]
  }
}
```

### POST /api/resources
Register a new flexible resource.

Request:

```json
{
  "residentId": "resident_002",
  "type": "ev_charger",
  "capacityKw": 7.2,
  "maxShiftEnergyKwh": 18.0,
  "dispatchable": true,
  "locationId": "sunshine_cell_02"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "resource_015",
    "status": "pending_review"
  }
}
```

### POST /api/resources/:resourceId/eligibility
Re-evaluate resource eligibility for a given event or cell.

Request:

```json
{
  "eventId": "event_001",
  "cellId": "sunshine_cell_01"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "resourceId": "resource_001",
    "eligible": true,
    "reasons": ["compatible_load_type", "available_window"],
    "confidence": 0.94
  }
}
```

## 5.4 Sunshine Cell and council endpoints

### GET /api/cells
List Sunshine Cells and their forecast context.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "sunshine_cell_01",
      "name": "Wollongong North Solar Zone",
      "constraintRisk": "high",
      "forecastWindowStart": "2026-08-22T12:00:00Z",
      "forecastWindowEnd": "2026-08-22T14:00:00Z",
      "solarExportPotentialKwh": 180
    }
  ]
}
```

### GET /api/cells/:cellId
Return a cell summary including forecast and candidate events.

### POST /api/cells
Create a Sunshine Cell context record.

### GET /api/council/forecast
Get forecast view for operator dashboard.

Response:

```json
{
  "success": true,
  "data": {
    "cellId": "sunshine_cell_01",
    "solarExportForecastKwh": 180,
    "demandConstraintRisk": "high",
    "recommendedWindowStart": "2026-08-22T12:00:00Z",
    "recommendedWindowEnd": "2026-08-22T14:00:00Z"
  }
}
```

## 5.5 Event lifecycle endpoints

### GET /api/events
Return all events or filtered events.

Query params:

- `status`
- `cellId`
- `residentId`
- `page`
- `limit`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "event_001",
      "status": "ready",
      "cellId": "sunshine_cell_01",
      "targetFlexEnergyKwh": 72,
      "maxPowerKw": 18,
      "confidence": 0.86
    }
  ]
}
```

### GET /api/events/:eventId
Detailed event record including window, resource counts, optimisation status, and verification state.

Response:

```json
{
  "success": true,
  "data": {
    "id": "event_001",
    "status": "ready",
    "sunshineCellId": "sunshine_cell_01",
    "targetFlexEnergyKwh": 72,
    "maxPowerKw": 18,
    "maxShiftEnergyKwh": 90,
    "windowStart": "2026-08-22T12:00:00Z",
    "windowEnd": "2026-08-22T14:00:00Z",
    "confidence": 0.86,
    "equityFloor": 0.15,
    "provenance": {
      "source": "simulated_network_forecast",
      "notes": "Constraint expected during midday export period"
    },
    "participants": [
      "resident_001",
      "resident_003"
    ]
  }
}
```

### POST /api/events
Create a new event.

Request:

```json
{
  "sunshineCellId": "sunshine_cell_01",
  "windowStart": "2026-08-22T12:00:00Z",
  "windowEnd": "2026-08-22T14:00:00Z",
  "targetFlexEnergyKwh": 72,
  "maxPowerKw": 18,
  "maxShiftEnergyKwh": 90,
  "equityFloor": 0.15,
  "provenance": {
    "source": "simulated_network_forecast"
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "event_001",
    "status": "draft"
  }
}
```

### POST /api/events/:eventId/select-resources
Select candidate resources for event optimisation.

Request:

```json
{
  "resourceIds": ["resource_001", "resource_002", "resource_007"]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "eventId": "event_001",
    "selectedResources": 3,
    "status": "ready_for_optimisation"
  }
}
```

### POST /api/events/:eventId/optimise
Run resource optimisation for the event.

Request:

```json
{
  "objective": "maximise_verified_flexibility",
  "constraints": {
    "maxPowerKw": 18,
    "targetFlexEnergyKwh": 72
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "eventId": "event_001",
    "selectedResources": [
      {
        "resourceId": "resource_001",
        "score": 0.91,
        "recommendedPowerKw": 2.4,
        "recommendedEnergyKwh": 4.8
      },
      {
        "resourceId": "resource_002",
        "score": 0.87,
        "recommendedPowerKw": 3.1,
        "recommendedEnergyKwh": 5.9
      }
    ],
    "totalRecommendedEnergyKwh": 74.4,
    "status": "optimised"
  }
}
```

### POST /api/events/:eventId/simulate
Simulate dispatch outcome and estimate baseline vs observed response.

Request:

```json
{
  "dispatchPlan": [
    {
      "resourceId": "resource_001",
      "plannedPowerKw": 2.4,
      "plannedEnergyKwh": 4.8
    },
    {
      "resourceId": "resource_002",
      "plannedPowerKw": 3.1,
      "plannedEnergyKwh": 5.9
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "eventId": "event_001",
    "estimatedFlexEnergyKwh": 70.2,
    "baselineEnergyKwh": 102.8,
    "observedEnergyKwh": 84.1,
    "dispatchConfidence": 0.86,
    "status": "simulated"
  }
}
```

### POST /api/events/:eventId/verify
Perform M&V check and determine whether the event passes confidence / settlement gate.

Request:

```json
{
  "observedMeterReadings": [
    {
      "resourceId": "resource_001",
      "actualPowerKw": 2.3,
      "actualEnergyKwh": 4.4
    },
    {
      "resourceId": "resource_002",
      "actualPowerKw": 2.9,
      "actualEnergyKwh": 5.7
    }
  ],
  "baselineReference": "event_baseline_v1"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "eventId": "event_001",
    "verificationStatus": "passed",
    "verifiedFlexEnergyKwh": 63.8,
    "confidenceScore": 0.89,
    "settlementGatePassed": true,
    "status": "verified"
  }
}
```

### POST /api/events/:eventId/settle
Run settlement and allocate credits.

Request:

```json
{
  "verifiedFlexEnergyKwh": 63.8,
  "valuePerKwh": 2.85,
  "equityFloor": 0.15
}
```

Response:

```json
{
  "success": true,
  "data": {
    "eventId": "event_001",
    "totalValue": 182.1,
    "equityCredit": 51.4,
    "contributorRewards": 130.7,
    "portfolioAdjustments": [
      {
        "residentId": "resident_001",
        "creditAward": 12.4
      }
    ],
    "status": "settled"
  }
}
```

### GET /api/events/:eventId/settlement
Return settlement details for a settled event.

## 5.6 Attribution and settlement endpoints

### GET /api/attribution/:eventId
Return contributor attribution results by resident and resource.

Response:

```json
{
  "success": true,
  "data": {
    "eventId": "event_001",
    "contributors": [
      {
        "residentId": "resident_001",
        "resourceId": "resource_001",
        "shareOfVerifiedResponse": 0.42,
        "reward": 54.7,
        "equityCredit": 15.1
      },
      {
        "residentId": "resident_003",
        "resourceId": "resource_007",
        "shareOfVerifiedResponse": 0.58,
        "reward": 76.0,
        "equityCredit": 21.3
      }
    ]
  }
}
```

### POST /api/settlement/calculate
Calculate settlement values without finalising the record.

Request:

```json
{
  "eventId": "event_001",
  "verifiedFlexEnergyKwh": 63.8,
  "valuePerKwh": 2.85,
  "equityFloor": 0.15
}
```

Response:

```json
{
  "success": true,
  "data": {
    "totalValue": 182.1,
    "equityCredit": 51.4,
    "contributorRewards": 130.7,
    "status": "calculated"
  }
}
```

## 5.7 Mock integration endpoints

These endpoints exist so the demo can simulate partner adapters without calling real external services.

### GET /api/mock/meters/:resourceId
Return mock meter reading for a resource.

### POST /api/mock/meters/ingest
Ingest simulated meter observation.

### GET /api/mock/dnsp/:cellId
Return mock DNSP constraint context.

### POST /api/mock/dispatch/:resourceId
Acknowledge simulated dispatch for a flexible resource.

### POST /api/mock/settlement/acknowledge
Simulate retailer settlement acknowledgement.

Example response:

```json
{
  "success": true,
  "data": {
    "acknowledged": true,
    "transactionId": "settle_tx_9901",
    "status": "accepted"
  }
}
```

## 6. Event state machine

The event lifecycle should follow this pattern:

```text
draft -> ready -> optimised -> simulated -> verified -> settled
                        \-> rejected
```

State definitions:

- `draft`: event created, not yet ready
- `ready`: candidate resources selected and event configuration valid
- `optimised`: optimiser has produced a dispatch plan
- `simulated`: dispatch response estimated
- `verified`: M&V check passed and confidence gate satisfied
- `settled`: credits and rewards allocated
- `rejected`: event failed validation or M&V gate

## 7. Provenance requirements

Every simulated, estimated, or derived field must include provenance metadata when relevant.

Example:

```json
{
  "provenance": {
    "source": "simulated_network_forecast",
    "confidence": 0.86,
    "assumptions": [
      "midday export constraint from local forecast",
      "hot water load available between 12:00 and 14:00"
    ],
    "updatedAt": "2026-08-22T10:30:00Z"
  }
}
```

This must be used for:

- solar forecast values
- dispatch simulation results
- measured vs estimated energy shift
- M&V confidence scoring
- settlement calculations

## 8. Validation rules

The API should reject invalid payloads with `400` or `422` responses when:

- `targetFlexEnergyKwh <= 0`
- `maxPowerKw <= 0`
- `windowStart >= windowEnd`
- `resourceId` does not exist
- `residentId` is unknown
- `confidence` is outside the range 0 to 1
- `event status` is incompatible with requested lifecycle step

## 9. Summary of the essential MVP endpoints

For a first implementation, the required endpoints are:

1. `GET /api/health`
2. `GET /api/bootstrap`
3. `GET /api/residents/:residentId`
4. `GET /api/residents/:residentId/wallet`
5. `GET /api/resources`
6. `GET /api/resources/:resourceId`
7. `GET /api/cells`
8. `GET /api/events`
9. `GET /api/events/:eventId`
10. `POST /api/events`
11. `POST /api/events/:eventId/optimise`
12. `POST /api/events/:eventId/simulate`
13. `POST /api/events/:eventId/verify`
14. `POST /api/events/:eventId/settle`
15. `GET /api/attribution/:eventId`

These cover the complete MVP arc from event creation to settlement explanation.

## 10. Final implementation guidance

The recommended MVP implementation should keep the API contract small, deterministic, and explainable. Avoid building a large generic API surface. Instead, implement the minimal routes that support the actual demo loop, real event lifecycle, and clear settlement explanation.

This contract is sufficient for a three-person hackathon team to build the app without frontend/backend drift while still preserving the technical logic required for the demo.
