import type { ReactNode } from "react";
import { CouncilNav } from "./council-nav";

export function CouncilShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--council-bg)] lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="bg-[var(--council-ink)] px-4 py-5 text-white lg:min-h-[calc(100vh-4rem)] lg:px-5 lg:py-7">
        <div className="mx-auto max-w-7xl lg:sticky lg:top-6">
          <div className="mb-5 flex items-center justify-between gap-4 px-2 lg:mb-9 lg:block">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[var(--council-accent)] uppercase">Council console</p>
              <p className="mt-1 text-sm text-slate-400">Energy equity operations</p>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">Demo data</span>
          </div>
          <CouncilNav />
          <div className="mt-9 hidden rounded-2xl border border-white/10 bg-white/5 p-4 lg:block">
            <p className="text-xs text-slate-400">Signed in as</p><p className="mt-1 text-sm font-semibold">Council Operator</p>
            <p className="mt-3 text-xs leading-5 text-slate-400">Wollongong City Council manages event and equity policy decisions.</p>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-7 sm:px-6 lg:px-9 lg:py-9 xl:px-12">{children}</main>
    </div>
  );
}
