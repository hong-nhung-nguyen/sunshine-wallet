import {
  checkApprovedProduct,
  isPlausibleSerial,
  isSerialAlreadyEnrolled,
  lookupGridConnection,
  lookupRegistrationByNmi,
  lookupRegistrationBySerial,
  type SolarRegistration,
} from "@/services/solar-registry";

/**
 * Contributor verification — does this household actually have solar?
 *
 * The Solar Pool is producer compensation, so enrolling a contributor on a
 * self-declared claim would pay for production nobody checked. That is the
 * same failure as crediting unverified flexibility, and the program cannot
 * defend one while refusing the other.
 *
 * Two things make this different from receiver onboarding, and they pull in
 * opposite directions:
 *
 * - **Receivers must never be blocked by a failed lookup.** A household in
 *   hardship may have no documents, so a failed eligibility check falls
 *   through to self-declaration and is still scored.
 * - **Contributors must be blocked by a failed lookup**, because the claim is
 *   about a physical asset that either exists on a registry or does not, and
 *   the money follows it.
 *
 * So this module refuses where the priority scheme forgives. What it will not
 * do is refuse *silently*: every gate returns a reason, and a household that
 * cannot pass automatically is routed to manual review with documents rather
 * than being turned away.
 */

export type VerificationGateCode =
  | "SERIAL_MALFORMED"
  | "NO_GRID_CONNECTION"
  | "NOT_ON_REGISTRY"
  | "REGISTRATION_INACTIVE"
  | "NMI_MISMATCH"
  | "PRODUCT_NOT_APPROVED"
  | "CAPACITY_EXCEEDS_APPROVAL"
  | "ALREADY_ENROLLED";

export type VerificationOutcome =
  | "verified"
  | "manual_review"
  | "rejected";

export type EvidenceRoute = "nmi_registry" | "serial_registry" | "documents";

export interface ContributorClaim {
  householdId: string;
  nmi: string;
  /** Optional. Used when the NMI is not on the registry. */
  inverterSerial?: string;
  /** The household says it has documents it can upload for manual review. */
  hasConnectionDocuments?: boolean;
  /** What the household claims, kW. Checked against the registry. */
  declaredSystemSizeKw?: number;
}

export interface VerificationGate {
  code: VerificationGateCode;
  label: string;
  passed: boolean;
  explanation: string;
}

export interface ContributorVerification {
  householdId: string;
  outcome: VerificationOutcome;
  route: EvidenceRoute | null;
  gates: VerificationGate[];
  failedCodes: VerificationGateCode[];
  /** Set only when verified. Safe to store — a hash, never a serial. */
  registrationId: string | null;
  inverterSerialHash: string | null;
  systemSizeKw: number | null;
  /** True only when the household may draw from the Solar Pool. */
  receivesSolarPool: boolean;
  summary: string;
}

const gate = (
  code: VerificationGateCode,
  label: string,
  passed: boolean,
  explanation: string,
): VerificationGate => ({ code, label, passed, explanation });

/** Tolerance between a declared system size and the registered one. */
export const SIZE_TOLERANCE_KW = 1.0;

export function verifyContributor(
  claim: ContributorClaim,
): ContributorVerification {
  const gates: VerificationGate[] = [];
  const nmi = claim.nmi.trim().toUpperCase();

  // 1. Grid connection approval — did the network agree to let it export?
  const connection = lookupGridConnection(nmi);
  gates.push(
    gate(
      "NO_GRID_CONNECTION",
      "Grid connection approval",
      Boolean(connection),
      connection
        ? `${connection.dnsp} approved export up to ${connection.exportLimitKw} kW on ${connection.approvedAt}`
        : "No export approval on file for this NMI. The system may not be connected, or may be exporting without an agreement.",
    ),
  );

  // 2. Registry — by NMI first, then by inverter serial.
  let registration: SolarRegistration | null = lookupRegistrationByNmi(nmi);
  let route: EvidenceRoute | null = registration ? "nmi_registry" : null;

  if (!registration && claim.inverterSerial) {
    if (!isPlausibleSerial(claim.inverterSerial)) {
      gates.push(
        gate(
          "SERIAL_MALFORMED",
          "Inverter serial",
          false,
          "That does not look like an inverter serial. It should be 8 to 24 letters, digits or hyphens.",
        ),
      );
    } else {
      registration = lookupRegistrationBySerial(claim.inverterSerial);
      if (registration) route = "serial_registry";
    }
  }

  gates.push(
    gate(
      "NOT_ON_REGISTRY",
      "Small-scale registry",
      Boolean(registration),
      registration
        ? `Registered as ${registration.registrationId}, ${registration.systemSizeKw} kW installed ${registration.installedAt}`
        : "No small-scale registration found for this address or serial.",
    ),
  );

  if (registration) {
    gates.push(
      gate(
        "REGISTRATION_INACTIVE",
        "Registration status",
        registration.status === "active",
        registration.status === "active"
          ? "Registration is active"
          : `Registration is ${registration.status}. A ${registration.status} system cannot earn producer compensation.`,
      ),
    );

    // A serial-route match on a different NMI means the system is registered
    // somewhere else — a previous owner, or the wrong address entered.
    if (route === "serial_registry") {
      gates.push(
        gate(
          "NMI_MISMATCH",
          "Address match",
          registration.nmi === nmi,
          registration.nmi === nmi
            ? "Serial matches the registration held against this NMI"
            : "That serial is registered against a different address. If you have moved into this home, the registration needs transferring before it can be enrolled.",
        ),
      );
    }

    const product = checkApprovedProduct(registration.inverterModel);
    gates.push(
      gate(
        "PRODUCT_NOT_APPROVED",
        "Approved product list",
        product.approved,
        product.approved
          ? `${registration.inverterModel} is on the approved product list`
          : `${registration.inverterModel} is not on the approved product list.`,
      ),
    );

    if (connection) {
      const withinApproval =
        registration.systemSizeKw <=
        connection.exportLimitKw + SIZE_TOLERANCE_KW;
      gates.push(
        gate(
          "CAPACITY_EXCEEDS_APPROVAL",
          "Capacity within approval",
          withinApproval,
          withinApproval
            ? `${registration.systemSizeKw} kW sits within the ${connection.exportLimitKw} kW export approval`
            : `${registration.systemSizeKw} kW registered against a ${connection.exportLimitKw} kW export approval. The system is larger than the network agreed to.`,
        ),
      );
    }

    gates.push(
      gate(
        "ALREADY_ENROLLED",
        "Not already enrolled",
        !isSerialAlreadyEnrolled(registration.inverterSerialHash),
        isSerialAlreadyEnrolled(registration.inverterSerialHash)
          ? "This system is already enrolled as a contributor. One physical system earns one contributor share."
          : "This system is not enrolled elsewhere",
      ),
    );

    if (claim.declaredSystemSizeKw !== undefined) {
      const drift = Math.abs(
        claim.declaredSystemSizeKw - registration.systemSizeKw,
      );
      if (drift > SIZE_TOLERANCE_KW)
        gates.push(
          gate(
            "CAPACITY_EXCEEDS_APPROVAL",
            "Declared size matches registry",
            false,
            `You entered ${claim.declaredSystemSizeKw} kW but the registry holds ${registration.systemSizeKw} kW. The registry figure is the one that counts.`,
          ),
        );
    }
  }

  const failed = gates.filter((entry) => !entry.passed);
  const failedCodes = failed.map((entry) => entry.code);

  // A household that cannot pass automatically is not turned away: if it can
  // produce connection paperwork, it goes to manual review instead.
  const onlyMissingRecords = failedCodes.every(
    (code) =>
      code === "NOT_ON_REGISTRY" ||
      code === "NO_GRID_CONNECTION" ||
      code === "SERIAL_MALFORMED",
  );

  let outcome: VerificationOutcome;
  if (failed.length === 0) outcome = "verified";
  else if (onlyMissingRecords && claim.hasConnectionDocuments)
    outcome = "manual_review";
  else outcome = "rejected";

  const summary =
    outcome === "verified"
      ? `Solar confirmed against ${route === "serial_registry" ? "the inverter serial" : "the address registration"} and the network's export approval.`
      : outcome === "manual_review"
        ? "Automatic checks could not confirm the system. Council will review the connection documents before enrolment."
        : `Cannot enrol as a contributor: ${failed[0]?.explanation ?? "verification failed"}`;

  return {
    householdId: claim.householdId,
    outcome,
    route: outcome === "manual_review" ? "documents" : route,
    gates,
    failedCodes,
    registrationId: outcome === "verified" ? registration!.registrationId : null,
    inverterSerialHash:
      outcome === "verified" ? registration!.inverterSerialHash : null,
    systemSizeKw: outcome === "verified" ? registration!.systemSizeKw : null,
    // Only a verified contributor draws from the Solar Pool. Manual review is
    // not a pass — it is a queue, and the household stays on the equity roll
    // until it clears.
    receivesSolarPool: outcome === "verified",
    summary,
  };
}
