import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  demoResidentPersonas,
  type DemoResidentPersona,
  type DemoResidentRole,
} from "@/lib/data/demo-residents";

export const demoSessionCookie = "sunshine-wallet-demo-role";

export async function getDemoResident(): Promise<DemoResidentPersona> {
  const role = (await cookies()).get(demoSessionCookie)?.value as
    | DemoResidentRole
    | undefined;
  if (!role || !(role in demoResidentPersonas)) redirect("/login");
  return demoResidentPersonas[role];
}
