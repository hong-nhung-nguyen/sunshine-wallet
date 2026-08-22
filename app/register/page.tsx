import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Create a mock Sunshine Wallet account and choose how to participate.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-sm font-semibold tracking-[0.16em] text-[var(--primary)] uppercase">
          Join Sunshine Wallet
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Choose how local energy can work for you.
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          You do not need rooftop solar, an EV, a battery or controllable
          equipment to register as a beneficiary.
        </p>
      </header>
      <Card className="mx-auto mt-8 max-w-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--primary)]">
              New account
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              Your details and role
            </h2>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            Mock registration
          </span>
        </div>
        <RegisterForm />
      </Card>
    </div>
  );
}
