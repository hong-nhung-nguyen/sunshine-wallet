import {
  flexEventSchema,
  flexibleResourceSchema,
  participantSchema,
  settlementSchema,
  sunshineCellSchema,
  verificationRecordSchema,
  type SunshineWalletData,
} from "@/lib/types";

export class SeedDataValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid Sunshine Wallet data:\n- ${issues.join("\n- ")}`);
    this.name = "SeedDataValidationError";
  }
}

function duplicateIds(records: readonly { id: string }[]): string[] {
  const seen = new Set<string>();
  return records.flatMap(({ id }) =>
    seen.has(id) ? [id] : (seen.add(id), []),
  );
}

export function validateSunshineWalletData(
  data: SunshineWalletData,
): SunshineWalletData {
  const issues: string[] = [];
  const collections = [
    ["participants", data.participants, participantSchema],
    ["sunshineCells", data.sunshineCells, sunshineCellSchema],
    ["flexibleResources", data.flexibleResources, flexibleResourceSchema],
    ["flexEvents", data.flexEvents, flexEventSchema],
    ["verificationRecords", data.verificationRecords, verificationRecordSchema],
    ["settlements", data.settlements, settlementSchema],
  ] as const;

  for (const [name, records, schema] of collections) {
    records.forEach((record, index) => {
      const result = schema.safeParse(record);
      if (!result.success)
        issues.push(
          `${name}[${index}]: ${result.error.issues.map((issue) => issue.message).join(", ")}`,
        );
    });
    const duplicates = duplicateIds(records);
    if (duplicates.length)
      issues.push(`${name} contains duplicate IDs: ${duplicates.join(", ")}`);
  }

  const participantIds = new Set(data.participants.map(({ id }) => id));
  const cellIds = new Set(data.sunshineCells.map(({ id }) => id));
  const resourceIds = new Set(data.flexibleResources.map(({ id }) => id));
  const eventIds = new Set(data.flexEvents.map(({ id }) => id));
  const verificationById = new Map(
    data.verificationRecords.map((record) => [record.id, record]),
  );

  data.flexibleResources.forEach((resource) => {
    if (!participantIds.has(resource.participantId))
      issues.push(
        `${resource.id} references missing participant ${resource.participantId}`,
      );
    if (!cellIds.has(resource.locationId))
      issues.push(
        `${resource.id} references missing cell ${resource.locationId}`,
      );
  });
  data.flexEvents.forEach((event) => {
    if (!cellIds.has(event.sunshineCellId))
      issues.push(
        `${event.id} references missing cell ${event.sunshineCellId}`,
      );
  });
  [
    ...data.eventResourceSelections,
    ...data.dispatchPlans,
    ...data.dispatchResults,
  ].forEach((record) => {
    if (!eventIds.has(record.eventId))
      issues.push(`${record.id} references missing event ${record.eventId}`);
    if (!resourceIds.has(record.resourceId))
      issues.push(
        `${record.id} references missing resource ${record.resourceId}`,
      );
  });
  data.contributorAttributions.forEach((record) => {
    if (!eventIds.has(record.eventId))
      issues.push(`${record.id} references missing event ${record.eventId}`);
    if (!resourceIds.has(record.resourceId))
      issues.push(
        `${record.id} references missing resource ${record.resourceId}`,
      );
    if (!participantIds.has(record.participantId))
      issues.push(
        `${record.id} references missing participant ${record.participantId}`,
      );
  });
  data.walletTransactions.forEach((record) => {
    if (!participantIds.has(record.participantId))
      issues.push(
        `${record.id} references missing participant ${record.participantId}`,
      );
    if (record.eventId && !eventIds.has(record.eventId))
      issues.push(`${record.id} references missing event ${record.eventId}`);
  });
  data.settlements.forEach((settlement) => {
    const verification = verificationById.get(settlement.verificationRecordId);
    if (!eventIds.has(settlement.eventId))
      issues.push(
        `${settlement.id} references missing event ${settlement.eventId}`,
      );
    if (!verification)
      issues.push(
        `${settlement.id} references missing verification ${settlement.verificationRecordId}`,
      );
    else if (
      !verification.settlementGatePassed ||
      verification.verificationStatus !== "passed"
    )
      issues.push(
        `${settlement.id} cannot settle without a passed verification gate`,
      );
    else if (verification.eventId !== settlement.eventId)
      issues.push(
        `${settlement.id} and ${verification.id} reference different events`,
      );
  });

  for (const event of data.flexEvents) {
    const shares = data.contributorAttributions
      .filter(({ eventId }) => eventId === event.id)
      .reduce((sum, item) => sum + item.shareOfVerifiedResponse, 0);
    if (shares > 0 && Math.abs(shares - 1) > 0.001)
      issues.push(`${event.id} attribution shares total ${shares}, expected 1`);
  }

  if (issues.length) throw new SeedDataValidationError(issues);
  return data;
}
