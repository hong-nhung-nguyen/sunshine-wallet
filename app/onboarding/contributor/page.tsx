import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  PROTOTYPE_ALWAYS_CONFIRMS,
  demoVerifiableNmi,
} from "@/lib/demo/prototype-mode";
import { verifyContributor } from "@/lib/engine/contributor-verification";
import { isValidNmi, resolveNmi } from "@/services/retailer";

export default async function ContributorOnboardingPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | undefined>>;
}>) {
  const params = await searchParams;
  const nmi = (params.nmi ?? "").trim();
  const serial = (params.serial ?? "").trim();
  const hasDocuments = params.documents === "on";
  const declaredKw = Number(params.sizeKw);
  const submitted = params.checked === "1";
  const checked = submitted && (PROTOTYPE_ALWAYS_CONFIRMS || isValidNmi(nmi));

  const entered = isValidNmi(nmi)
    ? verifyContributor({
        householdId: "hh_signup",
        nmi,
        inverterSerial: serial || undefined,
        hasConnectionDocuments: hasDocuments,
        declaredSystemSizeKw: Number.isFinite(declaredKw)
          ? declaredKw
          : undefined,
      })
    : null;

  // Prototype mode: anything the mocked registry will not confirm falls back
  // to a demo system, so the walk-through always reaches the end. The refusal
  // paths are still there — turn PROTOTYPE_ALWAYS_CONFIRMS off to see them.
  const substituted =
    checked && PROTOTYPE_ALWAYS_CONFIRMS && entered?.outcome !== "verified";
  const effectiveNmi = substituted ? demoVerifiableNmi : nmi;

  const resolution = checked ? resolveNmi(effectiveNmi) : null;
  const result = !checked
    ? null
    : substituted
      ? verifyContributor({
          householdId: "hh_signup",
          nmi: demoVerifiableNmi,
        })
      : entered;

  const tone =
    result?.outcome === "verified"
      ? "border-emerald-300 bg-emerald-50"
      : result?.outcome === "manual_review"
        ? "border-amber-300 bg-amber-50"
        : "border-rose-300 bg-rose-50";

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-sm font-semibold text-[var(--primary)]">
        Step 2 of 2 · confirming your system
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Let us confirm your solar
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        The Solar Pool pays producers, so we check the system exists before
        enrolling you. We look at your network export approval and the
        small-scale registry your installer lodged. We never store your inverter
        serial — only a one-way hash of it, so the same system cannot be
        enrolled twice.
      </p>

      <Card className="mt-7">
        <form method="get" className="space-y-5">
          <input type="hidden" name="checked" value="1" />
          <label className="block">
            <span className="text-sm font-semibold">
              NMI from your electricity bill
            </span>
            <input
              name="nmi"
              defaultValue={
                nmi || (PROTOTYPE_ALWAYS_CONFIRMS ? demoVerifiableNmi : "")
              }
              placeholder="10 or 11 characters"
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 font-mono"
            />
            <span className="mt-1 block text-xs text-[var(--muted)]">
              This is what the network and the registry are keyed on.
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">
              Inverter serial number{" "}
              <span className="font-normal text-[var(--muted)]">
                (only needed if we cannot find your address)
              </span>
            </span>
            <input
              name="serial"
              defaultValue={serial}
              placeholder="On the sticker on the side of your inverter"
              className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-3 font-mono"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">
              System size in kW{" "}
              <span className="font-normal text-[var(--muted)]">
                (optional)
              </span>
            </span>
            <input
              name="sizeKw"
              type="number"
              step="0.1"
              min="0"
              defaultValue={params.sizeKw ?? ""}
              className="mt-2 w-40 rounded-xl border border-[var(--border)] px-4 py-3 font-mono"
            />
            <span className="mt-1 block text-xs text-[var(--muted)]">
              We compare this with the registry. The registry figure is the one
              that counts.
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="documents"
              defaultChecked={hasDocuments}
              className="mt-1 size-4 accent-[var(--primary)]"
            />
            <span className="text-sm">
              I have my grid connection approval or installer paperwork and can
              upload it if the automatic checks cannot find my system.
            </span>
          </label>

          <button
            type="submit"
            className="min-h-12 w-full rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white"
          >
            Check my system
          </button>
        </form>

        {submitted && !PROTOTYPE_ALWAYS_CONFIRMS && !isValidNmi(nmi) && (
          <p className="mt-4 text-sm font-semibold text-rose-700">
            A NMI is 10 or 11 letters and digits. Check the number on your bill.
          </p>
        )}
      </Card>

      {result && (
        <Card className={`mt-6 ${tone}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold tracking-[0.12em] uppercase">
              {result.outcome === "verified"
                ? "Solar confirmed"
                : result.outcome === "manual_review"
                  ? "Sent for review"
                  : "Cannot enrol yet"}
            </p>
            {resolution && (
              <span className="text-xs font-semibold text-[var(--muted)]">
                {resolution.address}
              </span>
            )}
          </div>
          <p className="mt-3 text-sm">{result.summary}</p>
          {substituted && (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs leading-5 text-[var(--muted)]">
              Prototype mode: what you entered did not clear the mocked
              registry, so demo system{" "}
              <span className="font-mono">{demoVerifiableNmi}</span> was used so
              the walk-through can continue. Set{" "}
              <code>PROTOTYPE_ALWAYS_CONFIRMS</code> to false in{" "}
              <code>lib/demo/prototype-mode.ts</code> to see the real refusal.
            </p>
          )}

          <ul className="mt-4 space-y-2 border-t border-black/10 pt-4">
            {result.gates.map((gate) => (
              <li key={gate.code + gate.label} className="flex gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className={
                    gate.passed
                      ? "font-bold text-emerald-700"
                      : "font-bold text-rose-700"
                  }
                >
                  {gate.passed ? "✓" : "✕"}
                </span>
                <span className="min-w-0">
                  <span className="font-semibold">{gate.label}</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">
                    {gate.explanation}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {result.outcome === "verified" && (
            <dl className="mt-4 grid gap-4 border-t border-black/10 pt-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-[var(--muted)]">Registration</dt>
                <dd className="mt-1 font-mono text-sm font-semibold">
                  {result.registrationId}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">System size</dt>
                <dd className="mt-1 font-mono text-sm font-semibold">
                  {result.systemSizeKw} kW
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Serial on file</dt>
                <dd className="mt-1 font-mono text-sm font-semibold">
                  {result.inverterSerialHash}
                </dd>
              </div>
            </dl>
          )}

          <p className="mt-4 border-t border-black/10 pt-4 text-xs text-[var(--muted)]">
            {result.receivesSolarPool
              ? "You will be paid from the Solar Pool. Contributors are not paid from the Equity Pool — the two are separate, and no household draws from both."
              : "Until this clears you stay on the equity roll, so you are not left out of the program while we sort it out."}
          </p>

          <Link
            href={result.receivesSolarPool ? "/resident/wallet" : "/onboarding"}
            className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white"
          >
            {result.receivesSolarPool
              ? "Open my wallet →"
              : "Continue as an equity participant →"}
          </Link>
        </Card>
      )}
    </div>
  );
}
