# Sunshine Wallet — Value Split & Priority Scheme

## Current settlement policy — need and verified service are independent

This section supersedes older examples below that exclude contributors from
the Equity Pool or use Factor E to divide an Equity block.

The current Council-approved prototype rule is:

```text
Equity credit basis       = Need Score (Factors A-D only)
Contributor reward basis = verified attributed energy
Total monthly credit      = Equity credit + Contributor reward
```

- `equityEligible` is an explicit Council-approved need/access decision.
- Factor E describes physical capability for operational classification; owning
  equipment does not increase hardship support.
- An eligible household does not lose its Equity credit because its device was
  dispatched or because it earned a Contributor reward.
- Contributor rewards require verification and are proportional to aggregated
  verified contribution weight for the settlement month.
- The 60% Equity, 35% Contributor and 5% Reserve pools are fixed before
  household allocation, so receiving both credits does not count either pool
  twice.
- The same verified energy cannot be attributed twice, and wallet posting is
  idempotent per household, month and credit type.

The twelve cells remain useful for policy reporting (`need tier × capability`),
but money is divided through four Need Tier rates. Council and
resident interfaces must show Equity credit, Contributor reward and the monthly
total as separate values.

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
| Equity Pool | 60% | Distributed to participating households **who do not draw from the Solar Pool**, by priority cell then by priority score (§12) |
| Contributor Pool | 35% | Distributed by verified attributed energy; does not cancel an approved Equity entitlement |
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

Distributed across the **210 participants who are not enrolled solar contributors** — the 90 contributors are paid from the Solar Pool instead (§12.1).

The pool is divided in two stages (§12.3, §12.4):

```text
1. equity pool -> 12 cell blocks
     block = pool × (tierWeight × n) / Σ(tierWeight × n)

2. block -> households in that cell
     rate   = block / cellPoints
     credit = score × rate
```

Modelled cell rates on this roll range from `$0.1978` to `$0.4945` per point — see §13 for all twelve. There is no single feeder-wide rate.

A larger value pot makes every block larger, so every point in every cell becomes worth more.

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

Tiers drive eligibility, reporting, **and** the size of the block a household's cell draws from the Equity Pool (§12.3).

Within a block, distribution still uses the household's total priority score, so there are no jumps *inside* a tier. There is a step *between* tiers — that is the deliberate consequence of block allocation, and §12.7 sets out the assertions that keep it monotonic and reviewable.

Because tiers now carry money, the rule that they come from Factors A–D only matters more than before: **Factor E can never move a household across a tier boundary.** Capability changes a household's score within its cell, never which block it draws from.

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

The Equity Pool is **not** divided by a single global per-point rate. It is paid to every household with an approved need/access entitlement, independently of Contributor rewards.

## 12.1 Eligibility — independent need-based entitlement

```ts
equityEligible = household.equityEligible;
```

Council approval of need/access eligibility is the test. Device ownership, enrolment and dispatch do not remove that entitlement.

## 12.2 Groups — the twelve priority cells

The eligible roll is partitioned into the twelve cells of the priority matrix: four need tiers × three capability classes.

Capability class maps from Factor E:

| Factor E answer | Points | Capability class |
|---|---:|---|
| Individual storage tank on own controlled-load circuit | 15 | `individual_tank` |
| Shared/site storage tank | 8 | `shared_or_other` |
| Other controllable load — EV charger, pool pump, home battery | 4 | `shared_or_other` |
| Instantaneous electric, gas, or no controllable load | 0 | `none` |

> Factor E has four levels but the matrix has three columns. `Other controllable load` (4 points) shares the middle class with the shared tank. Their points still differ *inside* the cell, so the fold changes grouping only — it never alters a score.

## 12.3 Tier block share — tier weight × headcount

Each Need Tier takes a block of the pool proportional to its weight and claimant count. Capability cells do not receive independent financial blocks.

```ts
tierWeight = {
  critical: 4,
  high:     3,
  moderate: 2,
  standard: 1,
};

tierBlockWeight =
  tierWeight[tier] *
  tier.claimantCount;

tierBlock =
  equityPool *
  tierBlockWeight /
  totalTierBlockWeight;
```

`claimantCount` counts only equity-eligible households with `needScore > 0`. A zero-need household has no claim and adds no weight.

Tier weights are **governance policy**, versioned and votable alongside the 60/35/5 split (§17, §22). Capability has no financial weight in the Equity Pool.

## 12.4 Within a tier — divide by Need Score

```ts
tierRate =
  tierBlock /
  tierNeedPoints;

equityCredit =
  household.needScore *
  tierRate;
```

Every household in one Need Tier uses the same rate, regardless of capability. The operator console shows four financial rates and may retain twelve capability views for operational reporting.

## 12.5 What the default weights actually do

The three capability views inside a tier share one financial block and rate. The consequence is deliberate and worth stating plainly:

> **Average credit is equal across capability classes within a tier.** Factor E is operational context only and does not alter the Equity divisor.

That is the clearest reading of "need must determine equity." Verified service is compensated through the Contributor Pool, not through a larger share of hardship support.

Capability weighting is intentionally not a governance control. Verified delivery is rewarded only through the Contributor Pool.

## 12.6 Rounding

All arithmetic uses **integer cents**, distributed by largest remainder at both levels — pool → four tier blocks, then tier block → households. The invariant is exact, not approximate:

```ts
sum(allEquityCredits) === equityPoolCents;
```

If no household is eligible, the whole pool is undistributed and carries to the Community Reserve rather than being silently dropped.

## 12.7 Trade-off to keep visible

Grouping reintroduces a boundary effect the flat rate did not have. §10 justified the flat rate as avoiding "sudden payment jumps at tier boundaries" — with blocks, a household at need 59 (High) and one at need 60 (Critical) now draw from differently sized blocks.

Required mitigations:

1. Assert **monotonicity** — average credit per household must not increase as need tier falls (Critical ≥ High ≥ Moderate ≥ Standard).
2. Surface boundary pairs in the operator console so a household sitting one point below a tier line is visible to review.
3. Never let a tier boundary be crossed by a capability point. Tiers come from Factors A–D only (§10), so Factor E cannot move a household between blocks.

---

# 13. Example Priority Outcomes

Modelled on the Dapto East roll: **300 participants, 90 enrolled solar contributors excluded, 210 equity-eligible**, equity pool `$2,616.00`.

Illustrative need scores: Critical = 70 · High = 50 · Moderate = 30 · Standard = 10.

| Tier | Capability | n | Cell points | Weight | Block | Block % | Cell $/pt | Credit each |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Critical | Individual tank | 14 | 1,190 | 56 | $276.93 | 10.6% | $0.2327 | **$19.79** |
| Critical | Shared / other | 10 | 780 | 40 | $197.81 | 7.6% | $0.2536 | **$19.79** |
| Critical | None / apartment | 18 | 1,260 | 72 | $356.05 | 13.6% | $0.2826 | **$19.79** |
| High | Individual tank | 22 | 1,430 | 66 | $326.38 | 12.5% | $0.2282 | **$14.84** |
| High | Shared / other | 16 | 928 | 48 | $237.37 | 9.1% | $0.2558 | **$14.84** |
| High | None / apartment | 26 | 1,300 | 78 | $385.72 | 14.7% | $0.2967 | **$14.84** |
| Moderate | Individual tank | 25 | 1,125 | 50 | $247.26 | 9.5% | $0.2198 | **$9.90** |
| Moderate | Shared / other | 18 | 684 | 36 | $178.03 | 6.8% | $0.2603 | **$9.90** |
| Moderate | None / apartment | 22 | 660 | 44 | $217.59 | 8.3% | $0.3297 | **$9.90** |
| Standard | Individual tank | 14 | 350 | 14 | $69.23 | 2.6% | $0.1978 | **$4.95** |
| Standard | Shared / other | 11 | 198 | 11 | $54.40 | 2.1% | $0.2747 | **$4.95** |
| Standard | None | 14 | 140 | 14 | $69.23 | 2.6% | $0.4945 | **$4.95** |
| | | **210** | | **529** | **$2,616.00** | **100%** | | |

Blocks sum to the pool to the cent. Credits sum to the pool to the cent.

### Read the last two columns together

The cell rate is *highest* where capability is lowest — `$0.4945/pt` for Standard/none against `$0.1978/pt` for Standard/tank. That is the mechanism doing its job: the block is set by need and headcount, so a cell holding fewer points per household converts each point into more money. The credit column lands flat within each tier as a result.

### What changed against the old flat rate

The flat model would have produced `$0.2604/pt` across the whole roll:

| Cell | Flat rate | Grouped | Change |
|---|--:|--:|--:|
| Critical / individual tank | $22.14 | $19.79 | −$2.35 |
| Critical / none | $18.23 | $19.79 | **+$1.56** |
| High / none | $13.02 | $14.84 | **+$1.82** |
| Moderate / none | $7.81 | $9.90 | **+$2.09** |
| Standard / individual tank | $6.51 | $4.95 | −$1.56 |
| Standard / none | $2.60 | $4.95 | **+$2.35** |

The model compresses payments *within* a tier and separates them *between* tiers. Households with high need and no equipment gain; households with low need and good equipment lose. Both movements are the intended direction of travel.

### Note on these figures

The per-cell headcounts above are **modelled seed data** for the Dapto East demonstration, not observed. The rates and blocks are recomputed from the live roll at every settlement — none of the numbers in this table are constants in the system.

---

# 14. Solar Pool

Solar compensation is separate from the Equity Pool.

Eligibility:

```text
receivesSolarPool === true
```

Enrolment as a contributor, not `hasSolar`. Panels a household does not earn from make it a solar owner, not a Solar Pool recipient.

Calculation:

```ts
contributorReward =
  contributorPoolValue *
  householdVerifiedWeight /
  totalVerifiedWeight;
```

Only verification-approved contribution weights enter this calculation. A household with no verified contribution receives no Contributor reward for the period.

### An eligible household may receive both separate credits

An equity-eligible contributor retains both independently calculated entitlements.

```ts
totalHouseholdCredit =
  equityCredit + contributorReward;
```

The two pools answer different questions — *what verified service did you deliver* and *what disadvantage do you face* — and must be presented as separate wallet line items.

Enrolment is the switch, not ownership. A household with panels it does not earn from is an equity participant like any other.

**Partial-period enrolment:** only verification-approved contribution recorded while enrolled enters the monthly Contributor weight. Equity eligibility remains independent.

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
Cell = critical / none  ->  $0.2826/pt
Equity credit = $19.79
```

### Standard household with best device

```text
Need = 10
Contribution = 15
Priority = 25
Cell = standard / individual_tank  ->  $0.1978/pt
Equity credit = $4.95
```

Result:

```text
$19.79 > $4.95   (4.0x)
```

Under the old flat rate the same comparison was `$14.00 > $5.00` (2.8×). Cell grouping widens the margin, because tier weight now drives the block rather than a raw point total in which fifteen capability points counted the same as fifteen need points.

### Automated assertion

Compare the **worst case in the strongest need cell against the best case in the weakest**, not two hand-picked archetypes:

```ts
assert(
  min(creditsIn("critical", "none")) >
  max(creditsIn("standard", "individual_tank"))
);
```

Vacuously true when either cell is empty — report it as `PASS (cell empty)` rather than hiding the condition.

### Second assertion — tier monotonicity

Cell grouping makes a new failure possible that the flat rate could not produce: an unusual weight configuration or a lopsided roll inverting two adjacent tiers. Assert it directly:

```ts
assert(
  avgCredit("critical") >= avgCredit("high") &&
  avgCredit("high")     >= avgCredit("moderate") &&
  avgCredit("moderate") >= avgCredit("standard")
);
```

The governance UI must refuse any `tierWeight` edit that breaks either assertion, the same way it refuses `equityPct < 60`.

UI suggestion:

```text
Equity Floor: PASS
```

The operator interface should surface this as a visible fairness check.

---

# 16. What the Score Controls

| Output | Driven By |
|---|---|
| Equity Pool eligibility | Not drawing from the Solar Pool |
| Which equity cell you sit in | Need tier (Factors A–D) × capability class (Factor E) |
| Size of your cell's block | Tier weight × claimant headcount in that cell |
| Your share of that block | Total priority score ÷ cell points |
| Share of Solar Pool | Solar contributor enrolment only; equal flat share |
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

Cell and credit, at the §13 modelled rates:

```text
Need 46      -> tier High
Factor E 15  -> capability individual_tank
Cell         -> high / individual_tank  @ $0.2282/pt

Equity credit = 61 x $0.2282 = $13.92/month
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

Cell and credit:

```text
Need 75      -> tier Critical
Factor E 0   -> capability none
Cell         -> critical / none  @ $0.2826/pt

Equity credit = 75 x $0.2826 = $21.20/month
```

Delivery:

```text
program credit
```

Aroha contributes nothing physically and is the **highest earner from the Equity Pool** in these worked examples. Under the old flat rate she earned $15.00, below Dinh's tank-owning household on 61 points. Cell grouping is what puts her above him, and that is the entire point of the change: the critical/none cell has the largest block and the fewest points to divide it by.

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

Cell and credit:

```text
Need 43      -> tier High
Factor E 8   -> capability shared_or_other
Cell         -> high / shared_or_other  @ $0.2558/pt

Equity credit = 51 x $0.2558 = $13.05/month
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

Maria is an enrolled contributor. Her verified-service reward is calculated separately; she receives an Equity credit only if Council has also approved her need/access eligibility:

```text
receivesSolarPool = true

Equity credit = $0.00      (excluded, not scored to zero)
Solar credit  = $16.96
Total         = $16.96/month
```

Her priority score of 18 is still computed and still stored — it drives eligibility gates and reporting — but it does not draw from the Equity Pool while she is enrolled as a contributor.

Maria's payment is **entirely producer compensation**. Under the previous model she received $20.56, of which $3.60 came from the hardship pool despite no hardship indicators. That $3.60 now stays in the Equity Pool, and the 90 excluded contributors together return roughly $324 of the $2,616 to the 210 households the pool exists for.

**The comparison to keep honest:** on this roll the §28 inversion is gone — Aroha, a critical-need apartment renter with no device, receives **$21.20** against Maria's **$16.96**. Under the previous model Maria took $20.56 against Aroha's $15.00, and the ordering was the wrong way round.

That reversal is a **property of this roll, not a structural guarantee.** The Solar Pool is a flat 35% divided by contributor headcount, so if contributor numbers fall while the equity roll grows, a solar owner can overtake a critical-need household again without any rule changing. The system must therefore *report* the comparison every settlement rather than assume it:

```text
Highest equity credit  vs  solar credit per owner
```

If it inverts, that is a governance signal to revisit the 60/35/5 split (§17) — not a bug in the allocator.

---

# 20. Settlement Process

> The implementation sketch later in this section is retained as design
> history. Where it references `capabilityWeight`, `priorityScore` as the Equity
> divisor, or contributor exclusion, use the current rules at the top of this
> document and the production engine in `lib/engine/monthly-settlement.ts`.

Current order:

```text
verify monthly event value
→ split the fixed 60/35/5 pools
→ allocate Equity by explicit eligibility and Need Score
→ allocate Contributor rewards by verified contribution weight
→ post each non-zero credit type idempotently
```

Settlement occurs after program value has been verified.

Recommended sequence:

```text
Verified Program Value
        ↓
Three-Way Split
        ↓
┌───────────────────────────────┐
│ Equity Pool  │ Solar │ Reserve│
└───────────────────────────────┘
    ↓              ↓         ↓
    │              │         └─ Accumulate for approved uses
    │              │
    │              └─ Solar Pool / contributor count
    │                        ↓
    │                 Equal Solar Credit
    │                        ↓
    │                 These households are REMOVED
    │                 from the equity roll ──────┐
    │                                            │
    └─ Equity roll = participants NOT paid ←─────┘
       from the Solar Pool
                ↓
       Partition into 12 cells
       (need tier × capability class)
                ↓
       Block per cell = pool × (tierWeight × n) / Σ(tierWeight × n)
                ↓
       Cell rate = block / cell priority points
                ↓
       Household equity credit = score × cell rate
```

The order matters: **the solar roll is settled first**, because it determines who is on the equity roll. Computing them in parallel from the same household list is the classic way to pay someone twice.

Pseudocode:

```ts
function settleProgram({
  totalVerifiedValue,
  equityPct,
  solarPct,
  communityPct,
  tierWeight,
  capabilityWeight,
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

  // 1. Solar first — it decides who is on the equity roll.
  const contributors =
    households.filter(
      household => household.receivesSolarPool
    );

  const solarCredit =
    contributors.length > 0
      ? solarPool / contributors.length
      : 0;

  // 2. Equity roll excludes contributors and zero-point households.
  const equityRoll =
    households.filter(
      household =>
        !household.receivesSolarPool &&
        household.priorityScore > 0
    );

  // 3. Partition into the twelve priority cells.
  const cells = groupBy(
    equityRoll,
    household => [
      household.needTier,
      household.capabilityClass,
    ]
  );

  const cellWeight = cell =>
    tierWeight[cell.tier] *
    capabilityWeight[cell.capability] *
    cell.members.length;

  const totalWeight =
    cells.reduce(
      (sum, cell) => sum + cellWeight(cell),
      0
    );

  // 4. Block per cell, then points within the cell.
  const rates = new Map();

  for (const cell of cells) {
    const block =
      equityPool * cellWeight(cell) / totalWeight;

    const cellPoints =
      cell.members.reduce(
        (sum, household) =>
          sum + household.priorityScore,
        0
      );

    rates.set(cell.key, block / cellPoints);
  }

  return households.map(household => ({
    ...household,

    equityCredit:
      household.receivesSolarPool
        ? 0
        : household.priorityScore *
          (rates.get(cellKeyOf(household)) ?? 0),

    solarCredit:
      household.receivesSolarPool
        ? solarCredit
        : 0,
  }));
}
```

Edge cases the implementation must handle rather than divide by zero:

| Case | Behaviour |
|---|---|
| No contributors enrolled | `solarCredit = 0`; the Solar Pool carries to the Community Reserve |
| No equity-eligible households | Whole Equity Pool carries to the Community Reserve |
| A cell with zero members | Weight 0, block 0 — never appears in the divisor |
| A household with `priorityScore = 0` | Off the roll entirely; adds no weight and receives nothing |
| Rounding | Integer cents, largest remainder at both levels; `Σ credits === pool` exactly |

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

  capabilityClass:
    | "individual_tank"
    | "shared_or_other"
    | "none";

  deliveryMode:
    | "bill_credit"
    | "program_credit"
    | "voucher"
    | "debt_reduction";

  // Ownership — a physical fact about the property.
  hasSolar: boolean;

  // Enrolment — decides which pool pays this household.
  // Only this field gates Equity Pool eligibility.
  receivesSolarPool: boolean;

  lifeSupportFlag: boolean;

  equityCredit?: number;
  solarCredit?: number;
};
```

`hasSolar` and `receivesSolarPool` are **separate fields and must stay separate.** Collapsing them into one boolean is the change that would drop a social-housing tenant with landlord-owned panels out of both pools (§12.1).

`needTier` and `capabilityClass` are derived, not entered — recompute them from the factor scores at settlement rather than trusting a stored value, so a re-scored household lands in the right cell.

---

# 22. Governance Data Model

```ts
type GovernancePolicy = {
  version: string;

  equityPct: number;
  solarPct: number;
  communityPct: number;

  minimumEquityPct: 60;

  // Block weights for the twelve equity cells (§12.3).
  tierWeight: {
    critical: number;   // default 4
    high: number;       // default 3
    moderate: number;   // default 2
    standard: number;   // default 1
  };

  capabilityWeight: {
    individual_tank: number;   // default 1
    shared_or_other: number;   // default 1
    none: number;              // default 1
  };

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

  if (
    policy.equityPct +
      policy.solarPct +
      policy.communityPct !==
    100
  ) {
    return false;
  }

  // Every weight must be positive. A weight of 0 does not
  // "deprioritise" a cell — it removes those households
  // from the pool entirely, which is never the intent.
  const weights = [
    ...Object.values(policy.tierWeight),
    ...Object.values(policy.capabilityWeight),
  ];

  if (weights.some(weight => !(weight > 0))) {
    return false;
  }

  // Need must dominate contribution (§4).
  if (
    policy.tierWeight.critical <= policy.tierWeight.high ||
    policy.tierWeight.high <= policy.tierWeight.moderate ||
    policy.tierWeight.moderate <= policy.tierWeight.standard
  ) {
    return false;
  }

  return true;
}
```

Structural validation is not sufficient on its own. A policy that passes every rule above can still invert the roll in practice, because the outcome depends on headcounts as well as weights. **Re-run the settlement against the current roll and check both assertions in §15 before committing a policy change** — reject on failure, and show the operator which two cells inverted.

---

# 23. Suggested Hackathon Seed Data

Seed approximately:

```text
300 households
```

for the Dapto East demonstration.

Suggested:

```text
90 enrolled solar contributors   -> Solar Pool only
210 equity-eligible households   -> Equity Pool only
```

Seed at least one household with `hasSolar = true` and `receivesSolarPool = false` — a social-housing tenant with landlord-owned panels. That household stays on the equity roll, and it is the case that catches an implementation which gates eligibility on ownership instead of enrolment.

Every one of the twelve cells must have members, or the block allocation is never exercised. A cell left empty in the seed is a code path never run before the demo.

Suggested per-cell headcounts totalling 210 are modelled in §13.

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

Equity roll size  (participants − contributors)
Contributor count

12-cell table:
  cell · n · points · weight · block · block % · cell rate · credit each

Solar Credit per Owner
```

There is no single "Per-Point Rate" to display any more. Showing one number when twelve exist would misstate what a household is owed. If a headline figure is needed for the demo, show the **per-tier average credit** and label it an average.

The cell table is also the explainability surface: a resident asking "why this amount?" is answered by their cell's block, its divisor, and their score — three numbers, all on one row.

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

The modelled `60 / 35 / 5` split created a perception issue:

A Standard-tier solar owner could receive more overall than a Critical-need apartment renter, because solar compensation is a separate producer payment **stacked on top of** an equity credit.

**Status: addressed, not eliminated.** The source document named two possible remedies — reweighting to `65 / 30 / 5`, or changing Equity Pool eligibility rules. This specification takes the second: a household paid from the Solar Pool no longer draws from the Equity Pool (§12.1), and the equity pool is allocated by cell rather than by a flat rate (§12.3).

On the modelled Dapto East roll that reverses the ordering — Aroha $21.20 against Maria $16.96, where previously it was $15.00 against $20.56 (§19).

**What remains unresolved:**

1. The reversal is a property of the roll, not a structural guarantee. The Solar Pool is a flat 35% divided by contributor headcount; if contributors become scarce relative to the equity roll, a solar owner can overtake a critical-need household again with no rule having changed.
2. The remedy is therefore a **report, not an assertion**. Surface `highest equity credit vs. solar credit per owner` every settlement. Do not auto-correct it — an allocator that quietly reshapes pools to make a comparison look good is exactly what §30.10 forbids.
3. If it inverts persistently, the lever is the split itself (`65 / 30 / 5`), which is a community vote under §17.

Preserve the minimum in every configuration:

```text
equityPct >= 60
```

and keep the two facts visibly distinct in every surface:

```text
Equity support   ≠   Solar producer compensation
```

A household now receives exactly one of them, which makes the distinction easier to state honestly than it was when both landed on the same statement.

---

# 29. Implementation Priorities for Coding Agent

## P0 — Must Work

- [ ] Household priority-score calculation
- [ ] Need-tier calculation
- [ ] Capability-class derivation from Factor E
- [ ] Governance split validation
- [ ] Governance weight validation (positive, tier-monotonic)
- [ ] Equity roll construction — contributors and zero-point households excluded
- [ ] Twelve-cell partition
- [ ] Cell block allocation — `tierWeight × headcount`
- [ ] Cell rate and per-household credit
- [ ] Integer-cent largest-remainder rounding, both levels
- [ ] Solar Pool calculation
- [ ] Community Reserve calculation, including carry of an undistributable pool
- [ ] Solar-owner flat payment
- [ ] Equity Floor automated assertion (§15, both checks)
- [ ] Seed demo households across all twelve cells
- [ ] Settlement preview UI with the 12-cell table

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
