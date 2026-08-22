# Sunshine Wallet — Verification Engine Hackathon Notes

> Agent-facing implementation notes derived from the uploaded **Sunshine Wallet · The Verification Engine** specification.

## Why this matters for the hackathon

The Verification Engine is a strong hackathon feature because it makes Sunshine Wallet look **credible, auditable, and trustworthy**, rather than like a dashboard that simply calculates rewards.

The core pitch is:

> **One layer proves the money was real. One layer proves it went to the right people.**

The prototype should make this visible and easy for judges to understand.

---

## 1. Core Concept

Sunshine Wallet uses two independent verification layers.

### Layer 1 — Verify the claim

Layer 1 checks whether a participant is entitled to receive money from the shared value pot.

It has two branches:

- **Layer 1A — Equity claim**
  - verifies household eligibility,
  - verifies the priority score,
  - verifies that the equity-pool arithmetic is correct.

- **Layer 1B — Solar contributor claim**
  - verifies that the solar system is registered,
  - verifies that the household is enrolled,
  - verifies there is only one claim per connection point,
  - verifies the equal-share calculation.

### Layer 2 — Verify the value

Layer 2 checks whether a physical action actually created measurable value.

Examples:

- controlled hot-water load,
- community battery,
- other flexible resources.

Core concept:

```text
observed response - estimated counterfactual = verified contribution
```

Only verified contribution enters the value pot.

---

## 2. Keep Layer 1 and Layer 2 Independent

This is an important design rule.

A household can:

- pass Layer 1,
- fail Layer 2,
- and still keep its Layer 1 equity credit.

Example:

A household's hot-water relay fails and the system detects that the household added consumption instead of shifting it.

Result:

```text
Layer 2 contribution = rejected
Layer 1 equity claim = unchanged
```

The system must **not punish a household financially because its physical contribution failed**.

For implementation, keep Layer 1 and Layer 2 as separate code paths and separate verification records.

---

## 3. Hackathon Demo Priority

The most convincing demo should NOT only show successful cases.

Include:

1. one successful Layer 1 claim,
2. one successful Layer 2 contribution,
3. one rejected Layer 2 contribution,
4. one duplicate Layer 1 enrolment,
5. one no-event day.

The rejection path is especially important.

A useful demo moment:

> The system detects that a household consumed energy both at midday and overnight, so it rejects the claimed flexibility and adds **$0.00** to the pot.

This is strong because it proves the platform can refuse invalid value rather than always manufacturing a successful result.

---

## 4. Layer 1A — Equity Claim Checks

The prototype should support these checks:

```text
token_valid
no_duplicate
in_program_area
score_derivation
roll_closure
rate_arithmetic
```

### token_valid

Confirms the eligibility result is current and issued by an authorised party.

For the hackathon, this can be simulated.

Do not require real government integration.

### no_duplicate

Ensures the same household, premises, or eligibility token has not been enrolled twice.

This should be implemented as real prototype logic because it is simple and very useful for the demo.

### in_program_area

Confirms the household belongs to the active Sunshine Wallet program area.

For the prototype, use seeded suburb/feeder data.

### score_derivation

Recalculate the participant score from their recorded factor answers.

Example:

```text
A + B + C + D + E = priority score
```

Do not trust a stored score without recomputing it.

### roll_closure

Confirm that:

```text
sum of participant priority points = divisor used for per-point rate
```

### rate_arithmetic

Confirm:

```text
household credit = priority score × per-point rate
```

and:

```text
sum of all household equity credits ≈ equity pool
```

Use safe rounding rules.

---

## 5. Layer 1B — Solar Contributor Checks

The prototype should support:

```text
system_registered
enrolled
active_period
one_claim_per_point
count_closure
rate_arithmetic
```

### system_registered

Confirms rooftop solar exists at the connection point.

Hackathon version:

```text
simulated registered system
```

### enrolled

Confirms the account holder opted into the solar contributor pool.

### active_period

Confirms the contributor was enrolled during the settlement period.

### one_claim_per_point

Only one contributor claim per connection point.

### count_closure

Confirm:

```text
number of eligible contributors = divisor used for equal share
```

### rate_arithmetic

Confirm:

```text
solar credit = solar pool / contributor count
```

and:

```text
sum of solar credits ≈ solar pool
```

---

## 6. Layer 2 — Contribution Verification

Layer 2 applies only to resources that physically create value.

Three important checks:

```text
shift_not_addition
event_validity
attribution
```

### shift_not_addition

Prevents the system from paying for extra consumption.

Example:

A household heats water at midday and again overnight.

That is not necessarily flexibility.

The system should compare against a baseline and reject added consumption.

### event_validity

Confirms the event actually existed.

Example:

If forecast solar surplus never materialises, no event value should be claimed.

### attribution

Confirms the measured response is attributable to Sunshine Wallet rather than coincidence or another program.

---

## 7. Counterfactual Logic

The source specification uses the concept of a counterfactual:

> What would the resource likely have done if Sunshine Wallet had not dispatched it?

Hackathon implementation can use a simple deterministic baseline.

Example:

```ts
verifiedKwh = Math.min(observedKwh, baselineKwh);
```

Then reject or reduce value if the daily total shows additional consumption.

Do not over-engineer forecasting or machine learning.

The goal is explainable logic.

---

## 8. Example Successful Layer 2 Case

Example demo data:

```text
Observed midday use: 3.04 kWh
Estimated baseline: 2.98 kWh
Verified shift: 2.98 kWh
```

The extra:

```text
0.06 kWh
```

is not claimed.

Then value can be calculated using a simple price difference:

```text
verified_kWh × value_per_kWh
```

Display the arithmetic directly in the UI.

---

## 9. Example Rejected Layer 2 Case

Seed a household with:

```text
Midday consumption: 3.11 kWh
Overnight consumption: 2.87 kWh
Baseline: 3.02 kWh
Daily total: 5.98 kWh
```

This indicates the household likely added consumption rather than shifted it.

Result:

```text
verifiedKwh = 0
verifiedValue = $0.00
verdict = rejected
```

Important:

```text
Layer 1 equity credit remains unchanged.
```

Use this as a live judge demo.

---

## 10. No-Event Case

Include at least one simulated day where:

```text
forecast surplus < dispatch threshold
```

Result:

```text
resources engaged = 0
verifiedKwh = 0
verifiedValue = $0.00
verdict = no_event
```

This improves credibility.

The verification engine should not always find value.

---

## 11. Duplicate Enrolment Demo

Seed one participant with a duplicate active enrolment.

Expected behavior:

```text
duplicate claim detected
invalid enrolment removed
roll points decrease
per-point equity rate increases slightly
```

Surface this in the operator console.

This clearly demonstrates that the total pot is fixed before distribution.

A fraudulent participant does not create more money.

They dilute everyone else's share.

When removed:

```text
everyone else's share rises
```

---

## 12. Suggested Verification Record Shapes

### Layer 1A

```ts
type Layer1ARecord = {
  recordId: string;
  layer: "1A";
  participantId: string;
  period: string;

  checks: {
    tokenValid: "pass" | "fail";
    noDuplicate: "pass" | "fail";
    inProgramArea: "pass" | "fail";
    scoreDerivation: "pass" | "fail";
    rollClosure: "pass" | "fail";
    rateArithmetic: "pass" | "fail";
  };

  priorityScore: number;
  rollPoints: number;
  rateAudPerPoint: number;
  creditAud: number;

  deliveryMode: string;
  verdict: "passed" | "failed";

  createdAt: string;
};
```

### Layer 1B

```ts
type Layer1BRecord = {
  recordId: string;
  layer: "1B";
  claimantId: string;
  period: string;

  checks: {
    systemRegistered: "pass" | "fail";
    enrolled: "pass" | "fail";
    activePeriod: "pass" | "fail";
    oneClaimPerPoint: "pass" | "fail";
    countClosure: "pass" | "fail";
    rateArithmetic: "pass" | "fail";
  };

  systemKw: number;
  daysEnrolled: number;
  daysInPeriod: number;

  solarPoolAud: number;
  contributors: number;
  creditAud: number;

  deliveryMode: string;
  verdict: "passed" | "failed";

  createdAt: string;
};
```

### Layer 2

```ts
type Layer2Record = {
  recordId: string;
  layer: "2";

  subjectId: string;
  channel: string;
  feeder: string;

  window: {
    start: string;
    end: string;
  };

  dispatchRef?: string;

  observedKwh: number;
  counterfactualKwh: number;
  verifiedKwh: number;

  checks: {
    shiftNotAddition: "pass" | "fail";
    eventValidity: "pass" | "fail";
    attribution: "pass" | "fail";
  };

  verdict:
    | "verified"
    | "rejected"
    | "no_event";

  valueAud: number;
  methodVersion: string;

  createdAt: string;
};
```

---

## 13. Append-Only Audit Records

Verification records should be treated as immutable after creation.

Do not edit settled verification records.

If a correction is needed:

```text
create new record
reference original record
preserve original record
```

Hackathon implementation can model:

```ts
correctsRecordId?: string;
```

This supports an auditable trail.

---

## 14. Operator Console UI

Recommended verification screen:

### Verification Summary

Show:

```text
Layer 1 claims passed
Layer 1 claims failed
Layer 2 verified
Layer 2 rejected
No-event days
Verified pot value
```

### Verification Feed

Cards such as:

```text
LAYER 1A
PASSED

Participant: HH-0912
Priority score: 75
Per-point rate: $0.20
Credit: $15.00
```

and:

```text
LAYER 2
REJECTED

Observed midday: 3.11 kWh
Baseline: 3.02 kWh
Daily total: 5.98 kWh

Reason:
Consumption was added, not shifted.

Into pot: $0.00
```

### Arithmetic Visibility

Always show calculations.

Examples:

```text
75 points × $0.20 = $15.00
```

and:

```text
2.98 kWh × $0.15/kWh = $0.45
```

The arithmetic is part of the product experience.

---

## 15. Relationship to Settlement

The settlement engine should read verified outputs rather than raw telemetry.

Conceptually:

```text
Layer 2 verified value records
          ↓
     Total value pot
          ↓
   Governance split
          ↓
Layer 1 verified claim records
          ↓
      Wallet credits
```

Do not calculate settlement directly from:

- scheduled intentions,
- raw consumption,
- unverified forecasts.

Use verified records.

---

## 16. Hackathon Scope

### MUST IMPLEMENT

- [ ] Layer 1A verification logic
- [ ] Layer 1B verification logic
- [ ] Layer 2 verification logic
- [ ] independent Layer 1 and Layer 2 verdicts
- [ ] one successful Layer 2 example
- [ ] one rejected Layer 2 example
- [ ] one duplicate enrolment example
- [ ] one no-event example
- [ ] append-only verification records
- [ ] arithmetic displayed in the UI
- [ ] verified value feeding settlement
- [ ] failed Layer 2 does not remove Layer 1 credit

### CAN BE SIMULATED

- [ ] smart-meter telemetry
- [ ] feeder telemetry
- [ ] government eligibility-token API
- [ ] solar-system registry
- [ ] inverter registry
- [ ] hot-water control hardware
- [ ] battery telemetry
- [ ] competing demand-response program checks

### DO NOT OVERBUILD

Do not spend hackathon time on:

- real smart-meter integrations,
- ML-based counterfactual models,
- real government APIs,
- real retailer integrations,
- cryptographic audit infrastructure,
- production-grade event streaming,
- complicated microservices.

Use deterministic mock data with real verification logic.

---

## 17. Recommended Demo Flow

A strong 3–5 minute demo:

### Step 1

Show an optimisation event.

```text
Dapto East
Midday solar opportunity
```

### Step 2

Run simulated event.

Some resources respond.

### Step 3

Open Verification Engine.

Show successful Layer 2 record.

Explain:

> We do not assume the scheduled energy created value. We verify what actually happened.

### Step 4

Show rejected resource.

Explain:

> This household consumed at midday but also consumed again overnight, so this was additional consumption, not a real shift. Sunshine Wallet pays $0 for this contribution.

### Step 5

Immediately show:

```text
Household Layer 1 equity claim: PASSED
```

Explain:

> They are not punished for a faulty device. Their equity entitlement is independent.

### Step 6

Show duplicate enrolment removal.

Animate:

```text
Roll points: 13,092 → 13,080
Per-point rate: $0.1998 → $0.2000
```

Explain:

> Removing an invalid claim increases everyone else's share because the pot is fixed.

### Step 7

Show final verified pot.

Then continue to settlement:

```text
Verified value
→ Equity Pool
→ Solar Pool
→ Community Reserve
→ wallet credits
```

---

## 18. Main Judge Message

Do not describe the Verification Engine as merely:

> fraud detection

It is broader than that.

Use:

> **Sunshine Wallet separates proof of value from proof of entitlement. Layer 2 verifies that an energy action genuinely created value. Layer 1 independently verifies who is entitled to receive that value.**

Short pitch version:

> **Two layers. One proves the money was real. One proves it went to the right people.**

---

## 19. Why This Is Valuable in the Hackathon

This feature makes the system more convincing because it demonstrates:

- transparent calculations,
- failed-event handling,
- duplicate detection,
- auditability,
- independence between equity support and physical flexibility,
- conservative value recognition,
- clear traceability from an event to a wallet credit.

Most hackathon prototypes only demonstrate the happy path.

Sunshine Wallet should deliberately show the system refusing an invalid claim.

That rejection is a feature.

---

## 20. Agent Implementation Rules

When coding this feature:

1. Keep Layer 1 and Layer 2 independent.
2. Never remove a valid Layer 1 equity credit because Layer 2 failed.
3. Never count scheduled energy as verified energy automatically.
4. Use a simple explainable counterfactual.
5. Surface every verification check in the UI.
6. Show failed checks rather than hiding them.
7. Keep verification records append-only.
8. Feed only verified value into settlement.
9. Label simulated telemetry clearly.
10. Prefer deterministic, demo-safe logic over complex infrastructure.
11. Include at least one rejection and one no-event case.
12. Do not silently repair invalid data; create an explicit verification result.
