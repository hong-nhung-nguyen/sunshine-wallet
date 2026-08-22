# Sunshine Wallet

Sunshine Wallet is a local energy equity platform designed to turn constrained local solar into verified flexibility value and distribute that value fairly across the community.

The MVP focuses on one clear demo story: a local area with excess midday solar creates a temporary network constraint, eligible flexible loads respond to that constraint, the system verifies the outcome, and the resulting value is allocated with an explicit equity policy so households without rooftop solar still benefit.

---

## Project vision

The project addresses a practical issue in the energy transition: households with the resources to install rooftop solar, batteries, and smart appliances capture more direct financial benefit from renewables. Renters, apartment residents, and households under energy stress may be locked out of those gains even when they live in a solar-rich community.

Sunshine Wallet is designed to bridge that gap by:

- identifying a local network opportunity called a Sunshine Cell
- coordinating flexible demand and contribution in the right place and time
- simulating and verifying the change in network conditions
- allocating value through a transparent equity mechanism
- presenting the outcome clearly to both residents and operators

The mission is not to send electrons to a chosen household. Instead, it turns flexible demand into a verified local network resource and shares the value in a way that is explainable and defensible.

---

## Product scope

This project is a 25-hour hackathon MVP and intentionally narrows scope to a single complete event flow.

The minimum viable product includes:

- resident wallet and event participation views
- council/operator event management views
- flexible resource eligibility checks
- optimisation of resource response
- deterministic simulation of dispatch
- measurement and verification (M&V)
- settlement and equity credit allocation
- explainable audit trail and provenance metadata

The project intentionally avoids broad production complexity such as full retailer integrations, real market settlement flows, or a large multi-service architecture.

---

## The architecture in practice

The architecture is intentionally simple and intentionally safe for a small team.

### MVP architecture summary

- One responsive web app
- Resident and council/operator views in the same codebase
- Next.js app with route handlers and server actions
- Shared TypeScript data model used across frontend and backend logic
- Mocked smart meter, grid topology, device control, and settlement adapters
- Deterministic engine logic for event selection, simulation, verification, and settlement

### Frontend vs backend in this project

The project does not use a separate frontend repository or separate backend service for the hackathon MVP. Instead, it follows a single-app design where responsibilities are still separated conceptually:

- Frontend responsibilities:
  - page rendering
  - resident and council/operator UI
  - dashboards, status cards, tables, and charts
  - form inputs and user interaction flows

- Backend responsibilities:
  - route handlers and server actions
  - event selection and optimiser logic
  - baseline and simulated response calculations
  - M&V verification and settlement calculations
  - mock external integrations and provenance metadata

This matches the project brief and the repository docs: keep the core demo loop owned by a single app and make everything else read-only or mocked.

---

## Tech stack

The following stack is the intended stack for the project MVP and is consistent with the architecture brief.

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Responsive mobile-first UI patterns

### Backend / app logic

- Next.js server actions and route handlers
- Shared TypeScript domain models and schemas
- Deterministic engine functions for:
  - event-window selection
  - resource eligibility
  - optimisation scoring
  - simulated dispatch
  - M&V verification
  - contributor attribution
  - settlement and equity calculation

### Data and persistence

- seeded JSON / TypeScript data first
- optional Supabase or PostgreSQL later if needed
- mocked external system responses for:
  - smart meter readings
  - DNSP/constraint data
  - retailer settlement acknowledgement
  - device dispatch confirmation

### UI and presentation

- lightweight component system for cards, tables, and dashboards
- charting for baseline vs observed demand and credit outcomes
- clear report-style views for explainability and auditability

### Validation and quality

- TypeScript type safety
- shared contract definitions across frontend and backend
- deterministic mock data to keep the demo honest and explainable

---

## Key technical rules from the planning docs

These constraints are critical to the build:

- kW and kWh must remain distinct
- flexible demand and solar contribution are different resource categories
- planned response and actual response are separate concepts
- baseline demand and observed demand are different
- verification must happen before settlement
- equity credits and contributor rewards must be modelled separately
- the MVP should focus on one defensible DAPTO-01 style event instead of a broad feature set

---

## Expected application structure

This is the expected folder layout for the MVP, based on the project documents and architecture plan. The important point is that the project uses a single Next.js app, while still separating concerns internally between the UI layer and the logic layer.

```text
sunshine-wallet/
├── docs/
│   ├── Sunshine_Wallet_Energy_Equity_Concept.pdf
│   ├── Sunshine_Wallet_25h_Implementation_Plan.pdf
│   ├── Sunshine_Wallet_Complete_Engine_Flow.pdf
│   ├── Sunshine_Wallet_API_Contract.pdf
│   └── Sunshine_Wallet_Model_Contract.pdf
│
├── app/
│   ├── api/
│   │   ├── events/
│   │   │   └── route.ts
│   │   ├── resources/
│   │   │   └── route.ts
│   │   ├── settlement/
│   │   │   └── route.ts
│   │   └── wallet/
│   │       └── route.ts
│   ├── resident/
│   │   ├── page.tsx
│   │   ├── wallet/
│   │   │   └── page.tsx
│   │   └── events/
│   │       └── page.tsx
│   ├── council/
│   │   ├── page.tsx
│   │   ├── events/
│   │   │   └── page.tsx
│   │   └── settlement/
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   └── table.tsx
│   ├── resident/
│   │   ├── wallet-card.tsx
│   │   ├── event-summary.tsx
│   │   └── resource-status.tsx
│   ├── council/
│   │   ├── event-panel.tsx
│   │   ├── optimisation-overview.tsx
│   │   └── settlement-table.tsx
│   ├── charts/
│   │   ├── baseline-chart.tsx
│   │   └── event-impact-chart.tsx
│   └── shared/
│       ├── header.tsx
│       └── status-badge.tsx
│
├── lib/
│   ├── api/
│   │   ├── events.ts
│   │   ├── resources.ts
│   │   └── settlement.ts
│   ├── engine/
│   │   ├── event-window.ts
│   │   ├── eligibility.ts
│   │   ├── optimiser.ts
│   │   ├── simulation.ts
│   │   ├── verification.ts
│   │   ├── attribution.ts
│   │   └── settlement.ts
│   ├── data/
│   │   ├── seed.ts
│   │   ├── mock-api.ts
│   │   └── fixtures.ts
│   ├── types/
│   │   ├── models.ts
│   │   ├── event.ts
│   │   ├── resource.ts
│   │   └── settlement.ts
│   ├── utils.ts
│   └── formatters.ts
│
├── services/
│   ├── mock-meter.ts
│   ├── mock-dnsp.ts
│   └── mock-settlement.ts
│
├── public/
│   ├── icons/
│   └── images/
│
├── prisma/
│   └── schema.prisma   # optional if DB support is introduced
│
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.mjs
├── .env.example
└── .eslintrc.json
```

In this structure:

- app/ contains the frontend pages and API routes.
- components/ contains UI building blocks.
- lib/engine/ contains the backend-style decision logic.
- lib/api/ and services/ hold data access and mock integration logic.
- All of this still lives in the same Next.js application for the hackathon MVP.

---

## MVP user journeys

### Resident journey

- see wallet balance and energy credits
- view active or upcoming Sunshine events
- inspect eligibility and consent status
- understand why an event matters and what they are being asked to do
- accept or skip a flexibility event
- see the impact of participation and rewards

### Council/operator journey

- view Sunshine Cells and local forecast context
- create or select a network event
- inspect eligible flexible resources
- run optimisation and simulation
- verify dispatch performance against the baseline
- settle value and distribute credits
- review explainability and provenance for the event

---

## Demo flow summary

1. A local network constraint is identified.
2. A Sunshine Cell event is created.
3. Eligible resources are filtered and scored.
4. The optimiser chooses a reasonable response.
5. A simulation estimates the effect of dispatch.
6. M&V validates the measured result.
7. Proven value is attributed and settled.
8. Wallet credits are distributed under the equity policy.

---

## Key project documents

The project source material is in the docs folder and should be treated as the source of truth for the product and technical constraints:

- [docs/Sunshine_Wallet_Energy_Equity_Concept.pdf](docs/Sunshine_Wallet_Energy_Equity_Concept.pdf)
- [docs/Sunshine_Wallet_25h_Implementation_Plan.pdf](docs/Sunshine_Wallet_25h_Implementation_Plan.pdf)
- [docs/Sunshine_Wallet_Complete_Engine_Flow.pdf](docs/Sunshine_Wallet_Complete_Engine_Flow.pdf)
- [docs/Sunshine_Wallet_API_Contract.pdf](docs/Sunshine_Wallet_API_Contract.pdf)
- [docs/Sunshine_Wallet_Model_Contract.pdf](docs/Sunshine_Wallet_Model_Contract.pdf)

---

## Recommended next implementation steps

1. scaffold the Next.js app
2. establish the shared TypeScript domain models
3. create mock seed data for residents, resources, events, and settlements
4. build the resident wallet and operator dashboard screens
5. implement the engine functions for optimisation and verification
6. wire the end-to-end demo flow
7. validate explanation and auditability before final demo polish

This MVP is not a generic energy dashboard. It is a focused, explainable proof-of-concept showing how local solar can produce verified flexibility value and how that value can be shared more equitably within a community.
