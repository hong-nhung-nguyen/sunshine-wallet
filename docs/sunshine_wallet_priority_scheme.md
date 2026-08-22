# Sunshine Wallet — Value Split & Priority Scheme

> Hackathon implementation specification derived from the **Sunshine Wallet · Energy Equity Challenge — Value Split & Priority Scheme** document.

---

## 1. Purpose

Sunshine Wallet distributes verified program value created by:

- rescued solar curtailment,
- community battery peak arbitrage,
- network support payments.

All verified value is collected into one monthly pot, then split between:

1. **Equity Pool**
2. **Solar Pool**
3. **Community Reserve**

The purpose of the scheme is to make sure households facing energy disadvantage receive the largest protected share of program value, while solar contributors are still compensated for participation.

---

## 2. Core Governance Rule

### Default modelled split

| Pool | Share | Purpose |
|---|---:|---|
| Equity Pool | 60% | Distributed to participating households according to priority score |
| Solar Pool | 35% | Distributed equally among enrolled solar owners |
| Community Reserve | 5% | Supports low-yield months, crisis top-ups, trial credits, and community projects |

### Structural rule

**60% is the minimum Equity Pool share, not necessarily the permanent default.**

The community may vote to increase the Equity Pool above 60%, but it must never be reduced below 60%.

Implementation rule:

```ts
if (equityPct < 60) {
  throw new Error("Equity Pool cannot be below 60%");
}
```

The three percentages must always total 100%.

```ts
equityPct + solarPct + communityPct === 100
```

---

## 3. Modelled Example

### Dapto East feeder

- 300 participating households
- 90 households with solar
- Monthly verified value pot: **$4,360**

### Resulting split

#### Equity Pool

```text
60% × $4,360 = $2,616
```

Distributed in proportion to household priority scores.

Modelled rate:

```text
approximately $0.20 per priority point per month
```

The actual rate is not fixed.

```text
perPointRate =
  equityPool /
  totalPriorityPointsAcrossAllParticipants
```

A larger value pot means every priority point becomes worth more.

#### Solar Pool

```text
35% × $4,360 = $1,526
```

Split equally among 90 enrolled solar owners:

```text
$1,526 / 90 ≈ $16.96 per solar owner
```

The payment is **not based on panel size or kWh generated**.

#### Community Reserve

```text
5% × $4,360 = $218/month
```

Approximately:

```text
$2,600/year per feeder
```

Possible uses:

- protect the Equity Floor in low-yield months,
- crisis top-ups,
- ghost-wallet trial credits,
- community-voted local projects.

---

# 4. Priority Scoring Model

A household's priority score contains two components.

```text
Priority Score = Need Score + Contribution Score
```

Maximum:

```text
85 need points + 15 contribution points = 100 points
```

## Need Score — 85 points maximum

Factors:

- Factor A — Access barrier / disadvantage
- Factor B — Income & concession status
- Factor C — Tenure & structural lock-out
- Factor D — Billing arrangement

These factors represent **who the program exists for**.

## Contribution Score — 15 points maximum

Factor:

- Factor E — Physical contribution capability

This represents what flexible load or energy capability the household can physically offer.

### Design principle

Need must dominate contribution.

Owning suitable equipment may improve someone's position within a need tier, but it should not allow a lower-need household to overtake a substantially higher-need household purely because they own better equipment.

---

# 5. Factor A — Access Barrier / Disadvantage

**Range:** `0–35`

Onboarding question:

> How do you currently pay for electricity? Have you had trouble paying recently?

| Answer | Points | Verification |
|---|---:|---|
| No active bill, prepay meter, in debt recovery, disconnected, or referred by support service | 35 | Support-service referral or self-declaration + assisted-delivery flag |
| Received EAPA assistance in last 12 months | 25 | Eligibility token preferred or voucher record |
| Missed or deferred a bill in last 6 months | 12 | Self-declaration |
| None | 0 | — |

### Safety rule

Life-support and medical equipment are **not scored**.

Instead:

```text
lifeSupportFlag = true
```

This creates a safety exclusion so the household is never scheduled in a way that could affect supply.

Health information should not become part of the priority score.

---

# 6. Factor B — Income & Concession Status

**Range:** `0–25`

Onboarding question:

> Do you receive any energy rebate, or hold a concession card?

| Answer | Points | Verification |
|---|---:|---|
| Low Income Household Rebate, concession card, or pensioner card | 25 | Eligibility token preferred; card upload fallback |
| Family Energy Rebate or Seniors Energy Rebate | 18 | Eligibility token |
| No rebate, household income below median | 10 | Self-declaration + sample audit |
| None | 0 | — |

---

# 7. Factor C — Tenure & Structural Lock-Out

**Range:** `0–15`

Onboarding question:

> Do you rent or own? What type of home?

| Answer | Points | Reason |
|---|---:|---|
| Renter — private, social, or community housing | 15 | Cannot install solar directly |
| Owner-occupier in apartment or strata | 8 | Cannot unilaterally install solar |
| Owner-occupier, detached, no solar | 3 | Could install but currently has not |
| Owner-occupier with existing solar | 0 | Compensated separately through Solar Pool |

---

# 8. Factor D — Billing Arrangement

**Range:** `0–10`

Onboarding question:

> Who do you pay — an electricity retailer, or your landlord or building?

| Answer | Points | Reason |
|---|---:|---|
| Pays landlord/building operator through embedded network | 10 | Often less retail choice and fewer protections; may require program-credit delivery |
| Own retail account on standing/default offer | 6 | Typically overpaying |
| Own retail account on market offer | 3 | — |

---

# 9. Factor E — Physical Contribution Capability

**Range:** `0–15`

Onboarding question:

> What kind of hot water system do you have? Is it on its own meter?

| Capability | Points | Effect |
|---|---:|---|
| Individual storage tank on own controlled-load circuit | 15 | Full physical participation |
| Shared/site storage tank | 8 | Site value split among residents |
| Other controllable load — EV charger, pool pump, home battery | 4 | Phase-2 channel |
| Instantaneous electric, gas, or no controllable load | 0 | Financial participation only |

---

# 10. Need Tier Bands

Need tier uses only Factors A–D.

```text
needScore = factorA + factorB + factorC + factorD
```

| Need Score | Tier | Physical Channel |
|---:|---|---|
| 60–85 | Critical | Eligible |
| 40–59 | High | Eligible |
| 20–39 | Moderate | Eligible |
| 0–19 | Standard | Contributor only — no hardship rate |

Tiers are primarily for eligibility and reporting.

Financial distribution still uses the household's total priority score, which avoids sudden payment jumps at tier boundaries.

---

# 11. Priority Score Calculation

```ts
needScore =
  factorA +
  factorB +
  factorC +
  factorD;

contributionScore = factorE;

priorityScore =
  needScore +
  contributionScore;
```

Maximum:

```text
priorityScore = 100
```

---

# 12. Equity Pool Credit

The Equity Pool is distributed according to total priority points.

```ts
perPointRate =
  equityPoolValue /
  totalPriorityPoints;
```

For each household:

```ts
equityCredit =
  household.priorityScore *
  perPointRate;
```

Example at `$0.20/point`:

```text
70 points × $0.20 = $14.00/month
```

---

# 13. Example Priority Outcomes

Illustrative need scores:

- Critical = 70
- High = 50
- Moderate = 30
- Standard = 10

Example rate:

```text
$0.20 per point per month
```

| Tier | Capability | Need | Contribution | Total | Equity Credit |
|---|---|---:|---:|---:|---:|
| Critical | Individual tank | 70 | 15 | 85 | $17.00 |
| Critical | Shared tank | 70 | 8 | 78 | $15.60 |
| Critical | None / apartment | 70 | 0 | 70 | $14.00 |
| High | Individual tank | 50 | 15 | 65 | $13.00 |
| High | Shared tank | 50 | 8 | 58 | $11.60 |
| High | None / apartment | 50 | 0 | 50 | $10.00 |
| Moderate | Individual tank | 30 | 15 | 45 | $9.00 |
| Moderate | Shared tank | 30 | 8 | 38 | $7.60 |
| Moderate | None / apartment | 30 | 0 | 30 | $6.00 |
| Standard | Individual tank | 10 | 15 | 25 | $5.00 |
| Standard | Shared tank | 10 | 8 | 18 | $3.60 |
| Standard | None | 10 | 0 | 10 | $2.00 |

---

# 14. Solar Pool

Solar compensation is separate from the Equity Pool.

Eligibility:

```text
hasSolar === true
```

Calculation:

```ts
solarCredit =
  solarPoolValue /
  enrolledSolarOwners;
```

Every enrolled solar owner gets the same Solar Pool payment regardless of:

- panel size,
- system size,
- kWh generated,
- priority score.

A household may receive from both pools.

```ts
totalHouseholdCredit =
  equityCredit +
  solarCredit;
```

if they are eligible for both.

---

# 15. The Inversion Test

A core fairness assertion for Sunshine Wallet:

> A highest-need household with no physical contribution capability should still receive more from the Equity Pool than a lowest-need household with the strongest contribution capability.

Example:

### Critical household with no device

```text
Need = 70
Contribution = 0
Priority = 70
Equity credit = $14.00
```

### Standard household with best device

```text
Need = 10
Contribution = 15
Priority = 25
Equity credit = $5.00
```

Result:

```text
$14.00 > $5.00
```

### Automated assertion

```ts
assert(
  criticalNoDeviceEquityCredit >
  standardBestDeviceEquityCredit
);
```

UI suggestion:

```text
Equity Floor: PASS
```

The operator interface should surface this as a visible fairness check.

---

# 16. What the Score Controls

| Output | Driven By |
|---|---|
| Share of Equity Pool | Total priority score × per-point rate |
| Share of Solar Pool | Solar ownership only; equal flat share |
| Physical-channel enrolment | Need tier ≥ Moderate and suitable capability |
| Rotation priority when surplus is limited | Fairness counter first, then need tier as tiebreak |
| Delivery mode | Factors A + D |
| Safety exclusion | Independent life-support flag |

Capability must **not** determine rotation priority.

---

# 17. Community Governance

The community may vote on:

1. The three-way pool split, subject to Equity Pool ≥ 60%.
2. Priority-score factor weights.
3. Use of the Community Reserve.

The rest of the settlement process is deterministic arithmetic.

---

# 18. Verification Strategy

The system should minimise documentation burden because high-need users may be least able to provide extensive paperwork.

Priority order:

### 1. Eligibility tokens

Use authorised yes/no eligibility checks where possible.

Do not store unnecessary income or welfare details.

Store:

```text
eligibilityVerified = true
```

rather than raw sensitive evidence where possible.

### 2. Self-declaration + sample audit

Allow households to participate through self-declaration and verify a sample later.

### 3. Document upload as fallback

Document upload should not be the primary onboarding path.

### 4. Caseworker referral

Support-worker referral should be treated as a valid verification path.

### 5. Light re-verification

Suggested cadence:

```text
annually
```

or after a relevant triggering life event.

### 6. Technical capability verification

Use meter/device information or a meter-box photo where required.

---

# 19. Worked Household Examples

## Dinh — High

Profile:

- private renter,
- Low Income Household Rebate,
- own retail account on default offer,
- individual storage hot-water tank,
- no solar.

Score:

```text
A = 0
B = 25
C = 15
D = 6
Need = 46

E = 15

Priority = 61
```

At `$0.20/point`:

```text
Equity credit = $12.20/month
```

Delivery:

```text
bill credit
```

---

## Aroha — Critical

Profile:

- apartment renter,
- embedded network,
- EAPA recipient,
- instantaneous electric hot water.

Score:

```text
A = 25
B = 25
C = 15
D = 10

Need = 75

E = 0

Priority = 75
```

Credit:

```text
$15.00/month
```

Delivery:

```text
program credit
```

Aroha contributes nothing physically but can still be one of the highest earners from the Equity Pool.

---

## Sam — High

Profile:

- share house,
- three tenants,
- shared storage tank,
- one tenant holds account,
- below median income.

Score:

```text
A = 12
B = 10
C = 15
D = 6

Need = 43

E = 8

Priority = 51
```

Credit:

```text
$10.20/month each
```

Participation:

```text
site-level participation
```

Requires pass-through of benefits to residents.

---

## Maria — Standard + Solar

Profile:

- owner-occupier,
- 6.6 kW rooftop solar,
- no hardship indicators,
- storage tank.

Score:

```text
A = 0
B = 0
C = 0
D = 3

Need = 3

E = 15

Priority = 18
```

Equity credit:

```text
$3.60
```

Solar credit:

```text
$16.96
```

Total:

```text
$20.56/month
```

Most of Maria's payment is producer compensation rather than hardship support.

---

# 20. Settlement Process

Settlement occurs after program value has been verified.

Recommended sequence:

```text
Verified Program Value
        ↓
Three-Way Split
        ↓
┌───────────────────────────────┐
│ Equity Pool                   │
│ Solar Pool                    │
│ Community Reserve             │
└───────────────────────────────┘
        ↓
Equity Pool / Total Priority Points
        ↓
Per-Point Rate
        ↓
Household Equity Credits

Solar Pool / Number of Solar Owners
        ↓
Equal Solar Credit

Reserve
        ↓
Accumulate for approved uses
```

Pseudocode:

```ts
function settleProgram({
  totalVerifiedValue,
  equityPct,
  solarPct,
  communityPct,
  households,
}) {
  if (equityPct < 60) {
    throw new Error("Equity share cannot be below 60%");
  }

  if (equityPct + solarPct + communityPct !== 100) {
    throw new Error("Pool percentages must equal 100%");
  }

  const equityPool =
    totalVerifiedValue * (equityPct / 100);

  const solarPool =
    totalVerifiedValue * (solarPct / 100);

  const communityReserve =
    totalVerifiedValue * (communityPct / 100);

  const totalPriorityPoints =
    households.reduce(
      (sum, household) =>
        sum + household.priorityScore,
      0
    );

  const perPointRate =
    equityPool / totalPriorityPoints;

  const solarOwners =
    households.filter(
      household => household.hasSolar
    );

  const solarCredit =
    solarOwners.length > 0
      ? solarPool / solarOwners.length
      : 0;

  return households.map(household => ({
    ...household,

    equityCredit:
      household.priorityScore *
      perPointRate,

    solarCredit:
      household.hasSolar
        ? solarCredit
        : 0,
  }));
}
```

---

# 21. Suggested Household Data Model

Minimum implementation fields:

```ts
type Household = {
  id: string;

  factorA: number;
  factorB: number;
  factorC: number;
  factorD: number;
  factorE: number;

  needScore: number;
  contributionScore: number;
  priorityScore: number;

  needTier:
    | "critical"
    | "high"
    | "moderate"
    | "standard";

  deliveryMode:
    | "bill_credit"
    | "program_credit"
    | "voucher"
    | "debt_reduction";

  hasSolar: boolean;

  lifeSupportFlag: boolean;

  equityCredit?: number;
  solarCredit?: number;
};
```

---

# 22. Governance Data Model

```ts
type GovernancePolicy = {
  version: string;

  equityPct: number;
  solarPct: number;
  communityPct: number;

  minimumEquityPct: 60;

  effectiveDate: string;
  approvedBy: string;
};
```

Validation:

```ts
function validatePolicy(policy: GovernancePolicy) {
  if (policy.equityPct < 60) {
    return false;
  }

  return (
    policy.equityPct +
      policy.solarPct +
      policy.communityPct ===
    100
  );
}
```

---

# 23. Suggested Hackathon Seed Data

Seed approximately:

```text
300 households
```

for the Dapto East demonstration.

Suggested:

```text
90 solar households
210 non-solar households
```

Distribute households across:

- Critical
- High
- Moderate
- Standard

and across capability types:

- individual tank,
- shared tank,
- no controllable load.

The demo should contain all twelve combinations from the priority matrix rather than only a few archetypes.

---

# 24. Onboarding UI

Use five simple questions corresponding to Factors A–E.

Each question should include:

```text
Why we ask
```

as a tooltip or expandable explanation.

No question should block progress.

Every question should include:

```text
Prefer not to say
```

which should default to the conservative score defined by product policy.

---

# 25. Council / Operator UI

The council interface should show:

### Governance

- Equity Pool %
- Solar Pool %
- Community Reserve %
- policy version
- effective date

### Cohort Preview

- number of households,
- number with solar,
- number in each need tier,
- number with physical flexibility.

### Settlement Preview

Show:

```text
Total Verified Value

Equity Pool
Solar Pool
Community Reserve

Per-Point Rate

Solar Credit per Owner
```

### Fairness Check

Display:

```text
Equity Floor: PASS
```

or:

```text
Equity Floor: FAIL
```

The UI should reject a governance configuration that violates the structural Equity Floor.

---

# 26. Important Hackathon Interpretation

The project should distinguish between:

## Real logic

These should genuinely work:

- household scoring,
- need-tier calculation,
- priority score,
- pool splitting,
- per-point calculation,
- solar-owner calculation,
- settlement,
- Equity Floor assertion,
- governance validation.

## Simulated infrastructure

These may be mocked during the hackathon:

- live smart-meter readings,
- retailer integration,
- actual bill-credit delivery,
- government eligibility-token APIs,
- distribution network telemetry,
- physical hot-water control,
- real financial settlement.

The prototype should clearly label simulated inputs rather than presenting them as live integrations.

---

# 27. Key Product Principle

Sunshine Wallet should not be presented merely as:

> "A system for rewarding people who shift electricity."

The intended concept is:

> **A community energy-value distribution system where flexible-energy programs create value, contributors are compensated, and a structurally protected Equity Pool ensures households facing energy disadvantage also receive a meaningful share of that value.**

---

# 28. Known Design Question to Keep Visible

The modelled `60 / 35 / 5` split creates a possible perception issue:

A Standard-tier solar owner may receive more overall than a Critical-need apartment renter because solar compensation is a separate producer payment.

The source document treats this as a conscious governance decision rather than an accidental result.

Possible policy alternatives identified in the source include:

```text
65 / 30 / 5
```

or changing Equity Pool eligibility rules.

For the hackathon prototype, do not silently alter this rule.

If the split is configurable, preserve the minimum:

```text
equityPct >= 60
```

and clearly distinguish:

```text
Equity support
```

from:

```text
Solar producer compensation
```

---

# 29. Implementation Priorities for Coding Agent

## P0 — Must Work

- [ ] Household priority-score calculation
- [ ] Need-tier calculation
- [ ] Governance split validation
- [ ] Equity Pool calculation
- [ ] Solar Pool calculation
- [ ] Community Reserve calculation
- [ ] Per-point rate calculation
- [ ] Per-household settlement
- [ ] Solar-owner flat payment
- [ ] Equity Floor automated assertion
- [ ] Seed demo households
- [ ] Settlement preview UI

## P1 — High Value

- [ ] Five-question onboarding
- [ ] Cohort distribution dashboard
- [ ] Governance percentage editor
- [ ] PASS / FAIL Equity Floor indicator
- [ ] Worked household comparison
- [ ] Explainability text for every score
- [ ] Simulated settlement history

## P2 — Only If Time Remains

- [ ] Eligibility-token mock workflow
- [ ] Document upload fallback
- [ ] Caseworker referral workflow
- [ ] Community Reserve voting screen
- [ ] Historical monthly reports
- [ ] Advanced resource/device integration

## Do Not Build for Hackathon Unless Required

- [ ] Real retailer billing integration
- [ ] Real government eligibility API
- [ ] Live smart-meter integration
- [ ] Real monetary transfers
- [ ] Real DER/device control
- [ ] Production-grade identity verification
- [ ] Complex microservice architecture

---

# 30. Agent Instruction

When implementing this specification:

1. Preserve the distinction between **energy/flexibility operations** and **financial value distribution**.
2. Do not treat `eligibleResources`, `availableFlexEnergyKwh`, or `targetFlexEnergyKwh` as household priority values.
3. Do not treat the Solar Pool as hardship support.
4. Keep the Equity Pool minimum at 60% unless the underlying specification is intentionally changed.
5. Keep household need scoring explainable and deterministic.
6. Make simulated data visibly identifiable as simulated.
7. Prefer an end-to-end working demo over production architecture.
8. Do not introduce AI/ML unless there is a clear requirement.
9. Do not silently invent additional scoring factors.
10. Do not modify the business rules merely to make demo numbers look better; surface inconsistencies for review instead.

---

## Source

**Sunshine Wallet · Energy Equity Challenge — Value Split & Priority Scheme**

Modelled estimates based on a Dapto-scale feeder.
