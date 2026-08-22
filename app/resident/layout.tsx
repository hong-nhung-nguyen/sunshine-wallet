import type { ReactNode } from "react";
import { ResidentShell } from "@/components/resident/resident-shell";

export default function ResidentLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <ResidentShell>{children}</ResidentShell>;
}
