import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Retailer console" };

export default function RetailerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--surface-muted)] px-4 py-7 sm:px-6 lg:px-9">
      {children}
    </div>
  );
}
