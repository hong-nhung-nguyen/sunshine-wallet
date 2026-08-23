"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/resident", label: "Home", mark: "⌂" },
  { href: "/resident/wallet", label: "Wallet", mark: "$" },
  { href: "/resident/events", label: "Events", mark: "◷" },
  { href: "/resident/status", label: "Status", mark: "✓" },
] as const;

export function ResidentNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Resident navigation"
      className="resident-nav fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-white/95 px-3 pt-2 pb-[max(0.7rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(23,35,27,0.08)] backdrop-blur md:static md:rounded-2xl md:border md:p-2 md:shadow-none"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 md:max-w-none">
        {items.map((item) => {
          const active =
            item.href === "/resident"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-xs font-semibold transition-colors md:min-h-11 md:flex-row md:gap-2 md:text-sm ${active ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"}`}
            >
              <span
                aria-hidden="true"
                className="text-lg leading-none md:text-base"
              >
                {item.mark}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
