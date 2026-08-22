import { z } from "zod";

const isoTimestamp = z.iso.datetime({ offset: true });
const confidence = z.number().min(0).max(1);
const nonNegative = z.number().finite().nonnegative();
const positive = z.number().finite().positive();

export const provenanceSchema = z.object({
  source: z.enum([
    "simulated_network_forecast",
    "meter_reading",
    "device_acknowledgement",
    "manual_override",
    "retailer_settlement",
    "operator_review",
  ]),
  confidence: confidence.optional(),
  assumptions: z.array(z.string().min(1)).optional(),
  notes: z.string().min(1).optional(),
  updatedAt: isoTimestamp.optional(),
});

export const timeWindowSchema = z
  .object({ start: isoTimestamp, end: isoTimestamp })
  .refine(({ start, end }) => Date.parse(start) < Date.parse(end), {
    message: "Event window end must follow its start.",
    path: ["end"],
  });

export const participantSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["resident", "contributor", "operator", "council"]),
  name: z.string().min(1),
  email: z.email().optional(),
  householdType: z
    .enum(["renter", "owner", "social_housing", "mixed_household"])
    .optional(),
  equityTier: z.enum(["priority", "standard", "premium"]).optional(),
  locationId: z.string().min(1).optional(),
  walletBalance: nonNegative.optional(),
  consentStatus: z
    .enum(["not_requested", "accepted", "declined", "paused"])
    .optional(),
  createdAt: isoTimestamp,
  updatedAt: isoTimestamp.optional(),
  provenance: provenanceSchema.optional(),
});

export const sunshineCellSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1),
  region: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  constraintRisk: z.enum(["low", "medium", "high"]),
  solarExportPotentialKwh: nonNegative.optional(),
  forecastWindow: timeWindowSchema,
  demandProfile: z
    .enum(["normal", "constraint", "peak", "available"])
    .optional(),
  createdAt: isoTimestamp,
  provenance: provenanceSchema.optional(),
});

export const meterReadingSchema = z.object({
  id: z.string().min(1),
  resourceId: z.string().min(1),
  timestamp: isoTimestamp,
  actualPowerKw: z.number().finite(),
  actualEnergyKwh: z.number().finite(),
  baselineEnergyKwh: nonNegative.optional(),
  observedEnergyKwh: nonNegative.optional(),
  source: z.enum(["smart_meter", "simulated", "mock_adapter"]),
  provenance: provenanceSchema.optional(),
});

export const flexibleResourceSchema = z.object({
  id: z.string().min(1),
  participantId: z.string().min(1),
  resourceType: z.enum([
    "hot_water",
    "battery",
    "ev_charger",
    "community_load",
    "solar_export",
    "pool_pump",
    "hvac",
    "other",
  ]),
  name: z.string().min(1),
  description: z.string().optional(),
  locationId: z.string().min(1),
  capacityKw: positive,
  maxShiftEnergyKwh: nonNegative,
  dispatchable: z.boolean(),
  status: z.enum([
    "available",
    "reserved",
    "dispatched",
    "paused",
    "offline",
    "pending_review",
  ]),
  eligibility: z
    .object({
      eligible: z.boolean(),
      reasons: z.array(z.string()),
      confidence,
      checkedAt: isoTimestamp.optional(),
    })
    .optional(),
  lastKnownMeterReading: meterReadingSchema.optional(),
  createdAt: isoTimestamp,
  updatedAt: isoTimestamp.optional(),
  provenance: provenanceSchema.optional(),
});

export const flexEventSchema = z
  .object({
    id: z.string().min(1),
    sunshineCellId: z.string().min(1),
    name: z.string().optional(),
    status: z.enum([
      "draft",
      "ready",
      "optimised",
      "simulated",
      "verified",
      "settled",
      "rejected",
    ]),
    window: timeWindowSchema,
    targetFlexEnergyKwh: positive,
    maxPowerKw: positive,
    maxShiftEnergyKwh: nonNegative,
    confidence,
    equityFloor: confidence,
    createdAt: isoTimestamp,
    updatedAt: isoTimestamp.optional(),
    provenance: provenanceSchema.optional(),
  })
  .refine(
    ({ targetFlexEnergyKwh, maxShiftEnergyKwh }) =>
      maxShiftEnergyKwh >= targetFlexEnergyKwh,
    {
      message: "Maximum shift energy must meet or exceed the target.",
      path: ["maxShiftEnergyKwh"],
    },
  );

export const verificationRecordSchema = z.object({
  id: z.string().min(1),
  eventId: z.string().min(1),
  verificationStatus: z.enum(["pending", "passed", "failed", "partial"]),
  baselineReference: z.string().min(1),
  verifiedFlexEnergyKwh: nonNegative,
  confidenceScore: confidence,
  settlementGatePassed: z.boolean(),
  details: z.array(z.string()).optional(),
  createdAt: isoTimestamp,
  provenance: provenanceSchema.optional(),
});

export const settlementSchema = z
  .object({
    id: z.string().min(1),
    eventId: z.string().min(1),
    verificationRecordId: z.string().min(1),
    verifiedFlexEnergyKwh: nonNegative,
    totalValue: nonNegative,
    contributorRewards: nonNegative,
    equityCredit: nonNegative,
    communityReserve: nonNegative,
    equityFloorApplied: z.boolean(),
    status: z.enum(["pending", "calculated", "settled", "reversed"]),
    createdAt: isoTimestamp,
    updatedAt: isoTimestamp.optional(),
    provenance: provenanceSchema.optional(),
  })
  .refine(
    ({ totalValue, contributorRewards, equityCredit, communityReserve }) =>
      Math.abs(
        totalValue - contributorRewards - equityCredit - communityReserve,
      ) < 0.01,
    {
      message:
        "Contributor rewards, equity credit and reserve must equal total value.",
      path: ["totalValue"],
    },
  );
