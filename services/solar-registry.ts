import { chance, hash32, intBetween, numberBetween } from "./contracts";

/**
 * adapter:solar-registry — proving a contributor actually has solar.
 *
 * A self-declared "I have panels" cannot be paid from the Solar Pool: the pool
 * is producer compensation, and paying it on an unverified claim is the same
 * failure as crediting unverified flexibility. Three independent sources are
 * checked, mirroring how this works in Australia:
 *
 * 1. **Grid connection approval** — the DNSP (here Endeavour Energy) approved
 *    an inverter to export on that NMI. Without this the system is either not
 *    connected or is operating outside its agreement.
 * 2. **Small-scale registry** — the system was registered when its certificates
 *    were created (the Clean Energy Regulator's STC process). This carries the
 *    install date, system size and the inverter serial.
 * 3. **Approved product list** — the inverter model appears on the Clean Energy
 *    Council list, so the hardware is what the registration claims.
 *
 * Serial numbers identify a specific system and a specific installer's work, so
 * nothing here returns a raw serial to the caller. Lookups take one and give
 * back a salted hash, which is enough to detect the same system being enrolled
 * twice without storing the number itself.
 *
 * Everything is simulated and deterministic — see `contracts.ts`.
 */

export interface GridConnectionRecord {
  nmi: string;
  dnsp: string;
  approved: boolean;
  approvedAt: string;
  /** What the connection agreement permits, kW. */
  exportLimitKw: number;
}

export type RegistrationStatus = "active" | "superseded" | "decommissioned";

export interface SolarRegistration {
  /** Registry reference, safe to store. Not a serial number. */
  registrationId: string;
  nmi: string;
  installedAt: string;
  systemSizeKw: number;
  inverterModel: string;
  /** Salted hash of the inverter serial — never the serial itself. */
  inverterSerialHash: string;
  status: RegistrationStatus;
}

export interface ApprovedProduct {
  model: string;
  approved: boolean;
  maxSystemKw: number;
}

const DNSP = "Endeavour Energy";

const INVERTER_MODELS = [
  "Fronius Primo 5.0-1",
  "SMA Sunny Boy 5.0",
  "Sungrow SG5.0RS",
  "GoodWe DNS 5kW",
  "Fimer UNO-DM-5.0",
] as const;

/**
 * A salted, truncated hash. Enough to spot the same system enrolled twice;
 * not enough to recover the serial. A real deployment would use a keyed HMAC
 * with the key held outside the application database.
 */
export function hashSerial(serial: string): string {
  const normalised = serial.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!normalised) return "";
  return `sha:${hash32("sunshine-wallet-serial-salt", normalised)
    .toString(16)
    .padStart(8, "0")}`;
}

/** Inverter serials are alphanumeric and at least eight characters. */
export function isPlausibleSerial(serial: string): boolean {
  return /^[A-Za-z0-9-]{8,24}$/.test(serial.trim());
}

export function lookupGridConnection(nmi: string): GridConnectionRecord | null {
  const key = nmi.trim().toUpperCase();
  if (!key) return null;
  // Roughly one in seven NMIs has no export approval on file: either the
  // system was never connected, or it is connected without an agreement.
  if (chance(0.14, "grid-approval", key)) return null;
  return {
    nmi: key,
    dnsp: DNSP,
    approved: true,
    approvedAt: `20${intBetween(18, 25, "grid-year", key)}-0${intBetween(1, 9, "grid-month", key)}-1${intBetween(0, 9, "grid-day", key)}`,
    exportLimitKw: numberBetween(3, 10, 1, "export-limit", key),
  };
}

export function lookupRegistrationByNmi(nmi: string): SolarRegistration | null {
  const key = nmi.trim().toUpperCase();
  if (!key) return null;
  // One in five has no small-scale registration against the address.
  if (chance(0.2, "registry", key)) return null;
  const model =
    INVERTER_MODELS[hash32("model", key) % INVERTER_MODELS.length];
  const status: RegistrationStatus = chance(0.08, "decommissioned", key)
    ? "decommissioned"
    : chance(0.06, "superseded", key)
      ? "superseded"
      : "active";
  return {
    registrationId: `SRES-${hash32("reg", key).toString(16).toUpperCase().slice(0, 7)}`,
    nmi: key,
    installedAt: `20${intBetween(15, 25, "install-year", key)}-0${intBetween(1, 9, "install-month", key)}-2${intBetween(0, 8, "install-day", key)}`,
    systemSizeKw: numberBetween(2.5, 13.2, 1, "size", key),
    inverterModel: model,
    inverterSerialHash: hashSerial(`${key}-INV-${hash32("serial", key)}`),
    status,
  };
}

/**
 * The serial route, for a household whose NMI is not on the registry — a
 * system registered against a previous owner or a mistyped address. Returns
 * the registration the serial belongs to, which may sit on a different NMI.
 */
export function lookupRegistrationBySerial(
  serial: string,
): SolarRegistration | null {
  if (!isPlausibleSerial(serial)) return null;
  const digest = hashSerial(serial);
  if (chance(0.25, "serial-miss", digest)) return null;
  const model =
    INVERTER_MODELS[hash32("serial-model", digest) % INVERTER_MODELS.length];
  return {
    registrationId: `SRES-${hash32("serial-reg", digest).toString(16).toUpperCase().slice(0, 7)}`,
    nmi: `NMI${hash32("serial-nmi", digest).toString().slice(0, 7)}`,
    installedAt: `20${intBetween(15, 25, "s-year", digest)}-0${intBetween(1, 9, "s-month", digest)}-1${intBetween(0, 9, "s-day", digest)}`,
    systemSizeKw: numberBetween(2.5, 13.2, 1, "s-size", digest),
    inverterModel: model,
    inverterSerialHash: digest,
    status: chance(0.1, "s-decom", digest) ? "decommissioned" : "active",
  };
}

export function checkApprovedProduct(model: string): ApprovedProduct {
  const known = INVERTER_MODELS.includes(
    model as (typeof INVERTER_MODELS)[number],
  );
  return {
    model,
    approved: known,
    maxSystemKw: known ? 13.2 : 0,
  };
}

/**
 * Systems already enrolled in the program, by serial hash. A single physical
 * system must not be enrolled twice — that is the solar equivalent of the
 * duplicate-enrolment failure Layer 1A checks for.
 */
const enrolledSerialHashes = new Set<string>();

export function isSerialAlreadyEnrolled(serialHash: string): boolean {
  return enrolledSerialHashes.has(serialHash);
}

export function markSerialEnrolled(serialHash: string): void {
  if (serialHash) enrolledSerialHashes.add(serialHash);
}

export function resetEnrolledSerials(): void {
  enrolledSerialHashes.clear();
}
