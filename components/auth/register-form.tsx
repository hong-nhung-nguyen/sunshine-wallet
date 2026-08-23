"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type Role = "contributor" | "beneficiary";
type LookupStatus = "idle" | "found" | "not-found";

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("beneficiary");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [useBillLookup, setUseBillLookup] = useState(true);
  const [nmi, setNmi] = useState("");
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const lookupComplete =
    role !== "beneficiary" || !useBillLookup || lookupStatus === "found";

  function lookUpNmi() {
    setLookupStatus(
      /^[A-Za-z0-9]{10,11}$/.test(nmi.trim()) ? "found" : "not-found",
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const account = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      role,
    };
    try {
      const response = await fetch("/api/demo/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });
      const result = (await response.json()) as {
        message?: string;
        redirectTo?: string;
      };
      if (!response.ok) {
        setError(result.message ?? "Unable to create this demo account.");
        return;
      }
      router.push(result.redirectTo ?? "/resident");
      router.refresh();
    } catch {
      setError("Registration is temporarily unavailable. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-semibold">
            Full name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-semibold">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-semibold">
          Create password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 outline-none focus:border-[var(--primary)]"
        />
      </div>

      <fieldset>
        <legend className="text-base font-semibold">
          How would you like to take part?
        </legend>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Choose the option that best fits you. Council can review this later.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label
            className={`cursor-pointer rounded-2xl border-2 p-4 transition-colors ${role === "beneficiary" ? "border-[var(--primary)] bg-emerald-50" : "border-[var(--border)] bg-white"}`}
          >
            <input
              type="radio"
              name="role"
              value="beneficiary"
              checked={role === "beneficiary"}
              onChange={() => setRole("beneficiary")}
              className="sr-only"
            />
            <span className="flex items-center justify-between gap-3">
              <span className="font-semibold">Community receiver</span>
              <span
                aria-hidden="true"
                className={`grid size-5 place-items-center rounded-full border ${role === "beneficiary" ? "border-[var(--primary)] bg-[var(--primary)] text-xs text-white" : "border-[var(--border)]"}`}
              >
                {role === "beneficiary" ? "✓" : ""}
              </span>
            </span>
            <span className="mt-2 block text-sm leading-5 text-[var(--muted)]">
              I want fair access to community energy benefits, including if I
              rent or cannot use my building’s roof.
            </span>
          </label>
          <label
            className={`cursor-pointer rounded-2xl border-2 p-4 transition-colors ${role === "contributor" ? "border-[var(--primary)] bg-emerald-50" : "border-[var(--border)] bg-white"}`}
          >
            <input
              type="radio"
              name="role"
              value="contributor"
              checked={role === "contributor"}
              onChange={() => setRole("contributor")}
              className="sr-only"
            />
            <span className="flex items-center justify-between gap-3">
              <span className="font-semibold">Contributor</span>
              <span
                aria-hidden="true"
                className={`grid size-5 place-items-center rounded-full border ${role === "contributor" ? "border-[var(--primary)] bg-[var(--primary)] text-xs text-white" : "border-[var(--border)]"}`}
              >
                {role === "contributor" ? "✓" : ""}
              </span>
            </span>
            <span className="mt-2 block text-sm leading-5 text-[var(--muted)]">
              I may offer eligible solar export or flexible equipment to a
              Council-approved event.
            </span>
          </label>
        </div>
      </fieldset>

      {role === "beneficiary" ? (
        <fieldset className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
          <legend className="px-2 text-base font-semibold">
            Check your community eligibility
          </legend>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Use the NMI from your electricity bill to simulate a record lookup,
            or answer the questions yourself. A failed lookup never makes you
            ineligible.
          </p>
          <div
            className="mt-4 flex flex-wrap gap-2"
            role="group"
            aria-label="Eligibility check method"
          >
            <button
              type="button"
              onClick={() => setUseBillLookup(true)}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold ${useBillLookup ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] bg-white"}`}
            >
              I have my bill
            </button>
            <button
              type="button"
              onClick={() => setUseBillLookup(false)}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold ${!useBillLookup ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] bg-white"}`}
            >
              Answer questions instead
            </button>
          </div>

          {useBillLookup ? (
            <div className="mt-5">
              <label htmlFor="nmi" className="text-sm font-semibold">
                National Metering Identifier (NMI)
              </label>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Enter the 10–11 character number shown on your electricity bill.
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  id="nmi"
                  name="nmi"
                  value={nmi}
                  onChange={(event) => {
                    setNmi(event.target.value);
                    setLookupStatus("idle");
                  }}
                  placeholder="Try 41020000000"
                  className="min-h-12 min-w-0 flex-1 rounded-2xl border border-[var(--border)] bg-white px-4 font-mono outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={lookUpNmi}
                  className="min-h-12 rounded-full border border-[var(--primary)] bg-white px-5 text-sm font-semibold text-[var(--primary)] hover:bg-emerald-50"
                >
                  Look up record
                </button>
              </div>
              {lookupStatus === "found" ? (
                <div
                  role="status"
                  className="mt-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900"
                >
                  <b>Simulated record found.</b> Dapto · partner retailer ·
                  eligibility assertions available with your consent.
                  <label className="mt-3 flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="lookupConsent"
                      required
                      className="mt-0.5 size-4 accent-[var(--primary)]"
                    />
                    <span>I consent to this simulated eligibility lookup.</span>
                  </label>
                </div>
              ) : null}
              {lookupStatus === "not-found" ? (
                <div
                  role="alert"
                  className="mt-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-950"
                >
                  Enter a 10–11 character NMI, or use self-declaration below.
                  <button
                    type="button"
                    onClick={() => setUseBillLookup(false)}
                    className="ml-2 font-semibold underline underline-offset-4"
                  >
                    Answer questions
                  </button>
                </div>
              ) : null}
              {lookupStatus === "found" ? (
                <QuestionSelect
                  id="tenure-lookup"
                  label="Do you rent or own your home?"
                  name="tenure"
                  options={[
                    "Rent privately",
                    "Social or community housing",
                    "Own or mortgage",
                    "Prefer not to say",
                  ]}
                />
              ) : null}
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <QuestionSelect
                id="payment-difficulty"
                label="Have you had trouble paying an energy bill in the last 12 months?"
                name="paymentDifficulty"
                options={["Yes", "No", "Prefer not to say"]}
              />
              <QuestionSelect
                id="concession"
                label="Do you receive an energy rebate or concession?"
                name="concession"
                options={["Yes", "No", "Not sure", "Prefer not to say"]}
              />
              <QuestionSelect
                id="tenure"
                label="Do you rent or own your home?"
                name="tenure"
                options={[
                  "Rent privately",
                  "Social or community housing",
                  "Own or mortgage",
                  "Prefer not to say",
                ]}
              />
              <QuestionSelect
                id="billing"
                label="Who sends your electricity bill?"
                name="billing"
                options={[
                  "Energy retailer",
                  "Landlord or agent",
                  "Embedded network",
                  "Not sure",
                  "Prefer not to say",
                ]}
              />
              <QuestionSelect
                id="hot-water"
                label="What kind of electric hot water or controllable load do you have?"
                name="hotWater"
                options={[
                  "Individual electric tank",
                  "Shared system",
                  "Other controllable load",
                  "None or not sure",
                  "Prefer not to say",
                ]}
              />
              <QuestionSelect
                id="life-support"
                label="Is life-support equipment registered at your home?"
                name="lifeSupport"
                options={["Yes", "No", "Prefer not to say"]}
              />
            </div>
          )}
        </fieldset>
      ) : (
        <fieldset className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
          <legend className="px-2 text-base font-semibold">
            Tell us what you could contribute
          </legend>
          <p className="text-sm leading-6 text-[var(--muted)]">
            This creates a setup request only. Council verifies the device and
            its safety limits before any event.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <QuestionSelect
              id="resource-type"
              label="Which resource would you like to register?"
              name="resourceType"
              options={[
                "EV charger",
                "Home battery",
                "Electric hot-water system",
                "Solar export",
                "Other",
              ]}
            />
            <QuestionSelect
              id="resource-control"
              label="Can it be scheduled or controlled?"
              name="resourceControl"
              options={["Yes", "No", "Not sure"]}
            />
            <QuestionSelect
              id="resource-availability"
              label="When is it usually available?"
              name="resourceAvailability"
              options={["Most weekdays", "Weekends", "Varies", "Not sure"]}
            />
            <QuestionSelect
              id="resource-safety"
              label="Are there comfort, medical or safety limits Council should review?"
              name="resourceSafety"
              options={["Yes", "No", "Prefer not to say"]}
            />
          </div>
        </fieldset>
      )}

      <label className="flex items-start gap-3 text-sm leading-5">
        <input
          type="checkbox"
          required
          className="mt-0.5 size-4 accent-[var(--primary)]"
        />
        <span>
          I agree to the prototype participation terms and understand Council
          reviews program decisions.
        </span>
      </label>
      {error ? (
        <p
          role="alert"
          className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-800"
        >
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting || !lookupComplete}
        className="min-h-12 w-full rounded-full bg-[var(--primary)] px-6 font-semibold text-white transition-colors hover:bg-[var(--primary-strong)] disabled:opacity-70"
      >
        {submitting
          ? "Creating demo account…"
          : !lookupComplete
            ? "Look up your record to continue"
            : "Create account"}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--primary)] underline underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}

function QuestionSelect({
  id,
  label,
  name,
  options,
}: {
  id: string;
  label: string;
  name: string;
  options: readonly string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm leading-5 font-semibold">
        {label}
      </label>
      <select
        id={id}
        name={name}
        required
        defaultValue=""
        className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-base outline-none focus:border-[var(--primary)]"
      >
        <option value="" disabled>
          Select an answer
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
