"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type Role = "contributor" | "beneficiary";

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("beneficiary");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const account = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      role,
    };
    window.localStorage.setItem(
      "sunshine-wallet-demo-account",
      JSON.stringify(account),
    );
    window.localStorage.setItem(
      "sunshine-wallet-demo-session",
      JSON.stringify(account),
    );
    router.push(
      role === "contributor" ? "/resident/events" : "/resident/wallet",
    );
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
              <span className="font-semibold">Beneficiary</span>
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
      <button
        type="submit"
        disabled={submitting}
        className="min-h-12 w-full rounded-full bg-[var(--primary)] px-6 font-semibold text-white transition-colors hover:bg-[var(--primary-strong)] disabled:opacity-70"
      >
        {submitting ? "Creating demo account…" : "Create account"}
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
