import type { TimeWindow } from "@/lib/types";

export type ConstraintRisk = "low" | "medium" | "high";

export interface EventWindowCandidate {
  id: string;
  sunshineCellId: string;
  window: TimeWindow;
  solarExportPotentialKwh: number;
  constraintRisk: ConstraintRisk;
  forecastConfidence: number;
  availableFlexEnergyKwh: number;
  targetFlexEnergyKwh: number;
  comfortProtected: boolean;
}

export interface ScoredEventWindow extends EventWindowCandidate {
  eligible: boolean;
  score: number;
  scoreBreakdown: {
    forecastConfidence: number;
    solarOpportunity: number;
    networkNeed: number;
    flexibilityCoverage: number;
  };
  reasons: string[];
}

export type EventWindowSelection =
  | {
      status: "recommended";
      recommended: ScoredEventWindow;
      candidates: ScoredEventWindow[];
    }
  | {
      status: "no_event";
      recommended: null;
      candidates: ScoredEventWindow[];
      reasons: string[];
    };

export const EVENT_WINDOW_RULES = {
  minimumForecastConfidence: 0.75,
  meaningfulConstraintRisks: ["medium", "high"] as const,
} as const;

export function isValidTimeWindow(window: TimeWindow): boolean {
  return Date.parse(window.start) < Date.parse(window.end);
}

function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function scoreEventWindow(
  candidate: EventWindowCandidate,
): ScoredEventWindow {
  const reasons: string[] = [];
  if (!isValidTimeWindow(candidate.window))
    reasons.push("Window end must be after window start");
  if (
    candidate.forecastConfidence < EVENT_WINDOW_RULES.minimumForecastConfidence
  )
    reasons.push("Forecast confidence is below 75%");
  if (
    !EVENT_WINDOW_RULES.meaningfulConstraintRisks.includes(
      candidate.constraintRisk as "medium" | "high",
    )
  )
    reasons.push("Network need is not significant");
  if (candidate.availableFlexEnergyKwh < candidate.targetFlexEnergyKwh)
    reasons.push("Available flexibility is below the target");
  if (!candidate.comfortProtected)
    reasons.push("Customer comfort cannot be protected");
  if (candidate.targetFlexEnergyKwh <= 0)
    reasons.push("Target flexibility must be greater than 0 kWh");

  const confidencePoints =
    Math.min(Math.max(candidate.forecastConfidence, 0), 1) * 40;
  const solarPoints =
    candidate.targetFlexEnergyKwh > 0
      ? Math.min(
          candidate.solarExportPotentialKwh /
            (candidate.targetFlexEnergyKwh * 2),
          1,
        ) * 25
      : 0;
  const networkPoints =
    candidate.constraintRisk === "high"
      ? 20
      : candidate.constraintRisk === "medium"
        ? 10
        : 0;
  const flexibilityPoints =
    candidate.targetFlexEnergyKwh > 0
      ? Math.min(
          candidate.availableFlexEnergyKwh / candidate.targetFlexEnergyKwh,
          1,
        ) * 15
      : 0;

  return {
    ...candidate,
    eligible: reasons.length === 0,
    score: roundScore(
      confidencePoints + solarPoints + networkPoints + flexibilityPoints,
    ),
    scoreBreakdown: {
      forecastConfidence: roundScore(confidencePoints),
      solarOpportunity: roundScore(solarPoints),
      networkNeed: roundScore(networkPoints),
      flexibilityCoverage: roundScore(flexibilityPoints),
    },
    reasons: reasons.length === 0 ? ["All event-window gates passed"] : reasons,
  };
}

export function selectEventWindow(
  candidates: readonly EventWindowCandidate[],
): EventWindowSelection {
  const scored = candidates
    .map(scoreEventWindow)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.window.start.localeCompare(right.window.start) ||
        left.id.localeCompare(right.id),
    );
  const recommended = scored.find((candidate) => candidate.eligible);
  if (recommended)
    return { status: "recommended", recommended, candidates: scored };
  return {
    status: "no_event",
    recommended: null,
    candidates: scored,
    reasons: [...new Set(scored.flatMap((candidate) => candidate.reasons))],
  };
}
