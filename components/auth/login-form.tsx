"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type DemoAccount = {
  name: string;
  email: string;
  role: "contributor" | "beneficiary";
};

export function LoginForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const stored = window.localStorage.getItem("sunshine-wallet-demo-account");
    let account: DemoAccount = {
      name: "Demo resident",
      email,
      role: "beneficiary",
    };
    if (stored) {
      try {
        const saved = JSON.parse(stored) as Partial<DemoAccount>;
        if (
          typeof saved.name === "string" &&
          typeof saved.email === "string" &&
          (saved.role === "contributor" || saved.role === "beneficiary")
        ) {
          account = { name: saved.name, email: saved.email, role: saved.role };
        }
      } catch {
        window.localStorage.removeItem("sunshine-wallet-demo-account");
      }
    }
    window.localStorage.setItem(
      "sunshine-wallet-demo-session",
      JSON.stringify(account),
    );
    router.push(
      account.role === "contributor" ? "/resident/events" : "/resident/wallet",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
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
          placeholder="you@example.com"
          className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 outline-none focus:border-[var(--primary)]"
        />
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="password" className="text-sm font-semibold">
            Password
          </label>
          <span className="text-xs text-[var(--muted)]">Demo only</span>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 outline-none focus:border-[var(--primary)]"
        />
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="remember"
          className="size-4 accent-[var(--primary)]"
        />{" "}
        Keep me signed in on this device
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="min-h-12 w-full rounded-full bg-[var(--primary)] px-6 font-semibold text-white transition-colors hover:bg-[var(--primary-strong)] disabled:opacity-70"
      >
        {submitting ? "Opening your account…" : "Log in"}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        Don’t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[var(--primary)] underline underline-offset-4"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
