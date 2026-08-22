import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to the Sunshine Wallet prototype.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-[0.8fr_1.2fr]">
      <section>
        <p className="font-mono text-sm font-semibold tracking-[0.16em] text-[var(--primary)] uppercase">
          Wollongong community energy
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Welcome back to Sunshine Wallet.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
          See your community energy events, understand Council decisions and
          check credits shared with you.
        </p>
        <div className="mt-8 rounded-3xl bg-amber-100 p-5 text-sm leading-6 text-amber-950">
          <b>Simulation only:</b> these public demo accounts contain invented
          people, energy readings and credits. Do not enter a real password.
        </div>
      </section>
      <Card className="p-6 sm:p-8">
        <p className="text-sm font-semibold text-[var(--primary)]">
          Account access
        </p>
        <h2 className="mt-2 text-3xl font-semibold">Log in</h2>
        <LoginForm />
      </Card>
    </div>
  );
}
