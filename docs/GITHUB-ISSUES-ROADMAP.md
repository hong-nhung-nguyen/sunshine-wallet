# Sunshine Wallet — GitHub Issues Roadmap

Project: Sunshine Wallet  
Hackathon duration: 25 hours  
Team: 3 developers  
Architecture: Single responsive Next.js web app with resident and council/operator flows

## Team assignment conventions

- Dev 1: product + app structure + orchestration
- Dev 2: UI + data flow + dashboard experience
- Dev 3: engine + verification + settlement logic

Important note: Dev 3 should start later than Dev 1 and Dev 2 by about 4–6 hours so they can join the engine-heavy work once the shared model and app structure are stable. This reduces coordination overhead and keeps the early sprint focused on scaffolding and UX.

---

## Milestone plan

### Milestone 1 — Foundation and shared contract
Target: Hours 0–6

Goal: lock the project architecture, shared domain model, and basic UI shell before the engine work begins.

### Milestone 2 — Resident + operator experience and demo data
Target: Hours 6–13

Goal: get the app screens and mock data working, plus the event lifecycle UI and resident/council views.

### Milestone 3 — Engine, optimisation, and M&V
Target: Hours 13–20

Goal: implement the deterministic event logic for resource selection, simulation, verification, and attribution.

### Milestone 4 — Settlement, equity logic, and demo polish
Target: Hours 20–25

Goal: close the end-to-end loop with wallet credits, fairness policy, and final presentation polish.

---

## GitHub issue roadmap

| Issue # | Milestone | Title | Summary | Dev 1 | Dev 2 | Dev 3 | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| #1 | M1 | Project bootstrap and repo setup | Create repo structure, Next.js app, shared config, docs, gitignore, and initial scripts | Primary | Secondary | Support | Dev 3 joins after initial scaffold |
| #2 | M1 | Shared domain model and seed data | Build the canonical TypeScript model, mock residents, resources, cells, events, and settlement records | Secondary | Primary | Support | Dev 3 joins once model is stable |
| #3 | M1 | Resident app shell and navigation | Create resident wallet page, event list, and basic responsive layout | Primary | Secondary | Support | UI skeleton |
| #4 | M1 | Council/operator app shell and navigation | Create operator dashboard, event panels, and data overview page | Secondary | Primary | Support | Dashboard structure |
| #5 | M2 | Resident contributor event flow | Build consent, pause/accept event states, and resident-side explainability | Primary | Secondary | Support | Dev 3 starts here or slightly later |
| #6 | M2 | Council event creation and event detail view | Add event creation, window selection, and event detail screens | Secondary | Primary | Support | Requires seeded data |
| #7 | M2 | Resource eligibility and dashboard cards | Show candidate resources, compatibility, capacity, and status cards | Secondary | Primary | Support | Useful for UI validation |
| #8 | M3 | Event window selection logic | Implement the logic to decide a useful Sunshine event window | Primary | Support | Primary | Dev 3 becomes core owner here |
| #9 | M3 | Resource eligibility engine | Implement compatibility checks, window checks, and dispatchability rules | Secondary | Support | Primary | Engine-heavy task |
| #10 | M3 | Optimiser and dispatch plan generation | Build deterministic resource scoring and selection algorithm | Secondary | Support | Primary | Critical path |
| #11 | M3 | Event simulation engine | Estimate baseline vs observed change, energy shift, and expected response | Support | Support | Primary | Dev 3 leads |
| #12 | M3 | M&V and confidence gate | Compare actual vs baseline, validate response, and determine pass/fail gate | Support | Support | Primary | Must be deterministic and explainable |
| #13 | M3 | Contributor attribution engine | Allocate verified response to contributors and compute shares | Support | Support | Primary | Strong engine dependency |
| #14 | M4 | Settlement and Equity Floor logic | Calculate total value, equity credit, contributor reward, and fairness rules | Primary | Support | Primary | High-risk final logic |
| #15 | M4 | Wallet posting and statement pages | Post credits to resident wallets and render wallet balances/history | Primary | Primary | Support | Integrates with settlement |
| #16 | M4 | End-to-end event loop integration | Connect UI, API, engine, and mock systems so one event can flow end-to-end | Primary | Primary | Secondary | Final integration task |
| #17 | M4 | QA, bugfixing, and demo readiness | Fix issues, tone the narrative, validate the judge story, and final polish | Secondary | Primary | Secondary | Every dev participates |

---

## Issue breakdown by milestone

### Milestone 1 — Foundation and shared contract

#### Issue #1: Project bootstrap and repo setup
**Description**
- Initialise the Next.js app
- Configure TypeScript, Tailwind, ESLint, and project scripts
- Set up repo conventions and branch strategy
- Add README and docs placeholders

**Acceptance criteria**
- repo runs locally
- basic app shell renders
- config is stable for the team

**Assigned**
- Dev 1: primary
- Dev 2: secondary
- Dev 3: support

---

#### Issue #2: Shared domain model and seed data
**Description**
- Define canonical models for Participant, Resource, Sunshine Cell, FlexEvent, DispatchResult, Settlement, WalletTransaction
- Create mock seed data for example residents, cells, events, and flex resources
- Define event statuses and validation invariants

**Acceptance criteria**
- shared model is used by UI and engine
- seeded data supports all demo scenarios
- no model drift between frontend and backend logic

**Assigned**
- Dev 1: secondary
- Dev 2: primary
- Dev 3: support

---

#### Issue #3: Resident app shell and navigation
**Description**
- Create mobile-first resident page shell
- Add wallet, events, and status navigation
- Layout cards and summaries for the demo

**Acceptance criteria**
- resident page renders cleanly
- base navigation works
- content is readable on mobile

**Assigned**
- Dev 1: primary
- Dev 2: secondary
- Dev 3: support

---

#### Issue #4: Council/operator app shell and navigation
**Description**
- Create dashboard layout for Sunshine Cells and event management
- Add operator overview panels and scoring summaries
- Prepare event detail screen skeleton

**Acceptance criteria**
- council dashboard loads with mock data
- major sections are visible
- event flow is discoverable

**Assigned**
- Dev 1: secondary
- Dev 2: primary
- Dev 3: support

---

### Milestone 2 — Resident + operator experience and demo data

#### Issue #5: Resident contributor event flow
**Description**
- Build resident participation view
- Allow accept / pause / decline logic
- Show event explanation and expected contribution impact

**Acceptance criteria**
- resident can review an event
- state changes are reflected in the UI
- story is understandable for judges

**Assigned**
- Dev 1: primary
- Dev 2: secondary
- Dev 3: support

---

#### Issue #6: Council event creation and event detail view
**Description**
- Implement event creation flow and event screen
- Show target flexibility, cell, and time window
- Add operator explanation panels

**Acceptance criteria**
- event can be created from mock data
- event screen shows essential event metadata
- flow supports later engine integration

**Assigned**
- Dev 1: secondary
- Dev 2: primary
- Dev 3: support

---

#### Issue #7: Resource eligibility and dashboard cards
**Description**
- Show eligible resources in a viewable dashboard
- Present compatibility, power, and shift info
- Pre-emptively prepare for optimisation results

**Acceptance criteria**
- eligible resources can be enumerated and displayed
- UI explains why a resource is selected or rejected
- data matches the engine outputs

**Assigned**
- Dev 1: secondary
- Dev 2: primary
- Dev 3: support

---

### Milestone 3 — Engine, optimisation, and M&V

#### Issue #8: Event window selection logic
**Description**
- Determine useful event windows from solar/export forecast and local constraint risk
- Use a deterministic scoring system for candidate windows

**Acceptance criteria**
- event window recommendation is explainable
- window is valid and tied to a Sunshine Cell
- target flexibility is explicit in kWh

**Assigned**
- Dev 1: primary
- Dev 2: support
- Dev 3: primary

---

#### Issue #9: Resource eligibility engine
**Description**
- Implement compatibility checks for hot water, EV charging, battery, and other flexible resources
- Evaluate availability, capability, and dispatchable status

**Acceptance criteria**
- resources are filtered correctly
- rejection reasons are generated and stored
- logic is deterministic and testable

**Assigned**
- Dev 1: support
- Dev 2: support
- Dev 3: primary

---

#### Issue #10: Optimiser and dispatch plan generation
**Description**
- Rank eligible resources
- Produce a selected resource list and recommended dispatch plan
- Ensure energy target and power constraints are respected

**Acceptance criteria**
- selected set fits target constraints
- planner respects max power and target flexibility
- results are explainable in UI

**Assigned**
- Dev 1: support
- Dev 2: support
- Dev 3: primary

---

#### Issue #11: Event simulation engine
**Description**
- Simulate baseline and observed energy shift
- Estimate how much flexibility the event produced
- Measure the expected effect before verification

**Acceptance criteria**
- simulated energy outputs are consistent with the event targets
- baseline vs observed values are tracked separately
- result can be visualised in charts

**Assigned**
- Dev 1: support
- Dev 2: support
- Dev 3: primary

---

#### Issue #12: M&V and confidence gate
**Description**
- Compare planned vs actual response
- Estimate confidence score
- Determine whether the event passes the settlement gate

**Acceptance criteria**
- verification result is explicit and defendable
- confidence is numeric and bounded
- event cannot settle without passing the gate

**Assigned**
- Dev 1: support
- Dev 2: support
- Dev 3: primary

---

#### Issue #13: Contributor attribution engine
**Description**
- Attribute the verified response to each relevant participant/resource
- Prepare reward calculations before settlement
- Support both contributor reward and equity benefit distribution

**Acceptance criteria**
- attribution sum is consistent
- each participant has explainable contribution share
- downstream settlement logic receives proper values

**Assigned**
- Dev 1: support
- Dev 2: support
- Dev 3: primary

---

### Milestone 4 — Settlement, equity logic, and demo polish

#### Issue #14: Settlement and Equity Floor logic
**Description**
- Calculate total value from verified flexibility
- Apply Equity Floor and separate contributor reward from resident benefit
- Create settlement record

**Acceptance criteria**
- total value logic is consistent with event outputs
- fairness rule is explicit and visible
- program credit and contributor reward are separated properly

**Assigned**
- Dev 1: primary
- Dev 2: support
- Dev 3: primary

---

#### Issue #15: Wallet posting and statement pages
**Description**
- Post credit transactions to resident wallet balances
- Show wallet history and recent updates
- Provide post-settlement explanation for the end-user

**Acceptance criteria**
- wallet balance updates after settlement
- statement is understandable
- credit type is labelled clearly

**Assigned**
- Dev 1: primary
- Dev 2: primary
- Dev 3: support

---

#### Issue #16: End-to-end event loop integration
**Description**
- Connect all app layers into one complete demo flow
- Ensure events move from creation to verification to settlement
- Validate flow using seeded data and mock APIs

**Acceptance criteria**
- one full event path works in the app
- no missing critical transitions
- flow is coherent for demo purposes

**Assigned**
- Dev 1: primary
- Dev 2: primary
- Dev 3: secondary

---

#### Issue #17: QA, bugfixing, and demo readiness
**Description**
- Fix issues across the app and engine
- Make UI copy and flows judge-friendly
- Final pass on narrative and presentation quality

**Acceptance criteria**
- no blocking bugs
- final demo path is polished
- screenshots and live walkthrough are ready

**Assigned**
- Dev 1: secondary
- Dev 2: primary
- Dev 3: secondary

---

## Suggested delivery rhythm

### Daily rhythm for this team

- Dev 1: app structure, data contracts, integration, final QA
- Dev 2: UI screens, mock data, interaction polish, dashboard usability
- Dev 3: core engine, optimisation, simulation, verification, settlement logic

Dev 3 should not be expected to begin heavy feature work until the basic app shell and domain model are stable. That allows them to join at the moment the technical heavy-lifting begins, rather than being blocked by front-end scaffolding.

---

## Recommended GitHub milestone names

- `M1 - Foundation & Shared Contract`
- `M2 - Resident & Operator Experience`
- `M3 - Engine, Optimisation & M&V`
- `M4 - Settlement, Equity & Demo Readiness`

---

## Recommended labels

- `backend`
- `frontend`
- `engine`
- `ui`
- `demo`
- `mvp`
- `verification`
- `settlement`
- `equity`
- `blocked`
- `ready-for-demo`

---

## Final recommendation

This issue structure keeps the app simple but still honest to the project’s technical needs:

- Dev 1 handles coordination and integration
- Dev 2 owns resident/operator experience and product quality
- Dev 3 owns the engine-heavy logic once the model and app shell are in place

This is a realistic 25-hour plan and keeps the critical path focused on the actual demonstration: identify the event, select the resources, verify the actual impact, and allocate value fairly.
