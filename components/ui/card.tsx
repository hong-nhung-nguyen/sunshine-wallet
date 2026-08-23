import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  // Two background utilities on one element are decided by the order Tailwind
  // emits them, not by the order they are written. Drop ours when the caller
  // brings its own, so a dark card stays dark whatever the stylesheet order.
  const background = /(^|\s)bg-/.test(className) ? "" : "bg-[var(--surface)]";
  return (
    <div
      className={`rounded-3xl border border-[var(--border)] ${background} p-6 shadow-sm ${className}`}
      {...props}
    />
  );
}
