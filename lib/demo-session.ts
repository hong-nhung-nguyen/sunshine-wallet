import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  demoResidentPersonas,
  type DemoResidentPersona,
  type DemoResidentRole,
} from "@/lib/data/demo-residents";

export const demoSessionCookie = "sunshine-wallet-demo-role";
export const demoSessionNameCookie = "sunshine-wallet-demo-name";

export async function getDemoResident(): Promise<DemoResidentPersona> {
  const cookieStore = await cookies();
  const role = cookieStore.get(demoSessionCookie)?.value as
    | DemoResidentRole
    | undefined;
  if (!role || !(role in demoResidentPersonas)) redirect("/login");
  const resident = demoResidentPersonas[role];
  const registeredName = cookieStore.get(demoSessionNameCookie)?.value;
  if (!resident.isNew || !registeredName) return resident;
  const nameParts = registeredName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || resident.firstName;
  const initials = nameParts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return { ...resident, name: registeredName, firstName, initials };
}
