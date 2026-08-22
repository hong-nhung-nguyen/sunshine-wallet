# AGENTS.md

## Project mission

Sunshine Wallet is a 25-hour hackathon MVP set in Wollongong's suburbs that demonstrates one complete, defensible local-energy-equity event. The product identifies a local solar opportunity, coordinates eligible flexible demand, simulates the response, verifies the result against a baseline, and allocates the resulting program value under an explicit Equity Floor.

The hero outcome is a transparent resident credit for an apartment resident who cannot install rooftop solar on the building where they live. The product addresses unequal access to the benefits of local generation; it does not claim to route particular electrons from one household to another.

## Current repository state

At the time this file was added, the repository contains planning material only:

- `README.md`: project overview and intended stack
- `docs/`: the original product, implementation, engine, API, and model PDFs
- `specs/ARCHITECTURE.md`: application boundaries and intended structure
- `specs/MODEL-CONTRACT.md`: canonical domain concepts and invariants
- `specs/API-CONTRACT.md`: HTTP payloads and lifecycle operations

There is not yet an application scaffold or package manifest. Do not assume build, lint, or test commands exist until the relevant configuration has been added.

## Instruction and contract precedence

Follow instructions in this order:

1. The user's current request.
2. This `AGENTS.md` and any more specific nested `AGENTS.md`.
3. `specs/MODEL-CONTRACT.md` for domain meanings, invariants, and ownership.
4. `specs/API-CONTRACT.md` for route and transport contracts.
5. `specs/ARCHITECTURE.md` for layering and repository structure.
6. `README.md` and the PDFs in `docs/` for product intent and background.

If documents conflict, do not silently choose or combine examples. Identify the discrepancy, select one canonical contract in the smallest possible contract change, and keep the model, API, fixtures, engine, UI, and tests aligned. Ask the user when the choice materially changes the demo story.

## Non-negotiable product truths

- Build one responsive Next.js application with resident and council/operator experiences in the same codebase.
- Keep the MVP focused on one deterministic hero Sunshine Cell and one complete event lifecycle.
- Use seeded TypeScript/JSON state first. Persistence is optional and must not block the vertical slice.
- Mock external smart-meter, DNSP/topology, device-control, and retailer-settlement systems behind explicit adapters.
- Label data honestly as real/public, estimated, simulated, mocked, or calculated. Never imply a live industry integration.
- Prefer deterministic, explainable calculations over opaque AI or unnecessary machine learning.
- The system must be able to reject a resource, block settlement, and return a no-event outcome.
- Do not claim that suburb boundaries prove electrical topology or that a contributor's exact electrons reached a recipient.
- Do not treat the prototype settlement rate as a real tariff or settled production funding arrangement.
- Store only the minimum equity eligibility result needed by the demo; do not model sensitive welfare or income records.
- Keep the equity focus narrow: the priority group is Wollongong residents without practical roof access, especially apartment residents. Do not require them to own solar, a battery, an EV, or a controllable device to receive an Equity Dividend.

## Council governance and resident recourse

- Wollongong City Council is the sole program authority in the MVP. Council sets and approves eligibility policy, the Equity Floor, allocation shares, the simulated settlement rate, event rules, and any policy changes.
- The operator experience must show the active Council-approved policy, its effective date or version, and the reason for each allocation decision.
- Residents may send complaints or request a review through a clearly displayed Council email address. The MVP does not need to build an internal complaints case-management system.
- Council reviews complaints outside the prototype and may change a decision or policy when it considers the complaint justified and a change necessary.
- When a Council decision or policy change affects a participant, create a mocked email and/or in-app notification stating what changed, why it changed, when it takes effect, and whether the participant's credit changed.
- Do not imply that allocation decisions are automated, immutable, or made by an AI. Calculations support Council decisions and must remain reviewable and explainable.

## Scope discipline

Prioritize the vertical slice:

1. Select a valid event window or return no event.
2. Apply consent, cell, compatibility, availability, safety, and comfort gates.
3. Score eligible resources and schedule only the energy needed for the target.
4. Simulate deterministic delivered response separately from planned response.
5. Establish a counterfactual baseline and verify the event with a confidence gate.
6. Attribute qualifying contributor participation without electron tracing.
7. Validate settlement policy and the Equity Floor.
8. Apply idempotent resident and contributor credits.
9. Show the result and its provenance in the operator and resident experiences.
10. Reset the demo to its deterministic starting state.

Unless the user expands scope, do not add native apps, microservices, queues, websockets, full GIS, real authentication, live grid/device/billing integrations, complex database infrastructure, or multiple fully interactive Sunshine Cells.

## Architecture boundaries

- UI components render domain results and initiate actions; they do not recalculate optimisation, verification, attribution, or settlement.
- Route handlers/server actions validate transport input and orchestrate use cases.
- The engine contains pure or tightly controlled deterministic domain functions.
- Seed data and mutable demo state stay outside UI components.
- External dependencies are accessed through mockable adapter interfaces.
- Share one canonical TypeScript domain model across UI, API, engine, fixtures, and tests. Do not create frontend-only copies of domain entities.
- Keep engine modules independently testable: window selection, eligibility, optimisation, simulation, baseline, verification, attribution, settlement, and credit application.
- Prefer the simplest implementation that preserves these boundaries.

## Domain and calculation rules

- Keep power (`kW`) distinct from energy (`kWh`). Include units in field names.
- Keep flexible loads separate from solar contributors.
- Apply hard eligibility rules before scoring. Equity weighting must never override consent, topology, compatibility, availability, comfort, or safety.
- A score determines selection order, not a resource's delivered energy.
- Scheduled, simulated actual, baseline, observed, and verified energy are separate values.
- Verification must occur before settlement.
- Use confidence as a dispatch or settlement gate unless an explicitly approved contract says otherwise.
- Exclude event days from comparable-day baseline inputs.
- Contributor attribution must be capped by the verified attributable outcome.
- Keep Equity Dividends separate from Contributor Rewards and do not double-count resident benefit.
- Use integer cents for ledger and settlement amounts. Define deterministic rounding and ensure allocations reconcile exactly.
- Enforce the Equity Floor and pool-sum invariants before creating credits.
- Credit application must be idempotent.
- Enforce lifecycle transitions in the domain/API layer; do not let the UI manufacture state.

## Canonical demo data

The planning documents contain differing example personas, identifiers, energy values, response factors, baselines, credit amounts, API prefixes, and lifecycle labels. Before implementing fixtures or business logic, freeze one canonical scenario and use it everywhere.

At minimum, the canonical fixture must define:

- participant and household identities
- Sunshine Cell ID and event timestamps/timezone
- event target and confidence thresholds
- resource set, hard-gate outcomes, scores, and response factors
- planned, actual, baseline, observed, and verified energy
- contributor export and attribution cap
- settlement rate, pool shares, Equity Floor, rounding rule, and final credits
- a Council policy version, approval/effective date, and plain-language allocation rationale
- an apartment resident without practical roof access who receives an Equity Dividend without owning a participating device
- a Council contact email and at least one mocked policy-change or decision-change notification
- lifecycle enum and endpoint naming
- provenance for every non-real input and derived output

Never tune one layer's numbers merely to make a screenshot match. Change the canonical fixture/contract and update all consumers and tests together.

## Implementation conventions

- Use strict TypeScript and avoid `any`; validate untrusted input at API boundaries.
- Represent meaningful units and money explicitly in names and types.
- Keep calculations small, named, and side-effect free where practical.
- Return machine-readable rejection/error reasons alongside plain-language explanations.
- Keep resident language reassuring and non-technical; put dollars and reasons before engineering detail.
- Keep operator views technical and auditable; expose inputs, decisions, confidence, policy, and provenance.
- Preserve accessibility and responsive behavior, especially for the mobile-style resident experience.
- Clearly explain that program value is a simulated Council-approved reward pool calculated from the verified local flexibility outcome and a demo settlement rate. Do not present it as an existing Council payment, electricity tariff, or guaranteed market revenue.
- Show a small equity-impact summary: the total value allocated, the amount and percentage reserved for residents without roof access, and the number of those residents benefiting.
- Do not introduce dependencies without a concrete MVP need.
- Preserve existing user changes and avoid broad unrelated rewrites.

## Testing expectations

Once the application is scaffolded, add tests with the corresponding behavior rather than deferring all verification. At minimum cover:

- wrong-cell, unavailable, incompatible, paused/no-consent, and unsafe resources
- partial selection of the final resource and insufficient flexibility
- deterministic repeat runs
- no-event and low-forecast-confidence behavior
- exclusion of contaminated baseline days
- low M&V confidence blocking settlement
- invalid pool totals and Equity Floor violations
- contributor attribution caps and zero-export handling
- integer-cent rounding and allocation reconciliation
- duplicate credit application/idempotency
- an equity-eligible participant without a controllable device receiving an Equity Dividend
- an apartment resident without roof access receiving a benefit under the Council-approved policy
- a Council policy or decision change producing a notification for each affected participant
- reset restoring the exact initial scenario

Run only commands actually declared by the repository. When scripts exist, run the narrowest relevant checks first, then the full lint, type-check, test, and build suite before handoff when time permits. Report commands that were not available or not run.

## Change workflow

- Read the relevant contract sections before editing implementation code.
- Treat shared models, lifecycle enums, fixtures, and calculation constants as high-conflict files.
- Keep contract changes small and update example payloads, fixtures, engine logic, UI consumers, and tests in the same change.
- Do not edit generated artifacts or source PDFs unless explicitly requested.
- Keep the main demo path runnable and deterministic after each meaningful change.
- In the final handoff, summarize behavior changed, contract decisions made, provenance/mock assumptions, and verification performed.

## Definition of done for the MVP

The MVP is complete when a reviewer can run one deterministic event set in a Wollongong suburb from opportunity selection through eligibility, optimisation, simulation, verification, attribution, settlement, and idempotent wallet crediting; see an apartment resident without roof access receive a benefit without owning energy equipment; understand the Council-approved policy and why each decision occurred; see the source and equity distribution of the simulated program value; know how to contact Council for review; see which inputs were simulated or estimated; observe credible rejection, notification, and blocked-settlement states; reset the scenario; and finish with a clear resident benefit without any misleading electricity-market claim.
