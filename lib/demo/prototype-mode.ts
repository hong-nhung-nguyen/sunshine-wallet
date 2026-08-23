import { verifyContributor } from "@/lib/engine/contributor-verification";

/**
 * Prototype mode for the contributor onboarding walk-through.
 *
 * The mocked registry refuses a fair share of NMIs on purpose — no export
 * approval, nothing on the small-scale registry, a system larger than the
 * network agreed to. That is right for the engine, and the engine's tests
 * depend on those refusals existing. It is wrong for a five-minute demo,
 * where a dead end just means the walk-through stops.
 *
 * So the refusal paths stay exactly as they are, and this module makes the
 * onboarding page fall back to a system that does clear every gate. Set
 * `PROTOTYPE_ALWAYS_CONFIRMS` to false to walk the real refusals again.
 */

export const PROTOTYPE_ALWAYS_CONFIRMS = true;

/**
 * The first synthetic NMI that clears every gate. Found once at import, from
 * the same deterministic mocks the engine reads, so it never drifts from
 * whatever the adapters currently return.
 */
export const demoVerifiableNmi = ((): string => {
  for (let index = 0; index < 20000; index += 1) {
    const nmi = `NDEMO${String(index).padStart(5, "0")}`;
    const result = verifyContributor({ householdId: "hh_prototype", nmi });
    if (result.outcome === "verified") return nmi;
  }
  // Unreachable with the current mocks; a wrong NMI beats throwing at import.
  return "NDEMO00000";
})();
