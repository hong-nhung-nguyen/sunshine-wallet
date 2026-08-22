import type {
  DispatchPlan,
  EventResourceSelection,
  Provenance,
} from "@/lib/types";

export interface OptimisationCandidate {
  resourceId: string;
  eligible: boolean;
  capacityKw: number;
  maxShiftEnergyKwh: number;
  networkEffectiveness: number;
  equityNeed: number;
  controllability: number;
  rotationFairness: number;
}

export interface OptimisationConstraints {
  eventId: string;
  targetFlexEnergyKwh: number;
  maxPowerKw: number;
  windowDurationHours: number;
}

export interface ScoredCandidate extends OptimisationCandidate {
  rank: number;
  score: number;
  scoreBreakdown: {
    networkEffectiveness: number;
    equityNeed: number;
    controllability: number;
    rotationFairness: number;
  };
}

export interface OptimisationResult {
  status: "optimised" | "insufficient_flexibility";
  selections: EventResourceSelection[];
  dispatchPlans: DispatchPlan[];
  rankedCandidates: ScoredCandidate[];
  excludedResourceIds: string[];
  totalPlannedEnergyKwh: number;
  totalPlannedPowerKw: number;
  targetFlexEnergyKwh: number;
  shortfallEnergyKwh: number;
  explanation: string;
}

const provenance: Provenance = {
  source: "operator_review",
  notes: "Deterministic weighted score and constraint-based dispatch plan",
};

const round = (value: number) => Math.round(value * 100) / 100;

export function scoreOptimisationCandidate(
  candidate: OptimisationCandidate,
): Omit<ScoredCandidate, "rank"> {
  const breakdown = {
    networkEffectiveness: candidate.networkEffectiveness * 0.35,
    equityNeed: candidate.equityNeed * 0.3,
    controllability: candidate.controllability * 0.2,
    rotationFairness: candidate.rotationFairness * 0.15,
  };
  return {
    ...candidate,
    score: round(
      Object.values(breakdown).reduce((total, value) => total + value, 0),
    ),
    scoreBreakdown: Object.fromEntries(
      Object.entries(breakdown).map(([key, value]) => [key, round(value)]),
    ) as ScoredCandidate["scoreBreakdown"],
  };
}

export function optimiseDispatchPlan(
  candidates: readonly OptimisationCandidate[],
  constraints: OptimisationConstraints,
): OptimisationResult {
  if (
    constraints.targetFlexEnergyKwh <= 0 ||
    constraints.maxPowerKw <= 0 ||
    constraints.windowDurationHours <= 0
  )
    throw new Error("Optimisation constraints must be greater than zero");

  const excludedResourceIds = candidates
    .filter((candidate) => !candidate.eligible)
    .map((candidate) => candidate.resourceId)
    .sort();
  const rankedCandidates = candidates
    .filter((candidate) => candidate.eligible)
    .map(scoreOptimisationCandidate)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.resourceId.localeCompare(right.resourceId),
    )
    .map((candidate, index) => ({ ...candidate, rank: index + 1 }));

  const selections: EventResourceSelection[] = [];
  const dispatchPlans: DispatchPlan[] = [];
  let remainingEnergyKwh = constraints.targetFlexEnergyKwh;
  let remainingPowerKw = constraints.maxPowerKw;

  for (const candidate of rankedCandidates) {
    if (remainingEnergyKwh <= 0 || remainingPowerKw <= 0) break;
    const availablePowerKw = Math.min(candidate.capacityKw, remainingPowerKw);
    const energyAllowedByPowerKwh =
      availablePowerKw * constraints.windowDurationHours;
    const plannedEnergyKwh = round(
      Math.min(
        candidate.maxShiftEnergyKwh,
        energyAllowedByPowerKwh,
        remainingEnergyKwh,
      ),
    );
    if (plannedEnergyKwh <= 0) continue;
    const plannedPowerKw = round(
      Math.min(
        availablePowerKw,
        plannedEnergyKwh / constraints.windowDurationHours,
      ),
    );
    selections.push({
      id: `selection_${constraints.eventId}_${candidate.resourceId}`,
      eventId: constraints.eventId,
      resourceId: candidate.resourceId,
      selectionRank: candidate.rank,
      score: candidate.score / 100,
      recommendedPowerKw: plannedPowerKw,
      recommendedEnergyKwh: plannedEnergyKwh,
      status: "selected",
      provenance,
    });
    dispatchPlans.push({
      id: `plan_${constraints.eventId}_${candidate.resourceId}`,
      eventId: constraints.eventId,
      resourceId: candidate.resourceId,
      plannedPowerKw,
      plannedEnergyKwh,
      status: "planned",
      provenance,
    });
    remainingEnergyKwh = round(remainingEnergyKwh - plannedEnergyKwh);
    remainingPowerKw = round(remainingPowerKw - plannedPowerKw);
  }

  const totalPlannedEnergyKwh = round(
    dispatchPlans.reduce((total, plan) => total + plan.plannedEnergyKwh, 0),
  );
  const totalPlannedPowerKw = round(
    dispatchPlans.reduce((total, plan) => total + plan.plannedPowerKw, 0),
  );
  const shortfallEnergyKwh = round(
    Math.max(constraints.targetFlexEnergyKwh - totalPlannedEnergyKwh, 0),
  );
  const status =
    shortfallEnergyKwh === 0 ? "optimised" : "insufficient_flexibility";

  return {
    status,
    selections,
    dispatchPlans,
    rankedCandidates,
    excludedResourceIds,
    totalPlannedEnergyKwh,
    totalPlannedPowerKw,
    targetFlexEnergyKwh: constraints.targetFlexEnergyKwh,
    shortfallEnergyKwh,
    explanation:
      status === "optimised"
        ? "Eligible resources were ranked by score and scheduled only until the target was met."
        : `Eligible resources cannot meet the target under the ${constraints.maxPowerKw} kW power limit.`,
  };
}
