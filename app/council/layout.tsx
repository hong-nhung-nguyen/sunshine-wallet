import type { ReactNode } from "react";
import { CouncilShell } from "@/components/council/council-shell";

export default function CouncilLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <CouncilShell>{children}</CouncilShell>;
}
