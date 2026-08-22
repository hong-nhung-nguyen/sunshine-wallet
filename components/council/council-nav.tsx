"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/council", label: "Overview", mark: "01" },
  { href: "/council/events", label: "Events", mark: "02" },
  { href: "/council/windows", label: "Windows", mark: "03" },
  { href: "/council/resources", label: "Resources", mark: "04" },
  { href: "/council/optimisation", label: "Optimisation", mark: "05" },
  { href: "/council/settlement", label: "Settlement", mark: "06" },
] as const;

export function CouncilNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Council operator navigation"
      className="overflow-x-auto lg:overflow-visible"
    >
      <div className="flex min-w-max gap-2 lg:min-w-0 lg:flex-col">
        {navItems.map((item) => {
          const active =
            item.href === "/council"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors ${active ? "bg-white text-[var(--council-ink)] shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
            >
              <span
                className={`font-mono text-xs ${active ? "text-[var(--council-accent)]" : "text-slate-500 group-hover:text-slate-300"}`}
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
