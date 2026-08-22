export function StatusBadge({ children }: Readonly<{ children: string }>) {
  return (
    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-900 uppercase">
      {children}
    </span>
  );
}
