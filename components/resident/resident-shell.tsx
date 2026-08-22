import type { ReactNode } from "react";
import Link from "next/link";
import { residentProfile } from "@/lib/data/resident";
import { ResidentNav } from "./resident-nav";

export function ResidentShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--resident-bg)]">
      <div className="mx-auto max-w-5xl px-4 pb-28 pt-5 sm:px-6 md:pb-10 md:pt-8">
        <header className="mb-5 flex items-center justify-between gap-4 md:mb-6">
          <div>
            <Link href="/resident" className="text-sm font-bold tracking-[0.14em] text-[var(--primary)] uppercase">My Sunshine Wallet</Link>
            <p className="mt-1 text-sm text-[var(--muted)]">{residentProfile.location}</p>
          </div>
          <Link href="/resident/status" aria-label="Open Aisha Patel's program status" className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-sm font-bold text-white shadow-sm">{residentProfile.initials}</Link>
        </header>
        <ResidentNav />
        <main className="mt-5 md:mt-7">{children}</main>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-5 text-[var(--muted)]">Demonstration only. Credits, events and energy data shown here are simulated and are not a real tariff or Council payment.</p>
      </div>
    </div>
  );
}
