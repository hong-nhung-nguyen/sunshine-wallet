# Sunshine Wallet — Latest 25-Hour Implementation Plan

**Project:** Sunshine Wallet  
**Challenge:** Energy Equity / Local Renewable Energy  
**Team:** 3 people  
**Hackathon duration:** 25 hours  
**Application type:** One responsive web application with Resident/Contributor and Council/Operator experiences  
**Primary goal:** Build the smallest convincing end-to-end prototype that proves Sunshine Wallet can identify a useful local flexibility event, select compatible resources, verify the outcome, and distribute the resulting value fairly.

---

# 1. Final Product Definition

Sunshine Wallet is a **local energy orchestration, verification, and equitable settlement platform**.

It is **not**:

- a peer-to-peer electricity trading platform;
- a system that physically routes Maria's electricity directly to Dinh;
- a generic solar dashboard;
- a static energy-hardship map;
- a production retailer billing system;
- a real smart-meter controller during the hackathon.

The prototype demonstrates this complete story:

```text
Dinh cannot own rooftop solar
        ↓
Council identifies a useful local Sunshine Event
        ↓
The engine recommends the best event window
        ↓
Eligible flexible resources are checked
        ↓
The optimiser selects the best resources
        ↓
The event is simulated
        ↓
M&V checks what actually changed
        ↓
Contributor participation is attributed
        ↓
Program value is calculated
        ↓
Equity Floor is enforced
        ↓
Maria gets a contributor reward
        ↓
Dinh gets a bill/program credit
```

The guiding principle is:

> **Optimise for the grid and equity at the same time, then verify the result before distributing value.**

---

# 2. Core Demo Hypothesis

The prototype needs to prove:

> **Given a local solar/network opportunity, Sunshine Wallet can identify a useful event window, select compatible flexible resources, simulate their response, verify the resulting flexibility, and distribute the resulting financial value between contributors and equity households under an explicit fairness rule.**

Everything we build must support this hypothesis.

---

# 3. Final User Roles

## 3.1 Equity Receiver

Example persona:

```text
Name: Dinh
Location: Dapto
Sunshine Cell: DAPTO-01
Household type: Renter
Rooftop solar: None
Equity eligible: Yes
Participation status: Active
```

Dinh may receive a **Flexibility Dividend / program bill credit**.

The credit is what reduces his effective electricity bill.

Do not double-count the benefit by claiming both:

- electricity automatically becomes cheaper, and
- he separately receives free money.

For the demo:

```text
Normal electricity charges: $120
Sunshine Wallet credit:      -$4.15
Effective amount:           $115.85
```

---

## 3.2 Contributor

Example persona:

```text
Name: Maria
Role: Solar contributor
Sunshine Cell: DAPTO-01
Participation status: Active
```

Maria's excess solar is exported to the grid under her existing arrangements.

Sunshine Wallet does **not** trace her exact electrons.

Instead, during a qualifying Sunshine Event, the system records her qualifying export and uses accounting attribution to calculate her contributor share.

Maria receives a **Contributor Reward**.

---

## 3.3 Receiver + Contributor

A household may be both.

Example:

- equity eligible;
- owns no rooftop solar;
- but has controllable storage hot water.

The data model should support this even if the hackathon only lightly demonstrates it.

---

## 3.4 Council / Operator

The Council/operator experience is used to:

- inspect Sunshine Cells;
- review proposed event windows;
- inspect target and available flexibility;
- run the optimiser;
- inspect selection/rejection reasons;
- review the Equity Floor;
- simulate the event;
- verify the outcome;
- inspect settlement;
- apply credits.

The Council does **not** manually decide which exact appliance to switch.

The engine makes recommendations and the operator oversees the process.

---

# 4. Final Application Architecture

Use **one responsive web application**.

```text
                         Browser
                            |
                            v
                   Next.js Web Application
                            |
          -----------------------------------------
          |                                       |
          v                                       v
 Resident / Contributor                     Council / Operator
 mobile-style experience                    desktop dashboard
          |                                       |
          --------------------|--------------------
                              |
                              v
                       Shared Domain Models
                              |
                              v
                      Sunshine Wallet Engine
                              |
      ------------------------------------------------
      |           |          |        |              |
      v           v          v        v              v
 Window       Eligibility  Optimiser  M&V       Settlement
 Selection
                              |
                              v
                   Deterministic Demo Data
                              |
                              v
                  Mock Partner Integrations
```

### Recommended stack

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Recharts**
- **Vercel**
- Local TypeScript/JSON fixture data first
- Optional Supabase only if it adds no delivery risk

Do not build a separate backend service unless the team is substantially faster with Express.

---

# 5. Sunshine Cell

A **Sunshine Cell** is a small local electrical coordination zone.

It represents the smallest practical area where we can reasonably relate:

- local solar/export opportunity;
- local network constraint;
- local flexible resources.

Example:

```text
DAPTO-01
```

A Sunshine Cell is **not simply a suburb**.

For the hackathon:

```text
DAPTO-01
SIMULATED NETWORK CELL
```

In production, a DNSP/network partner would supply richer topology and telemetry.

---

# 6. Sunshine Event

A Sunshine Event is a condition-triggered local flexibility event.

Example:

```text
Cell: DAPTO-01
Window: 12:00–14:00
Target flexible energy: 24 kWh
Available flexibility: 31 kWh
Forecast confidence: 82%
```

Events do **not** automatically happen every day.

The system must support:

```text
No Sunshine Event today
```

when:

- forecast confidence is too low;
- network need is insignificant;
- available resources are insufficient;
- customer comfort cannot be protected.

---

# 7. Important Energy Units

Use these names consistently.

## Power

```text
kW
```

Power at a point in time.

Example:

```ts
maxPowerKw: 3.6
```

## Energy

```text
kWh
```

Energy over a period.

Example:

```ts
targetFlexEnergyKwh: 24
maxShiftEnergyKwh: 5
```

The MVP optimiser operates primarily on **event energy in kWh**.

Never display:

```text
24 kW flexible energy
```

if you mean total energy across the event.

---

# 8. Final Engine Flow

Implement seven primary engine modules:

```ts
selectEventWindow()
checkResourceEligibility()
optimiseResources()
simulateEvent()
verifyEvent()
attributeContributors()
settleEvent()
```

Then create one coordinator:

```ts
runSunshineEvent()
```

The full execution path is:

```text
Input data
   ↓
1. Select event window
   ↓
2. Derive target flexibility
   ↓
3. Check resource eligibility
   ↓
4. Score + select resources
   ↓
5. Simulate actual response
   ↓
6. Calculate baseline
   ↓
7. M&V verification
   ↓
8. Confidence settlement gate
   ↓
9. Attribute contributor share
   ↓
10. Calculate program value
   ↓
11. Enforce Equity Floor
   ↓
12. Allocate credits/rewards
```

---

# 9. Algorithm 1 — Event Window Selection

The engine checks candidate periods such as:

```text
10:00–12:00
11:00–13:00
12:00–14:00
13:00–15:00
```

Prototype score:

```text
Window Score =
40% Solar Opportunity
+ 40% Network Need
+ 20% Available Flexibility
```

Example:

```text
12:00–14:00

Solar opportunity      95
Network need           90
Available flexibility  85

Score =
95 × 0.40
+ 90 × 0.40
+ 85 × 0.20
= 91
```

### Hard gate

Prototype rule:

```text
forecastConfidence >= 0.70
```

If no candidate passes the hard gates:

```text
NO_EVENT
```

### Important

These weights and thresholds are **prototype design choices**, not scientifically validated industry standards.

---

# 10. Algorithm 2 — Target Flexible Energy

The `24 kWh` target must be derived, not manually invented.

Simplified hackathon model:

```text
Forecast local export opportunity: 70 kWh
Comfortably accommodated export:   46 kWh
                                    ------
Target flexible energy:             24 kWh
```

Formula:

```ts
targetFlexEnergyKwh =
  Math.max(
    0,
    forecastExportEnergyKwh - comfortableExportEnergyKwh
  );
```

If the simulated inputs change:

```text
Forecast export = 62 kWh
Comfortable export = 46 kWh
```

then:

```text
Target = 16 kWh
```

The optimiser should then select fewer resources.

---

# 11. Algorithm 3 — Resource Eligibility

Before scoring, every resource passes hard checks.

Example:

```ts
if (!resource.consentActive)
  reject("NO_CONSENT");

if (resource.sunshineCellId !== event.sunshineCellId)
  reject("WRONG_SUNSHINE_CELL");

if (!resource.available)
  reject("UNAVAILABLE");

if (!resource.compatible)
  reject("INCOMPATIBLE");

if (!resource.comfortSafe)
  reject("COMFORT_CONSTRAINT");
```

A high optimiser score must **never override** a hard rule.

Example:

```text
HW-101
Correct cell ✓
Available ✓
Consent ✓
Compatible ✓
Comfort safe ✓
→ ELIGIBLE

EV-04
Unavailable
→ REJECTED

HW-205
Wrong cell
→ REJECTED
```

---

# 12. Algorithm 4 — Resource Scoring and Optimisation

Prototype score:

```text
35% Network Effectiveness
30% Equity Need
20% Controllability
15% Rotation Fairness
```

Formula:

```ts
score =
  networkEffectiveness * 0.35 +
  equityNeed * 0.30 +
  controllability * 0.20 +
  rotationFairness * 0.15;
```

All criterion values should use the same scale, for example:

```text
0–100
```

### Example

```text
HW-101

Network effectiveness = 95
Equity need            = 90
Controllability        = 100
Rotation fairness      = 80

Score:
95 × 0.35  = 33.25
90 × 0.30  = 27.00
100 × 0.20 = 20.00
80 × 0.15  = 12.00
----------------------
Total         92.25
```

### Selection

Target:

```text
24 kWh
```

Resources sorted by score:

```text
HW-101   5 kWh
HW-102   4 kWh
BAT-01  10 kWh
APT-01   6 kWh
```

Selection:

```text
HW-101 → 5
Total = 5

HW-102 → 4
Total = 9

BAT-01 → 10
Total = 19

Remaining target = 5

APT-01 can provide 6
Select only 5
```

Final dispatch:

```text
HW-101    5 kWh
HW-102    4 kWh
BAT-01   10 kWh
APT-01    5 kWh
         -------
Total     24 kWh
```

The score decides **selection order**.

`maxShiftEnergyKwh` and remaining target decide **how much is dispatched**.

---

# 13. Algorithm 5 — Deterministic Event Simulation

The prototype does not control real devices.

Instead, it simulates responses using deterministic response factors.

Example:

```text
HW-101 response factor = 0.96
HW-102 response factor = 0.975
BAT-01 response factor = 0.97
APT-01 response factor = 0.84
```

Formula:

```ts
actualEnergyKwh =
  scheduledEnergyKwh * responseFactor;
```

Example:

```text
HW-101     5.0 × 0.96  = 4.80
HW-102     4.0 × 0.975 = 3.90
BAT-01    10.0 × 0.97  = 9.70
APT-01     5.0 × 0.84  = 4.20
                             -----
Actual simulated response = 22.60 kWh
```

Deterministic factors are used instead of random values so the live demo is repeatable.

---

# 14. Algorithm 6 — Baseline Calculation

The baseline means:

> **What we estimate electricity demand would have been if Sunshine Wallet had done nothing.**

Use comparable **non-event** days only.

Example:

```text
Comparable non-event days

Day 1 = 49 kWh
Day 2 = 51 kWh
Day 3 = 50 kWh
```

Then:

```text
Baseline = (49 + 51 + 50) / 3
         = 50 kWh
```

Do not include previous event days.

Bad example:

```text
No event       50
Wallet event   72
Wallet event   70

Average = 64 kWh
```

That would contaminate the baseline and underestimate the current event.

### Prototype rule

```ts
referenceDays
  .filter(day => !day.eventRan)
```

If there are too few clean reference days:

- reduce M&V confidence; or
- block settlement.

---

# 15. Algorithm 7 — Measurement & Verification

M&V means:

> **Check what actually changed compared with what would have happened without the event.**

Formula:

```text
Verified flexible energy =
Observed event-period energy
-
Baseline event-period energy
```

Example:

```text
Observed = 72.6 kWh
Baseline = 50.0 kWh

Verified =
72.6 - 50.0
= 22.6 kWh
```

The optimiser expected:

```text
24.0 kWh
```

but only:

```text
22.6 kWh
```

was verified.

That is realistic because:

```text
Scheduled ≠ automatically delivered
```

---

# 16. M&V Confidence Gate

M&V confidence is used as a settlement safety gate.

Prototype threshold:

```text
70%
```

Example:

```text
Verified flexibility = 22.6 kWh
Confidence = 82%

82% >= 70%
→ settlement allowed
```

Low-confidence example:

```text
Verified flexibility = 18.5 kWh
Confidence = 63%

63% < 70%
→ result shown
→ result marked provisional
→ credits are NOT settled
```

The exact 70% is a prototype rule.

---

# 17. Contributor Attribution

Do not claim Maria's exact electricity went to Dinh.

Instead:

1. measure qualifying export during the event;
2. calculate each contributor's proportional share;
3. cap attribution by verified event value.

Example:

```text
Maria   6.5 kWh
Alex    4.0 kWh
Sam     2.5 kWh
       --------
Total  13.0 kWh
```

Maria's contributor share:

```text
6.5 / 13
= 50%
```

Suppose verified accommodated solar is:

```text
10 kWh
```

Then total attributable contributor energy is capped:

```ts
attributableEnergyKwh =
  Math.min(
    totalQualifyingExportKwh,
    verifiedAccommodatedEnergyKwh
  );
```

So:

```text
min(13, 10)
= 10 kWh
```

Maria attribution:

```text
50% × 10
= 5 kWh
```

This is accounting attribution, not electron tracing.

---

# 18. Program Value Calculation

For the hackathon, use a clearly labelled prototype rate.

Example:

```text
Verified flexibility: 22.6 kWh
Prototype value rate: $0.80 / verified kWh
```

Then:

```text
22.6 × $0.80
= $18.08
```

UI label:

```text
PROTOTYPE SETTLEMENT RATE
Not a real electricity tariff
```

---

# 19. Equity Floor

Example:

```text
Equity Floor = 60%
```

Meaning:

> At least 60% of distributable program value must reach eligible equity participants.

This applies to **financial value**, not kWh.

Example valid policy:

```text
Equity Pool        65%
Contributor Pool   30%
Community Reserve   5%
```

Since:

```text
65% >= 60%
```

settlement is valid.

Invalid example:

```text
Equity Pool        50%
Contributor Pool   45%
Reserve             5%
```

Since:

```text
50% < 60%
```

the settlement engine rejects the policy.

CTA:

```text
Apply Credits
```

must remain disabled until the policy is valid.

---

# 20. Settlement Example

Program value:

```text
$18.08
```

Policy:

```text
65% Equity Pool
30% Contributor Pool
5% Community Reserve
```

Calculated:

```text
Equity Pool       ≈ $11.75
Contributor Pool  ≈ $5.42
Reserve           ≈ $0.90
```

Use integer cents internally to avoid floating point currency errors.

Example:

```ts
verifiedProgramValueCents: 1808
```

---

# 21. Resident Credit Allocation

The Equity Pool is shared among eligible equity households.

For the hackathon, use simple predefined weights.

Example:

```text
Dinh     35%
Sarah    35%
James    30%
```

If Equity Pool is:

```text
$11.75
```

then Dinh gets approximately:

```text
$11.75 × 35%
≈ $4.11
```

The UI can use the agreed hero scenario value if the demo data contract defines a slightly different rounded credit.

The allocation rule must be deterministic and transparent.

---

# 22. Contributor Reward Allocation

Contributor Pool:

```text
$5.42
```

Maria share:

```text
50%
```

Then:

```text
Maria Reward
= $5.42 × 50%
= $2.71
```

Maria's wallet shows:

```text
Latest Contributor Reward
+$2.71
```

---

# 23. Receiver Device Registration

Residents should not manually enter technical electrical specifications.

Flow:

```text
Join Sunshine Wallet
        ↓
Which flexible appliances do you have?
        ↓
Storage hot water / EV / battery / pool pump / none
        ↓
Check compatibility
        ↓
Simulated authorised-partner response
        ↓
Compatible?
        ↓
Consent
        ↓
Resource registered
```

Example mock partner response:

```json
{
  "provider": "SIMULATED_PARTNER",
  "deviceType": "STORAGE_HOT_WATER",
  "compatible": true,
  "maxPowerKw": 3.6,
  "maxShiftEnergyKwh": 5,
  "controlAvailable": true
}
```

UI label:

```text
MOCK PARTNER RESPONSE
```

If the household has no compatible appliance, they may still participate as an Equity Pool participant.

---

# 24. Contributor Participation

Contributor controls:

```text
Participation
ACTIVE

[ Pause participation ]
```

When an upcoming event exists:

```text
Upcoming Sunshine Event
Tomorrow · 12:00–14:00

Estimated qualifying contribution:
8.2 kWh

[ Skip this event ]
```

Do not use:

```text
Give my energy away
```

Prefer:

```text
Participate in local energy events
```

or:

```text
Allow eligible solar export to participate
```

Contributors should normally opt in once rather than manually approve every event.

---

# 25. Resident UI

Mobile-first.

## Dinh Wallet

```text
Hi Dinh

Your Flexibility Dividend

$18.40 this month

Latest verified event
+$4.15

Dapto Sunshine Cell

[ See how it worked ]

Participation
ACTIVE

[ Pause participation ]
```

Key principles:

- dollar benefit first;
- plain English;
- no electrical-engineering jargon;
- visible pause/opt-out;
- explain why credit was received.

---

# 26. Contributor UI

Use the same mobile-style wallet structure.

```text
Hi Maria

Contributor Rewards

$12.70 this month

Latest verified event
+$2.71

Qualifying export
6.5 kWh

[ See how your contribution helped ]

Participation
ACTIVE

[ Pause participation ]
```

Do not create a separate completely different consumer application.

---

# 27. Council Dashboard UI

Desktop-first.

Primary cards:

```text
Constraint window
12:00–14:00

Target flexibility
24 kWh

Available flexibility
31 kWh

Forecast confidence
82%
```

Show:

```text
Event feasible
Sufficient flexible energy available
```

Also show why target exists:

```text
Forecast export opportunity    70 kWh
Comfortably accommodated       46 kWh
                               ------
Target flexible energy         24 kWh
```

Clearly label the network calculation as simulated.

---

# 28. Optimise Event UI

Example table:

| Resource | Type | Max Shift | Score | Decision |
|---|---|---:|---:|---|
| HW-101 | Storage hot water | 5 kWh | 0.91 | Selected |
| HW-102 | Storage hot water | 4 kWh | 0.86 | Selected |
| BAT-01 | Community battery | 10 kWh | 0.78 | Selected |
| APT-01 | Apartment common load | 6 kWh | 0.76 | Selected: 5 kWh |
| EV-04 | EV charger | 7 kWh | — | Rejected — unavailable |
| HW-205 | Storage hot water | 5 kWh | — | Rejected — wrong cell |

Show:

```text
Equity Floor: 60%
```

Tooltip:

> Applies to financial program value after verification.

CTA:

```text
Simulate Flex Event
```

---

# 29. Verify & Settle UI

Show side-by-side:

```text
Before dispatch

Baseline:
50.0 kWh
```

and:

```text
After dispatch

Observed:
72.6 kWh
```

Then large result:

```text
VERIFIED FLEXIBILITY

22.6 kWh

Confidence: 82%
Expected: 24.0 kWh
```

Show equation:

```text
72.6 actual
-
50.0 baseline
=
22.6 verified
```

Then settlement:

```text
Verified program value
$18.08

Equity Pool
65% / $11.75

Contributor Pool
30% / $5.42

Community Reserve
5% / $0.90
```

CTA:

```text
Apply Credits & View Resident Wallet
```

---

# 30. Primary Demo Navigation

The actual demo should feel like one story.

```text
Landing
↓
Dinh Wallet
↓
See how it worked
↓
Council Dashboard
↓
DAPTO-01 Event
↓
Optimise
↓
Resource decisions
↓
Simulate Flex Event
↓
Verify & Settle
↓
Apply Credits
↓
Dinh Wallet updated
```

If time permits, show Maria afterward:

```text
Maria Contributor Wallet
↓
Contributor Reward updated
```

---

# 31. Data Strategy

## Real / contextual

Use real public data only where easy and useful:

- suburb demographic context;
- rental / apartment indicators;
- public solar uptake;
- evidence that relevant community-energy mechanisms exist.

## Simulated

Use simulated or prepared data for:

- Sunshine Cell topology;
- solar generation/export intervals;
- household smart-meter readings;
- flexible-resource availability;
- hot-water status;
- EV connection;
- battery state;
- local network constraint;
- DNSP telemetry;
- community-battery dispatch;
- retailer settlement;
- authorised partner compatibility checks.

## Real Code

Must actually execute:

- event-window selection;
- target calculation;
- eligibility checks;
- optimiser;
- partial dispatch;
- deterministic response;
- baseline;
- M&V;
- confidence gate;
- contributor attribution;
- Equity Floor;
- settlement;
- wallet updates.

---

# 32. Core Data Models

The implementation should use stable shared models.

Minimum entities:

```text
Household
Participant
SunshineCell
FlexibleResource
SolarContributorProfile
EnergyInterval
BaselineReferenceDay
FlexEvent
DispatchDecision
ResourceResponse
BaselineEstimate
Verification
ContributorAttribution
SettlementPolicy
Settlement
Credit
WalletSummary
```

Important rule:

> Shared domain/API contracts are team contracts. Do not casually rename fields during the hackathon.

---

# 33. Example Flex Event Model

```ts
interface FlexEvent {
  id: string;
  sunshineCellId: string;

  startTime: string;
  endTime: string;

  forecastExportEnergyKwh: number;
  comfortableExportEnergyKwh: number;

  targetFlexEnergyKwh: number;
  availableFlexEnergyKwh: number;

  forecastConfidence: number;

  status:
    | "PROPOSED"
    | "READY"
    | "OPTIMISED"
    | "SIMULATED"
    | "VERIFIED"
    | "SETTLED"
    | "NO_EVENT";
}
```

---

# 34. Example Flexible Resource

```ts
interface FlexibleResource {
  id: string;
  householdId?: string;

  sunshineCellId: string;

  type:
    | "STORAGE_HOT_WATER"
    | "EV_CHARGER"
    | "COMMUNITY_BATTERY"
    | "APARTMENT_COMMON_LOAD"
    | "POOL_PUMP";

  maxPowerKw: number;
  maxShiftEnergyKwh: number;

  available: boolean;
  compatible: boolean;
  consentActive: boolean;
  comfortSafe: boolean;

  networkEffectiveness: number;
  equityNeed: number;
  controllability: number;
  rotationFairness: number;

  responseFactor: number;
}
```

---

# 35. API Contract — Minimum P0 Endpoints

The exact route structure may vary, but the UI should be able to call equivalent contracts.

```text
GET /api/demo/state

GET /api/cells

GET /api/cells/:cellId

GET /api/events/:eventId

POST /api/events/:eventId/optimise

POST /api/events/:eventId/simulate

POST /api/events/:eventId/verify

POST /api/events/:eventId/settle

POST /api/events/:eventId/apply-credits

POST /api/demo/reset

GET /api/households/:householdId/wallet

POST /api/participants/:participantId/pause

POST /api/events/:eventId/skip

POST /api/compatibility/check
```

For the hackathon, many of these can be implemented as thin route handlers around shared engine functions.

---

# 36. Suggested Project Structure

```text
sunshine-wallet/
│
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── .env.example
├── .gitignore
│
├── public/
│   ├── icons/
│   └── images/
│
├── src/
│   │
│   ├── app/
│   │   ├── page.tsx
│   │   │
│   │   ├── resident/
│   │   │   ├── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── events/
│   │   │       └── [eventId]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── contributor/
│   │   │   └── page.tsx
│   │   │
│   │   ├── operator/
│   │   │   ├── page.tsx
│   │   │   └── events/
│   │   │       └── [eventId]/
│   │   │           ├── page.tsx
│   │   │           ├── optimise/
│   │   │           │   └── page.tsx
│   │   │           └── verify/
│   │   │               └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── demo/
│   │       ├── cells/
│   │       ├── events/
│   │       ├── participants/
│   │       ├── wallets/
│   │       └── compatibility/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── resident/
│   │   ├── contributor/
│   │   ├── operator/
│   │   ├── charts/
│   │   └── governance/
│   │
│   ├── domain/
│   │   ├── models/
│   │   ├── enums/
│   │   └── validation/
│   │
│   ├── engine/
│   │   ├── selectEventWindow.ts
│   │   ├── deriveTargetFlex.ts
│   │   ├── checkResourceEligibility.ts
│   │   ├── optimiseResources.ts
│   │   ├── simulateEvent.ts
│   │   ├── calculateBaseline.ts
│   │   ├── verifyEvent.ts
│   │   ├── attributeContributors.ts
│   │   ├── settleEvent.ts
│   │   └── runSunshineEvent.ts
│   │
│   ├── data/
│   │   ├── demoScenario.ts
│   │   ├── historicalDays.ts
│   │   └── fixtures/
│   │
│   ├── services/
│   │   ├── eventService.ts
│   │   ├── walletService.ts
│   │   └── compatibilityService.ts
│   │
│   ├── lib/
│   │   ├── money.ts
│   │   ├── energy.ts
│   │   └── utils.ts
│   │
│   └── types/
│       └── api.ts
│
└── tests/
    ├── engine/
    ├── api/
    └── fixtures/
```

---

# 37. Team Responsibilities

## Developer 1 — Engine / Domain / Integration

Primary ownership:

```text
src/engine/
src/domain/
src/app/api/
src/services/
```

Responsibilities:

- domain models;
- engine algorithms;
- demo-state coordinator;
- API route handlers;
- tests;
- deployment support.

---

## Developer 2 — Council / Operator UI

Primary ownership:

```text
src/app/operator/
src/components/operator/
src/components/charts/
src/components/governance/
```

Responsibilities:

- event overview;
- target / flexibility cards;
- optimiser table;
- rejection explanations;
- Equity Floor;
- Verify & Settle screen;
- charts.

---

## Developer 3 — Resident / Contributor UI + Demo

Primary ownership:

```text
src/app/resident/
src/app/contributor/
src/components/resident/
src/components/contributor/
```

Responsibilities:

- Dinh wallet;
- Maria wallet;
- participation controls;
- compatibility onboarding;
- role selector;
- final visual polish;
- pitch;
- README / demo flow;
- backup recording.

---

# 38. GitHub Workflow

Use:

```text
main
```

as the always-runnable demo branch.

Do not develop directly on `main`.

### Branch naming

Examples:

```text
feature/engine-window-selection
feature/engine-optimiser
feature/operator-event-view
feature/operator-verify-settle
feature/resident-wallet
feature/contributor-wallet
fix/settlement-rounding
fix/mobile-layout
```

### Commit format

```text
type(scope): short description
```

Examples:

```text
feat(engine): derive target flexibility

feat(engine): implement optimiser scoring

feat(mv): exclude event days from baseline

feat(settlement): enforce equity floor

feat(operator): add resource decision table

feat(resident): build Dinh wallet

feat(contributor): add skip event control

fix(engine): cap partial resource dispatch

fix(wallet): prevent duplicate credit application
```

### PR workflow

```bash
git checkout main
git pull origin main

git checkout -b feature/example
```

Make focused commits.

Then:

```bash
git push -u origin feature/example
```

Open a Pull Request into `main`.

Quick review by one teammate.

Before merge:

- app builds;
- demo route still works;
- no type errors;
- no obvious console errors;
- shared models have not silently changed.

---

# 39. 25-Hour Build Schedule

## Hour 0–1 — Freeze Product

All three together.

Confirm:

```text
Dinh
→ DAPTO-01
→ event window
→ 24 kWh target
→ optimiser
→ simulation
→ M&V
→ settlement
→ credits
```

Freeze:

- hero data;
- four major Council/resident screens;
- model names;
- API contracts;
- ownership.

---

## Hour 1–2 — Scaffold

### Developer 1

- shared models;
- fixtures;
- engine stubs;
- API contracts.

### Developer 2

- operator routes;
- UI shell;
- mock metric cards.

### Developer 3

- landing;
- resident wallet shell;
- contributor wallet shell;
- visual tokens.

### Hour 2 Gate

Must have:

- repo;
- Next.js running;
- shared types;
- mock data;
- routes;
- branches;
- basic deployment if possible.

---

## Hours 2–5 — Build Engine Brain + UI Skeletons

### Developer 1

Complete:

```text
deriveTargetFlex
eligibility
optimiser
simulation
baseline
verification
settlement
```

### Developer 2

Build operator screens against mock API data.

### Developer 3

Build Dinh wallet and contributor shell.

### Hour 5 Gate

Engine must produce deterministic console output.

Example:

```text
Event window: 12:00–14:00
Target: 24 kWh
Selected: HW-101, HW-102, BAT-01, APT-01
Rejected: EV-04, HW-205
Actual simulated response: 22.6 kWh
Verified: 22.6 kWh
Program value: $18.08
Settlement allowed: true
```

If this does not work, stop adding optional UI.

---

## Hours 5–8 — First Vertical Slice

Connect:

```text
Operator Event
↓
Optimise
↓
Simulate
↓
Verify
↓
Settle
```

Ugly is acceptable.

The logic must be real.

### Hour 8 Gate

Emergency technical demo works.

---

## Hours 8–11 — Full Demo Loop

Connect:

```text
Dinh Wallet
↓
Council
↓
Event
↓
Optimise
↓
Simulate
↓
Verify
↓
Settle
↓
Apply Credits
↓
Dinh updated
```

If time allows, Maria also updates.

### Hour 11 Gate

A full submission-quality logical flow exists.

---

## Hours 11–13 — UI Polish

Focus only on:

- layout;
- hierarchy;
- charts;
- provenance badges;
- loading states;
- rejection explanations;
- wallet clarity.

### Hour 13 — Feature Freeze

No new significant feature after this point.

---

## Hours 13–16 — Reliability + P1

Only if core flow is safe:

- Maria contributor wallet;
- compatibility onboarding;
- no-event state;
- Equity Floor control;
- skip-event control.

---

## Hours 16–18 — Deployment + Fallback

- Vercel deploy;
- localhost fallback;
- reset demo state;
- test browser refresh;
- test incognito;
- bundle all critical assets locally;
- no live external dependency required.

### Hour 18 — Code Freeze

No new features.

---

## Hours 18–20 — README + Pitch + Q&A

Prepare:

- what is simulated;
- what is real code;
- who pays;
- why contributors participate;
- why renters benefit;
- Sunshine Cell explanation;
- baseline explanation;
- M&V explanation;
- kW vs kWh;
- Equity Floor.

---

## Hours 20–21 — Record Backup Demo

Record full screen capture.

---

## Hours 21–24 — Rehearsal

At least three full runs:

1. normal;
2. with interruptions/questions;
3. strict time limit.

---

## Hour 24–25 — Final Freeze

Only critical bug fixes.

Prepare:

- laptop;
- charger;
- local app;
- Vercel app;
- backup video;
- clean browser tabs;
- reset demo state.

---

# 40. Build Order by Risk

Do not build by page order.

Build by risk reduction.

## Step 1

Freeze scenario and data.

## Step 2

Build shared models.

## Step 3

Build target calculation.

## Step 4

Build eligibility.

## Step 5

Build optimiser.

## Step 6

Build deterministic simulation.

## Step 7

Build baseline + M&V.

## Step 8

Build settlement.

## Step 9

Prove complete engine in console/tests.

## Step 10

Wrap engine in API/service layer.

## Step 11

Build operator vertical slice.

## Step 12

Build Dinh wallet.

## Step 13

Connect apply-credit flow.

## Step 14

Add Maria if safe.

## Step 15

Polish.

## Step 16

Deploy.

---

# 41. P0 — Demo Cannot Work Without These

- [ ] Hero DAPTO-01 scenario
- [ ] Dinh resident
- [ ] Maria contributor record
- [ ] synthetic 24-hour interval data
- [ ] candidate event windows
- [ ] event-window selection
- [ ] target flexible energy calculation
- [ ] resource eligibility
- [ ] optimiser scoring
- [ ] partial dispatch
- [ ] selected and rejected resource reasons
- [ ] deterministic event simulation
- [ ] historical non-event baseline data
- [ ] baseline calculation
- [ ] M&V calculation
- [ ] confidence settlement gate
- [ ] contributor attribution
- [ ] prototype settlement rate
- [ ] Equity Floor enforcement
- [ ] Dinh credit
- [ ] Maria reward
- [ ] operator event page
- [ ] optimiser page
- [ ] verify/settle page
- [ ] resident wallet
- [ ] working end-to-end flow
- [ ] reset demo state
- [ ] local fallback

---

# 42. P1 — High Value

- [ ] Maria contributor wallet
- [ ] participant pause
- [ ] contributor skip-event action
- [ ] compatibility onboarding
- [ ] Equity Floor slider
- [ ] no-event state
- [ ] data provenance badges
- [ ] explanation drawers
- [ ] candidate-window comparison
- [ ] polished charts
- [ ] operator confidence explanations

---

# 43. P2 — Only If Everything Is Stable

- [ ] multiple Sunshine Cells
- [ ] opportunity map
- [ ] combined receiver + contributor persona
- [ ] event history
- [ ] policy comparison
- [ ] richer audit timeline
- [ ] downloadable report

---

# 44. Do Not Build

- [ ] real authentication
- [ ] OAuth
- [ ] native mobile application
- [ ] real smart-meter control
- [ ] real retailer billing
- [ ] real payment processing
- [ ] real DNSP telemetry
- [ ] real community-battery API
- [ ] sophisticated M&V methodology
- [ ] machine learning
- [ ] chatbot
- [ ] microservices
- [ ] Kubernetes
- [ ] Kafka
- [ ] WebSockets unless absolutely needed
- [ ] advanced GIS
- [ ] complex database architecture
- [ ] complex CI/CD

---

# 45. Emergency Scope Reduction

## If behind at Hour 5

Drop:

- candidate-window UI;
- compatibility onboarding;
- Maria's detailed page.

Keep engine.

## If behind at Hour 8

Hard-code:

```text
Equity Floor = 60%
```

inside the policy model.

Do not build slider.

## If behind at Hour 11

Show credit on Verify & Settle page even if wallet update is incomplete.

## If behind at Hour 13

Stop all new features.

Polish only the existing vertical slice.

## If deployment fails

Use:

```bash
npm run dev
```

and demo locally.

---

# 46. Minimum Successful Submission

The absolute minimum successful product is:

```text
DAPTO-01
↓
Engine derives 24 kWh target
↓
Eligible resources evaluated
↓
Resources selected / rejected
↓
24 kWh scheduled
↓
22.6 kWh simulated actual response
↓
50 kWh baseline
↓
22.6 kWh verified flexibility
↓
82% confidence
↓
$18.08 prototype program value
↓
Equity Floor validated
↓
Dinh receives credit
↓
Maria receives contributor reward
```

This can be implemented with:

- deterministic fixtures;
- real engine functions;
- 3–4 polished screens;
- no real database;
- no external APIs.

That is enough to demonstrate the invention.

---

# 47. Ideal Submission

If development is smooth:

- polished Dinh wallet;
- polished Maria wallet;
- Council dashboard;
- event-window recommendation;
- clear target derivation;
- resource explanations;
- interactive Equity Floor;
- before/after chart;
- baseline explanation;
- confidence gate;
- contributor attribution;
- no-event state;
- compatibility onboarding;
- provenance badges;
- deterministic reset button;
- polished final pitch.

---

# 48. Judge-Facing Technical Positioning

The strongest explanation is:

> **Sunshine Wallet does not claim that one household's electricity is directly routed to another. It identifies a local grid opportunity, coordinates compatible flexible resources within the relevant Sunshine Cell, verifies what changed against a no-intervention baseline, and then allocates the resulting program value between contributors and equity households under an explicit fairness policy.**

---

# 49. Final Development Philosophy

> **Build the complete causal story first: event opportunity → decision → response → verification → settlement → human benefit. Do not build infrastructure the judges cannot see or that does not strengthen that story.**
