"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const demoChoices = [
  {
    label: "Solar contributor",
    email: "contributor@gmail.com",
    description: "EV flexibility, event requests and contributor rewards",
  },
  {
    label: "Resident without solar",
    email: "nonsolar@gmail.com",
    description: "Community inclusion and Equity Dividends",
  },
] as const;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function selectDemoAccount(accountEmail: string) {
    setEmail(accountEmail);
    setPassword("abc");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/demo/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as {
        message?: string;
        redirectTo?: string;
      };
      if (!response.ok) {
        setError(result.message ?? "Unable to open this demo account.");
        return;
      }
      router.push(result.redirectTo ?? "/resident");
      router.refresh();
    } catch {
      setError("The demo login is temporarily unavailable. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className="mt-6 grid gap-3 sm:grid-cols-2"
        aria-label="Demo accounts"
      >
        {demoChoices.map((choice) => (
          <button
            key={choice.email}
            type="button"
            onClick={() => selectDemoAccount(choice.email)}
            className="min-h-24 cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-left transition-colors hover:border-[var(--primary)] hover:bg-emerald-50"
          >
            <span className="block text-sm font-semibold">{choice.label}</span>
            <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
              {choice.description}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">
        Choose a persona to fill its demo credentials automatically.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="email" className="text-sm font-semibold">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="contributor@gmail.com"
            aria-describedby={error ? "login-error" : undefined}
            className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-sm font-semibold">
              Password
            </label>
            <span className="text-xs text-[var(--muted)]">Demo: abc</span>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter abc"
            aria-describedby={error ? "login-error" : undefined}
            className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 outline-none focus:border-[var(--primary)]"
          />
        </div>
        {error ? (
          <p
            id="login-error"
            role="alert"
            className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-800"
          >
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="min-h-12 w-full cursor-pointer rounded-full bg-[var(--primary)] px-6 font-semibold text-white transition-colors hover:bg-[var(--primary-strong)] disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? "Opening demo account…" : "Log in to demo"}
        </button>
      </form>
    </>
  );
}
