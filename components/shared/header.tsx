import Link from "next/link";

const links = [
  { href: "/resident", label: "Resident" },
  { href: "/council", label: "Council" },
  { href: "/retailer", label: "Retailer" },
  { href: "/login", label: "Log in" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-6 px-5">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 font-semibold"
        >
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-full bg-[var(--accent)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
            </svg>
          </span>
          Sunshine Wallet
        </Link>
        <nav aria-label="Primary navigation" className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="flex min-h-11 items-center rounded-full bg-[var(--primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-strong)]"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
