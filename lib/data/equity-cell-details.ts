import { householdRoll } from "./households";
import { augustMonthlyLedger } from "./monthly-ledger";
import { computePriorityScore } from "@/lib/engine/priority-scheme";

export interface EquityCellHouseholdDetail {
  householdId: string;
  displayId: string;
  needScore: number;
  capabilityScore: number;
  equityScore: number;
  verifiedEnergyKwh: number;
  energyStatus:
    | "verified"
    | "dispatched_pending_verification"
    | "verification_failed"
    | "eligible_not_dispatched"
    | "not_available";
  creditCents: number;
  contributorRewardCents: number;
  totalCreditCents: number;
}

export interface EquityCellDetail {
  policyVersion: string;
  key: string;
  tier: string;
  capability: string;
  claimantCount: number;
  cellPoints: number;
  blockCents: number;
  centsPerPoint: number;
  totalVerifiedEnergyKwh: number;
  households: EquityCellHouseholdDetail[];
}

const roundEnergy = (value: number) => Math.round(value * 10) / 10;

function seededEnergy(
  householdId: string,
  capabilityScore: number,
  hasVerifiedReward: boolean,
): Pick<EquityCellHouseholdDetail, "verifiedEnergyKwh" | "energyStatus"> {
  const index = Number(householdId.match(/_(\d+)$/)?.[1] ?? 0);
  if (hasVerifiedReward)
    return {
      verifiedEnergyKwh: roundEnergy(2.8 + (index % 4) * 0.5),
      energyStatus: "verified",
    };
  if (capabilityScore === 0 || index % 5 === 4)
    return { verifiedEnergyKwh: 0, energyStatus: "not_available" };
  if (index % 4 === 1)
    return {
      verifiedEnergyKwh: 0,
      energyStatus: "dispatched_pending_verification",
    };
  if (index % 4 === 2)
    return { verifiedEnergyKwh: 0, energyStatus: "verification_failed" };
  return { verifiedEnergyKwh: 0, energyStatus: "eligible_not_dispatched" };
}

/**
 * Privacy-minimised drill-down for the deterministic demo roll. Energy
 * activity is simulated context; credits always come from monthly settlement.
 */
export function getEquityCellDetail(cellKey: string): EquityCellDetail | null {
  if (augustMonthlyLedger.settlement.status !== "settled") return null;
  const allocation = augustMonthlyLedger.settlement.allocation;
  const cell = allocation.cells.find(({ key }) => key === cellKey);
  if (!cell) return null;

  const creditByHousehold = new Map(
    allocation.credits
      .filter((credit) => credit.cellKey === cellKey)
      .map((credit) => [credit.householdId, credit]),
  );
  const contributorRewardByHousehold = new Map(
    augustMonthlyLedger.settlement.credits
      .filter((credit) => credit.branch === "1B" && credit.amountCents > 0)
      .map((credit) => [credit.householdId, credit.amountCents]),
  );
  const households = householdRoll
    .filter((household) => creditByHousehold.has(household.id))
    .map((household, index) => {
      const score = computePriorityScore(household.factors);
      const contributorRewardCents =
        contributorRewardByHousehold.get(household.id) ?? 0;
      const energy = seededEnergy(
        household.id,
        score.contribScore,
        contributorRewardCents > 0,
      );
      const creditCents = creditByHousehold.get(household.id)?.amountCents ?? 0;
      return {
        householdId: household.id,
        displayId: `${score.needTier.slice(0, 2).toUpperCase()}-${score.capabilityClass
          .split("_")
          .map((part) => part[0].toUpperCase())
          .join("")}-${String(index + 1).padStart(3, "0")}`,
        needScore: score.needScore,
        capabilityScore: score.contribScore,
        equityScore: score.needScore,
        ...energy,
        creditCents,
        contributorRewardCents,
        totalCreditCents: creditCents + contributorRewardCents,
      };
    })
    .sort(
      (left, right) =>
        right.creditCents - left.creditCents ||
        left.displayId.localeCompare(right.displayId),
    );

  return {
    policyVersion: augustMonthlyLedger.settlement.policy.version,
    key: cell.key,
    tier: cell.tier,
    capability: cell.capability,
    claimantCount: cell.claimantCount,
    cellPoints: cell.cellPoints,
    blockCents: cell.blockCents,
    centsPerPoint: cell.centsPerPoint,
    totalVerifiedEnergyKwh: roundEnergy(
      households.reduce(
        (sum, household) => sum + household.verifiedEnergyKwh,
        0,
      ),
    ),
    households,
  };
}
